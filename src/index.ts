import { createApp } from './app.js';

const allowedHosts = process.env.ALLOWED_HOSTS?.split(',').map((h) => h.trim()).filter(Boolean);

const port = Number(process.env.PORT ?? 3000);
createApp({
  railkitBaseUrl: process.env.RAILKIT_BASE_URL ?? 'https://api.railkit.in',
  allowedHosts: allowedHosts?.length ? allowedHosts : undefined,
}).listen(port, () => {
  console.error(`irctc-mcp listening on :${port}/mcp`);
});
