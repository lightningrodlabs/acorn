/*
 * Direct OpenAI-compatible backend — talks STRAIGHT to a chat-completions endpoint
 * (Ollama at /v1, LM Studio, vLLM, …), with no ACP agent in between.
 *
 * WHY this exists: routing a local model through OpenCode's ACP server wraps every
 * turn in OpenCode's coding-agent apparatus — its own system prompt, a
 * primary/subagent hierarchy, glob/edit/task tools, git snapshots — and in ACP
 * mode it does not surface Acorn's MCP tools to the model at all (verified in
 * OpenCode's own debug logs: `agent=build` runs, yet `read_tree` never appears and
 * the model globs the filesystem). Meanwhile the *model itself* is fine: given a
 * clean system message it answers as Acorn, and given a tool it calls `read_tree`.
 * So for the local case we give the model EXACTLY that and nothing else: our system
 * prompt + skill in the system slot, Acorn's two tools, the conversation.
 *
 * This module presents the same minimal surface the sidecar's handleFrame already
 * drives on an ACP agent — initialize / newSession / prompt / cancel — so it's a
 * drop-in: the renderer protocol is unchanged. The chat call is injectable so the
 * tool-loop is unit-testable without a running model.
 *
 * Plain Node CommonJS (loaded by the CommonJS sidecar).
 */
const { flattenResourceBlocks } = require('./promptContext')

// Hard cap on tool-call round-trips per turn, so a confused model can't loop
// forever calling tools.
const MAX_STEPS = 8

// acornToolsServer's TOOLS ({name, description, inputSchema}) -> OpenAI tool defs.
function toOpenAiTools(tools) {
  return (tools || []).map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema || { type: 'object', properties: {} },
    },
  }))
}

// ACP content blocks -> a single plain-text string (resources flattened first).
function blocksToText(blocks) {
  return flattenResourceBlocks(blocks || [])
    .map((b) => (b && b.type === 'text' ? b.text : ''))
    .filter(Boolean)
    .join('\n\n')
}

function safeParseArgs(raw) {
  if (raw == null) return {}
  if (typeof raw === 'object') return raw
  try {
    return JSON.parse(raw)
  } catch (_) {
    return {}
  }
}

// The default `chat` implementation: one non-streaming OpenAI-compatible
// chat/completions call. Returns { content, thinking, toolCalls:[{id,name,arguments}] }.
function makeHttpChat({ baseURL, model, apiKey, fetchImpl }) {
  const doFetch = fetchImpl || globalThis.fetch
  const url = `${String(baseURL).replace(/\/$/, '')}/chat/completions`
  return async (messages, tools) => {
    const res = await doFetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages,
        ...(tools && tools.length ? { tools } : {}),
        stream: false,
      }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`chat/completions ${res.status}: ${body.slice(0, 300)}`)
    }
    const data = await res.json()
    const msg = (data.choices && data.choices[0] && data.choices[0].message) || {}
    const toolCalls = (msg.tool_calls || []).map((tc) => ({
      id: tc.id || tc.function.name,
      name: tc.function.name,
      arguments: safeParseArgs(tc.function.arguments),
    }))
    return {
      content: msg.content || '',
      thinking: msg.reasoning_content || msg.reasoning || '',
      toolCalls,
    }
  }
}

/**
 * Build a direct backend exposing the agent surface the sidecar calls.
 *
 * @param {object} o
 * @param {string} o.model               model id (for the chat call + identity line)
 * @param {?string} o.modelLabel         friendly model name (for agentInfo)
 * @param {?string} o.systemText         Acorn system prompt
 * @param {?string} o.skillText          clarity-trees skill markdown
 * @param {Array}  o.tools               acornToolsServer TOOLS
 * @param {function} o.chat              async (messages, tools) => {content,thinking,toolCalls}
 * @param {function} o.callTool          async (name, args) => {ok,result}|{ok:false,error}
 * @param {function} o.pushUpdate        (sessionId, update) => void  (renderer stream)
 * @param {function} o.genSessionId      () => string
 */
