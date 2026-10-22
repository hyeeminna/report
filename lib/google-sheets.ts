import { PostItMemo, COLOR_MAP, NUM_TO_COLOR_MAP } from '@/types/memo';
import { formatIsoDateTime, formatKoreanDate } from './date';

const STORAGE_KEY = 'postit_todo_memos_v2';
const SHEET_CONFIG_KEY = 'postit_sheet_config_v2';

export interface SheetConfig {
  scriptUrl: string;
}

export function getStoredSheetConfig(): SheetConfig | null {
  // 1. .env 파일의 NEXT_PUBLIC_GOOGLE_SCRIPT_URL 최우선 적용
  const envUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
  if (envUrl) {
    return { scriptUrl: envUrl };
  }

  // 2. localStorage 사용자 수동 설정 fallback
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SHEET_CONFIG_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.scriptUrl) return parsed;
    } catch {
      // ignore
    }
  }

  return null;
}

export function setStoredSheetConfig(config: SheetConfig) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SHEET_CONFIG_KEY, JSON.stringify(config));
}

// 기본 메모 목록 (초기에는 빈 배열로 시작)
export const initialMemos: PostItMemo[] = [];

export function loadLocalMemos(): PostItMemo[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load local memos', e);
    return [];
  }
}

export function saveLocalMemos(memos: PostItMemo[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
  } catch (e) {
    console.error('Failed to save local memos', e);
  }
}

// 구글 시트 행 데이터를 PostItMemo 형태로 파싱
export function parseSheetRowToMemo(row: any, index: number): PostItMemo {
  const colorNum = Number(row.color) || 1;
  const color = NUM_TO_COLOR_MAP[colorNum] || 'yellow';
  const isCompleted = row.state === '완료' || row.state === '체크';
  const d = row.datetime ? new Date(row.datetime) : new Date();

  return {
    id: `memo-${row.datetime || Date.now()}-${index}`,
    datetime: String(row.datetime || formatIsoDateTime()),
    timestamp: String(row.timestamp || ''),
    category: (row.category || '할 일') as any,
    content: String(row.content || ''),
    color,
    colorNum,
    state: isCompleted ? '완료' : '미완료',
    order: Number(row.order) || index + 1,
    isCompleted,
    statusBadge: isCompleted ? '완료됨' : '진행중',
    createdAt: formatKoreanDate(isNaN(d.getTime()) ? new Date() : d),
  };
}

// 구글 시트 연동 비동기 호출
export async function syncWithGoogleSheet(
  action: 'create' | 'update' | 'delete' | 'reorder' | 'read' | 'clearAll',
  payload?: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const config = getStoredSheetConfig();
    const scriptUrl = config?.scriptUrl;

    const res = await fetch('/api/memos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload, scriptUrl }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || '네트워크 오류' };
  }
}
