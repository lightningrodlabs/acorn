# Standalone build with a working harness — build plan

Goal: run Acorn as a real build — `hc-spin` + built UI bundle, no webpack-dev-server —
with the LLM harness (chat panel, read_tree / propose_edits, diff bridge) fully working.

## Why the harness is dev-only today

Three couplings to webpack-dev-server, and nothing else:

1. **The sidecar host.** `attachHarnessSidecar(server)` is attached to the dev
   server's HTTP server in `webpack.dev.js` `onListening`. The sidecar itself
   (`web/dev-harness/sidecar.js`) is plain Node CJS and server-agnostic — it only
   needs *an* `http.Server` to hang its WS upgrade handler on.
2. **The HTTP bridges.** `/__acorn_tool` (hosted-MCP relay) and the three
   `/__acorn_diff*` endpoints (exchange file read/write, locate, locate-dir) are
   inline middlewares in `webpack.dev.js` `setupMiddlewares` — defined nowhere else.
3. **The renderer's assumptions.** `DevSidecarHarnessClient` connects to
   `ws://${location.host}/__acorn_harness` (same-origin), gates `available` on
   `process.env.__DEV_MODE__` (false in `webpack.prod.js`), and the diff/locate
   fetches in `AgentDiffTools.tsx` / `AskDialog.tsx` use relative URLs.

## Design decision: keep the dev topology, replace webpack-dev-server

Rather than a separate-origin harness server (CORS, CSP, URL discovery in the
renderer) or forking acorn-desktop/Kangaroo now, the standalone host **serves the
built UI itself**, exactly where the dev server used to be:

```
hc-spin (electron, conductor)
   └─ window loads http://localhost:$WEB_PORT   ← standalone harness host
                                                   • static-serves web/dist (SPA fallback)
                                                   • WS /__acorn_harness (sidecar, unchanged)
                                                   • /__acorn_tool + /__acorn_diff* bridges
                                                   • spawns ACP agent / direct backend (unchanged)
```

Same origin ⇒ zero changes to any renderer URL, no CORS, no CSP fight, and
`acornToolsServer.js`'s `ACORN_WEB_PORT` plumbing keeps working verbatim. The dev
flow (`yarn harness:claude` etc.) is untouched — it and the standalone host share
the same extracted modules. Packaging into the real desktop app (acorn-desktop /
Kangaroo) becomes a later phase that embeds this same host in the Electron main
process — `attachHarnessSidecar(server)` is already shaped for that.

## Phases

### Phase 1 — extract the bridges out of webpack.dev.js (refactor, no behavior change)

- New `web/dev-harness/bridges.js` exporting the three diff middlewares
  (`diffBridge`, `diffLocate`, `diffLocateDir`) exactly as they are today
  (fixed `/tmp/acorn-clarity` fallback dir, `?dir=` passthrough, bounded walks).
- `webpack.dev.js` imports them; its `setupMiddlewares` shrinks to unshift calls.
- Verify: existing dev flow (`yarn harness:claude`) still round-trips a
  read_tree + propose_edits and a diff-file export/import.

### Phase 2 — the standalone host

- New `web/dev-harness/host.js` (plain Node CJS, same style as sidecar.js):
  - `http.createServer` on `WEB_PORT` (default 8081), localhost bind.
  - Tiny middleware chain: `toolBridgeMiddleware` → bridges → static file server
    over `web/dist` with SPA fallback to `index.html`.
  - `attachHarnessSidecar(server)` — unchanged sidecar, all existing env config
    (`ACORN_HARNESS_CMD`, `ACORN_SYSTEM_PROMPT_FILE`, `ACORN_OPENAI_*`, MCP config)
    works as-is.
  - Clean exit kills the agent child (sidecar already hooks SIGINT/SIGTERM).
- No new dependencies: `ws` is already a devDependency; static serving is ~40
  lines by hand (content-type map for js/css/html/png/svg/fonts/map).

### Phase 3 — standalone bundle config

- New `web/webpack.standalone.js` via `webpack-merge` (already a dep) on the prod
  rules, minus HMR/react-refresh, with:
  - `__ADMIN_PORT__` / `__APP_PORT__` from env (like dev), not the hardcoded
    1235/8889 of webpack.prod.js.
  - `'process.env.KANGAROO': JSON.stringify(process.env.KANGAROO)` (prod config
    currently omits it entirely).
  - `'process.env.__DEV_MODE__': false`, plus a new
    `'process.env.__HARNESS__': JSON.stringify(true)` define.
- `devSidecarClient.ts`: `available` becomes
  `Boolean(process.env.__DEV_MODE__ || process.env.__HARNESS__)` — initialize()
  stays the real liveness gate (already latches `unavailable`).
- Leave `webpack.prod.js` (webhapp/Moss target) alone: `__HARNESS__` undefined ⇒
  chat hidden, exactly as today.

### Phase 4 — scripts (root package.json)

- `standalone:build` — `yarn workspace acorn-ui webpack --config webpack.standalone.js`
  with `KANGAROO=true WEB_PORT=8081 ADMIN_WS_PORT=1101 APP_WS_PORT=8101`.
