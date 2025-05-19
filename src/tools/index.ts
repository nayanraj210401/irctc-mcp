import { trainTools } from './train.tools.js';
import { pnrTools } from './pnr.tools.js';
import { z } from 'zod';

// Define tool interface
interface Tool {
  name: string;
  description: string;
  parameters: z.ZodObject<any>;
  execute: (params: any) => Promise<any>;
}

// Export all tools
export const tools: Record<string, Tool> = {
  ...Object.fromEntries(
    Object.entries(trainTools).map(([key, tool]) => [tool.name, tool])
  ),
  ...Object.fromEntries(
    Object.entries(pnrTools).map(([key, tool]) => [tool.name, tool])
  )
};

// Export tool schemas for MCP server registration
export const toolSchemas = Object.fromEntries(
  Object.values(tools).map((tool) => [
    tool.name, 
    {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }
  ])
);

// Type for tool execution
type ToolName = keyof typeof tools;

// Execute tool by name
export async function executeTool(toolName: string, params: any) {
  const tool = tools[toolName];
  if (!tool) {
    throw new Error(`Tool ${toolName} not found`);
  }
  return await tool.execute(params);
}
