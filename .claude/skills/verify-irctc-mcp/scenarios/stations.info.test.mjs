// stations.info: every tool entry point reaches the right RailKit path with the caller's key.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startApp, artifact } from './_app.mjs';

const CASES = [
  ["searchStations", {"name": "New Delhi"}, "/api/v1/stations/search?name=New%20Delhi"],
  ["getStation", {"stationCode": "ndls"}, "/api/v1/stations/NDLS"],
  ["getLiveStation", {"stationCode": "NDLS"}, "/api/v1/stations/NDLS/live?hrs=2"],
  ["getLiveStation", {"stationCode": "NDLS", "hours": 8}, "/api/v1/stations/NDLS/live?hrs=8"],
  ["getStationTimetable", {"stationCode": "NDLS", "date": "2026-10-07"}, "/api/v1/stations/NDLS/timetable?date=07-10-2026"],
];

let app;
before(async () => { app = await startApp(); });
after(async () => { await app.stop(); });

test('stations.info: each tool hits its RailKit endpoint', async () => {
  const results = [];
  for (const [name, args, path] of CASES) {
    const r = await app.call(name, args);
    assert.equal(r.isError, false, `${name}: ${r.text}`);
    assert.equal(r.json.data.path, path, name);
    assert.equal(r.json.data.key, 'verify-key', name);
    results.push({ name, args, path: r.json.data.path });
  }
  artifact('stations.info', results);
});

test('stations.info: invalid input is rejected before any RailKit call', async () => {
  const before = app.requests.length;
  const r = await app.call("searchStations", {"name": "N"});
  assert.equal(r.isError, true);
  assert.equal(app.requests.length, before);
});
