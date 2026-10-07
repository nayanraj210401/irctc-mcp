import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createApp } from '../src/app.js';

// Mock RailKit: rejects "bad-key-secret", otherwise echoes the path and key it received after a random delay.
let railkitMock: Server;
let mcp: Server;
let mcpUrl: URL;

before(async () => {
  process.env.RAILKIT_API_KEY = 'operator-key-must-never-be-used';
  railkitMock = createServer((req, res) => {
    const key = req.headers['x-api-key'];
    setTimeout(() => {
      res.setHeader('Content-Type', 'application/json');
      if (key === 'bad-key-secret') {
        res.statusCode = 401;
        res.end(JSON.stringify({ success: false, error: 'Invalid API key' }));
        return;
      }
      res.end(JSON.stringify({ success: true, data: { path: req.url, key } }));
    }, Math.random() * 30);
  }).listen(0);
  const railkitBaseUrl = `http://127.0.0.1:${(railkitMock.address() as AddressInfo).port}`;
  mcp = createApp({ railkitBaseUrl }).listen(0);
  mcpUrl = new URL(`http://127.0.0.1:${(mcp.address() as AddressInfo).port}/mcp`);
});

after(() => {
  railkitMock.close();
  mcp.close();
});

async function connect(headers: Record<string, string>) {
  const client = new Client({ name: 'e2e', version: '0' });
  await client.connect(new StreamableHTTPClientTransport(mcpUrl, { requestInit: { headers } }));
  return client;
}

async function call(key: string, name: string, args: Record<string, unknown>) {
  const client = await connect({ Authorization: `Bearer ${key}` });
  try {
    const result = await client.callTool({ name, arguments: args });
    const text = (result.content as { text: string }[])[0].text;
    return { isError: result.isError === true, text };
  } finally {
    await client.close();
  }
}

test('lists the RailKit tools', async () => {
  const client = await connect({ Authorization: 'Bearer k' });
  const { tools } = await client.listTools();
  await client.close();
  for (const name of ['searchTrains', 'checkSeatAvailability', 'getTrainSchedule', 'getLiveTrainStatus', 'getPnrStatus', 'searchStations', 'getStation', 'searchTrainsByName', 'getFare', 'getLiveStation', 'getStationTimetable', 'getCancelledTrains', 'getTrainHistory']) {
    assert.ok(tools.some((t) => t.name === name), `missing tool ${name}`);
  }
});

test('rejects a request without a caller key, even when the server env has one', async () => {
  const res = await fetch(mcpUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
  });
  assert.equal(res.status, 401);
  assert.equal(res.headers.get('www-authenticate'), 'Bearer');
});

test('accepts the key from X-RailKit-Key', async () => {
  const client = await connect({ 'X-RailKit-Key': 'header-key' });
  const result = await client.callTool({ name: 'getPnrStatus', arguments: { pnrNumber: '1234567890' } });
  await client.close();
  assert.equal(JSON.parse((result.content as { text: string }[])[0].text).data.key, 'header-key');
});

test('concurrent callers each reach RailKit with their own key', async () => {
  const keys = Array.from({ length: 8 }, (_, i) => `user-key-${i}`);
  const results = await Promise.all(keys.map((k) => call(k, 'getPnrStatus', { pnrNumber: '1234567890' })));
  results.forEach((r, i) => assert.equal(JSON.parse(r.text).data.key, keys[i]));
});

test('converts YYYY-MM-DD to RailKit DD-MM-YYYY and uppercases station codes', async () => {
  const r = await call('k', 'searchTrains', { source: 'ndls', destination: 'PNBE', date: '2026-10-07' });
  assert.equal(JSON.parse(r.text).data.path, '/api/v1/trains/between/NDLS/PNBE?date=07-10-2026');
});

test('getFare puts the date before the stations, in DD-MM-YYYY', async () => {
  const r = await call('k', 'getFare', { trainNumber: '12301', from: 'ndls', to: 'hwh', date: '2026-10-07', classCode: '3A' });
  assert.equal(JSON.parse(r.text).data.path, '/api/v1/fare/12301/07-10-2026/NDLS/HWH/3A/GN');
});

test('searchStations URL-encodes the name', async () => {
  const r = await call('k', 'searchStations', { name: 'New Delhi' });
  assert.equal(JSON.parse(r.text).data.path, '/api/v1/stations/search?name=New%20Delhi');
});

test('getLiveStation defaults to 2 hours', async () => {
  const r = await call('k', 'getLiveStation', { stationCode: 'ndls' });
  assert.equal(JSON.parse(r.text).data.path, '/api/v1/stations/NDLS/live?hrs=2');
});

test('an upstream 401 becomes a tool error that does not echo the key', async () => {
  const r = await call('bad-key-secret', 'getPnrStatus', { pnrNumber: '1234567890' });
  assert.equal(r.isError, true);
  assert.match(r.text, /rejected the API key/);
  assert.doesNotMatch(r.text, /bad-key-secret/);
});
