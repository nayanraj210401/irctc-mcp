import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Create a simple MCP server for testing
const server = new Server(
  {
    name: 'test-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {}
    },
  }
);

// Add a simple test endpoint
(server as any).on('request', async (request: any) => {
  if (request.method === 'test') {
    return { message: 'Test successful' };
  }
  return { error: 'Method not supported' };
});

// Start the server
const transport = new StdioServerTransport();
(server as any).connect(transport);

console.log('Test server started');
