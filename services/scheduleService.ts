import { ScheduleParseResponse } from '../types';

interface EncodedPdf {
  fileName: string;
  mimeType: string;
  data: string;
}

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('파일 인코딩에 실패했습니다.'));
        return;
      }
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('파일 읽기 중 오류가 발생했습니다.'));
    reader.readAsDataURL(file);
  });

export const analyzeSchedulePdfs = async (files: File[]): Promise<ScheduleParseResponse> => {
  const encodedFiles: EncodedPdf[] = await Promise.all(
    files.map(async (file) => ({
      fileName: file.name,
      mimeType: file.type || 'application/pdf',
      data: await toBase64(file),
    })),
  );

  const response = await fetch('/api/analyzeSchedules', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ files: encodedFiles }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || '시간표 분석에 실패했습니다.');
  }

  return payload;
};
