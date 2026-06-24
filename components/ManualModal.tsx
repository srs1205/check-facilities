
import React, { useState } from 'react';

interface Props { onClose: () => void; }

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="text-lg font-black text-slate-900 mb-3 pb-2 border-b-2 border-indigo-100">{title}</h3>
    <div className="space-y-2 text-slate-700 text-sm leading-relaxed">{children}</div>
  </div>
);

const Badge: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <span className={`inline-block px-2 py-0.5 rounded text-white text-xs font-black ${color}`}>{label}</span>
);

const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
);

const EasyManual: React.FC = () => (
  <div>
    <Section title="📱 이 앱은 무엇인가요?">
      <p>도서관 열람실 좌석을 한눈에 점검할 수 있는 도구입니다. 스마트폰이나 컴퓨터에서 좌석을 탭하면 의자·조명·전등 갓·번호 스티커 상태를 기록하고, 이상 내역을 자동으로 정리해줍니다.</p>
    </Section>

    <Section title="🏢 층 선택">
      <p>상단의 <strong>2층 열람실</strong> / <strong>3층 열람실</strong> 버튼을 눌러 점검할 층을 선택하세요.</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>2층: 128석</li>
        <li>3층: 110석</li>
      </ul>
    </Section>

    <Section title="🎨 색상 의미">
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="w-8 h-8 bg-white border-2 border-slate-300 rounded flex-shrink-0" />
          <div><strong>흰색 — 미점검</strong><br /><span className="text-slate-500">아직 확인하지 않은 좌석</span></div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="w-8 h-8 bg-blue-500 rounded flex-shrink-0" />
          <div><strong>파란색 — 정상</strong><br /><span className="text-slate-500">모든 항목 이상 없음</span></div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="w-8 h-8 bg-red-500 rounded flex-shrink-0" />
          <div><strong>빨간색 — 이상</strong><br /><span className="text-slate-500">하나라도 이상 있거나 비고 입력됨</span></div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="w-8 h-8 bg-slate-400 rounded flex-shrink-0" />
          <div><strong>회색 — 보류</strong><br /><span className="text-slate-500">이용자 있어 확인 못한 좌석</span></div>
        </div>
      </div>
    </Section>

    <Section title="✅ 좌석 점검하기">
      <ol className="list-decimal pl-5 space-y-2">
        <li>지도에서 좌석 번호를 <strong>탭</strong>합니다.</li>
        <li>점검 창이 열리면 각 항목(의자·조명·전등 갓·번호 스티커)을 <Badge color="bg-blue-500" label="정상" /> 또는 <Badge color="bg-red-500" label="이상" />으로 선택합니다.</li>
        <li>특이사항이 있으면 <strong>기타 비고</strong> 칸에 입력하세요. (입력하면 자동으로 이상 처리됩니다)</li>
        <li>이용자가 있어 확인이 어려우면 <strong>점검 보류</strong>를 누르세요. → 회색 표시</li>
        <li>다 됐으면 <strong>점검 완료</strong>를 누릅니다.</li>
      </ol>
    </Section>

    <Section title="🔍 지도 크기 조정">
      <p>지도 오른쪽 상단의 <strong>−</strong> / <strong>＋</strong> 버튼으로 좌석 지도를 축소·확대할 수 있습니다. (50% ~ 200%)</p>
    </Section>

    <Section title="📊 리포트 생성">
      <ol className="list-decimal pl-5 space-y-2">
        <li>화면 하단 필터에서 <strong>이상만 / 이상+보류 / 전체</strong> 중 원하는 범위를 선택합니다.</li>
        <li><strong>유지보수 리포트 생성</strong> 버튼을 누릅니다.</li>
        <li>표 형태로 결과가 아래에 나타납니다.</li>
      </ol>
    </Section>

    <Section title="💾 저장 및 공유">
      <div className="space-y-3">
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <strong>🟡 시트에 저장</strong> — 리포트를 Google Sheets에 새 탭으로 저장합니다. 이름을 입력하면 "점검결과 날짜시간이름" 형식으로 자동 생성됩니다.
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <strong>🟢 엑셀 내보내기</strong> — 리포트를 .xlsx 파일로 다운로드합니다.
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <strong>🔵 엑셀 가져오기</strong> (헤더) — 이전에 내보낸 엑셀 파일을 불러와 좌석 상태에 반영합니다.
        </div>
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <strong>🔴 초기화</strong> (헤더) — 모든 점검 기록을 삭제합니다. 주의하세요!
        </div>
      </div>
    </Section>

    <Section title="💡 자주 묻는 것">
      <div className="space-y-3">
        <div className="p-3 bg-slate-50 rounded-xl"><strong>Q. 앱을 껐다 켜도 데이터가 남아있나요?</strong><br />A. 네, 브라우저에 자동 저장됩니다. 같은 기기·브라우저라면 유지됩니다.</div>
        <div className="p-3 bg-slate-50 rounded-xl"><strong>Q. 여러 사람이 동시에 쓸 수 있나요?</strong><br />A. 각자 점검 후 "시트에 저장"을 누르면 Google Sheets에 누적됩니다. 실시간 동기화는 지원하지 않습니다.</div>
        <div className="p-3 bg-slate-50 rounded-xl"><strong>Q. 비고란에 뭔가 썼더니 빨간색이 됐어요.</strong><br />A. 의도된 동작입니다. 비고가 있으면 추가 확인이 필요한 좌석으로 자동 분류됩니다.</div>
      </div>
    </Section>
  </div>
);

