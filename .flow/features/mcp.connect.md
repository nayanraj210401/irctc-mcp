---
id: mcp.connect
title: Connect with your own RailKit key
owns: src/app.ts src/index.ts src/railkit.ts test/e2e.test.ts scripts/smoke-live.ts
entries: api POST /mcp | api GET /health
scenario:
status: unverified
verified:
---
# Connect with your own RailKit key

A user adds the server URL to their MCP client with their own RailKit key and gets the tool list. Without a key they are told how to send one. Their key is used only for their own requests.

## Sub-features
- mcp.connect.main · tools/list with `Authorization: Bearer <key>` returns all 13 tools
- mcp.connect.altheader · `X-RailKit-Key: <key>` works as well as Bearer
- mcp.connect.nokey · no key → HTTP 401 with `WWW-Authenticate: Bearer`, even if the server env has RAILKIT_API_KEY
- mcp.connect.isolation · concurrent callers each reach RailKit with only their own key
- mcp.connect.badkey · RailKit 401 → tool error "rejected the API key" without echoing the key
- mcp.connect.health · GET /health → 200 {ok:true}

## How to get to it
Any MCP client (Claude Code `claude mcp add --transport http ... --header`, Cursor, Windsurf) at `POST /mcp`; load balancers at `GET /health`.

## Driving it
POST JSON-RPC `initialize` then `tools/list` with and without the header; call a tool with a bogus key.

## Proof
With a key: 13 tool names. Without: 401. Must not happen: a request without a key succeeds, or a key appears in any response text.

## Gotchas
RailKit REST needs the Advance plan. DNS-rebinding Host checks only apply when ALLOWED_HOSTS is set.
