---
id: booking.check
title: Check seats and fares
owns: src/tools.ts
entries: api POST /mcp tools/call checkSeatAvailability | api POST /mcp tools/call getFare
scenario:
status: unverified
verified:
---
# Check seats and fares

A user checks if seats are available (with a waitlist prediction) and what the fare will be.

## Sub-features
- booking.check.availability · checkSeatAvailability hits /api/v1/seats/:no/:from/:to/:DD-MM-YYYY/:class/:quota, quota defaults GN
- booking.check.fare · getFare hits /api/v1/fare/:no/:DD-MM-YYYY/:from/:to/:class/:quota (date before stations)

## How to get to it
MCP tools/call on POST /mcp.

## Driving it
tools/call each tool; check the path.

## Proof
Expected path; invalid class codes are rejected by the schema before any RailKit call.

## Gotchas
Availability accepts 7 classes, fare accepts 15.
