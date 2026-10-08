// trains.find: every tool entry point reaches the right RailKit path with the caller's key.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startApp, artifact } from './_app.mjs';

const CASES = [
  ["searchTrains", {"source": "ndls", "destination": "PNBE", "date": "2026-10-07"}, "/api/v1/trains/between/NDLS/PNBE?date=07-10-2026"],
  ["searchTrains", {"source": "NDLS", "destination": "PNBE"}, "/api/v1/trains/between/NDLS/PNBE"],
  ["searchTrainsByName", {"name": "Rajdhani Exp"}, "/api/v1/trains/search?name=Rajdhani%20Exp"],
  ["getTrainSchedule", {"trainNumber": "12301"}, "/api/v1/trains/12301/info"],
];

let app;
before(async () => { app = await startApp(); });
after(async () => { await app.stop(); });

test('trains.find: each tool hits its RailKit endpoint', async () => {
  const results = [];
  for (const [name, args, path] of CASES) {
    const r = await app.call(name, args);
    assert.equal(r.isError, false, `${name}: ${r.text}`);
    assert.equal(r.json.data.path, path, name);
    assert.equal(r.json.data.key, 'verify-key', name);
    results.push({ name, args, path: r.json.data.path });
  }
  artifact('trains.find', results);
});

test('trains.find: invalid input is rejected before any RailKit call', async () => {
  const before = app.requests.length;
  const r = await app.call("getTrainSchedule", {"trainNumber": "123"});
  assert.equal(r.isError, true);
  assert.equal(app.requests.length, before);
});
