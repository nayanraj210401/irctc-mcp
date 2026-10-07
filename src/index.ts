#!/usr/bin/env node
import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3000);
createApp({
  railkitBaseUrl: process.env.RAILKIT_BASE_URL ?? 'https://api.railkit.in',
  allowedHosts: process.env.ALLOWED_HOSTS?.split(','),
}).listen(port, () => {
  console.error(`irctc-mcp listening on :${port}/mcp`);
});
