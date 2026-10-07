---
id: trains.track
title: Track running and past trains
owns: src/tools.ts
entries: api POST /mcp tools/call getLiveTrainStatus | api POST /mcp tools/call getTrainHistory | api POST /mcp tools/call getCancelledTrains
scenario:
status: unverified
verified:
---
# Track running and past trains

A user checks where a train is now, how a finished journey went, and which trains are cancelled today.

## Sub-features
- trains.track.live · getLiveTrainStatus(trainNumber, date) hits /api/v1/trains/:no/live/:DD-MM-YYYY
- trains.track.history · getTrainHistory(trainNumber, date) hits /api/v1/trains/:no/history/:DD-MM-YYYY
- trains.track.cancelled · getCancelledTrains() hits /api/v1/trains/cancelled

## How to get to it
MCP tools/call on POST /mcp.

## Driving it
tools/call each tool; check the path.

## Proof
Expected path per tool.

## Gotchas
History is 404 until a journey completes.
