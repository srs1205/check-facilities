
import { Seat } from './types';

const FLOOR_2_COUNT = 128;
const FLOOR_3_COUNT = 110;

const generateSeatsForFloor = (floor: 2 | 3, count: number): Seat[] => {
  return Array.from({ length: count }, (_, i) => {
    const number = i + 1;
    return {
      id: `${floor}-${number}`,
      floor,
      number,
      inspection: {
        chair: 'pending',
        light: 'pending',
        lampShade: 'pending',
        others: ''
      }
    };
  });
};

export const INITIAL_SEATS: Seat[] = [
  ...generateSeatsForFloor(2, FLOOR_2_COUNT),
  ...generateSeatsForFloor(3, FLOOR_3_COUNT)
];

export const STATUS_LABELS = {
  pending: '미점검',
  ok: '정상',
  issue: '이상발생'
};

export const ISSUE_COLORS = {
  pending: 'bg-white border-slate-200 text-slate-400',
  ok: 'bg-blue-500 border-blue-600 text-white',
  issue: 'bg-red-500 border-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'
};
