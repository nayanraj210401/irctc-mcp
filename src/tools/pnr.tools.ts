import { z } from 'zod';
import { RapidApiService } from '../services/rapidapi.service.js';

const rapidApiService = new RapidApiService();

export const pnrTools = {
  getPnrStatus: {
    name: 'getPnrStatus',
    description: 'Get the current status of a PNR (Passenger Name Record)',
    parameters: z.object({
      pnrNumber: z.string().describe('10-digit PNR number')
    }),
    execute: async (input: { pnrNumber: string }) => {
      const result = await rapidApiService.getPnrStatus(input.pnrNumber);
      return result;
    }
  },

  getPnrHistory: {
    name: 'getPnrHistory',
    description: 'Get booking history for a PNR',
    parameters: z.object({
      pnrNumber: z.string().describe('10-digit PNR number')
    }),
    execute: async (input: { pnrNumber: string }) => {
      // Implementation would depend on the API availability
      // This is a placeholder for future implementation
      const result = {
        success: false,
        error: 'This feature is not yet implemented in the API'
      };
      return result;
    }
  },

  checkPnrChartStatus: {
    name: 'checkPnrChartStatus',
    description: 'Check if the chart has been prepared for a PNR',
    parameters: z.object({
      pnrNumber: z.string().describe('10-digit PNR number')
    }),
    execute: async (input: { pnrNumber: string }) => {
      const result = await rapidApiService.getPnrStatus(input.pnrNumber);
      if (result.success && result.data) {
        return {
          success: true,
          data: {
            pnrNumber: input.pnrNumber,
            chartStatus: result.data.chartStatus || 'UNKNOWN',
            trainNumber: result.data.trainNumber,
            trainName: result.data.trainName,
            doj: result.data.doj
          }
        };
      }
      return result;
    }
  }
};
