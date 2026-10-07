// pnr.status: every tool entry point reaches the right RailKit path with the caller's key.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startApp, artifact } from './_app.mjs';

const CASES = [
  ["getPnrStatus", {"pnrNumber": "1234567890"}, "/api/v1/pnr/1234567890"],
];

let app;
before(async () => { app = await startApp(); });
after(async () => { await app.stop(); });

test('pnr.status: each tool hits its RailKit endpoint', async () => {
  const results = [];
  for (const [name, args, path] of CASES) {
    const r = await app.call(name, args);
    assert.equal(r.isError, false, `${name}: ${r.text}`);
    assert.equal(r.json.data.path, path, name);
    assert.equal(r.json.data.key, 'verify-key', name);
    results.push({ name, args, path: r.json.data.path });
  }
  artifact('pnr.status', results);
});

test('pnr.status: invalid input is rejected before any RailKit call', async () => {
  const before = app.requests.length;
  const r = await app.call("getPnrStatus", {"pnrNumber": "12345"});
  assert.equal(r.isError, true);
  assert.equal(app.requests.length, before);
});
