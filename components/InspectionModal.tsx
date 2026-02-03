
import React, { useState } from 'react';
import { Seat, Status, InspectionData } from '../types';

interface Props {
  seat: Seat;
  onSave: (data: InspectionData) => void;
  onClose: () => void;
}

const InspectionModal: React.FC<Props> = ({ seat, onSave, onClose }) => {
  // 미점검 상태(pending)인 경우 기본적으로 'ok'(정상)으로 세팅
  const [data, setData] = useState<InspectionData>(() => {
    const current = seat.inspection;
    return {
      chair: current.chair === 'pending' ? 'ok' : current.chair,
      light: current.light === 'pending' ? 'ok' : current.light,
      lampShade: current.lampShade === 'pending' ? 'ok' : current.lampShade,
      others: current.others || ''
    };
  });
  const [isTouched, setIsTouched] = useState(false);

  const toggleStatus = (field: keyof Omit<InspectionData, 'others'>) => {
    setIsTouched(true);
    setData(prev => {
      const current = prev[field];
      const next: Status = current === 'ok' ? 'issue' : 'ok';
      return { ...prev, [field]: next };
    });
  };

  const statusStyle = (status: Status) => {
    switch (status) {
      case 'ok': return 'bg-blue-500 text-white';
      case 'issue': return 'bg-red-500 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const statusLabel = (status: Status) => {
    switch (status) {
      case 'ok': return '정상';
      case 'issue': return '이상';
      default: return '미점검';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black">{seat.floor}층 {seat.number}번 좌석</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Inspection Panel</p>
          </div>
          <button
            onClick={() => {
              if (isTouched && !window.confirm('저장하지 않은 변경사항이 있습니다. 닫을까요?')) {
                return;
              }
              onClose();
            }}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            {(['chair', 'light', 'lampShade'] as const).map((field) => (
              <div key={field} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-700">
                  {field === 'chair' ? '🪑 의자 상태' : field === 'light' ? '💡 조명 상태' : '🏮 전등 갓'}
                </span>
                <button
                  onClick={() => toggleStatus(field)}
                  className={`px-6 py-2 rounded-xl font-black text-xs transition-all active:scale-95 shadow-md ${statusStyle(data[field])}`}
                >
                  {statusLabel(data[field])}
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">기타 비고</label>
            <textarea
              className="w-full border border-slate-200 bg-slate-50 rounded-2xl p-4 h-20 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
              placeholder="추가적인 파손이나 특이사항이 있으면 적어주세요."
              value={data.others}
              onChange={(e) => {
                setIsTouched(true);
                setData({ ...data, others: e.target.value });
              }}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                onSave({ chair: 'pending', light: 'pending', lampShade: 'pending', others: data.others });
              }}
              className="flex-1 py-4 bg-slate-200 text-slate-700 rounded-2xl font-black hover:bg-slate-300 shadow-sm active:scale-95 transition-all"
            >
              점검 보류
            </button>
            <button
              onClick={() => onSave(data)}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95 transition-all"
            >
              점검 완료
            </button>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold text-center">
            점검 보류를 선택하면 미점검 상태로 유지됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InspectionModal;
