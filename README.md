# IRCTC MCP Server

A remote MCP server for Indian Railways, built on the [RailKit](https://railkit.in) REST API. It speaks Streamable HTTP at `POST /mcp`. You bring your own RailKit API key and send it with each request. The server holds no key of its own.

## Tools

- `searchTrains`: trains between two stations, optionally on a date
- `checkSeatAvailability`: seat availability, fare, and waitlist prediction
- `getTrainSchedule`: train details and full route
- `getLiveTrainStatus`: live running status for a journey date
- `getPnrStatus`: PNR status and passenger details

More tools may be added. The authoritative list is what the server returns for `tools/list`.

## Get a RailKit key

1. Sign in at [railkit.in](https://railkit.in).
2. Open Dashboard, then API Keys, and create a key.

RailKit's direct REST access requires the **Advance plan**. Free and Pro keys are rejected.

## Connect

Replace `<host>` with the address of a running server. Send your key as `Authorization: Bearer <key>` or `X-RailKit-Key: <key>`.

### Claude Code

```bash
claude mcp add --transport http irctc https://<host>/mcp --header "Authorization: Bearer <your-railkit-key>"
```

### Cursor

In `mcp.json`:

```json
{
  "mcpServers": {
    "irctc": {
      "url": "https://<host>/mcp",
      "headers": { "Authorization": "Bearer ${env:RAILKIT_API_KEY}" }
    }
  }
}
```

### Windsurf

In `mcp_config.json`:

```json
{
  "mcpServers": {
    "irctc": {
      "serverUrl": "https://<host>/mcp",
      "headers": { "Authorization": "Bearer <your-railkit-key>" }
    }
  }
}
```

### claude.ai and Claude Desktop

Add a custom connector pointing at `https://<host>/mcp`.

TODO (maintainer): it is unverified how claude.ai sends a static API key to a custom connector. Test this and document the working setup, or add a supported auth flow.

## Privacy

The server never stores or logs your key. Every request uses only the key sent with that request.

## Self-host and develop

Requires Node 18+.

```bash
npm install
npm run dev          # watch mode on http://localhost:3000
npm test
npm run smoke:live   # live check against RailKit
```

Environment variables (see `.env.example`):

- `PORT`: listen port (default `3000`)
- `RAILKIT_BASE_URL`: RailKit API base (default `https://api.railkit.in`)
- `ALLOWED_HOSTS`: optional comma-separated Host header allowlist

The server does not read a RailKit key from the environment.

Health check: `GET /health`.

### Docker

```bash
docker build -t irctc-mcp .
docker run -p 3000:3000 irctc-mcp
```

### Railway

Deploy the repo on Railway. `railway.json` selects the Dockerfile and the `/health` check. Set `ALLOWED_HOSTS` to your public domain if you want Host header checking.

## Older local version

The previous local stdio version lives on the `backup/local-stdio` branch.

## Credits

If you use this project in your work, we'd appreciate a shoutout! While not required, it helps the project grow and helps others discover it. You can mention it like this:

```
IRCTC MCP - A Model Context Protocol server for Indian Railway IRCTC API integration
https://github.com/nayanraj210401/irctc-mcp
```

## License

This project is licensed under the [MIT License](LICENSE) - see the [LICENSE](LICENSE) file for details.
