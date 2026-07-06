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

## System prompt & context delivery (uniform across backends)

**How every backend gets the same Acorn context.** ACP offers two *optional*
channels for out-of-band context — `_meta.systemPrompt` on `session/new` and
embedded `resource` content blocks — but agents disagree on, and sometimes
misreport, support for them. OpenCode advertises `embeddedContext` and accepts
`_meta`, yet forwards **neither** to its model — so a session that relied on them
got no Acorn context at all (the model answered "who are you?" as a generic
assistant). The one channel every ACP agent reliably forwards is ordinary user
prompt **text**.

So the sidecar delivers the Acorn preamble — **system prompt + clarity-trees
skill** — plus per-turn context (tree snapshot, selection) as **inline text on
each session's first prompt, identically for all backends** (claude, OpenCode,
Gemini, …). Embedded resources are flattened to text too. This composition lives
in [promptContext.js](./promptContext.js) (`composeFirstPrompt` / `composeTurn`)
and is unit-tested. The sidecar no longer branches on advertised capabilities.

### System slot, when possible (the better channel)

Inline text is the floor — it always lands, but in the *user* slot, which a small
model weighs below its built-in identity and below whatever system prompt the
backend injects (OpenCode runs its own coding-agent persona). So on top of the
floor, the sidecar **seats the Acorn prompt in the backend's authoritative system
slot whenever it has an adapter for that backend** — [systemSlot.js](./systemSlot.js):

| Backend | System-slot channel | When it's wired |
| --- | --- | --- |
| claude-agent-acp | ACP `_meta.systemPrompt` on `session/new` (full preset replace) | per-session, in [sidecar.js](./sidecar.js) `newSession` |
| OpenCode | its config — we **replace the primary agent's `prompt`** with the Acorn prompt | pre-spawn: a generated config |
| others / future | *(none yet)* | inline floor only — no regression |

There's no ACP standard for a system prompt, and agents misreport capabilities,
so adapters are **explicit**, matched by the harness command (config-based
backends must be configured *before* spawn, before `agentInfo.name` is known).
Adding a backend is one entry in `ADAPTERS`.

For OpenCode the sidecar reads the config at `OPENCODE_CONFIG`, writes the Acorn
prompt to an absolute temp file, builds an *effective* config carrying it through
**two levers**, writes that next to it, and points `OPENCODE_CONFIG` there before
spawning:

1. `instructions: [<abs prompt file>]` — **the primary lever.** OpenCode's ACP
   mode has a bug ([sst/opencode#8680](https://github.com/anomalyco/opencode/issues/8680)):
   it ignores the configured default agent and runs whatever agent is first in
   state (often a *subagent*), so an `agent.*.prompt` override may never be the
   agent in play. Top-level `instructions` apply to the model regardless of
   agent, so they survive the bug. (Absolute path ⇒ no dependence on the agent's
   `web/` cwd — the old committed relative path misresolved to `web/web/…` and
   loaded nothing.)
2. `agent.build.prompt` = the prompt — secondary insurance for when ACP honors
   the primary agent (or #8680 is fixed): a full system-prompt replace.

Confirm it fired via the startup log line `OpenCode system slot: instructions=[…]
+ agent.build.prompt via generated config <path>`, and inspect the generated
files under `/tmp/acorn-harness/`. The committed
[opencode.local.json](./opencode.local.json) no longer carries an `instructions`
key — the sidecar owns system-slot seating. *(Caveat: `instructions` **appends**
to OpenCode's own agent prompt rather than replacing it, and a tiny local model
weighs identity weakly, so on `harness:local` identity may still wobble even with
the prompt in the system slot — the tool/skill behaviour is the real signal.)*

`_meta.systemPrompt` is **still sent** on `session/new` for agents that honor it
(claude), but no backend depends on it for the working *context* — the inline copy
is authoritative there. For identity to stick on an agent with no system-slot
adapter, the prompt file must assert it plainly ("You are Acorn, not Claude" —
see [acorn-system-prompt.md](./acorn-system-prompt.md)).

`claude-agent-acp` defaults every session to the Claude Agent SDK's `claude_code`
preset — the "You are Claude Code…" identity plus tool-use/tone sections and
dynamic working-dir/memory/git context. (This is why a non-Anthropic model still
says "I am Claude": the preset's identity overrides the weights.) Override it via
these env vars, read in [sidecar.js](./sidecar.js) — sent over ACP
`_meta.systemPrompt` **and** inlined into the first prompt:

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
# 1. Pull the model under Ollama. NOTE: the bare `lfm2.5:8b-a1b` tag does NOT
#    exist (manifest 404) — every 8b-a1b variant is quant-suffixed. Q4_K_M is the
#    ~5.16 GB build the spec intends.
ollama pull lfm2.5:8b-a1b-q4_K_M
#    (or pull the GGUF straight from HuggingFace, per Liquid's model card:
#     ollama pull hf.co/LiquidAI/LFM2.5-8B-A1B-GGUF:Q4_K_M)
# 2. Give it enough context (the default 4096 is too small for read_tree)
export OLLAMA_CONTEXT_LENGTH=32768
# 3. Launch — OPENCODE_CONFIG points at opencode.local.json (provider=ollama, model=lfm2.5:8b-a1b-q4_K_M)
yarn harness:local
```

The model/provider live in [opencode.local.json](./opencode.local.json); edit the
`model` / `baseURL` there to try a different local model or server (LM Studio,
llama.cpp, vLLM — all OpenAI-compatible at a `/v1` base URL).

### OpenCode config specifics

[opencode.local.json](./opencode.local.json) differs from the other backends in
two ways that are easy to trip over:

- **No comments — strict schema.** OpenCode validates the config against its JSON
  schema and **rejects any unrecognized key**, including the `"//": "…"` comment
  convention (it fails with `Configuration is invalid … Unrecognized keys: //`).
  Keep all annotations here in the README, not in the JSON.
- **OpenCode ignores the ACP `_meta.systemPrompt`** the sidecar sends per session
  (that's a `claude-agent-acp` convention). This used to mean OpenCode got no
  Acorn prompt — now fixed: the prompt (and skill) are delivered as **inline
  text** on the first turn for every backend (see *System prompt & context
  delivery* above), so `ACORN_SYSTEM_PROMPT_FILE` reaches OpenCode the same way it
  reaches claude. The top-level `instructions:
  ["web/dev-harness/acorn-system-prompt.md"]` key in the config is now an
  *optional* extra: it also seeds the prompt into OpenCode's own system slot
  (path resolves from the git root). Harmless redundancy — the inline copy is what
  guarantees parity; you can drop the key without losing the Acorn context.
- **MCP fallback registered up front.** For the known "`session/new` `mcpServers`
  don't attach in ACP mode" OpenCode bug, the `acorn` stdio server
  ([acornToolsServer.js](./acornToolsServer.js), bridging back to the sidecar over
  HTTP via `ACORN_WEB_PORT`, default `8081` to match `harness:local`'s `WEB_PORT`)
  is registered directly under `mcp` rather than relying on ACP attachment.

Two more things to know:

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
