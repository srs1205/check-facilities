import React, { useMemo, useState } from 'react';
import { analyzeSchedulePdfs } from './services/scheduleService';
import { StudentSchedule, Weekday } from './types';

const WEEKDAYS: Weekday[] = ['월', '화', '수', '목', '금', '토', '일'];

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatSlots = (schedule: StudentSchedule, dayFilter?: Weekday) => {
  const slots = dayFilter ? schedule.availableSlots.filter(slot => slot.day === dayFilter) : schedule.availableSlots;
  if (slots.length === 0) return '가능 시간 없음';
  return slots
    .map(slot => `${slot.day} ${slot.start}~${slot.end}${slot.note ? ` (${slot.note})` : ''}`)
    .join(', ');
};

const hasCoverage = (schedule: StudentSchedule, day: Weekday, start: string, end: string) => {
  const startMinute = toMinutes(start);
  const endMinute = toMinutes(end);

  return schedule.availableSlots.some(slot => {
    if (slot.day !== day) return false;
    const slotStart = toMinutes(slot.start);
    const slotEnd = toMinutes(slot.end);
    return slotStart <= startMinute && slotEnd >= endMinute;
  });
};

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [schedules, setSchedules] = useState<StudentSchedule[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [day, setDay] = useState<Weekday>('월');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');

  const candidates = useMemo(() => {
    if (toMinutes(startTime) >= toMinutes(endTime)) return [];
    return schedules.filter(schedule => hasCoverage(schedule, day, startTime, endTime));
  }, [day, endTime, schedules, startTime]);

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError('먼저 PDF 파일을 업로드해주세요.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      const result = await analyzeSchedulePdfs(files);
      setSchedules(result.schedules);
      setWarnings(result.warnings);
    } catch (e) {
      setError(e instanceof Error ? e.message : '분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h1 className="text-2xl font-black">근로학생 시간표 매칭 도구</h1>
          <p className="text-sm text-slate-600">
            학생 시간표 PDF(한 장에 한 명 양식)를 업로드하면 이름/학번/연락처와 근무 가능 시간을 추출합니다.
            표시가 애매한 경우에는 <strong>검토 필요</strong>로 표시됩니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white hover:file:bg-indigo-700"
            />
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-bold disabled:bg-slate-300"
            >
              {isAnalyzing ? '분석 중...' : 'PDF 분석'}
            </button>
          </div>

          {files.length > 0 && (
            <p className="text-xs text-slate-500">선택된 파일: {files.map(file => file.name).join(', ')}</p>
          )}

          {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
          {warnings.map((warning, idx) => (
            <p key={`${warning}-${idx}`} className="text-xs text-amber-700">⚠️ {warning}</p>
          ))}
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-black">필요 시간대 입력</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select
              value={day}
              onChange={(e) => setDay(e.target.value as Weekday)}
              className="rounded-lg border border-slate-300 px-3 py-2"
            >
              {WEEKDAYS.map(weekday => (
                <option key={weekday} value={weekday}>{weekday}요일</option>
              ))}
            </select>
            <input type="time" step={1800} value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" />
            <input type="time" step={1800} value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" />
            <div className="flex items-center text-sm text-slate-600">{day}요일 {startTime}~{endTime}</div>
          </div>

          {toMinutes(startTime) >= toMinutes(endTime) && (
            <p className="text-sm text-red-600">종료 시간은 시작 시간보다 뒤여야 합니다.</p>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black">가능 학생 ({candidates.length}명)</h2>
          {candidates.length === 0 ? (
            <p className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-600">조건에 맞는 학생이 없습니다.</p>
          ) : (
            candidates.map(student => (
              <article key={`${student.sourceFileName}-${student.studentId}`} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-black text-lg">{student.name}</p>
                    <p className="text-sm text-slate-600">학번 {student.studentId} · 연락처 {student.contact}</p>
                  </div>
                  <p className="text-xs text-slate-500">원본: {student.sourceFileName}</p>
                </div>
                <p className="mt-3 text-sm text-slate-700"><strong>해당 요일 시간표:</strong> {formatSlots(student, day)}</p>
                {student.reviewRequired && (
                  <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                    <p className="font-bold">사람 확인 필요</p>
                    <ul className="list-disc pl-4 mt-1">
                      {student.reviewReasons.map((reason, idx) => <li key={`${reason}-${idx}`}>{reason}</li>)}
                    </ul>
                  </div>
                )}
              </article>
            ))
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black">전체 분석 결과</h2>
          {schedules.length === 0 ? (
            <p className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-600">아직 분석된 시간표가 없습니다.</p>
          ) : (
            schedules.map(student => (
              <article key={`all-${student.sourceFileName}-${student.studentId}`} className="bg-white border border-slate-200 rounded-xl p-4 text-sm">
                <p className="font-bold">{student.name} ({student.studentId})</p>
                <p className="text-slate-600">{student.contact}</p>
                <p className="mt-2 text-slate-700">{formatSlots(student)}</p>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
