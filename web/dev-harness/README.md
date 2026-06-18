# Harness (in-app LLM chat over ACP)

The dev-server **sidecar** ([sidecar.js](./sidecar.js)) owns the ACP connection to
a local LLM agent so the renderer (a browser context that can't spawn a
subprocess) doesn't have to. It attaches a WebSocket at `/__acorn_harness`:

```
renderer  <--WS-->  sidecar  <--ACP JSON-RPC/stdio-->  agent
```

## Running

Pick an agent via the root `package.json` scripts (each sets `ACORN_HARNESS_CMD`):

```sh
yarn harness:claude      # @agentclientprotocol/claude-agent-acp
yarn harness:gemini      # gemini --experimental-acp
yarn harness:openrouter  # claude-agent-acp via OpenRouter ($OPENROUTER_API_KEY)
```

With no `ACORN_HARNESS_CMD`, the sidecar reports the harness unavailable and the
chat UI hides.

> Use `@agentclientprotocol/claude-agent-acp`, not the old
> `@zed-industries/claude-code-acp` (deprecated/renamed, frozen at 0.16.2). The
> old one pins `@agentclientprotocol/sdk@0.14.1` + `claude-agent-sdk@0.2.44`,
> skewed from the sidecar's `sdk@0.26.0`; its older engine may not actually
> connect to remote (http) MCP servers even though it forwards the config — so
> Linear's tools can silently fail to appear. The current package advertises
> `mcpCapabilities {http,sse}`, so the sidecar forwards http/sse servers
> natively (the `mcp-remote` stdio bridge is the fallback for agents that don't).

## OpenRouter (or any Anthropic-compatible gateway)

`yarn harness:openrouter` runs the same `claude-agent-acp` against OpenRouter
instead of Anthropic:

```sh
export OPENROUTER_API_KEY=sk-or-v1-...      # from openrouter.ai/keys (required — the script fails fast if unset)
ANTHROPIC_MODEL='openai/gpt-4o' yarn harness:openrouter
```

- `ANTHROPIC_BASE_URL` must be `https://openrouter.ai/api` — **not** `.../api/v1`.
  The Anthropic SDK appends `/v1/messages`, so the base already ends one segment
  short of the endpoint; adding `/v1` yourself produces `…/api/v1/v1/messages`
  (a 404 that surfaces in the UI as a misleading "the selected model may not
  exist" error).
- `ANTHROPIC_MODEL` is an **OpenRouter slug** (`openai/gpt-4o`,
  `anthropic/claude-3.7-sonnet`, …), not an Anthropic model id. OpenRouter's
  Anthropic-compatible endpoint translates any slug server-side.
- Confirm which model actually served a turn at <https://openrouter.ai/activity>
  — don't trust the assistant's self-report (see the system-prompt note below).

## System prompt

`claude-agent-acp` defaults every session to the Claude Agent SDK's `claude_code`
preset — the "You are Claude Code…" identity plus tool-use/tone sections and
dynamic working-dir/memory/git context. (This is why a non-Anthropic model still
says "I am Claude": the preset's identity overrides the weights.) Override it via
these env vars, read in [sidecar.js](./sidecar.js) and passed per-session over
ACP `_meta.systemPrompt`:

| Env var | Effect |
| --- | --- |
| `ACORN_SYSTEM_PROMPT_FILE` | File contents become the **full** prompt — replaces the preset entirely (no Claude identity, no built-in tool-use prose). See [acorn-system-prompt.md](./acorn-system-prompt.md). |
| `ACORN_SYSTEM_PROMPT` | Same full replacement, inline. |
| `ACORN_SYSTEM_PROMPT_APPEND` | Keeps the whole `claude_code` preset and **appends** your text — augment, don't replace. Safer when you still want the SDK's tool-use guidance. |
| `ACORN_MODEL_LABEL` | Optional friendly model name for the "backed by …" identity line (see below). |

The `harness:*` scripts set `ACORN_SYSTEM_PROMPT_FILE` to
[acorn-system-prompt.md](./acorn-system-prompt.md) by default — a **full
replacement**, because appending to the `claude_code` preset does *not* reliably
override its authoritative "You are Claude Code" opening (the model keeps
claiming to be Claude Code; an append can add facts but not retract identity).
Full replacement is also a fine default here: a clarity-tree assistant only needs
`read_tree`/`propose_edits` plus the injected skill, not the full coding-agent
preset.

When the backing model is known, the sidecar folds a **"You are backed by the
model `<model>`"** sentence onto the end of whichever prompt is in force, so the
assistant can answer "what powers you?" honestly. The model is read from the
harness call — `ANTHROPIC_MODEL` (set by `harness:openrouter`), overridable with
`ACORN_MODEL_LABEL`. If neither is set (e.g. `harness:claude` on its default
model, or `harness:local` where OpenCode picks the model from
`opencode.local.json` rather than the environment), the "backed by" line is
omitted rather than guessed — set `ACORN_MODEL_LABEL` explicitly to surface it
there.

```sh
ACORN_SYSTEM_PROMPT_FILE=./web/dev-harness/acorn-system-prompt.md \
ANTHROPIC_MODEL='openai/gpt-4o' yarn harness:openrouter
```

> **Architecture note — this is dev-harness scaffolding, not the eventual shape.**
> Env vars + a file on disk are fine for driving the harness from a `yarn`
> script, but when this generalizes to the Moss/Kangaroo host the system prompt
> (like model, base URL, MCP servers, and skill seeding) will not come from the
> environment. It should be one field in a **single harness configuration blob**
> the host hands the sidecar per session — the same generalizable surface noted
> for MCP servers below. The `_meta.systemPrompt` plumbing already added to
> `newSession` is the right seam; only its *source* needs to change (config blob
> instead of `process.env`).

## Attaching MCP servers (Linear, etc.)

MCP servers are attached **agent-agnostically**: ACP carries them from the client
to the agent in `session/new`, so the same config works for whichever agent is
running (Claude, Gemini, …). Configure them in a local file:

```sh
cp web/dev-harness/mcp-servers.json.example web/dev-harness/mcp-servers.json
```

`${VAR}` is interpolated from the environment, so **secrets stay out of the
file** (and `mcp-servers.json` is git-ignored). For Linear's hosted MCP:

```jsonc
// mcp-servers.json
{
  "servers": [
    { "name": "linear", "type": "http",
      "url": "https://mcp.linear.app/mcp",
      "headers": { "Authorization": "Bearer ${LINEAR_API_KEY}" } }
  ]
}
```

```sh
LINEAR_API_KEY=lin_api_xxx yarn harness:claude
```

The agent can now call Linear's tools (`create_issue`, `create_project`,
`list_issues`, …) alongside `read_tree` — e.g. *"read the tree and create a
Linear project with an issue per leaf."* Attached servers show as chips
(`🔌 linear`) in the chat header.

Server entry shape (see [mcpConfig.js](./mcpConfig.js)):

- `type: "stdio"` — `command`, `args`, `env` (a `{NAME: value}` map). Universal.
- `type: "http"` / `"sse"` — `url`, `headers` (a `{Name: value}` map). Forwarded
  natively if the agent advertised http/sse MCP support at `initialize`, else
  **transparently bridged** through a local `npx mcp-remote` (stdio) process so
  even an stdio-only agent can reach a remote server.

A malformed file or a single bad/duplicate entry (e.g. a referenced env var is
unset) is logged and skipped — the harness still comes up. Override the config
path with `ACORN_MCP_CONFIG`. Edits take effect on restart.

> This file-based config is the generalizable surface: a Moss/Kangaroo host can
> later write the same JSON shape from a UI without any code change here.

## Fully-local LLM (no network egress)

`yarn harness:local` drives a model running **entirely on your machine** — proving
the loop works air-gapped. Stack: **LiquidAI LFM2.5-8B-A1B** served by **Ollama**,
driven through the **OpenCode** ACP agent. (LFM2.5-8B-A1B is an MoE with ~1B
*active* params per token, so it runs on a CPU-only laptop; Q4_K_M is ~5.16 GB.)

OpenCode is the chosen ACP agent because it accepts the MCP servers Acorn passes
per-session over ACP `session/new` — the same path the sidecar uses to attach
`read_tree` / `propose_edits`. ([Goose](https://block.github.io/goose/) is a
fallback ACP agent: Ollama via `OLLAMA_HOST`.)

```sh
# 1. Pull the model under Ollama
ollama pull lfm2.5:8b-a1b          # or: ollama run lfm2.5:8b-a1b-q4_K_M
# 2. Give it enough context (the default 4096 is too small for read_tree)
export OLLAMA_CONTEXT_LENGTH=32768
# 3. Launch — OPENCODE_CONFIG points at opencode.local.json (provider=ollama, model=lfm2.5:8b-a1b)
yarn harness:local
```

The model/provider live in [opencode.local.json](./opencode.local.json); edit the
`model` / `baseURL` there to try a different local model or server (LM Studio,
llama.cpp, vLLM — all OpenAI-compatible at a `/v1` base URL).

Two things to know:

- **Use a small project.** `read_tree` on a large tree can be tens of thousands of
  tokens — past a small model's window. Run the demo against a tiny (3–6 node)
  project so the whole tree fits and the model can emit a clean `propose_edits` diff.
- **Verify tool-calling fires.** Some Ollama LFM2.5 builds have shipped without the
  tool template wired ([ollama#15953](https://github.com/ollama/ollama/issues/15953));
  confirm the `8b-a1b` build actually emits tool calls. If the Acorn tools don't
  attach over ACP `session/new`, register the `acorn` stdio server (it bridges to
  the sidecar via `ACORN_WEB_PORT`) directly in `opencode.local.json` under `mcp`.

To prove it's truly local, block egress to `api.anthropic.com` (and other model
APIs) while running — only `localhost:11434` should be reached.
