---
name: verify-irctc-mcp
description: Drive the irctc-mcp remote MCP server like a client and prove each feature works. Use for "verify", "prove it works", "check the API", "run the app", or before claiming a tool or auth change is done.
---
# verify-irctc-mcp

generated-by: flow-stack:make-verifier
generated-at: 2026-10-07
source-commit: 2c6650f

Drives the real server entry (`src/index.ts`) over Streamable HTTP with the MCP SDK client, against a mock RailKit that records each request's path and `x-api-key`.

## Launch
- Install: `npm ci`
- `scenarios/_app.mjs` `startApp()` starts a mock RailKit on a random port, spawns `node --import tsx src/index.ts` in its own process group with `PORT`, `RAILKIT_BASE_URL` (the mock), and `RAILKIT_API_KEY=operator-key-must-never-be-used` (to prove it's ignored), then polls `GET /health` until 200 (15s timeout).
- `stop()` kills only that process group.
- Manual: `npm run dev` → `http://localhost:3000/mcp`.

## Reset
Stateless. Each scenario file starts a fresh app; nothing to clean except `.flow/artifacts/verify/`.

## Scenarios
One file per feature in `scenarios/<feature-id>.test.mjs`; the feature files in `.flow/features/` (index: `.flow/features/README.md`) are the source of truth and point at them via `scenario:`.
- Run one: `node --test .claude/skills/verify-irctc-mcp/scenarios/<id>.test.mjs`
- Run all: `/Users/nayanraj/Project/flow-stack/plugins/flow-stack/skills/feature-map/scripts/features.sh run --all`
- Tool features assert, per tool: the RailKit path received, the caller key forwarded, and that invalid input never reaches RailKit.
- `mcp.connect` asserts health, Bearer and X-RailKit-Key auth, 401 without a key (and no RailKit call), 10-way key isolation, and the bad-key error not echoing the key.

## Evidence
- `.flow/artifacts/verify/<feature>.json`: the tool calls and paths observed (`mcp.connect.json` = tool names).
- node:test TAP output on stdout.

## Live (deployed) check
Production: `https://irctc-mcp-production.up.railway.app/mcp` (Railway project irctc-mcp). Without a paid RailKit key only auth paths can be driven live: `/health` 200, keyless POST 401, `tools/list` 13, and a bogus key → "RailKit rejected the API key". `npm run smoke:live` covers the bogus-key path against real RailKit locally.

## Gotchas
- Mock keys: `bad-key-secret` → RailKit 401. Any other key → 200 echoing `{path, key}`.
- The real RailKit response shapes are not exercised (needs an Advance-plan key). Scenarios prove routing, dates, validation, and auth only.
- Port collision fails with "server exited … port busy?"; re-run.

## Self-test
`node --test .claude/skills/verify-irctc-mcp/scenarios/mcp.connect.test.mjs`

Currency saved: attention: user-level proof instead of "tests pass".
