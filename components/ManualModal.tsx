
import React, { useState } from 'react';

interface Props { onClose: () => void; }

const Step: React.FC<{ num: number; title: string; children: React.ReactNode }> = ({ num, title, children }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-sm">{num}</div>
    <div className="flex-1 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
      <p className="font-black text-slate-900 mb-1">{title}</p>
      <div className="text-sm text-slate-600 leading-relaxed">{children}</div>
    </div>
  </div>
);

const Tip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">{children}</div>
);

const FuncRow: React.FC<{ badge: string; badgeColor: string; title: string; children: React.ReactNode }> = ({ badge, badgeColor, title, children }) => (
  <div className="flex gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <span className={`flex-shrink-0 text-[10px] font-black px-2 py-1 rounded-lg text-white h-fit ${badgeColor}`}>{badge}</span>
    <div>
      <p className="font-black text-slate-800 text-sm">{title}</p>
      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{children}</p>
    </div>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="text-base font-black text-slate-900 mb-3 pb-2 border-b-2 border-indigo-100">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
);

// ── 근로장학생 가이드 ──────────────────────────────
const StudentGuide: React.FC = () => (
  <div>
    {/* 빠른 시작 */}
    <div className="mb-8 bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-5">
      <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-3">이것만 하면 됩니다</p>
      <div className="space-y-5">
        <Step num={1} title="사이트 접속">
          <span className="font-black text-slate-800">크롬(Chrome) 브라우저</span>에서 <span className="font-black text-slate-800">check-facilities.vercel.app</span> 으로 접속합니다.
          <div className="mt-2">
            <Tip>카카오톡 링크로 열면 일부 기능이 불안정할 수 있어요. 링크를 복사한 뒤 크롬에서 직접 열어주세요.</Tip>
          </div>
        </Step>
        <Step num={2} title="이전 작업 이어받기 (첫 번째 사람이면 건너뜀)">
          오른쪽 위 <span className="font-black">불러오기</span> 버튼을 누르고, 목록에서 <span className="font-black">가장 최근</span> 것을 선택합니다.
          <div className="mt-2 bg-white border border-indigo-100 rounded-lg px-3 py-2 text-xs text-slate-500">
            날짜·시간·이름 형식으로 표시됩니다. 숫자가 클수록 최근입니다. (예: 2606241051홍길동 → 6월 24일 10시 51분 홍길동 저장분)
          </div>
        </Step>
        <Step num={3} title="층 선택">
          화면 상단에서 점검할 <span className="font-black">2층</span> 또는 <span className="font-black">3층</span>을 선택합니다.
        </Step>
        <Step num={4} title="좌석 점검">
          지도에서 좌석 번호를 탭하면 점검 창이 열립니다.
          <ul className="mt-2 space-y-1 list-none">
            <li>→ 의자·조명 전원·조명 탈착·전등 갓·번호 스티커 각각 <span className="font-black text-blue-600">정상</span> 또는 <span className="font-black text-red-500">이상</span> 선택</li>
            <li>→ 추가로 적을 내용이 있으면 <span className="font-black">기타 비고</span>에 메모</li>
            <li>→ <span className="font-black">점검 완료</span> 버튼으로 저장</li>
          </ul>
          <Tip>비고란에 내용을 입력하면 자동으로 이상 처리됩니다.</Tip>
        </Step>
        <Step num={5} title="작업 저장 (반드시!)">
          자리를 비우거나 작업을 마칠 때 반드시 <span className="font-black">전체 저장</span> 버튼을 누릅니다. 이름을 입력하면 서버에 저장됩니다.
          <div className="mt-2">
            <Tip>저장 안 하면 다음 사람이 이어받을 수 없습니다. 꼭 저장하세요!</Tip>
          </div>
        </Step>
      </div>
    </div>

    {/* 색상 */}
    <Section title="🎨 좌석 색상 의미">
      <div className="grid grid-cols-2 gap-2">
        {[
          { color: 'bg-white border-2 border-slate-300', label: '흰색', desc: '아직 확인 안 한 좌석' },
          { color: 'bg-blue-500', label: '파란색', desc: '모든 항목 정상' },
          { color: 'bg-red-500', label: '빨간색', desc: '이상 있거나 비고 입력됨' },
        ].map(({ color, label, desc }) => (
          <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className={`w-7 h-7 rounded flex-shrink-0 ${color}`} />
            <div>
              <p className="font-black text-slate-800 text-sm">{label}</p>
              <p className="text-slate-500 text-xs">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>

    {/* 버튼 기능 */}
    <Section title="🔘 버튼 설명">
      <FuncRow badge="초록" badgeColor="bg-green-500" title="전체 저장">
        지금까지 점검한 내용 전체를 서버(Google Sheets)에 저장합니다. 이름을 입력하면 저장 완료. <span className="font-black">작업 중간중간, 그리고 마칠 때 꼭 누르세요.</span>
      </FuncRow>
      <FuncRow badge="노랑" badgeColor="bg-yellow-500" title="불러오기">
        이전 사람이 저장한 내용을 불러옵니다. 목록에서 날짜·이름을 확인하고 가장 최근 것을 선택하세요.
      </FuncRow>
      <FuncRow badge="빨강" badgeColor="bg-red-500" title="초기화 (주의!)">
        모든 점검 데이터를 지웁니다. 실수로 누르지 않도록 주의하세요.
      </FuncRow>
    </Section>

    {/* 점검 창 */}
    <Section title="📋 점검 창 안내">
      <div className="space-y-3 text-sm text-slate-700">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
          <div className="flex gap-2 items-start">
            <span className="font-black text-blue-600 flex-shrink-0">정상</span>
            <span>항목에 문제가 없는 경우</span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="font-black text-red-500 flex-shrink-0">이상</span>
            <span>의자 파손, 조명 전원 불량, 조명 탈착(빠짐), 전등 갓 파손, 스티커 없음 등 문제가 있는 경우</span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="font-black text-slate-600 flex-shrink-0">초기화</span>
            <span>잘못 체크했거나 다른 자리를 점검한 경우 — 해당 좌석만 초기화</span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="font-black text-slate-600 flex-shrink-0">기타 비고</span>
            <span>이상 항목이 여러 개이거나 구체적인 내용을 메모할 때 사용 (예: "의자 바퀴 빠짐", "조명 깜빡임")</span>
          </div>
        </div>
        <Tip>이용자가 앉아 있어 확인이 어려우면 그냥 넘어가도 됩니다. 흰색(미점검)으로 남겨두면 됩니다.</Tip>
      </div>
    </Section>

    {/* FAQ */}
    <Section title="💬 자주 묻는 것">
      {[
        ['전체 저장 안 눌렀는데 나갔어요.', '내 기기에 임시 저장은 되어 있어요. 다시 접속하면 남아있을 수 있지만, 다른 사람과 공유는 안 됩니다. 이후에 전체 저장을 꼭 누르세요.'],
        ['불러왔는데 색깔이 다 흰색이에요.', '빈 저장 파일을 불러왔거나, 아직 아무도 저장한 게 없는 거예요. 다른 항목을 선택해보세요.'],
        ['좌석을 잘못 눌렀어요.', '다시 탭해서 점검 창을 열고, 하단의 초기화 버튼을 누르면 해당 좌석만 원래대로 돌아옵니다.'],
        ['저장 버튼을 눌렀는데 이름 입력창이 안 떴어요.', '팝업 차단이 설정되어 있을 수 있어요. 브라우저 주소창 오른쪽의 팝업 허용 아이콘을 눌러주세요.'],
      ].map(([q, a]) => (
        <div key={q} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="font-black text-slate-800 text-sm mb-1">Q. {q}</p>
          <p className="text-slate-500 text-sm">{a}</p>
        </div>
      ))}
    </Section>
  </div>
);

// ── 심화 버전 ──────────────────────────────────────
const AdvancedManual: React.FC = () => (
  <div>
    <Section title="🛠 기술 스택">
      <div className="grid grid-cols-2 gap-2">
        {[['React 19','UI 프레임워크'],['TypeScript','정적 타입'],['Vite 6','번들러/개발서버'],['Tailwind CSS','유틸리티 CSS'],['SheetJS (xlsx)','Excel 처리'],['Google Apps Script','Sheets API 백엔드'],['Vercel','프로덕션 배포'],['localStorage','클라이언트 영속성']].map(([t,d]) => (
          <div key={t} className="p-2 bg-slate-50 rounded-lg"><span className="font-black text-slate-800 block text-sm">{t}</span><span className="text-slate-500 text-xs">{d}</span></div>
        ))}
      </div>
    </Section>

    <Section title="🗂 데이터 구조">
      <pre className="bg-slate-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`type Status = 'pending' | 'ok' | 'issue';

interface InspectionData {
  chair: Status;        // 의자 상태
  lightPower: Status;   // 조명 전원
  lightDetach: Status;  // 조명 탈착
  lampShade: Status;    // 전등 갓 상태
  sticker: Status;      // 번호 스티커 부착 여부
  others: string;       // 기타 비고
}

interface Seat {
  id: string;          // "{floor}-{number}"
  floor: 2 | 3;
  number: number;
  inspection: InspectionData;
  lastUpdated?: number; // timestamp
}`}</pre>
    </Section>

    <Section title="🧠 좌석 상태 판별 로직">
      <pre className="bg-slate-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`// 우선순위
// 1. 항목 중 하나라도 'issue' OR 비고 입력 → 'issue' (빨간색)
// 2. 모든 항목이 'ok'             → 'ok'    (파란색)
// 3. 그 외 (일부 pending 혼재)    → 'pending' (흰색)

// 비고란 텍스트는 필드 상태와 무관하게 즉시 issue로 승격`}</pre>
    </Section>

    <Section title="💽 로컬 저장소">
      <p className="text-sm text-slate-700"><Code>localStorage</Code> 키: <Code>inspection_data_v6</Code> — 전체 <Code>Seat[]</Code> 배열을 JSON으로 직렬화 저장. v5에서 마이그레이션 시 sticker 필드를 pending으로 보완.</p>
    </Section>

    <Section title="📡 Google Sheets 연동">
      <div className="space-y-2 text-sm text-slate-700">
        <div className="p-3 bg-slate-50 rounded-xl">
          <p className="font-black mb-1">전체 저장 (doPost action=state)</p>
          <pre className="bg-slate-900 text-green-400 p-3 rounded-lg text-xs mt-1 overflow-x-auto">{`// 미점검 제외하고 점검된 좌석만 전송
seats.filter(s => getSeatStatus(s) !== 'pending')
// appendRow 대신 setValues로 일괄 쓰기 (속도 개선)`}</pre>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl">
          <p className="font-black mb-1">불러오기 (doGet action=load)</p>
          <pre className="bg-slate-900 text-green-400 p-3 rounded-lg text-xs mt-1 overflow-x-auto">{`// id 매칭 대신 floor+number로 매칭 (Sheets 타입 불일치 방지)
rows.find(r => Number(r.floor) === s.floor && Number(r.number) === s.number)`}</pre>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl">
          <p className="font-black mb-1">POST 요청 방식</p>
          <pre className="bg-slate-900 text-green-400 p-3 rounded-lg text-xs mt-1 overflow-x-auto">{`fetch(SHEET_URL, {
  method: 'POST',
  mode: 'no-cors',           // CORS preflight 회피
  headers: { 'Content-Type': 'text/plain' }, // JSON이면 차단됨
  body: JSON.stringify({ ... }),
})`}</pre>
        </div>
      </div>
    </Section>

    <Section title="🔍 줌 동작 원리">
      <pre className="bg-slate-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto">{`const cell = Math.round(44 * zoom); // 기본 44px
// CSS transform 대신 grid 컬럼 크기 직접 계산
// → transform은 스크롤 영역이 원본 크기로 고정되어 overflow 발생`}</pre>
    </Section>

    <Section title="📁 프로젝트 구조">
      <pre className="bg-slate-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto">{`check-facilities/
├── App.tsx              # 메인 컴포넌트 (상태, 로직, 레이아웃)
├── constants.tsx        # 좌석 레이아웃, 색상, 초기 데이터
├── types.ts             # Status, Seat, InspectionData 타입
├── components/
│   ├── InspectionModal.tsx  # 좌석 점검 모달
│   └── ManualModal.tsx      # 이 매뉴얼
└── .claude/launch.json  # 개발 서버 설정`}</pre>
    </Section>
  </div>
);

// ── 모달 ───────────────────────────────────────────
const ManualModal: React.FC<Props> = ({ onClose }) => {
  const [tab, setTab] = useState<'student' | 'advanced'>('student');
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-black">📖 사용 매뉴얼</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Smart Checker Guide</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">✕</button>
        </div>
        <div className="flex border-b border-slate-200 flex-shrink-0">
          <button onClick={() => setTab('student')} className={`flex-1 py-3 text-sm font-black transition-all ${tab === 'student' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
            🙋 근로장학생 가이드
          </button>
          <button onClick={() => setTab('advanced')} className={`flex-1 py-3 text-sm font-black transition-all ${tab === 'advanced' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
            🔧 기술 상세
          </button>
        </div>
        <div className="overflow-y-auto p-6 flex-1">
          {tab === 'student' ? <StudentGuide /> : <AdvancedManual />}
        </div>
      </div>
    </div>
  );
};

export default ManualModal;
