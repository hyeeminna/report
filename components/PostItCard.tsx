'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, Check, Sparkles, GripVertical } from 'lucide-react';
import { PostItMemo } from '@/types/memo';

interface PostItCardProps {
  memo: PostItMemo;
  isNew?: boolean;
  onEdit: (memo: PostItMemo) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export function PostItCard({
  memo,
  isNew = false,
  onEdit,
  onDelete,
  onToggleComplete,
}: PostItCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: memo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.75 : 1,
  };

  // 색상 클래스 매핑
  const colorClassMap: Record<string, string> = {
    yellow: 'postit-yellow',
    green: 'postit-green',
    pink: 'postit-pink',
    blue: 'postit-blue',
  };

  const badgeBgMap: Record<string, string> = {
    yellow: 'bg-yellow-200/80 text-yellow-900 border-yellow-300',
    green: 'bg-green-200/80 text-green-900 border-green-300',
    pink: 'bg-pink-200/80 text-pink-900 border-pink-300',
    blue: 'bg-sky-200/80 text-sky-900 border-sky-300',
  };

  const aiBoxBgMap: Record<string, string> = {
    yellow: 'bg-yellow-50/70 border-yellow-200/70 text-yellow-950',
    green: 'bg-emerald-50/70 border-emerald-200/70 text-emerald-950',
    pink: 'bg-pink-50/70 border-pink-200/70 text-pink-950',
    blue: 'bg-sky-50/70 border-sky-200/70 text-sky-950',
  };

  const statusIcons: Record<string, string> = {
    '완료됨': '🏆 완료',
    '완료': '🏆 완료',
    '미완료': '📌 진행중',
    '영감 포착': '💡 영감 포착',
    '힐링 완료': '🌿 힐링 완료',
    '집중 상태': '⚡ 집중 상태',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-200 border flex flex-col justify-between select-none ${
        colorClassMap[memo.color] || 'postit-yellow'
      } ${isNew ? 'animate-stick-on' : ''}`}
    >
      {/* 반투명 마스킹 테이프 */}
      <div className="masking-tape" />

      {/* 상단 액션 바 */}
      <div className="flex items-center justify-between mb-3 mt-1">
        <div className="flex items-center gap-1.5">
          {/* 드래그 핸들 (모바일 및 데스크톱) */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-black/10 text-black/50 transition-colors"
            title="드래그하여 이동"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>

          {/* 카테고리 태그 */}
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border shadow-2xs ${
              badgeBgMap[memo.color]
            }`}
          >
            {memo.category}
          </span>
        </div>

        {/* 편집 & 삭제 버튼 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(memo)}
            className="p-1 rounded-md text-black/60 hover:text-black hover:bg-black/10 transition-colors"
            title="메모 수정"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(memo.id)}
            className="p-1 rounded-md text-black/60 hover:text-red-600 hover:bg-red-500/10 transition-colors"
            title="메모 즉시 삭제"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 메모 본문 */}
      <div className="my-2 text-[14.5px] leading-relaxed font-medium break-words">
        {memo.content}
      </div>

      {/* 체크리스트 아이템 (체크박스) */}
      {memo.checklist && (
        <div
          onClick={() => onToggleComplete(memo.id)}
          className="mt-2 mb-3 flex items-center gap-2 cursor-pointer group/chk"
        >
          <div
            className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
              memo.isCompleted
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-black/30 bg-white/60 group-hover/chk:border-black/60'
            }`}
          >
            {memo.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <span
            className={`text-xs transition-colors ${
              memo.isCompleted
                ? 'line-through text-black/45 font-normal'
                : 'text-black/85 font-medium'
            }`}
          >
            {memo.checklist}
          </span>
        </div>
      )}

      {/* Gemini AI 분석 박스 */}
      {memo.aiAnalysis && (
        <div
          className={`mt-2 mb-3 p-2.5 rounded-lg border text-xs backdrop-blur-xs shadow-2xs ${
            aiBoxBgMap[memo.color]
          }`}
        >
          <div className="flex items-center justify-between mb-1.5 font-semibold">
            <span className="flex items-center gap-1 text-[11px] text-indigo-700 dark:text-indigo-900">
              <Sparkles className="w-3 h-3" />
              gemini-3.8-flash
            </span>
            {memo.aiScore && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/80 font-bold border border-black/10">
                {memo.aiScoreLabel || '달성률'} {memo.aiScore}
              </span>
            )}
          </div>
          <p className="text-[11.5px] italic leading-snug opacity-90 font-sans">
            {memo.aiAnalysis}
          </p>
        </div>
      )}

      {/* 하단 정보 바 */}
      <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center justify-between text-[11px] text-black/50">
        {/* 왼쪽: 작성 연월일 시간 요일 */}
        <span className="font-mono tracking-tight">{memo.createdAt}</span>

        {/* 오른쪽: 상태 태그 */}
        <span className="text-[11px] font-semibold text-black/75">
          {statusIcons[memo.statusBadge || ''] || memo.statusBadge || '📌 진행중'}
        </span>
      </div>
    </div>
  );
}
