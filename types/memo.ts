export type CategoryType = '전체' | '할 일' | '아이디어' | '기타';
export type MemoCategory = '할 일' | '아이디어' | '기타';

export type PostItColor = 'yellow' | 'pink' | 'green' | 'blue';

export const COLOR_MAP: Record<PostItColor, { num: number; label: string }> = {
  yellow: { num: 1, label: '노란색' },
  pink: { num: 2, label: '분홍색' },
  green: { num: 3, label: '초록색' },
  blue: { num: 4, label: '파란색' },
};

export const NUM_TO_COLOR_MAP: Record<number, PostItColor> = {
  1: 'yellow',
  2: 'pink',
  3: 'green',
  4: 'blue',
};

export interface PostItMemo {
  id: string; // 클라이언트 식별자 (datetime 기반)
  datetime: string; // B열: 메모생성날짜및시간 (YYYY-MM-DD HH:mm:ss)
  timestamp?: string; // A열: 시트기록날짜및시간
  category: MemoCategory; // C열: 메모범주
  content: string; // D열: 메모내용
  color: PostItColor; // E열: 메모색상 (숫자 1,2,3,4 매핑)
  colorNum: number; // 1: 노랑, 2: 분홍, 3: 초록, 4: 파랑
  state: '완료' | '미완료'; // F열: 체크 시 '완료', 기본 '미완료'
  order: number; // G열: 메모순서 (1, 2, 3...)
  
  // UI 보조 필드
  checklist?: string;
  isCompleted?: boolean;
  aiAnalysis?: string;
  aiScore?: string;
  aiScoreLabel?: string;
  statusBadge?: string;
  createdAt: string; // 한국식 포맷 표시 (YYYY. MM. DD (요일) HH:mm)
}

export interface SheetRowData {
  timestamp: string;
  datetime: string;
  category: string;
  content: string;
  color: number;
  state: string;
  order: number;
}
