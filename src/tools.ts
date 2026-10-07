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
  endpoint(
    'searchStations',
    'Search stations by name (min 2 chars) to turn a city or station name like "Delhi" into station codes for the other tools',
    { name: z.string().min(2).describe('Station name or part of it, e.g. "New Delhi"') },
    (a) => `/api/v1/stations/search?name=${encodeURIComponent(a.name)}`,
  ),
  endpoint(
    'getStation',
    "Get a station's name and coordinates by its code",
    { stationCode },
    (a) => `/api/v1/stations/${a.stationCode}`,
  ),
  endpoint(
    'searchTrainsByName',
    'Search trains by name (min 2 chars) to turn a name like "Rajdhani" into train numbers for the other tools',
    { name: z.string().min(2).describe('Train name or part of it, e.g. "Rajdhani"') },
    (a) => `/api/v1/trains/search?name=${encodeURIComponent(a.name)}`,
  ),
  endpoint(
    'getFare',
    'Get the fare breakdown (base, reservation, superfast, catering, GST, total) for a train journey',
    {
      trainNumber,
      from: stationCode,
      to: stationCode,
      date,
      classCode: z.enum(['1A', '2A', '3A', '3E', 'CC', 'EC', 'EA', 'FC', 'SL', '2S', 'VS', 'CH', 'HS', 'VC', 'VA']).describe('Travel class'),
      quota: z.enum(['GN', 'TQ', 'LD', 'DF', 'FT', 'LB', 'PT', 'YU', 'DP', 'HP', 'PH', 'SS']).default('GN').describe('Quota, GN general by default'),
    },
    (a) => `/api/v1/fare/${a.trainNumber}/${toRailKitDate(a.date)}/${a.from}/${a.to}/${a.classCode}/${a.quota}`,
  ),
  endpoint(
    'getLiveStation',
    'Get trains arriving at or departing from a station in the next 2, 4 or 8 hours',
    { stationCode, hours: z.union([z.literal(2), z.literal(4), z.literal(8)]).default(2).describe('Look-ahead window in hours: 2, 4 or 8') },
    (a) => `/api/v1/stations/${a.stationCode}/live?hrs=${a.hours}`,
  ),
  endpoint(
    'getStationTimetable',
    'Get the timetable of trains at a station; RailKit only accepts today, yesterday or tomorrow as the date',
    { stationCode, date: date.optional() },
    (a) => `/api/v1/stations/${a.stationCode}/timetable` + (a.date ? `?date=${toRailKitDate(a.date)}` : ''),
  ),
  endpoint(
    'getCancelledTrains',
    'List all fully and partially cancelled trains right now',
    {},
    () => '/api/v1/trains/cancelled',
  ),
  endpoint(
    'getTrainHistory',
    'Get the completed-journey timeline of a train for a start date (404 if the journey has not completed)',
    { trainNumber, date },
    (a) => `/api/v1/trains/${a.trainNumber}/history/${toRailKitDate(a.date)}`,
  ),
];
