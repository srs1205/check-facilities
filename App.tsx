
import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { INITIAL_SEATS, ISSUE_COLORS, SEAT_LAYOUTS, SeatLayoutItem } from './constants';
import { Seat, InspectionData, Status } from './types';
import InspectionModal from './components/InspectionModal';

type ReportFilter = 'issue' | 'issueAndHold' | 'all';

type ReportRow = {
  floor: number; number: number; updatedAt: number;
  chair: string; light: string; lampShade: string; sticker: string; others: string;
};

const STATUS_KO: Record<string, string> = { ok: '정상', issue: '이상', pending: '미점검', hold: '보류' };
const KO_STATUS: Record<string, Status> = { 정상: 'ok', 이상: 'issue', 미점검: 'pending', 보류: 'hold' };
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwDJnVcVj53riC4NbFVJ_PtEWGnpp-QE4ks1YWdYpulSvwyXhOP656d6PrRo9KSfEPT/exec';

const getSeatStatus = (seat: Seat): Status => {
  const { chair, light, lampShade, sticker } = seat.inspection;
  const vals = [chair, light, lampShade, sticker ?? 'pending'];
  if (vals.some(v => v === 'issue')) return 'issue';
  if (vals.some(v => v === 'hold')) return 'hold';
  if (vals.every(v => v === 'ok')) return 'ok';
  return 'pending';
};

