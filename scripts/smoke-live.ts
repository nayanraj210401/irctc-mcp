// Calls the real RailKit API through our server with a bogus key and expects an invalid-key tool error.
import type { AddressInfo } from 'node:net';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createApp } from '../src/app.js';

const server = createApp({ railkitBaseUrl: 'https://api.railkit.in' }).listen(0);
const url = new URL(`http://127.0.0.1:${(server.address() as AddressInfo).port}/mcp`);
const client = new Client({ name: 'smoke', version: '0' });
await client.connect(new StreamableHTTPClientTransport(url, { requestInit: { headers: { Authorization: 'Bearer bogus-smoke-key' } } }));
const result = await client.callTool({ name: 'getPnrStatus', arguments: { pnrNumber: '1234567890' } });
await client.close();
server.close();
const text = (result.content as { text: string }[])[0].text;
console.log(text);
if (!result.isError || !/rejected the API key/.test(text)) process.exit(1);
