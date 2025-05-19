import { z } from 'zod';
import { RapidApiService } from '../services/rapidapi.service.js';
import type { SearchTrainsInput, SeatAvailabilityInput } from '../types/index.js';

const rapidApiService = new RapidApiService();

export const trainTools = {
  searchTrains: {
    name: 'searchTrains',
    description: 'Search for trains between two stations on a specific date',
    parameters: z.object({
      source: z.string().describe('Source station code (e.g., NDLS for New Delhi)'),
      destination: z.string().describe('Destination station code'),
      date: z.string().describe('Date of journey in YYYY-MM-DD format')
    }),
    execute: async (input: SearchTrainsInput) => {
      const result = await rapidApiService.searchTrains(
        input.source,
        input.destination,
        input.date
      );
      return result;
    }
  },

  checkSeatAvailability: {
    name: 'checkSeatAvailability',
    description: 'Check seat availability for a specific train and journey details',
    parameters: z.object({
      trainNumber: z.string().describe('Train number'),
      from: z.string().describe('Source station code'),
      to: z.string().describe('Destination station code'),
      date: z.string().describe('Date of journey in YYYY-MM-DD format'),
      classCode: z.string().describe('Class code (e.g., SL, 3A, 2A, 1A)'),
      quota: z.string().optional().default('GN').describe('Quota code (e.g., GN, LD, YU)')
    }),
    execute: async (input: SeatAvailabilityInput) => {
      const result = await rapidApiService.checkSeatAvailability(
        input.trainNumber,
        input.from,
        input.to,
        input.date,
        input.classCode,
        input.quota
      );
      return result;
    }
  },

  getTrainSchedule: {
    name: 'getTrainSchedule',
    description: 'Get the complete schedule of a train',
    parameters: z.object({
      trainNumber: z.string().describe('Train number')
    }),
    execute: async (input: { trainNumber: string }) => {
      const result = await rapidApiService.getTrainSchedule(input.trainNumber);
      return result;
    }
  },

  getLiveTrainStatus: {
    name: 'getLiveTrainStatus',
    description: 'Get live status of a running train',
    parameters: z.object({
      trainNumber: z.string().describe('Train number'),
      date: z.string().describe('Date in YYYY-MM-DD format')
    }),
    execute: async (input: { trainNumber: string; date: string }) => {
      const result = await rapidApiService.getLiveTrainStatus(
        input.trainNumber,
        input.date
      );
      return result;
    }
  }
};
