// booking.check: every tool entry point reaches the right RailKit path with the caller's key.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startApp, artifact } from './_app.mjs';

const CASES = [
  ["checkSeatAvailability", {"trainNumber": "12301", "from": "NDLS", "to": "HWH", "date": "2026-10-07", "classCode": "3A"}, "/api/v1/seats/12301/NDLS/HWH/07-10-2026/3A/GN"],
  ["getFare", {"trainNumber": "12301", "from": "NDLS", "to": "HWH", "date": "2026-10-07", "classCode": "3A", "quota": "TQ"}, "/api/v1/fare/12301/07-10-2026/NDLS/HWH/3A/TQ"],
];

let app;
before(async () => { app = await startApp(); });
after(async () => { await app.stop(); });

test('booking.check: each tool hits its RailKit endpoint', async () => {
  const results = [];
  for (const [name, args, path] of CASES) {
    const r = await app.call(name, args);
    assert.equal(r.isError, false, `${name}: ${r.text}`);
    assert.equal(r.json.data.path, path, name);
    assert.equal(r.json.data.key, 'verify-key', name);
    results.push({ name, args, path: r.json.data.path });
  }
  artifact('booking.check', results);
});

test('booking.check: invalid input is rejected before any RailKit call', async () => {
  const before = app.requests.length;
  const r = await app.call("checkSeatAvailability", {"trainNumber": "12301", "from": "NDLS", "to": "HWH", "date": "2026-10-07", "classCode": "XX"});
  assert.equal(r.isError, true);
  assert.equal(app.requests.length, before);
});
