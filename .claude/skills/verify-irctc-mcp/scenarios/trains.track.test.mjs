// trains.track: every tool entry point reaches the right RailKit path with the caller's key.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startApp, artifact } from './_app.mjs';

const CASES = [
  ["getLiveTrainStatus", {"trainNumber": "12301", "date": "2026-10-07"}, "/api/v1/trains/12301/live/07-10-2026"],
  ["getTrainHistory", {"trainNumber": "12301", "date": "2026-10-06"}, "/api/v1/trains/12301/history/06-10-2026"],
  ["getCancelledTrains", {}, "/api/v1/trains/cancelled"],
];

let app;
before(async () => { app = await startApp(); });
after(async () => { await app.stop(); });

test('trains.track: each tool hits its RailKit endpoint', async () => {
  const results = [];
  for (const [name, args, path] of CASES) {
    const r = await app.call(name, args);
    assert.equal(r.isError, false, `${name}: ${r.text}`);
    assert.equal(r.json.data.path, path, name);
    assert.equal(r.json.data.key, 'verify-key', name);
    results.push({ name, args, path: r.json.data.path });
  }
  artifact('trains.track', results);
});

test('trains.track: invalid input is rejected before any RailKit call', async () => {
  const before = app.requests.length;
  const r = await app.call("getLiveTrainStatus", {"trainNumber": "12301", "date": "07-10-2026"});
  assert.equal(r.isError, true);
  assert.equal(app.requests.length, before);
});
