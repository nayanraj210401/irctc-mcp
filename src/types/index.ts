// Common types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Train Types
export interface Train {
  trainNumber: string;
  trainName: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  travelTime: string;
  runningDays: string[];
  classes: string[];
}

// Station Types
export interface Station {
  code: string;
  name: string;
  city: string;
  state: string;
}

// PNR Types
export interface PnrStatus {
  pnrNumber: string;
  trainNumber: string;
  trainName: string;
  doj: string;
  from: string;
  to: string;
  class: string;
  chartStatus: string;
  passengers: Passenger[];
}

export interface Passenger {
  number: number;
  bookingStatus: string;
  currentStatus: string;
  coachPosition: string;
  bookingBerthNo: string;
  currentBerthNo: string;
}

// Fare Enquiry Types
export interface FareEnquiry {
  trainNumber: string;
  trainName: string;
  from: string;
  to: string;
  class: string;
  fare: number;
  baseFare: number;
  reservationCharge: number;
  superfastCharge: number;
  gst: number;
  otherCharges: number;
}

// Tool Input/Output Types
export interface SearchTrainsInput {
  source: string;
  destination: string;
  date: string;
}

export interface PnrStatusInput {
  pnrNumber: string;
}

export interface SeatAvailabilityInput {
  trainNumber: string;
  from: string;
  to: string;
  date: string;
  classCode: string;
  quota?: string;
}

export interface LiveTrainStatusInput {
  trainNumber: string;
  date: string;
}