- `standalone:ui` — `node web/dev-harness/host.js` (same env).
- `standalone:happ` — existing `desktop:happ` (hc-spin `--ui-port 8081`) reused as-is.
- Harness variants mirroring the dev ones, e.g. `standalone:claude`,
  `standalone:openrouter`, `standalone:ollama` = env + `standalone:ui`.
- Run order is identical to today's two-terminal habit:
  `yarn standalone:build` once, then `standalone:claude` + `desktop:happ`.

### Phase 5 — verification

- Unit: host's middleware chain (static + fallback + bridge routing) with
  supertest-style raw http tests in jest (mirrors existing sidecar/session tests);
  bridges.js gets its extraction covered by the existing dev-flow tests it moved
  out of, plus a direct test.
- Manual checklist on the built bundle (no dev server running anywhere):
  1. App loads from host, joins/creates a project (conductor via hc-spin).
  2. Chat panel appears; first turn gets skill + system prompt; model label right.
  3. read_tree returns the live snapshot; propose_edits opens an inert draft;
     human Confirm writes it (draft-safety invariant intact).
  4. Diff-file export lands next to the imported tree file (`?dir=` path) and
     import round-trips.
  5. Renderer reload: session resumes (fast path), in-flight turn adopted.
  6. Host restart: durable resume via session/load where the backend supports it.
  7. Concurrent sessions across two projects (session registry) still attribute
     hosted tool calls correctly.

### Phase 6 (future, separate effort) — packaged desktop app

- Embed `host.js` in acorn-desktop's (Kangaroo) Electron main process: attach the
  sidecar + bridges to (or beside) the window's origin, spawn the agent from main.
- Needs the acorn-desktop repo (not currently cloned locally), a settings surface
  for API keys / backend choice, and a decision about bundling an agent binary vs
  `npx` at first run. The host built in Phases 1–2 is the embeddable unit; nothing
  in it references webpack or the dev server.

## Runtime portability (Moss, Tauri)

The load-bearing choices are runtime-neutral, verified against the local moss and
tauri-plugin-holochain sources:

- **The host is a self-contained Node process.** No webpack, no Electron API, no
  dev-server coupling — any runtime (Kangaroo, Moss, Tauri) can spawn it as a
  child process or embed `attachHarnessSidecar(server)` beside its own server.
- **The renderer's only transport is the HarnessClient seam + the WS frame
  protocol.** Re-pointing it at a different origin touches exactly one seam (a
  base-URL resolver in devSidecarClient) plus the three relative-fetch sites
  (AgentDiffTools, AskDialog) and CORS headers on the host. The frames themselves
  are transport-agnostic (mossClient.ts was designed as an alternate carrier).

**Tauri** (if the desktop shell moves off Kangaroo/Electron): supported both ways.
`tauri-plugin-holochain`'s `main_window_builder` takes `url: Option<WebviewUrl>`
(defaults to `WebviewUrl::App("index.html")`), so the window can load
`WebviewUrl::External(http://localhost:$WEB_PORT)` → the same-origin topology of
this plan carries over verbatim, host spawned as a Tauri sidecar binary.
Alternatively, UI served from `tauri://` with the separate-origin variant —
CSP is ours to set in tauri.conf.json (`connect-src ws://localhost:*`), and
Chromium/WebView loopback targets are exempt from mixed-content blocking.

**Moss**: two distinct claims.
1. *Acorn-as-applet keeps working unchanged.* This plan doesn't touch the
   webhapp/`webpack.prod.js` path; in Weave context `MossHarnessClient` still
   reports unavailable → chat hidden, exactly as today.
2. *Lighting the harness up inside Moss is a small incremental variant, not a
   rework.* Moss serves applets from the `applet://` scheme, registered
   `secure: true, supportFetchAPI: true` (moss/src/main/index.ts
   `registerSchemesAsPrivileged`), and injects **no CSP** on applet responses —
   so a WS to `ws://localhost:$PORT` from the applet iframe is permitted
   (localhost is a potentially-trustworthy origin, exempt from mixed-content
   blocking; Moss dev mode already proves iframe→localhost WS via the HMR
   socket). Work needed: the separate-origin seam above, CORS on the host, an
   availability probe (configured host URL, e.g. localStorage), and
   `getHarnessClient` falling back to the sidecar client in Weave context when a
   host URL is set. The long-term "proper" Moss path (harness owned by the Moss
   main process behind a Weave host API) stays open — same frames, different
   carrier.

**Shared constraint for every runtime**: the host and the ACP agent both need a
Node runtime on the machine (the agent is `npx`-launched Node regardless of
shell). For packaged apps that means bundling Node or a compiled host binary —
a packaging problem, identical across Electron/Tauri, not an architecture one.

### A Rust host? (later, on triggers — not this milestone)

The renderer only speaks the WS frames (`src/harness/protocol.ts`) + the bridge
HTTP shapes, so the host is reimplementable in any language without renderer
changes; the Phase 1–2 extraction defines exactly the surface a port implements.

