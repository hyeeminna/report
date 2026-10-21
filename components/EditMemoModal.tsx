'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { PostItMemo, MemoCategory, PostItColor, COLOR_MAP } from '@/types/memo';

interface EditMemoModalProps {
  memo: PostItMemo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: PostItMemo) => void;
}

export function EditMemoModal({ memo, isOpen, onClose, onSave }: EditMemoModalProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<MemoCategory>('할 일');
  const [color, setColor] = useState<PostItColor>('yellow');
  const [checklist, setChecklist] = useState('');

  useEffect(() => {
    if (memo) {
      setContent(memo.content);
      setCategory(memo.category);
      setColor(memo.color);
      setChecklist(memo.checklist || '');
    }
  }, [memo]);

  if (!isOpen || !memo) return null;

  const handleSave = () => {
    if (!content.trim()) return;
    onSave({
      ...memo,
      content,
      category,
      color,
      colorNum: COLOR_MAP[color].num,
      checklist: checklist.trim() || undefined,
    });
    onClose();
  };

  const categories: MemoCategory[] = ['할 일', '아이디어', '기타'];
  const colors: { key: PostItColor; label: string; class: string }[] = [
    { key: 'yellow', label: '노랑', class: 'bg-yellow-300' },
    { key: 'pink', label: '분홍', class: 'bg-pink-300' },
    { key: 'green', label: '초록', class: 'bg-emerald-300' },
    { key: 'blue', label: '파랑', class: 'bg-sky-300' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            포스트잇 메모 수정
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* 카테고리 선택 */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              카테고리
            </label>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    category === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 색상 선택 */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              포스트잇 색상
            </label>
            <div className="flex gap-3">
              {colors.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setColor(c.key)}
                  className={`w-7 h-7 rounded-full ${c.class} flex items-center justify-center border-2 transition-transform ${
                    color === c.key
                      ? 'border-slate-800 dark:border-white scale-110 shadow-md'
                      : 'border-transparent hover:scale-105'
                  }`}
                  title={c.label}
                >
                  {color === c.key && <Check className="w-4 h-4 text-slate-800" />}
                </button>
              ))}
            </div>
          </div>

          {/* 본문 내용 */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              메모 내용
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="메모 내용을 입력하세요..."
            />
          </div>

          {/* 체크리스트 */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              체크리스트 (선택 사항)
            </label>
            <input
              type="text"
              value={checklist}
              onChange={(e) => setChecklist(e.target.value)}
              placeholder="예: 클라이언트 미팅 질문지 정리"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
