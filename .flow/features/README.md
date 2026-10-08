# Feature map

The maintained, user-facing source for what this repo does and how to prove each part works.
One file per feature. Regenerate this table with `features.sh index`; edit the feature files, not this table.

| Feature | Status | Verified | Entry points | Owns |
|---|---|---|---|---|
| [booking.check](booking.check.md) · Check seats and fares | unverified |  | api POST /mcp tools/call checkSeatAvailability<br>api POST /mcp tools/call getFare | `src/tools.ts` |
| [mcp.connect](mcp.connect.md) · Connect with your own RailKit key | unverified |  | api POST /mcp<br>api GET /health | `src/app.ts src/index.ts src/railkit.ts test/e2e.test.ts` |
| [pnr.status](pnr.status.md) · Check PNR status | unverified |  | api POST /mcp tools/call getPnrStatus | `src/tools.ts` |
| [stations.info](stations.info.md) · Station lookup and boards | unverified |  | api POST /mcp tools/call searchStations<br>api POST /mcp tools/call getStation<br>api POST /mcp tools/call getLiveStation<br>api POST /mcp tools/call getStationTimetable | `src/tools.ts` |
| [trains.find](trains.find.md) · Find trains | unverified |  | api POST /mcp tools/call searchTrains<br>api POST /mcp tools/call searchTrainsByName<br>api POST /mcp tools/call getTrainSchedule | `src/tools.ts` |
| [trains.track](trains.track.md) · Track running and past trains | unverified |  | api POST /mcp tools/call getLiveTrainStatus<br>api POST /mcp tools/call getTrainHistory<br>api POST /mcp tools/call getCancelledTrains | `src/tools.ts` |

Status: `verified` (scenario passed at the recorded commit) · `stale` (owned code changed since) · `broken` (scenario failed) · `unverified`.