const AdvancedManual: React.FC = () => (
  <div>
    <Section title="🛠 기술 스택">
      <div className="grid grid-cols-2 gap-2">
        {[
          ['React 19', 'UI 프레임워크'],
          ['TypeScript', '정적 타입'],
          ['Vite 6', '번들러/개발서버'],
          ['Tailwind CSS', '유틸리티 CSS'],
          ['SheetJS (xlsx)', 'Excel 처리'],
          ['Google Apps Script', 'Sheets API 대체 백엔드'],
          ['Vercel', '프로덕션 배포'],
          ['localStorage', '클라이언트 영속성'],
        ].map(([tech, desc]) => (
          <div key={tech} className="p-2 bg-slate-50 rounded-lg">
            <span className="font-black text-slate-800 block">{tech}</span>
            <span className="text-slate-500 text-xs">{desc}</span>
          </div>
        ))}
      </div>
    </Section>

    <Section title="🗂 데이터 구조">
      <p className="mb-2">핵심 타입 정의 (<Code>types.ts</Code>):</p>
      <pre className="bg-slate-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`type Status = 'pending' | 'ok' | 'issue' | 'hold';

interface InspectionData {
  chair: Status;      // 의자 상태
  light: Status;      // 조명 상태
  lampShade: Status;  // 전등 갓 상태
  sticker: Status;    // 번호 스티커 부착 여부
  others: string;     // 기타 비고
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
      <p className="mb-2"><Code>getSeatStatus(seat)</Code> 우선순위:</p>
      <pre className="bg-slate-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`// 1. 항목 중 하나라도 'issue' OR 비고 입력 있으면
→ 'issue' (빨간색)

// 2. 항목 중 하나라도 'hold' 이면
→ 'hold' (회색)

// 3. 모든 항목이 'ok' 면
→ 'ok' (파란색)

// 4. 그 외 (일부 pending 혼재)
→ 'pending' (흰색)`}</pre>
      <p className="mt-2 text-slate-500">비고란 텍스트는 필드 상태와 무관하게 즉시 <Code>issue</Code>로 승격됩니다.</p>
    </Section>

    <Section title="💽 로컬 저장소">
      <p><Code>localStorage</Code> 키: <Code>inspection_data_v6</Code></p>
      <p className="mt-1">전체 <Code>Seat[]</Code> 배열을 JSON으로 직렬화해 저장합니다. 앱 로드 시 v6 키를 먼저 읽고, 없으면 이전 버전(<Code>v5</Code>)을 마이그레이션합니다:</p>
      <pre className="bg-slate-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed mt-2">{`// v5 → v6 마이그레이션: sticker 필드 추가
seat.inspection.sticker ?? 'pending'`}</pre>
    </Section>

    <Section title="📡 Google Sheets 연동">
      <p>전용 API 서버 없이 <strong>Google Apps Script 웹 앱</strong>을 REST 엔드포인트로 활용합니다.</p>
      <div className="mt-3 space-y-2">
        <div className="p-3 bg-slate-50 rounded-xl">
          <strong>요청 방식</strong>
          <pre className="bg-slate-900 text-green-400 p-3 rounded-lg text-xs mt-2 overflow-x-auto">{`fetch(SHEET_URL, {
  method: 'POST',
  mode: 'no-cors',           // CORS preflight 회피
  headers: { 'Content-Type': 'text/plain' }, // JSON 불가
  body: JSON.stringify({ rows, sheetName }),
})`}</pre>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl">
          <strong>왜 <Code>text/plain</Code>인가?</strong><br />
          <span className="text-slate-600"><Code>no-cors</Code> 모드에서 <Code>application/json</Code>은 preflight를 유발해 차단됩니다. <Code>text/plain</Code>은 단순 요청으로 분류되어 통과하며, Apps Script는 <Code>e.postData.contents</Code>로 동일하게 파싱합니다.</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl">
          <strong>시트 네이밍 규칙</strong><br />
          <Code>{`점검결과 YYMMDDHHMM이름`}</Code> — 예: <Code>점검결과 2606241051홍길동</Code>
        </div>
      </div>
    </Section>

    <Section title="📊 Excel 처리 (SheetJS)">
      <div className="space-y-2">
        <div className="p-3 bg-slate-50 rounded-xl">
          <strong>내보내기</strong>
          <pre className="bg-slate-900 text-green-400 p-3 rounded-lg text-xs mt-2 overflow-x-auto">{`const ws = XLSX.utils.json_to_sheet(rows);
ws['!cols'] = [10, 8, 20, 8, 8, 8, 8, 30].map(w => ({ wch: w }));
XLSX.writeFile(wb, 'filename.xlsx');`}</pre>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl">
          <strong>가져오기</strong> — 동일 양식의 .xlsx 파일을 업로드하면 층·좌석 번호를 키로 매칭해 상태를 갱신합니다. 없는 좌석 번호는 무시됩니다.
        </div>
      </div>
    </Section>

    <Section title="🔍 줌 동작 원리">
      <p>CSS transform이 아닌 <strong>grid 컬럼 크기 직접 계산</strong> 방식을 사용합니다:</p>
      <pre className="bg-slate-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto mt-2">{`const cell = Math.round(44 * zoom); // 기본 44px

// 외부 그리드
gridTemplateColumns: \`repeat(24, \${cell}px)\`
gridAutoRows: \`\${cell}px\`

// 내부 버튼
style={{ width: cell, height: cell,
         fontSize: Math.max(9, Math.round(11 * zoom)) }}`}</pre>
      <p className="mt-2 text-slate-500">transform 방식은 스크롤 영역이 원본 크기 기준으로 고정돼 overflow가 발생하므로, 그리드 컬럼 크기를 직접 조정합니다.</p>
    </Section>

    <Section title="🗺 좌석 레이아웃 구조">
      <p><Code>SEAT_LAYOUTS</Code> (<Code>constants.tsx</Code>)에 각 층의 블록 위치가 정의됩니다:</p>
      <pre className="bg-slate-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto mt-2">{`type SeatLayoutItem =
  | { type: 'block'; id: string;
      row: number; col: number;   // 24-col grid 기준 위치
      seats: number[][];          // 2D 배열: 행×열의 좌석번호 }
  | { type: 'label'; id: string;
      row: number; col: number;
      text: string; cols: number; rows: number; }`}</pre>
      <p className="mt-2 text-slate-500">빈 좌석(null 셀)은 <Code>null</Code> 대신 존재하지 않는 번호로 처리해 레이아웃 공백을 만듭니다.</p>
    </Section>

    <Section title="🔄 리포트 필터 로직">
      <pre className="bg-slate-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto">{`// 이상만
seats.filter(s => getSeatStatus(s) === 'issue')

// 이상 + 보류
seats.filter(s =>
  getSeatStatus(s) === 'issue' ||
  getSeatStatus(s) === 'hold')

// 전체 (점검된 것)
seats.filter(s => getSeatStatus(s) !== 'pending')`}</pre>
      <p className="mt-2 text-slate-500">결과는 층 → 좌석번호 오름차순으로 정렬 후 출력합니다.</p>
    </Section>

    <Section title="📁 프로젝트 구조">
      <pre className="bg-slate-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto">{`check-facilities/
├── App.tsx              # 메인 컴포넌트 (상태, 로직, 레이아웃)
├── constants.tsx        # 좌석 레이아웃, 색상, 초기 데이터
├── types.ts             # Status, Seat, InspectionData 타입
├── components/
│   ├── InspectionModal.tsx  # 좌석 점검 모달
│   └── ManualModal.tsx      # 이 매뉴얼
├── .claude/
│   └── launch.json      # 개발 서버 설정
└── index.html`}</pre>
    </Section>
  </div>
);

const ManualModal: React.FC<Props> = ({ onClose }) => {
  const [tab, setTab] = useState<'easy' | 'advanced'>('easy');

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-black">📖 사용 매뉴얼</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Smart Checker Guide</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 flex-shrink-0">
          <button
            onClick={() => setTab('easy')}
            className={`flex-1 py-3 text-sm font-black transition-all ${tab === 'easy' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            🙂 쉬운 버전
          </button>
          <button
            onClick={() => setTab('advanced')}
            className={`flex-1 py-3 text-sm font-black transition-all ${tab === 'advanced' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            🔧 심화 버전
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1">
          {tab === 'easy' ? <EasyManual /> : <AdvancedManual />}
        </div>
      </div>
    </div>
  );
};

export default ManualModal;
