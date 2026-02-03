
import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_SEATS, ISSUE_COLORS, SEAT_LAYOUTS, SeatLayoutItem } from './constants';
import { Seat, InspectionData, Status } from './types';
import InspectionModal from './components/InspectionModal';

const ISSUE_FIELDS: { key: keyof Omit<InspectionData, 'others'>; label: string }[] = [
  { key: 'chair', label: '의자' },
  { key: 'light', label: '조명' },
  { key: 'lampShade', label: '전등 갓' }
];

const App: React.FC = () => {
  const [seats, setSeats] = useState<Seat[]>(() => {
    const saved = localStorage.getItem('inspection_data_v5');
    return saved ? JSON.parse(saved) : INITIAL_SEATS;
  });
  const [currentFloor, setCurrentFloor] = useState<2 | 3>(2);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [reportGeneratedAt, setReportGeneratedAt] = useState<Date | null>(null);
  const [reportRows, setReportRows] = useState<Array<{ floor: number; seat: number; item: string; detail: string }>>([]);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    localStorage.setItem('inspection_data_v5', JSON.stringify(seats));
  }, [seats]);

  const stats = useMemo(() => {
    const floorSeats = seats.filter(s => s.floor === currentFloor);
    const checked = floorSeats.filter(s => 
      s.inspection.chair !== 'pending' || 
      s.inspection.light !== 'pending' || 
      s.inspection.lampShade !== 'pending'
    ).length;
    const issues = floorSeats.filter(s => 
      s.inspection.chair === 'issue' || 
      s.inspection.light === 'issue' || 
      s.inspection.lampShade === 'issue'
    ).length;
    return { checked, issues, total: floorSeats.length };
  }, [seats, currentFloor]);

  const seatMap = useMemo(() => {
    return new Map(seats.map(seat => [`${seat.floor}-${seat.number}`, seat]));
  }, [seats]);

  const updateSeat = (id: string, data: InspectionData) => {
    setSeats(prev => prev.map(s => s.id === id ? { 
      ...s, 
      inspection: data, 
      lastUpdated: Date.now() 
    } : s));
  };

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeatId(seat.id);
  };

  const handleModalClose = () => {
    setSelectedSeatId(null);
  };

  const handleReset = () => {
    if (window.confirm('모든 점검 데이터를 초기화하시겠습니까?')) {
      setSeats(INITIAL_SEATS);
      localStorage.removeItem('inspection_data_v5');
      setReportGeneratedAt(null);
      setReportRows([]);
      setSelectedSeatId(null);
    }
  };

  const buildIssueRows = (targetSeats: Seat[]) => {
    return targetSeats.flatMap(seat => {
      const detailNote = seat.inspection.others?.trim();
      return ISSUE_FIELDS.flatMap(field => {
        if (seat.inspection[field.key] !== 'issue') return [];
        return [{
          floor: seat.floor,
          seat: seat.number,
          item: field.label,
          detail: detailNote ? `이상 · ${detailNote}` : '이상'
        }];
      });
    });
  };

  const handleGenerateReport = () => {
    const rows = buildIssueRows(seats);
    if (rows.length === 0) {
      alert('발견된 이상 항목이 없습니다.');
      return;
    }
    setReportRows(rows);
    const now = new Date();
    setReportGeneratedAt(now);
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
  };

  const formatDateTime = (date: Date) => date.toLocaleString('ko-KR');

  const formatFileDate = (date: Date) => {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}`;
  };

  const handleExportExcel = () => {
    if (!reportGeneratedAt) return;
    const header = ['층', '좌석', '점검항목', '점검내용'];
    const sheetRows: Array<Array<string | number>> = [
      ['보고서 생성일시', formatDateTime(reportGeneratedAt)],
      [],
      header,
      ...reportRows.map(row => [row.floor, `${row.seat}번`, row.item, row.detail])
    ];
    const csvContent = sheetRows
      .map(row =>
        row
          .map(cell => {
            const cellString = String(cell ?? '');
            if (cellString.includes(',') || cellString.includes('"') || cellString.includes('\n')) {
              return `"${cellString.replace(/"/g, '""')}"`;
            }
            return cellString;
          })
          .join(',')
      )
      .join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `maintenance_report_${formatFileDate(reportGeneratedAt)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getSeatStatus = (seat: Seat): Status => {
    const { chair, light, lampShade } = seat.inspection;
    if (chair === 'issue' || light === 'issue' || lampShade === 'issue') return 'issue';
    if (chair === 'ok' && light === 'ok' && lampShade === 'ok') return 'ok';
    return 'pending';
  };

  const renderBlock = (item: SeatLayoutItem) => {
    if (item.type === 'label') {
      return (
        <div
          key={item.id}
          style={{ gridColumnStart: item.col, gridColumnEnd: `span ${item.cols}`, gridRowStart: item.row, gridRowEnd: `span ${item.rows}` }}
          className="flex items-center justify-center text-slate-400 font-black text-xl tracking-widest"
        >
          {item.text}
        </div>
      );
    }

    const maxCols = Math.max(...item.seats.map(row => row.length));
    return (
      <div
        key={item.id}
        style={{ gridColumnStart: item.col, gridColumnEnd: `span ${maxCols}`, gridRowStart: item.row, gridRowEnd: `span ${item.seats.length}` }}
        className="grid gap-1 border border-slate-300 bg-slate-100/80 p-1.5 rounded-lg shadow-sm"
      >
        {item.seats.map((row, rowIdx) => (
          <div key={`${item.id}-row-${rowIdx}`} className="grid gap-1" style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}>
            {row.map(number => {
              const seat = seatMap.get(`${currentFloor}-${number}`);
              if (!seat) {
                return (
                  <div key={`${item.id}-${number}`} className="w-7 h-7 sm:w-9 sm:h-9" />
                );
              }
              return (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat)}
                  className={`w-7 h-7 sm:w-9 sm:h-9 text-[9px] sm:text-[11px] font-black border transition-all active:scale-90 flex items-center justify-center rounded ${ISSUE_COLORS[getSeatStatus(seat)]}`}
                >
                  {seat.number}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderMap = () => (
    <div className="bg-white rounded-3xl border-4 border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 text-[11px] font-bold text-slate-500">
        <span>도면 줌</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.max(0.75, Math.round((z - 0.1) * 10) / 10))}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200"
          >
            −
          </button>
          <span className="min-w-[44px] text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(1.5, Math.round((z + 0.1) * 10) / 10))}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200"
          >
            +
          </button>
          <button
            onClick={() => setZoom(1)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200"
          >
            100%
          </button>
        </div>
      </div>
      <div className="overflow-auto scrollbar-hide">
        <div className="origin-top-left scale-[var(--zoom)] p-4 sm:p-6 min-w-[720px]" style={{ ['--zoom' as string]: zoom }}>
          <div className="relative grid grid-cols-[repeat(24,minmax(0,1fr))] auto-rows-[34px] gap-2">
            {SEAT_LAYOUTS[currentFloor].map(renderBlock)}
          </div>
        </div>
      </div>
    </div>
  );

  const selectedSeat = useMemo(() => 
    seats.find(s => s.id === selectedSeatId), 
    [seats, selectedSeatId]
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-36">
      <header className="sticky top-0 z-50 bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-4 shadow-xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tighter">SMART CHECKER</h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold tracking-widest uppercase">Maintenance Tool</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleReset} className="text-[9px] sm:text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-3 sm:px-4 py-2 rounded-xl font-black hover:bg-red-500 hover:text-white transition-all">초기화</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Floor Selection */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {[2, 3].map(f => (
            <button
              key={f}
              onClick={() => setCurrentFloor(f as 2 | 3)}
              className={`flex-1 py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl transition-all border-b-4 ${currentFloor === f ? 'bg-slate-900 text-white border-slate-700 shadow-xl scale-[1.02]' : 'bg-white text-slate-300 border-slate-200'}`}
            >
              {f}층 열람실
              <span className="block text-[10px] opacity-50">{f === 2 ? '128' : '110'} Seats</span>
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center px-4 sm:px-8 shadow-sm">
           <div className="flex gap-8">
              <div className="text-center">
                 <p className="text-[10px] font-black text-slate-400">점검완료</p>
                 <p className="text-lg font-black text-blue-600">{stats.checked}</p>
              </div>
              <div className="text-center">
                 <p className="text-[10px] font-black text-slate-400">이상발견</p>
                 <p className="text-lg font-black text-red-500">{stats.issues}</p>
              </div>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-400">전체 진행률</p>
              <p className="text-lg font-black text-slate-800">{Math.round((stats.checked/stats.total)*100)}%</p>
           </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-tighter">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white border border-slate-300 rounded"></div> 미점검</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500 rounded"></div> 정상</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded"></div> 이상발생</div>
        </div>

        {/* Map Layout */}
        {renderMap()}

        {/* Report Output */}
        {reportGeneratedAt && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-900 shadow-2xl animate-in slide-in-from-bottom-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black flex items-center gap-3">
                  <span className="bg-indigo-600 text-white p-2 rounded-xl">🧾</span> 점검 결과 리포트
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 font-bold mt-2">
                  생성 일시: {formatDateTime(reportGeneratedAt)}
                </p>
              </div>
              <button
                onClick={handleExportExcel}
                className="px-4 py-3 sm:px-5 sm:py-3 rounded-xl bg-emerald-600 text-white font-black shadow-lg hover:bg-emerald-700 transition-all"
              >
                엑셀로 내보내기
              </button>
            </div>

            <div className="overflow-auto border border-slate-200 rounded-2xl">
              <table className="min-w-full text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-black">층</th>
                    <th className="px-4 py-3 text-left font-black">좌석</th>
                    <th className="px-4 py-3 text-left font-black">점검항목</th>
                    <th className="px-4 py-3 text-left font-black">점검내용</th>
                  </tr>
                </thead>
                <tbody>
                  {reportRows.map((row, index) => (
                    <tr key={`${row.floor}-${row.seat}-${row.item}-${index}`} className="border-t border-slate-200">
                      <td className="px-4 py-3 font-bold text-slate-700">{row.floor}층</td>
                      <td className="px-4 py-3 font-bold text-slate-700">{row.seat}번</td>
                      <td className="px-4 py-3 text-slate-600">{row.item}</td>
                      <td className="px-4 py-3 text-slate-600">{row.detail}</td>
                    </tr>
                  ))}
                  {reportRows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-400 font-semibold">
                        이상 항목이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Primary Floating Action Button */}
      <div className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 sm:px-6 z-[60]">
        <button
          onClick={handleGenerateReport}
          className={`w-full py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg shadow-2xl flex items-center justify-center gap-3 transition-all ${
            stats.issues === 0 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:translate-y-1 border-b-4 border-indigo-900 active:border-b-0'
          }`}
          disabled={stats.issues === 0}
        >
          점검 리포트 생성
        </button>
      </div>

      {/* Modal */}
      {selectedSeat && (
        <InspectionModal
          seat={selectedSeat}
          onSave={(data) => { updateSeat(selectedSeat.id, data); setSelectedSeatId(null); }}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default App;
