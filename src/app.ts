import type { NextFunction, Request, Response } from 'express';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { railkit } from './railkit.js';
import { tools } from './tools.js';

const MISSING_KEY = 'Send your own RailKit API key as "Authorization: Bearer <key>" or "X-RailKit-Key: <key>".';

function callerKey(req: Request): string | undefined {
  const bearer = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  return bearer ?? req.header('x-railkit-key') ?? undefined;
}

// Each request gets its own server bound to the caller's key; the process never holds a key of its own.
export function createApp(options: { railkitBaseUrl: string; allowedHosts?: string[] }) {
  const app = createMcpExpressApp({ host: '0.0.0.0', allowedHosts: options.allowedHosts });

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/mcp', async (req, res) => {
    const key = callerKey(req);
    if (!key) {
      res.status(401).set('WWW-Authenticate', 'Bearer').json({ jsonrpc: '2.0', error: { code: -32001, message: MISSING_KEY }, id: null });
      return;
    }
    const server = new McpServer({ name: 'irctc-mcp', version: '2.0.0' });
    const rk = railkit(key, options.railkitBaseUrl);
    for (const register of tools) register(server, rk);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on('close', () => {
      transport.close();
      server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  const methodNotAllowed = (_req: Request, res: Response) => {
    res.status(405).set('Allow', 'POST').end();
  };
  app.get('/mcp', methodNotAllowed);
  app.delete('/mcp', methodNotAllowed);

  app.use((err: Error & { type?: string }, _req: Request, res: Response, _next: NextFunction) => {
    const parseError = err.type === 'entity.parse.failed';
    if (!parseError) console.error(err);
    res.status(parseError ? 400 : 500).json({
      jsonrpc: '2.0',
      error: parseError ? { code: -32700, message: 'Parse error' } : { code: -32603, message: 'Internal error' },
      id: null,
    });
  });

  return app;
}
