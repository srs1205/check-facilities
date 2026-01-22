
import { GoogleGenAI } from "@google/genai";
import { Seat } from "../types";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { seats } = await req.json();
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API_KEY is not configured on Vercel.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const issuesOnly = seats.filter((s: Seat) => 
      s.inspection.chair === 'issue' || 
      s.inspection.light === 'issue' || 
      s.inspection.lampShade === 'issue' ||
      s.inspection.others.trim().length > 0
    );

    const prompt = `
      다음은 도서관 2층과 3층 열람실 시설물 점검 결과입니다.
      이 내용을 바탕으로 시설관리팀에 전달할 '유지보수 요청 리포트'를 작성해주세요.
      
      점검 데이터:
      ${JSON.stringify(issuesOnly.map((s: Seat) => ({
        location: `${s.floor}층 ${s.number}번 좌석`,
        issues: {
          chair: s.inspection.chair,
          light: s.inspection.light,
          lampShade: s.inspection.lampShade,
          notes: s.inspection.others
        }
      })), null, 2)}

      요구사항:
      1. 층별로 구분하여 정리할 것.
      2. 전문적이고 간결한 보고서 형식으로 작성할 것.
      3. 한국어로 작성할 것.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return new Response(JSON.stringify({ text: response.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
