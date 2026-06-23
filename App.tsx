
import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { INITIAL_SEATS, ISSUE_COLORS, SEAT_LAYOUTS, SeatLayoutItem } from './constants';
import { Seat, InspectionData, Status } from './types';
import InspectionModal from './components/InspectionModal';


const App: React.FC = () => {
  const [seats, setSeats] = useState<Seat[]>(() => {
    const saved = localStorage.getItem('inspection_data_v5');
    return saved ? JSON.parse(saved) : INITIAL_SEATS;
  });
  const [currentFloor, setCurrentFloor] = useState<2 | 3>(2);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [report, setReport] = useState<{ floor: number; number: number; updatedAt: number; chair: string; light: string; lampShade: string; others: string }[] | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

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
      setReport(null);
      setSelectedSeatId(null);
    }
  };

  const handleGenerateReport = () => {
    const issueSeats = seats.filter(s => getSeatStatus(s) === 'issue');
    if (issueSeats.length === 0) {
      alert('발견된 이상 항목이 없습니다.');
      return;
    }
    setReport(issueSeats.map(s => ({
      floor: s.floor,
      number: s.number,
      updatedAt: s.lastUpdated ?? Date.now(),
      chair: s.inspection.chair,
      light: s.inspection.light,
      lampShade: s.inspection.lampShade,
      others: s.inspection.others ?? '',
    })));
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
  };

  const STATUS_KO: Record<string, string> = { ok: '정상', issue: '이상', pending: '미점검' };

  const handleExport = () => {
    if (!report) return;
    const rows = report.map(r => ({
      층: `${r.floor}층`,
      좌석: `${r.number}번`,
      점검일시: new Date(r.updatedAt).toLocaleString('ko-KR'),
      의자: STATUS_KO[r.chair] ?? r.chair,
      조명: STATUS_KO[r.light] ?? r.light,
      전등갓: STATUS_KO[r.lampShade] ?? r.lampShade,
      비고: r.others,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [10, 8, 20, 8, 8, 8, 30].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '점검결과');
    XLSX.writeFile(wb, `점검결과_${new Date().toLocaleDateString('ko-KR').replace(/\. /g, '-').replace('.', '')}.xlsx`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target?.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
        const KO_STATUS: Record<string, Status> = { 정상: 'ok', 이상: 'issue', 미점검: 'pending' };
        setSeats(prev => {
          const next = [...prev];
          rows.forEach(row => {
            const floor = parseInt(row['층']) as 2 | 3;
            const number = parseInt(row['좌석']);
            const idx = next.findIndex(s => s.floor === floor && s.number === number);
            if (idx === -1) return;
            next[idx] = {
              ...next[idx],
              inspection: {
                chair: KO_STATUS[row['의자']] ?? next[idx].inspection.chair,
                light: KO_STATUS[row['조명']] ?? next[idx].inspection.light,
                lampShade: KO_STATUS[row['전등갓']] ?? next[idx].inspection.lampShade,
                others: row['비고'] ?? next[idx].inspection.others,
              },
              lastUpdated: Date.now(),
            };
          });
          return next;
        });
        setReport(null);
        alert(`${rows.length}개 좌석 데이터가 반영되었습니다.`);
      } catch {
        alert('파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
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
          className="flex items-center justify-center text-slate-400 font-black text-2xl tracking-widest"
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
                  <div key={`${item.id}-${number}`} className="w-10 h-10 sm:w-11 sm:h-11" />
                );
              }
              return (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 text-[11px] font-black border transition-all active:scale-90 flex items-center justify-center rounded ${ISSUE_COLORS[getSeatStatus(seat)]}`}
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
    <div className="bg-white rounded-3xl border-4 border-slate-200 overflow-auto scrollbar-hide min-h-[560px]">
      <div className="relative grid grid-cols-[repeat(24,44px)] auto-rows-[44px] gap-3 p-6 min-w-fit">
        {SEAT_LAYOUTS[currentFloor].map(renderBlock)}
      </div>
    </div>
  );

  const selectedSeat = useMemo(() => 
    seats.find(s => s.id === selectedSeatId), 
    [seats, selectedSeatId]
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-36">
      <header className="sticky top-0 z-50 bg-slate-900 text-white px-6 py-4 shadow-xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black tracking-tighter">SMART CHECKER</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Maintenance Tool</p>
          </div>
          <div className="flex items-center gap-3">
            <input ref={importRef} type="file" accept=".xlsx" className="hidden" onChange={handleImport} />
            <button onClick={() => importRef.current?.click()} className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-xl font-black hover:bg-blue-500 hover:text-white transition-all">엑셀 가져오기</button>
            <button onClick={handleReset} className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl font-black hover:bg-red-500 hover:text-white transition-all">초기화</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Floor Selection */}
        <div className="flex gap-4">
          {[2, 3].map(f => (
            <button
              key={f}
              onClick={() => setCurrentFloor(f as 2 | 3)}
              className={`flex-1 py-5 rounded-2xl font-black text-xl transition-all border-b-4 ${currentFloor === f ? 'bg-slate-900 text-white border-slate-700 shadow-xl scale-[1.02]' : 'bg-white text-slate-300 border-slate-200'}`}
            >
              {f}층 열람실
              <span className="block text-[10px] opacity-50">{f === 2 ? '128' : '110'} Seats</span>
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center px-8 shadow-sm">
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
        <div className="flex gap-4 justify-center text-[10px] font-black text-slate-400 uppercase tracking-tighter">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white border border-slate-300 rounded"></div> 미점검</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500 rounded"></div> 정상</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded"></div> 이상발생</div>
        </div>

        {/* Map Layout */}
        {renderMap()}

        {/* Report Table */}
        {report && (
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-900 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">점검 결과 리포트</h2>
              <button
                onClick={handleExport}
                className="text-sm bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black hover:bg-emerald-700 transition-all active:scale-95"
              >
                엑셀 내보내기
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    {['층', '좌석', '점검일시', '의자', '조명', '전등갓', '비고'].map(h => (
                      <th key={h} className="px-4 py-3 font-black">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-4 py-2 font-bold">{row.floor}층</td>
                      <td className="px-4 py-2 font-bold">{row.number}번</td>
                      <td className="px-4 py-2 text-slate-500">{new Date(row.updatedAt).toLocaleString('ko-KR')}</td>
                      {[row.chair, row.light, row.lampShade].map((s, j) => (
                        <td key={j} className={`px-4 py-2 font-bold ${s === 'issue' ? 'text-red-500' : 'text-blue-500'}`}>
                          {STATUS_KO[s] ?? s}
                        </td>
                      ))}
                      <td className="px-4 py-2 text-slate-600">{row.others || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Primary Floating Action Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-[60]">
        <button
          onClick={handleGenerateReport}
          disabled={stats.issues === 0}
          className={`w-full py-5 rounded-2xl font-black text-lg shadow-2xl flex items-center justify-center gap-3 transition-all ${
            stats.issues === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:translate-y-1 border-b-4 border-indigo-900 active:border-b-0'
          }`}
        >
          유지보수 리포트 생성
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
