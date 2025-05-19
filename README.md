# IRCTC MCP Server

A Model Context Protocol (MCP) server for IRCTC (Indian Railways) integration using RapidAPI. This server provides tools for searching trains, checking PNR status, and other IRCTC-related functionalities.

## Features

- Search trains between stations
- Check seat availability
- Get train schedules
- Check PNR status
- Get live train status
- Built with TypeScript for type safety
- Environment-based configuration

## Prerequisites

- Node.js 18+
- npm or yarn
- RapidAPI key for IRCTC API

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd irctc-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and update with your RapidAPI key:
   ```bash
   cp .env.example .env
   ```

4. Build the project:
   ```bash
   npm run build
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## Using the MCP in Your Applications

### Adding to Cascade

To add the IRCTC MCP to Cascade, you need to update your MCP configuration file located at `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "irctc": {
      "command": "node",
      "args": [
        "/path/to/irctc-mcp/dist/index.js"
      ],
      "env": {
        "RAPIDAPI_KEY": "your_rapidapi_key_here",
        "RAPIDAPI_HOST": "irctc1.p.rapidapi.com"
      }
    }
  }
}
```

Replace `/path/to/irctc-mcp` with the actual path to your project directory and update the `RAPIDAPI_KEY` with your actual API key.

### Adding to Claude or Other MCP-Compatible Applications

You can add this MCP to Claude or other MCP-compatible applications by creating a JSON configuration file:

```json
{
  "name": "IRCTC MCP",
  "description": "MCP server for IRCTC integration with RapidAPI",
  "transport": {
    "type": "http",
    "url": "http://localhost:3000"
  }
}
```

### Adding to Claude Desktop

#### macOS:
1. Open Claude Desktop
2. Click on "Claude" in the menu bar
3. Select "Settings" (or "Preferences")
4. Go to the "Developer" tab
5. Click on "Edit Config"
   - This will open the configuration file at: `~/Library/Application Support/Claude/claude_desktop_config.json`

#### Windows:
1. Open Claude Desktop
2. Click on the hamburger menu (☰) in the top-left corner
3. Go to "File" > "Settings"
4. Navigate to the "Developer" tab
5. Click on "Edit Config"
   - This will open the configuration file at: `%APPDATA%\Claude\claude_desktop_config.json`

#### Configuration Example:
Add the following JSON to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "irctc": {
      "command": "node",
      "args": [
        "/path/to/irctc-mcp/dist/index.js"
      ],
      "env": {
        "RAPIDAPI_KEY": "your_rapidapi_key_here",
        "RAPIDAPI_HOST": "irctc1.p.rapidapi.com"
      }
    }
  }
}
```

After making changes, completely close and restart Claude Desktop for the changes to take effect.

### Adding to Claude Web

1. Save the above JSON configuration to a file (e.g., `irctc-mcp.json`)
2. In Claude Web, click on the '+' button in the sidebar
3. Select 'Add MCP Server' and upload your JSON configuration file
4. The IRCTC MCP will now be available in your Claude conversations

### Example Usage in Claude

Once connected, you can ask Claude to use the IRCTC MCP with prompts like:

```
Can you search for trains from NDLS to PNBE on 2023-12-25?
```

Or:

```
Check the PNR status for 1234567890
```

## Available Tools

### Train Tools
- `searchTrains`: Search for trains between two stations
- `checkSeatAvailability`: Check seat availability for a specific train
- `getTrainSchedule`: Get the complete schedule of a train
- `getLiveTrainStatus`: Get live status of a running train

### PNR Tools
- `getPnrStatus`: Get the current status of a PNR
- `getPnrHistory`: Get booking history for a PNR (placeholder)
- `checkPnrChartStatus`: Check if the chart has been prepared for a PNR

## RapidAPI Integration

This project uses the [IRCTC API](https://rapidapi.com/IRCTCAPI/api/irctc1) available on RapidAPI. To use this API:

1. Sign up for a free account at [RapidAPI](https://rapidapi.com/)
2. Subscribe to the [IRCTC API](https://rapidapi.com/IRCTCAPI/api/irctc1)
3. Get your API key from the RapidAPI dashboard

## Environment Variables

- `RAPIDAPI_KEY`: Your RapidAPI key (required)
- `RAPIDAPI_HOST`: Set to `irctc1.p.rapidapi.com`
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## Credits

If you use this project in your work, we'd appreciate a shoutout! While not required, it helps the project grow and helps others discover it. You can mention it like this:

```
IRCTC MCP - A Model Context Protocol server for Indian Railway IRCTC API integration
https://github.com/nayanraj210401/irctc-mcp
```

## License

This project is licensed under the [MIT License](LICENSE) - see the [LICENSE](LICENSE) file for details.
