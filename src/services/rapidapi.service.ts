import { config } from '../config/index.js';

// Define a single ApiResponse interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class RapidApiService {
  private baseUrl = `https://${config.RAPIDAPI_HOST}`;
  private headers = {
    'X-RapidAPI-Key': config.RAPIDAPI_KEY,
    'X-RapidAPI-Host': config.RAPIDAPI_HOST,
    'Content-Type': 'application/json',
  };

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      });


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }


      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }


  // Train Search
  async searchTrains(
    source: string,
    destination: string,
    date: string
  ): Promise<ApiResponse<any>> {
    return this.request(
      `/api/v3/trainBetweenStations?fromStationCode=${source}&toStationCode=${destination}&date=${date}`
    );
  }


  // Get Train Schedule
  async getTrainSchedule(trainNumber: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/getTrainSchedule?trainNo=${trainNumber}`);
  }


  // Check Seat Availability
  async checkSeatAvailability(
    trainNumber: string,
    from: string,
    to: string,
    date: string,
    classCode: string,
    quota: string = 'GN'
  ): Promise<ApiResponse<any>> {
    return this.request(
      `/api/v3/checkSeatAvailability?trainNo=${trainNumber}&fromStnCode=${from}&toStnCode=${to}&date=${date}&classCode=${classCode}&quota=${quota}`
    );
  }


  // Get PNR Status
  async getPnrStatus(pnrNumber: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v3/getPNRStatus?pnrNumber=${pnrNumber}`);
  }


  // Get Live Train Status
  async getLiveTrainStatus(
    trainNumber: string,
    date: string
  ): Promise<ApiResponse<any>> {
    return this.request(
      `/api/v1/getLiveTrainStatus?trainNo=${trainNumber}&date=${date}`
    );
  }
}
