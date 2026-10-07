// mcp.connect: BYOK auth on POST /mcp and GET /health, against the real entry with RAILKIT_API_KEY set in its env.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startApp, artifact } from './_app.mjs';

let app;
before(async () => { app = await startApp(); });
after(async () => { await app.stop(); });

const listBody = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' });
const jsonHeaders = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' };

test('mcp.connect.health: GET /health is 200', async () => {
  const res = await fetch(`${app.base}/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
});

test('mcp.connect.main: Bearer key lists all 13 tools', async () => {
  const c = await app.client();
  const { tools } = await c.listTools();
  await c.close();
  assert.equal(tools.length, 13);
  artifact('mcp.connect', tools.map((t) => t.name));
});

test('mcp.connect.altheader: X-RailKit-Key is used for the RailKit call', async () => {
  const c = await app.client({ 'X-RailKit-Key': 'alt-header-key' });
  const r = await c.callTool({ name: 'getPnrStatus', arguments: { pnrNumber: '1234567890' } });
  await c.close();
  assert.equal(JSON.parse(r.content[0].text).data.key, 'alt-header-key');
});

test('mcp.connect.nokey: no key is 401 and never reaches RailKit, despite RAILKIT_API_KEY in server env', async () => {
  const before = app.requests.length;
  const res = await fetch(app.mcpUrl, { method: 'POST', headers: jsonHeaders, body: listBody });
  assert.equal(res.status, 401);
  assert.equal(res.headers.get('www-authenticate'), 'Bearer');
  assert.equal(app.requests.length, before);
  assert.ok(!app.requests.some((r) => r.key === 'operator-key-must-never-be-used'));
});

test('mcp.connect.isolation: 10 concurrent callers each use only their own key', async () => {
  const keys = Array.from({ length: 10 }, (_, i) => `caller-${i}`);
  const results = await Promise.all(keys.map((k) => app.call('getPnrStatus', { pnrNumber: '1234567890' }, k)));
  results.forEach((r, i) => assert.equal(r.json.data.key, keys[i]));
});

test('mcp.connect.badkey: RailKit 401 is a tool error that does not echo the key', async () => {
  const r = await app.call('getPnrStatus', { pnrNumber: '1234567890' }, 'bad-key-secret');
  assert.equal(r.isError, true);
  assert.match(r.text, /rejected the API key/);
  assert.doesNotMatch(r.text, /bad-key-secret/);
});