function makeDirectAgent(o) {
  const tools = toOpenAiTools(o.tools)
  const histories = new Map() // sessionId -> OpenAI messages[]
  const cancelled = new Set()

  const systemMessage = () => {
    const parts = []
    if (o.systemText && o.systemText.trim()) parts.push(o.systemText.trim())
    if (o.skillText && o.skillText.trim()) {
      parts.push(
        'CLARITY-TREES SKILL — load and follow this for any tree work:\n\n' +
          o.skillText.trim()
      )
    }
    return parts.join('\n\n---\n\n')
  }

  return {
    direct: true,
    async initialize() {
      return {
        protocolVersion: 1,
        agentInfo: { name: o.modelLabel ? `Acorn · ${o.modelLabel}` : 'Acorn (direct)' },
        agentCapabilities: {
          loadSession: false,
          promptCapabilities: {},
          mcpCapabilities: {},
        },
      }
    },
    async newSession() {
      const sessionId = o.genSessionId()
      const sys = systemMessage()
      histories.set(sessionId, sys ? [{ role: 'system', content: sys }] : [])
      return { sessionId }
    },
    // No durable agent-side resume — the renderer restores the transcript itself.
    async loadSession() {
      throw new Error('direct backend does not support session/load')
    },
    cancel({ sessionId }) {
      cancelled.add(sessionId)
    },
    async prompt({ sessionId, prompt: blocks }) {
      let hist = histories.get(sessionId)
      if (!hist) {
        const sys = systemMessage()
        hist = sys ? [{ role: 'system', content: sys }] : []
        histories.set(sessionId, hist)
      }
      cancelled.delete(sessionId)
      const userText = blocksToText(blocks)
      if (userText) hist.push({ role: 'user', content: userText })

      for (let step = 0; step < MAX_STEPS; step++) {
        if (cancelled.has(sessionId)) return { stopReason: 'cancelled' }
        const res = await o.chat(hist, tools)
        if (res.thinking)
          o.pushUpdate(sessionId, { type: 'thought', text: res.thinking })

        const calls = res.toolCalls || []
        if (calls.length) {
          // Record the assistant's tool-call turn, then run each tool.
          hist.push({
            role: 'assistant',
            content: res.content || '',
            tool_calls: calls.map((tc) => ({
              id: tc.id,
              type: 'function',
              function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
            })),
          })
          if (res.content)
            o.pushUpdate(sessionId, { type: 'message', text: res.content })
          for (const tc of calls) {
            o.pushUpdate(sessionId, {
              type: 'tool_call',
              toolCallId: tc.id,
              title: tc.name,
              status: 'in_progress',
              kind: 'other',
            })
            let result
            try {
              result = await o.callTool(tc.name, tc.arguments)
            } catch (e) {
              result = { ok: false, error: String((e && e.message) || e) }
            }
            const ok = result && result.ok !== false
            o.pushUpdate(sessionId, {
              type: 'tool_call',
              toolCallId: tc.id,
              title: tc.name,
              status: ok ? 'completed' : 'failed',
              kind: 'other',
            })
            const content = ok
              ? typeof result.result === 'string'
                ? result.result
                : JSON.stringify(result.result)
              : (result && result.error) || 'tool failed'
            hist.push({ role: 'tool', tool_call_id: tc.id, content })
          }
          continue // let the model react to the tool results
        }

        // No tool calls → final answer for this turn.
        if (res.content) {
          hist.push({ role: 'assistant', content: res.content })
          o.pushUpdate(sessionId, { type: 'message', text: res.content })
        }
        return { stopReason: 'end_turn' }
      }
      o.pushUpdate(sessionId, {
        type: 'message',
        text: '[stopped: too many tool calls in one turn]',
      })
      return { stopReason: 'max_steps' }
    },
  }
}

module.exports = {
  makeDirectAgent,
  toOpenAiTools,
  blocksToText,
  makeHttpChat,
  MAX_STEPS,
}
