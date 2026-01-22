
import { Seat } from "../types";

export const generateMaintenanceReport = async (seats: Seat[]): Promise<string> => {
  try {
    const response = await fetch('/api/generateReport', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ seats }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate report');
    }

    const data = await response.json();
    return data.text || "리포트 생성에 실패했습니다.";
  } catch (error) {
    console.error("Fetch Error:", error);
    return "서버와 통신 중 오류가 발생했습니다. Vercel 환경변수(API_KEY) 설정을 확인해주세요.";
  }
};
