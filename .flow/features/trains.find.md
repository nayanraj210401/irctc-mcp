---
id: trains.find
title: Find trains
owns: src/tools.ts
entries: api POST /mcp tools/call searchTrains | api POST /mcp tools/call searchTrainsByName | api POST /mcp tools/call getTrainSchedule
scenario: node --test .claude/skills/verify-irctc-mcp/scenarios/trains.find.test.mjs
status: verified
verified: 2026-10-07 2c6650f
---
# Find trains

A user finds trains between two stations, looks a train up by name, and sees its full route and timings.

## Sub-features
- trains.find.between · searchTrains(source, destination, date?) hits /api/v1/trains/between/:from/:to?date=DD-MM-YYYY
- trains.find.byname · searchTrainsByName(name) hits /api/v1/trains/search?name=<urlencoded>
- trains.find.schedule · getTrainSchedule(trainNumber) hits /api/v1/trains/:no/info

## How to get to it
MCP tools/call on POST /mcp.

## Driving it
tools/call each tool with sample inputs; check the RailKit path received.

## Proof
RailKit receives the expected path with uppercased station codes and DD-MM-YYYY dates. Must not happen: a YYYY-MM-DD date is passed through unconverted.

## Gotchas
Station codes are uppercased; train numbers must be 5 digits.