const App: React.FC = () => {
  const [seats, setSeats] = useState<Seat[]>(() => {
    const saved = localStorage.getItem('inspection_data_v6') || localStorage.getItem('inspection_data_v5');
    if (saved) {
      try {
        return JSON.parse(saved).map((s: Seat) => ({
          ...s,
          inspection: { ...s.inspection, sticker: (s.inspection as any).sticker ?? 'pending' }
        }));
      } catch { return INITIAL_SEATS; }
    }
    return INITIAL_SEATS;
  });
  const [currentFloor, setCurrentFloor] = useState<2 | 3>(2);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [report, setReport] = useState<ReportRow[] | null>(null);
  const [reportFilter, setReportFilter] = useState<ReportFilter>('issue');
  const [zoom, setZoom] = useState(1);
  const [syncing, setSyncing] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('inspection_data_v6', JSON.stringify(seats));
  }, [seats]);

  const stats = useMemo(() => {
    const floorSeats = seats.filter(s => s.floor === currentFloor);
    const checked = floorSeats.filter(s => getSeatStatus(s) !== 'pending').length;
    const issues = floorSeats.filter(s => getSeatStatus(s) === 'issue').length;
    const holds = floorSeats.filter(s => getSeatStatus(s) === 'hold').length;
    return { checked, issues, holds, total: floorSeats.length };
  }, [seats, currentFloor]);

  const seatMap = useMemo(() => new Map(seats.map(s => [`${s.floor}-${s.number}`, s])), [seats]);

  const updateSeat = (id: string, data: InspectionData) => {
    setSeats(prev => prev.map(s => s.id === id ? { ...s, inspection: data, lastUpdated: Date.now() } : s));
  };

  const handleReset = () => {
    if (window.confirm('모든 점검 데이터를 초기화하시겠습니까?')) {
      setSeats(INITIAL_SEATS);
      localStorage.removeItem('inspection_data_v6');
      localStorage.removeItem('inspection_data_v5');
      setReport(null);
      setSelectedSeatId(null);
    }
  };

  const handleGenerateReport = () => {
    let filtered: Seat[];
    if (reportFilter === 'issue') {
      filtered = seats.filter(s => getSeatStatus(s) === 'issue');
      if (filtered.length === 0) { alert('발견된 이상 항목이 없습니다.'); return; }
    } else if (reportFilter === 'issueAndHold') {
      filtered = seats.filter(s => getSeatStatus(s) === 'issue' || getSeatStatus(s) === 'hold');
      if (filtered.length === 0) { alert('이상 또는 보류 항목이 없습니다.'); return; }
    } else {
      filtered = seats.filter(s => getSeatStatus(s) !== 'pending');
      if (filtered.length === 0) { alert('점검된 항목이 없습니다.'); return; }
    }
    setReport(filtered
      .sort((a, b) => a.floor - b.floor || a.number - b.number)
      .map(s => ({
        floor: s.floor, number: s.number,
        updatedAt: s.lastUpdated ?? Date.now(),
        chair: s.inspection.chair, light: s.inspection.light,
        lampShade: s.inspection.lampShade, sticker: s.inspection.sticker ?? 'pending',
        others: s.inspection.others ?? '',
      })));
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
  };

  const handleSaveToSheet = async () => {
    if (!report) return;
    const name = window.prompt('생성자 이름을 입력하세요');
    if (!name) return;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const stamp = `${String(now.getFullYear()).slice(2)}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
    const sheetName = `점검결과 ${stamp}${name}`;
    setSyncing(true);
    try {
      const rows = report.map(r => ({
        층: `${r.floor}층`, 좌석: `${r.number}번`,
        점검일시: new Date(r.updatedAt).toLocaleString('ko-KR'),
        의자: STATUS_KO[r.chair], 조명: STATUS_KO[r.light],
        전등갓: STATUS_KO[r.lampShade], 스티커: STATUS_KO[r.sticker] ?? r.sticker,
        비고: r.others,
      }));
      await fetch(SHEET_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ rows, sheetName }),
      });
      alert(`"${sheetName}" 시트로 저장되었습니다.`);
    } catch {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = () => {
    if (!report) return;
    const rows = report.map(r => ({
      층: `${r.floor}층`, 좌석: `${r.number}번`,
      점검일시: new Date(r.updatedAt).toLocaleString('ko-KR'),
      의자: STATUS_KO[r.chair], 조명: STATUS_KO[r.light],
      전등갓: STATUS_KO[r.lampShade], 스티커: STATUS_KO[r.sticker] ?? r.sticker,
      비고: r.others,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [10, 8, 20, 8, 8, 8, 8, 30].map(w => ({ wch: w }));
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
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(wb.Sheets[wb.SheetNames[0]]);
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
                sticker: KO_STATUS[row['스티커']] ?? next[idx].inspection.sticker ?? 'pending',
                others: row['비고'] ?? next[idx].inspection.others,
              },
              lastUpdated: Date.now(),
            };
          });
          return next;
        });
        setReport(null);
        alert(`${rows.length}개 좌석 데이터가 반영되었습니다.`);
      } catch { alert('파일을 읽는 중 오류가 발생했습니다.'); }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const cell = Math.round(44 * zoom);

  const renderBlock = (item: SeatLayoutItem) => {
    if (item.type === 'label') {
      return (
        <div
          key={item.id}
          style={{ gridColumnStart: item.col, gridColumnEnd: `span ${item.cols}`, gridRowStart: item.row, gridRowEnd: `span ${item.rows}`, fontSize: Math.round(24 * zoom) }}
          className="flex items-center justify-center text-slate-400 font-black tracking-widest"
        >
          {item.text}
        </div>
      );
    }
    const maxCols = Math.max(...item.seats.map(row => row.length));
    const gap = Math.max(2, Math.round(4 * zoom));
    return (
      <div
        key={item.id}
        style={{ gridColumnStart: item.col, gridColumnEnd: `span ${maxCols}`, gridRowStart: item.row, gridRowEnd: `span ${item.seats.length}`, display: 'grid', gap, padding: Math.max(2, Math.round(6 * zoom)), border: '1px solid #cbd5e1', background: 'rgba(241,245,249,0.8)', borderRadius: 8 }}
      >
        {item.seats.map((row, rowIdx) => (
          <div key={`${item.id}-row-${rowIdx}`} style={{ display: 'grid', gridTemplateColumns: `repeat(${row.length}, ${cell}px)`, gap }}>
            {row.map(number => {
              const seat = seatMap.get(`${currentFloor}-${number}`);
              if (!seat) return <div key={`${item.id}-${number}`} style={{ width: cell, height: cell }} />;
              const status = getSeatStatus(seat);
              return (
                <button
                  key={seat.id}
                  onClick={() => setSelectedSeatId(seat.id)}
                  style={{ width: cell, height: cell, fontSize: Math.max(9, Math.round(11 * zoom)) }}
                  className={`font-black border transition-all active:scale-90 flex items-center justify-center rounded ${ISSUE_COLORS[status]}`}
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
    <div className="bg-white rounded-3xl border-4 border-slate-200 overflow-auto scrollbar-hide min-h-[400px]">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(24, ${cell}px)`,
          gridAutoRows: `${cell}px`,
          gap: Math.max(4, Math.round(12 * zoom)),
          padding: Math.round(24 * zoom),
          position: 'relative',
          minWidth: 'fit-content',
        }}
      >
        {SEAT_LAYOUTS[currentFloor].map(renderBlock)}
      </div>
    </div>
  );

  const selectedSeat = useMemo(() => seats.find(s => s.id === selectedSeatId), [seats, selectedSeatId]);

  const statusColor: Record<string, string> = {
    issue: 'text-red-500', hold: 'text-slate-500', ok: 'text-blue-500', pending: 'text-slate-400',
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-44">
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
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400">보류</p>
              <p className="text-lg font-black text-slate-400">{stats.holds}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400">전체 진행률</p>
            <p className="text-lg font-black text-slate-800">{Math.round((stats.checked / stats.total) * 100)}%</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 justify-center text-[10px] font-black text-slate-400 uppercase tracking-tighter">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white border border-slate-300 rounded" /> 미점검</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500 rounded" /> 정상</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded" /> 이상</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-slate-400 rounded" /> 보류</div>
        </div>

        {/* Zoom Controls */}
        <div className="flex justify-end items-center gap-2">
          <span className="text-[10px] font-black text-slate-400">지도 크기</span>
          <button onClick={() => setZoom(z => Math.max(0.5, parseFloat((z - 0.1).toFixed(1))))} className="w-8 h-8 bg-white border border-slate-200 rounded-lg font-black text-slate-600 hover:bg-slate-100 transition-all">−</button>
          <span className="text-xs font-black text-slate-600 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, parseFloat((z + 0.1).toFixed(1))))} className="w-8 h-8 bg-white border border-slate-200 rounded-lg font-black text-slate-600 hover:bg-slate-100 transition-all">＋</button>
          <button onClick={() => setZoom(1)} className="text-[10px] font-black text-slate-400 hover:text-slate-700 px-2">초기화</button>
        </div>

        {/* Map Layout */}
        {renderMap()}

        {/* Report Table */}
        {report && (
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-900 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">점검 결과 리포트</h2>
              <div className="flex gap-3">
                <button onClick={handleSaveToSheet} disabled={syncing} className="text-sm bg-yellow-500 text-white px-5 py-2.5 rounded-xl font-black hover:bg-yellow-600 transition-all active:scale-95 disabled:opacity-40">
                  {syncing ? '저장 중...' : '시트에 저장'}
                </button>
                <button onClick={handleExport} className="text-sm bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black hover:bg-emerald-700 transition-all active:scale-95">
                  엑셀 내보내기
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    {['층', '좌석', '점검일시', '의자', '조명', '전등갓', '스티커', '비고'].map(h => (
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
                      {[row.chair, row.light, row.lampShade, row.sticker].map((s, j) => (
                        <td key={j} className={`px-4 py-2 font-bold ${statusColor[s] ?? ''}`}>
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

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-[60] space-y-3">
        {/* Report filter */}
        <div className="bg-white rounded-2xl border border-slate-200 flex shadow-lg overflow-hidden">
          {([
            { val: 'issue',        label: '이상만' },
            { val: 'issueAndHold', label: '이상+보류' },
            { val: 'all',          label: '전체' },
          ] as { val: ReportFilter; label: string }[]).map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setReportFilter(val)}
              className={`flex-1 py-2 text-xs font-black transition-all ${reportFilter === val ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={handleGenerateReport}
          className="w-full py-5 rounded-2xl font-black text-lg shadow-2xl flex items-center justify-center gap-3 transition-all bg-indigo-600 text-white hover:bg-indigo-700 active:translate-y-1 border-b-4 border-indigo-900 active:border-b-0"
        >
          유지보수 리포트 생성
        </button>
      </div>

      {selectedSeat && (
        <InspectionModal
          seat={selectedSeat}
          onSave={data => { updateSeat(selectedSeat.id, data); setSelectedSeatId(null); }}
          onClose={() => setSelectedSeatId(null)}
        />
      )}
    </div>
  );
};

export default App;
