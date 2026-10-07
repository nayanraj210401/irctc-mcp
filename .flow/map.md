# Map · irctc-mcp
source-commit: f69ce94 · generated: 2026-10-07

## What this is
Remote MCP server (Streamable HTTP, stateless) exposing Indian Railways data from the RailKit REST API.
BYOK: every request carries the caller's RailKit key; the process never holds or reads one.

## Run / test / lint
- dev: `npm run dev` (tsx watch, :3000/mcp)
- test: `npm test` (node:test e2e against a mock RailKit, spawns the real entry too)
- typecheck: `npx tsc --noEmit` (src only; tests run via tsx)
- live smoke: `npm run smoke:live` (real api.railkit.in, bogus key → invalid-key error)
- build/start: `npm run build && npm start`; Docker: `docker build -t irctc-mcp .`
- no linter configured

## Entry points
- src/index.ts:5 · reads PORT, RAILKIT_BASE_URL, ALLOWED_HOSTS; listens
- src/app.ts:23 · POST /mcp: key from `Authorization: Bearer` / `X-RailKit-Key`, else 401
- src/app.ts:19 · GET /health
- scripts/smoke-live.ts · live RailKit check

## Modules
- src/app.ts · HTTP + per-request McpServer/transport lifecycle, JSON-RPC error middleware · talks to tools, railkit
- src/tools.ts · endpoint table: one `endpoint(name, description, zodShape, path)` per tool (13) · talks to railkit
- src/railkit.ts · `railkit(key, baseUrl)` → GET fetcher; maps 401/403/404/429/5xx to key-free messages
- test/e2e.test.ts · mock RailKit (keys `bad-key-secret`, `fail-500` trigger errors) + MCP client

## Data
None stored. No DB, no cache. RailKit responses `{success, data}` are returned minus `success`.

## Flows
- tool call: client → POST /mcp (src/app.ts:23) → new McpServer + tools (src/tools.ts:27) → rk(path) (src/railkit.ts:10) → api.railkit.in
- auth fail: missing key → 401 + WWW-Authenticate (src/app.ts:25); bad key upstream → tool isError (src/railkit.ts:14)
- dates: tools take YYYY-MM-DD, `toRailKitDate` → DD-MM-YYYY (src/tools.ts:11)

## Conventions
- New tool = one `endpoint(...)` entry in src/tools.ts; reuse `trainNumber`/`stationCode`/`date` schemas
- Behavior proven in test/e2e.test.ts via the mock echoing `{path, key}`
- Logs go to stderr; never log headers or keys

## Hazards
- Never add a server-side key fallback (BYOK; tested at test/e2e.test.ts "real entry point")
- RailKit REST requires the Advance plan; Free/Pro keys rejected (docs, untested)
- `backup/local-stdio` branch = old RapidAPI stdio version (local only)
- package-lock churn dominates diffs

## Features
.flow/features/README.md (build with feature-map)
