export type Weekday = '월' | '화' | '수' | '목' | '금' | '토' | '일';

export interface TimeSlot {
  day: Weekday;
  start: string; // HH:MM
  end: string; // HH:MM
  note?: string;
  confidence?: 'high' | 'medium' | 'low';
}

export interface StudentSchedule {
  sourceFileName: string;
  name: string;
  studentId: string;
  contact: string;
  availableSlots: TimeSlot[];
  reviewRequired: boolean;
  reviewReasons: string[];
}

export interface ScheduleParseResponse {
  schedules: StudentSchedule[];
  warnings: string[];
}

// Legacy types kept for compatibility with existing files.
export type Status = 'pending' | 'ok' | 'issue';

export interface InspectionData {
  chair: Status;
  light: Status;
  lampShade: Status;
  others: string;
}

export interface Seat {
  id: string;
  floor: 2 | 3;
  number: number;
  inspection: InspectionData;
  lastUpdated?: number;
}

export interface InspectionSummary {
  totalSeats: number;
  checkedCount: number;
  issueCount: number;
  floorSummaries: {
    2: number;
    3: number;
  };
}
