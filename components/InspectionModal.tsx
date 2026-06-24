
import React, { useState } from 'react';
import { Seat, Status, InspectionData } from '../types';

interface Props {
  seat: Seat;
  onSave: (data: InspectionData, onHold: boolean) => void;
  onClose: () => void;
}

const FIELDS: { key: keyof Omit<InspectionData, 'others'>; label: string }[] = [
  { key: 'chair',     label: '🪑 의자 상태' },
  { key: 'light',     label: '💡 조명 상태' },
  { key: 'lampShade', label: '🏮 전등 갓' },
  { key: 'sticker',   label: '🔖 번호 스티커' },
];

const LABELS: Record<string, Record<'ok' | 'issue', string>> = {
  sticker: { ok: '부착됨', issue: '미부착' },
  default: { ok: '정상',   issue: '이상'   },
};

const InspectionModal: React.FC<Props> = ({ seat, onSave, onClose }) => {
  const [data, setData] = useState<InspectionData>(() => {
    const c = seat.inspection;
    const def = (v: Status): Status => (v === 'pending' || v === 'hold') ? 'ok' : v;
    return {
      chair:     def(c.chair),
      light:     def(c.light),
      lampShade: def(c.lampShade),
      sticker:   def((c as any).sticker ?? 'pending'),
      others:    c.others || '',
    };
  });
  const [isTouched, setIsTouched] = useState(false);

  const set = (field: keyof Omit<InspectionData, 'others'>, val: Status) => {
    setIsTouched(true);
    setData(prev => ({ ...prev, [field]: val }));
  };

  const handleClose = () => {
    if (isTouched && !window.confirm('저장하지 않은 변경사항이 있습니다. 닫을까요?')) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black">{seat.floor}층 {seat.number}번 좌석</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Inspection Panel</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { if (window.confirm('이 좌석의 점검 내용을 초기화할까요?')) { onSave({ chair: 'pending', light: 'pending', lampShade: 'pending', sticker: 'pending', others: '' }, false); } }}
              className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg font-black hover:bg-red-500 hover:text-white transition-all"
            >
              좌석 초기화
            </button>
            <button onClick={handleClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-3">
            {FIELDS.map(({ key, label }) => {
              const lblMap = LABELS[key] ?? LABELS.default;
              return (
                <div key={key} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="font-bold text-slate-700 text-sm mb-2">{label}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => set(key, 'ok')}
                      className={`flex-1 py-2 rounded-xl font-black text-xs transition-all active:scale-95 ${data[key] === 'ok' ? 'bg-blue-500 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}
                    >
                      {lblMap.ok}
                    </button>
                    <button
                      onClick={() => set(key, 'issue')}
                      className={`flex-1 py-2 rounded-xl font-black text-xs transition-all active:scale-95 ${data[key] === 'issue' ? 'bg-red-500 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}
                    >
                      {lblMap.issue}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">기타 비고</label>
            <textarea
              className="w-full border border-slate-200 bg-slate-50 rounded-2xl p-4 h-20 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
              placeholder="추가적인 파손이나 특이사항이 있으면 적어주세요."
              value={data.others}
              onChange={e => { setIsTouched(true); setData({ ...data, others: e.target.value }); }}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onSave(data, true)}
              className="flex-1 py-4 bg-slate-200 text-slate-700 rounded-2xl font-black hover:bg-slate-300 active:scale-95 transition-all"
            >
              점검 보류
            </button>
            <button
              onClick={() => onSave(data, false)}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95 transition-all"
            >
              점검 완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionModal;
