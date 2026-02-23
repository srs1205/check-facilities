import { GoogleGenAI } from '@google/genai';
import { ScheduleParseResponse, StudentSchedule } from '../types';

export const config = {
  runtime: 'edge',
};

interface UploadedPdf {
  fileName: string;
  mimeType: string;
  data: string;
}

const parseJsonFromText = <T>(text: string): T => {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenceMatch ? fenceMatch[1] : trimmed;
  return JSON.parse(candidate) as T;
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API_KEY is not configured on Vercel.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { files } = await req.json() as { files: UploadedPdf[] };

    if (!Array.isArray(files) || files.length === 0) {
      return new Response(JSON.stringify({ error: '분석할 PDF 파일이 없습니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const schedules: StudentSchedule[] = [];
    const warnings: string[] = [];

    for (const file of files) {
      const prompt = `
당신은 대학 근로학생 시간표 판독기입니다.
입력되는 문서는 학생 1명의 시간표 PDF입니다.
문서에서 다음을 최대한 정확히 추출하세요.
- 이름
- 학번
- 연락처
- 근무 가능 시간(30분 단위 표에서 색칠/체크된 칸)

중요 규칙:
1) 가능한 시간만 추출합니다.
2) 요일은 월/화/수/목/금/토/일 중 하나로 표준화합니다.
3) 연속된 30분 칸은 start~end 범위로 합칩니다.
4) 표기 애매/번짐/판독 어려움/손글씨 체크 불확실 등 사람이 확인해야 할 요소가 있으면 reviewRequired=true로 두고 reviewReasons에 이유를 구체적으로 넣으세요.
5) 확실한 정보가 없으면 빈 문자열 또는 빈 배열로 두고 reviewReasons에 누락 원인을 기록하세요.
6) 반드시 JSON만 출력하세요. 코드블록 금지.

출력 스키마:
{
  "name": "string",
  "studentId": "string",
  "contact": "string",
  "availableSlots": [
    { "day": "월|화|수|목|금|토|일", "start": "HH:MM", "end": "HH:MM", "note": "optional", "confidence": "high|medium|low" }
  ],
  "reviewRequired": true,
  "reviewReasons": ["string"]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: file.mimeType || 'application/pdf',
                data: file.data,
              },
            },
          ],
        },
      });

      try {
        const parsed = parseJsonFromText<Omit<StudentSchedule, 'sourceFileName'>>(response.text || '');
        schedules.push({
          sourceFileName: file.fileName,
          name: parsed.name || '',
          studentId: parsed.studentId || '',
          contact: parsed.contact || '',
          availableSlots: Array.isArray(parsed.availableSlots) ? parsed.availableSlots : [],
          reviewRequired: Boolean(parsed.reviewRequired),
          reviewReasons: Array.isArray(parsed.reviewReasons) ? parsed.reviewReasons : [],
        });
      } catch (error) {
        schedules.push({
          sourceFileName: file.fileName,
          name: '',
          studentId: '',
          contact: '',
          availableSlots: [],
          reviewRequired: true,
          reviewReasons: ['AI 응답 파싱에 실패하여 수동 확인이 필요합니다.'],
        });
        warnings.push(`${file.fileName}: AI 응답 파싱 실패 (${error instanceof Error ? error.message : 'unknown error'})`);
      }
    }

    const payload: ScheduleParseResponse = {
      schedules,
      warnings,
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || '서버 오류가 발생했습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
