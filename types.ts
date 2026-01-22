
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