- **For**: single static binary (clean Tauri sidecar — or better, a crate
  compiled straight into the Tauri main process next to tauri-plugin-holochain);
  Zed's `agent-client-protocol` crate covers the ACP client side; paired with
  the direct backend it removes Node from the product entirely.
- **Against, today**: it's a rewrite of ~2k lines of subtle working sidecar
  behavior (rebinding/queueing, replay suppression, tool-call session
  attribution, per-backend systemSlot quirks) while the harness is still moving
  fast; and Node ACP agents (claude-agent-acp, gemini) need Node on the machine
  anyway, so only the direct-backend path becomes truly dependency-free.
- **Drift rule if ported**: dev must use the Rust host too — webpack-dev-server
  keeps HMR only and proxies `/__acorn_harness` + bridges to it, so there is
  exactly ONE implementation, never a Node-dev/Rust-prod pair.
- **Cheap middle path**: compile the Node host to a single binary
  (`bun build --compile` / Node SEA) — most of the distribution win, no rewrite.
- **Triggers for the port**: committing to Tauri, and/or the primary backend
  becoming direct-API (or a Rust ACP agent) rather than a Node agent.

## CI dev-build plan (acorn webhapp + acorn-desktop AppImage)

Two existing pipelines to reuse, not replace: acorn's `release-webhapps.yaml`
(fires on `happ-v*` tags; nix + cachix `holochain-ci`; `pack-happs` +
`build-webhapp`; draft prerelease with webhapp/happ) and acorn-desktop's
`release.yaml` (push to `release`; full platform matrix + signing).

**Phase A — acorn: `dev-webhapp.yaml`.** `workflow_dispatch` (branch-choosable)
clone of the release workflow that publishes a NON-draft prerelease tagged
`happ-dev-<shortsha>` with `acorn.webhapp` + a `.sha256` file. Builds zomes from
the branch — this is where "a new build of the DNA" happens; a changed integrity
zome means a new DNA hash, which is fine because dev builds are network-isolated
(Phase B). The existing release workflow names its release from package.json
version, not the pushed tag (collision + `allowUpdates: false` failure), hence a
separate workflow rather than tag-pattern reuse. Thanks to the runtime
`__ACORN_HARNESS__` flag, the ordinary `build-webhapp` output is correct for
desktop and Moss alike. Prereqs: merge `standalone-build` → `clarity-forge`,
push the branch.

**Phase B — acorn-desktop: dev identity in `write-configs.js`.** A `DEV_BUILD=1`
env consumed where kangaroo.config.ts is materialized into
`resources/kangaroo.config.json`: appId → `org.lightningrodlabs.acorn.dev`,
productName → `Acorn Dev`, autoUpdates → false. Runtime data-dir identity comes
from that json (filesystem.ts), and the default network seed is
`${productName}-${breakingVersion}` (cli.ts) — so this one switch separates the
dev build's profile AND its DHT network from a production install on the same
machine. Without it, a dev AppImage sharing the production profile would see
`kangaroo.happ` already installed and silently keep the OLD DNA under the new
UI. electron-builder.yml stays untouched (its appId is desktop-integration
cosmetics only).

**Phase C — acorn-desktop: `dev-build.yaml`.** `workflow_dispatch` with a
`webhapp_tag` input (an acorn `happ-dev-*` tag). Linux x64 only, no signing:
node 22 + yarn, `fetch:binaries`, `write:configs` under `DEV_BUILD=1`, curl the
webhapp release asset into `pouch/` + verify its `.sha256` (bypassing
`fetch:webhapp`, which is pinned to the stable URL in kangaroo.config.ts), then
`yarn build:appimage`; upload the AppImage as a workflow artifact (optionally
also a `dev-*` prerelease for easy sharing). CI uses the COMMITTED vendored
`harness/` — `sync-harness` stays a dev-time action, `prepare:harness` already
runs inside `yarn build`.

**Phase D — verify.** Dispatch A, dispatch C with A's tag, download, and check:
no env → stock behavior, fresh `~/.config/org.lightningrodlabs.acorn.dev`
profile; with `ACORN_HARNESS_CMD` → chat, tools round-trip; confirm the
installed DNA hash matches the branch build (not a reused production DNA).

Decisions to confirm before building: dispatch-only vs also push-triggered;
artifact-only vs prerelease for the AppImage; whether the dev seed should be
pinned explicitly instead of riding the productName default.

## Risks / gotchas

- **Do not reuse `build:ui`** (one-shot `webpack.dev.js` build) for this: it bakes
  in the react-refresh runtime, which throws outside a dev-server page. Hence
  webpack.standalone.js.
- The host needs Node on PATH (fine under `nix develop`; note it in DEVELOPERS.md).
- `npx -y @agentclientprotocol/claude-agent-acp` needs network on first run —
  same as dev today, acceptable for this milestone.
- hc-spin's `--ui-port` flow means the window origin is `http://localhost:8081`
  — identical to dev, so the AskDialog folder-pick walk, exchange-file dirs, and
  fixed `/tmp/acorn-harness` system-slot dir all behave exactly as in dev.
- `webpack.prod.js` hardcodes admin/app ports; unchanged here, but worth a later
  look at whether the webhapp path actually uses launcher-env injection.
