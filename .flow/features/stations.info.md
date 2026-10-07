---
id: stations.info
title: Station lookup and boards
owns: src/tools.ts
entries: api POST /mcp tools/call searchStations | api POST /mcp tools/call getStation | api POST /mcp tools/call getLiveStation | api POST /mcp tools/call getStationTimetable
scenario:
status: unverified
verified:
---
# Station lookup and boards

A user turns a city name into station codes, and sees trains at a station now or on its timetable.

## Sub-features
- stations.info.search · searchStations(name) hits /api/v1/stations/search?name=<urlencoded>
- stations.info.get · getStation(code) hits /api/v1/stations/:code
- stations.info.live · getLiveStation(code, hours=2) hits /api/v1/stations/:code/live?hrs=2|4|8
- stations.info.timetable · getStationTimetable(code, date?) hits /api/v1/stations/:code/timetable[?date=DD-MM-YYYY]

## How to get to it
MCP tools/call on POST /mcp.

## Driving it
tools/call each tool; check the path.

## Proof
Expected path per tool.

## Gotchas
Timetable dates: RailKit accepts only today/yesterday/tomorrow.
