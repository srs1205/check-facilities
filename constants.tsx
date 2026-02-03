
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

export type SeatLayoutItem =
  | {
      type: 'block';
      id: string;
      row: number;
      col: number;
      seats: number[][];
    }
  | {
      type: 'label';
      id: string;
      row: number;
      col: number;
      text: string;
      cols: number;
      rows: number;
    };

export const SEAT_LAYOUTS: Record<2 | 3, SeatLayoutItem[]> = {
  2: [
    { type: 'block', id: 'f2-left-top', row: 1, col: 2, seats: [[128, 127], [126, 125]] },
    { type: 'block', id: 'f2-left-124', row: 4, col: 1, seats: [[124, 123, 120, 119], [122, 121, 118, 117]] },
    { type: 'block', id: 'f2-left-116', row: 7, col: 1, seats: [[116, 115, 112, 111], [114, 113, 110, 109]] },
    { type: 'block', id: 'f2-left-108', row: 10, col: 1, seats: [[108, 107, 104, 103], [106, 105, 102, 101]] },
    { type: 'block', id: 'f2-left-100', row: 13, col: 1, seats: [[100, 99, 96, 95], [98, 97, 94, 93]] },
    { type: 'block', id: 'f2-left-92', row: 16, col: 1, seats: [[92, 91, 88, 87], [90, 89, 86, 85]] },
    { type: 'block', id: 'f2-left-84', row: 19, col: 1, seats: [[84, 83, 80, 79], [82, 81, 78, 77]] },

    { type: 'block', id: 'f2-mid-76', row: 13, col: 9, seats: [[76, 75, 72, 71, 68, 67], [74, 73, 70, 69, 66, 65]] },
    { type: 'block', id: 'f2-right-64', row: 13, col: 20, seats: [[64, 62, 61], [63, 60, 59]] },
    { type: 'block', id: 'f2-mid-58', row: 16, col: 9, seats: [[58, 57, 54, 53, 50, 49], [56, 55, 52, 51, 48, 47]] },
    { type: 'block', id: 'f2-right-46', row: 16, col: 20, seats: [[46, 44, 43], [45, 42, 41]] },

    { type: 'block', id: 'f2-mid-40', row: 19, col: 8, seats: [[40, 39], [38, 37]] },
    { type: 'block', id: 'f2-mid-36', row: 19, col: 12, seats: [[36, 35], [34, 33]] },
    { type: 'block', id: 'f2-mid-32', row: 19, col: 16, seats: [[32, 31], [30, 29]] },
    { type: 'block', id: 'f2-mid-28', row: 19, col: 19, seats: [[28, 27], [26, 25]] },
    { type: 'block', id: 'f2-right-24', row: 19, col: 23, seats: [[24, 23], [22, 21]] },

    { type: 'block', id: 'f2-bottom-20', row: 22, col: 7, seats: [[20, 19], [18, 17]] },
    { type: 'block', id: 'f2-bottom-16', row: 22, col: 10, seats: [[16, 15], [14, 13]] },
    { type: 'block', id: 'f2-bottom-12', row: 22, col: 13, seats: [[12, 11], [10, 9]] },
    { type: 'block', id: 'f2-bottom-8', row: 22, col: 16, seats: [[8, 7], [6, 5]] },
    { type: 'block', id: 'f2-bottom-4', row: 22, col: 22, seats: [[4, 3], [2, 1]] },
    { type: 'label', id: 'f2-in', row: 11, col: 14, text: 'IN', cols: 3, rows: 2 }
  ],
  3: [
    { type: 'block', id: 'f3-left-top', row: 1, col: 2, seats: [[110, 108, 107], [109, 106, 105]] },
    { type: 'block', id: 'f3-left-104', row: 4, col: 1, seats: [[104, 103, 100, 99], [102, 101, 98, 97]] },
    { type: 'block', id: 'f3-left-96', row: 7, col: 1, seats: [[96, 95, 92, 91], [94, 93, 90, 89]] },
    { type: 'block', id: 'f3-left-88', row: 10, col: 1, seats: [[88, 87, 84, 83], [86, 85, 82, 81]] },
    { type: 'block', id: 'f3-left-80', row: 13, col: 1, seats: [[80, 79, 76, 75], [78, 77, 74, 73]] },
    { type: 'block', id: 'f3-left-72', row: 16, col: 1, seats: [[72, 71, 68, 67], [70, 69, 66, 65]] },

    { type: 'block', id: 'f3-mid-64', row: 13, col: 11, seats: [[64, 63, 60, 59], [62, 61, 58, 57]] },
    { type: 'block', id: 'f3-right-56', row: 13, col: 20, seats: [[56, 55, 54], [53, 52, 51]] },
    { type: 'block', id: 'f3-mid-50', row: 16, col: 11, seats: [[50, 49, 46, 45, 42, 41], [48, 47, 44, 43, 40, 39]] },
    { type: 'block', id: 'f3-right-38', row: 16, col: 20, seats: [[38, 37, 36], [35, 34, 33]] },

    { type: 'block', id: 'f3-bottom-32', row: 19, col: 1, seats: [[32, 31], [30, 29]] },
    { type: 'block', id: 'f3-bottom-28', row: 19, col: 5, seats: [[28, 27], [26, 25]] },
    { type: 'block', id: 'f3-bottom-24', row: 19, col: 9, seats: [[24, 23], [22, 21]] },
    { type: 'block', id: 'f3-bottom-20', row: 19, col: 13, seats: [[20, 19], [18, 17]] },
    { type: 'block', id: 'f3-bottom-16', row: 19, col: 16, seats: [[16, 15], [14, 13]] },
    { type: 'block', id: 'f3-bottom-12', row: 19, col: 19, seats: [[12, 11], [10, 9]] },
    { type: 'block', id: 'f3-bottom-8', row: 19, col: 22, seats: [[8, 7], [6, 5]] },
    { type: 'block', id: 'f3-bottom-4', row: 19, col: 24, seats: [[4, 3], [2, 1]] },
    { type: 'label', id: 'f3-in', row: 11, col: 14, text: 'IN', cols: 3, rows: 2 }
  ]
};
