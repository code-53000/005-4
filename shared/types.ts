export type TrainType = '复兴号' | '和谐号' | '绿皮车' | '其他';

export type SeatType = '一等座' | '二等座' | '硬卧' | '软卧' | '硬座' | '其他';

export interface TripImage {
  id: number;
  recordId: number;
  filename: string;
  originalName: string;
  sortOrder: number;
  url?: string;
}

export interface TripRecord {
  id: number;
  trainNumber: string;
  trainType: TrainType;
  departureStation: string;
  arrivalStation: string;
  tripDate: string;
  scheduledDeparture: string;
  actualArrival: string;
  isDelayed: boolean;
  delayMinutes: number;
  seatType: SeatType;
  ticketPrice: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  images?: TripImage[];
}

export interface TripRecordFormData {
  trainNumber: string;
  trainType: TrainType;
  departureStation: string;
  arrivalStation: string;
  tripDate: string;
  scheduledDeparture: string;
  actualArrival: string;
  isDelayed: boolean;
  delayMinutes: number;
  seatType: SeatType;
  ticketPrice: number;
  notes: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
}

export interface ApiError {
  error: string;
  message?: string;
}

export const TRAIN_TYPES: TrainType[] = ['复兴号', '和谐号', '绿皮车', '其他'];
export const SEAT_TYPES: SeatType[] = ['一等座', '二等座', '硬卧', '软卧', '硬座', '其他'];
