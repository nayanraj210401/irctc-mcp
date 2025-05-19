// Import with .js extension for ES modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { toolSchemas, executeTool } from './tools/index.js';
import { config } from './config/index.js';
import { z } from 'zod';

// Initialize MCP server
const server = new McpServer({
  name: 'irctc-mcp',
  version: '1.0.0',
  description: 'MCP server for IRCTC integration with RapidAPI',
});

// Register all tools from toolSchemas
Object.entries(toolSchemas).forEach(([name, schema]) => {
  server.tool(
    name,
    schema.parameters.shape as Record<string, z.ZodType>,
    async (parameters) => {
      try {
        const result = await executeTool(name, parameters);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      } catch (error) {
        console.error(`Error executing tool ${name}:`, error);
        throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    }
  );
});

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);

console.log('IRCTC MCP Server started');

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down IRCTC MCP Server...');
  process.exit(0);
});

// Log configuration
console.log('Server Configuration:', {
  environment: config.NODE_ENV,
  port: config.PORT,
  rapidApiHost: config.RAPIDAPI_HOST,
});
