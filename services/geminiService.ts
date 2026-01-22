
import { GoogleGenAI, Type } from "@google/genai";
import { Seat } from "../types";

export const generateMaintenanceReport = async (seats: Seat[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const issuesOnly = seats.filter(s => 
    s.inspection.chair === 'issue' || 
    s.inspection.light === 'issue' || 
    s.inspection.lampShade === 'issue' ||
    s.inspection.others.trim().length > 0
  );

  const prompt = `
    다음은 도서관 2층과 3층 열람실 시설물 점검 결과입니다.
    이 내용을 바탕으로 시설관리팀에 전달할 '유지보수 요청 리포트'를 작성해주세요.
    점검 항목: 의자 상태, 조명 상태, 전등 갓 상태, 기타 비고.

    점검 데이터:
    ${JSON.stringify(issuesOnly.map(s => ({
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
    2. 파손 유형별(의자, 조명 등)로 우선순위를 제안할 것.
    3. 전문적이고 간결한 보고서 형식으로 작성할 것.
    4. 한국어로 작성할 것.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "리포트 생성에 실패했습니다.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI 분석 중 오류가 발생했습니다. 나중에 다시 시도해주세요.";
  }
};
