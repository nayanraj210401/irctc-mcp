// Fixture: a mock RailKit plus the real server entry (src/index.ts), spawned in its own process group.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, writeFileSync } from 'node:fs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const ROOT = new URL('../../../../', import.meta.url).pathname;

export async function startApp() {
  const requests = [];
  const railkit = createServer((req, res) => {
    const key = req.headers['x-api-key'];
    requests.push({ path: req.url, key });
    res.setHeader('Content-Type', 'application/json');
    if (key === 'bad-key-secret') {
      res.statusCode = 401;
      res.end(JSON.stringify({ success: false, error: 'Invalid API key' }));
      return;
    }
    setTimeout(() => res.end(JSON.stringify({ success: true, data: { path: req.url, key } })), Math.random() * 20);
  });
  await new Promise((r) => railkit.listen(0, '127.0.0.1', r));

  const port = 30000 + Math.floor(Math.random() * 20000);
  const child = spawn(process.execPath, ['--import', 'tsx', 'src/index.ts'], {
    cwd: ROOT,
    detached: true,
    stdio: ['ignore', 'ignore', 'pipe'],
    env: {
      ...process.env,
      PORT: String(port),
      RAILKIT_BASE_URL: `http://127.0.0.1:${railkit.address().port}`,
      RAILKIT_API_KEY: 'operator-key-must-never-be-used',
    },
  });
  const base = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 15000;
  for (;;) {
    if (child.exitCode !== null) throw new Error(`server exited (${child.exitCode}); port ${port} busy?`);
    if (Date.now() > deadline) throw new Error('server not ready after 15s');
    try {
      if ((await fetch(`${base}/health`)).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }

  return {
    base,
    mcpUrl: new URL(`${base}/mcp`),
    requests,
    async client(headers = { Authorization: 'Bearer verify-key' }) {
      const c = new Client({ name: 'verify-irctc-mcp', version: '0' });
      await c.connect(new StreamableHTTPClientTransport(new URL(`${base}/mcp`), { requestInit: { headers } }));
      return c;
    },
    async call(name, args, key = 'verify-key') {
      const c = await this.client({ Authorization: `Bearer ${key}` });
      try {
        const r = await c.callTool({ name, arguments: args });
        const text = r.content[0].text;
        return { isError: r.isError === true, text, json: r.isError ? null : JSON.parse(text) };
      } finally {
        await c.close();
      }
    },
    async stop() {
      try { process.kill(-child.pid); } catch {}
      railkit.close();
    },
  };
}

export function artifact(feature, data) {
  const dir = `${ROOT}.flow/artifacts/verify`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${feature}.json`, JSON.stringify(data, null, 2));
}
