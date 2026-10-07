---
id: pnr.status
title: Check PNR status
owns: src/tools.ts
entries: api POST /mcp tools/call getPnrStatus
scenario: node --test .claude/skills/verify-irctc-mcp/scenarios/pnr.status.test.mjs
status: verified
verified: 2026-10-07 2c6650f
---
# Check PNR status

A user enters a 10-digit PNR and sees booking, chart and per-passenger status.

## Sub-features
- pnr.status.main · getPnrStatus(pnrNumber) hits /api/v1/pnr/:pnr; non-10-digit input rejected

## How to get to it
MCP tools/call on POST /mcp.

## Driving it
tools/call getPnrStatus with 1234567890.

## Proof
Path /api/v1/pnr/1234567890.

## Gotchas
Chart status lives in data.chart.status; there is no separate chart tool.
