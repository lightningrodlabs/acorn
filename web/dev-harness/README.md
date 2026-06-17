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
