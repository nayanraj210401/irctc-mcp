import { z, type ZodRawShape } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RailKit } from './railkit.js';

export type Tool = (server: McpServer, rk: RailKit) => void;

export const trainNumber = z.string().regex(/^\d{5}$/).describe('5-digit train number, e.g. 12301');
export const stationCode = z.string().regex(/^[A-Za-z]{1,5}$/).transform((s) => s.toUpperCase()).describe('Station code, e.g. NDLS');
export const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Date in YYYY-MM-DD format');

export const toRailKitDate = (isoDate: string) => isoDate.split('-').reverse().join('-');

export function endpoint<S extends ZodRawShape>(
  name: string,
  description: string,
  inputSchema: S,
  path: (args: z.output<z.ZodObject<S>>) => string,
): Tool {
  return (server, rk) => {
    const shape: ZodRawShape = inputSchema;
    server.registerTool(name, { description, inputSchema: shape }, async (args) => ({
      content: [{ type: 'text', text: JSON.stringify(await rk(path(args as z.output<z.ZodObject<S>>))) }],
    }));
  };
}

export const tools: Tool[] = [
  endpoint(
    'searchTrains',
    'Search for trains between two stations, optionally on a specific date',
    { source: stationCode, destination: stationCode, date: date.optional() },
    (a) => `/api/v1/trains/between/${a.source}/${a.destination}` + (a.date ? `?date=${toRailKitDate(a.date)}` : ''),
  ),
  endpoint(
    'checkSeatAvailability',
    'Check seat availability, fare, and waitlist confirmation prediction for a train journey',
    {
      trainNumber,
      from: stationCode,
      to: stationCode,
      date,
      classCode: z.enum(['SL', '3A', '2A', '1A', 'CC', 'EC', '2S']).describe('Travel class'),
      quota: z.enum(['GN', 'TQ', 'LD', 'SS']).default('GN').describe('Quota: GN general, TQ tatkal, LD ladies, SS senior citizen'),
    },
    (a) => `/api/v1/seats/${a.trainNumber}/${a.from}/${a.to}/${toRailKitDate(a.date)}/${a.classCode}/${a.quota}`,
  ),
  endpoint(
    'getTrainSchedule',
    'Get train details and its full route: stations, arrival/departure times, halts, distance',
    { trainNumber },
    (a) => `/api/v1/trains/${a.trainNumber}/info`,
  ),
  endpoint(
    'getLiveTrainStatus',
    'Get the live running status of a train for a journey start date',
    { trainNumber, date },
    (a) => `/api/v1/trains/${a.trainNumber}/live/${toRailKitDate(a.date)}`,
  ),
  endpoint(
    'getPnrStatus',
    'Get PNR status: journey, chart status, and each passenger\'s booking and current status',
    { pnrNumber: z.string().regex(/^\d{10}$/).describe('10-digit PNR number') },
    (a) => `/api/v1/pnr/${a.pnrNumber}`,
  ),
];
