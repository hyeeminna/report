'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Sparkles,
  LayoutGrid,
  Sun,
  Moon,
  FileSpreadsheet,
  ChevronDown,
  Layers,
  Send,
  Loader2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { PostItMemo, MemoCategory, CategoryType, PostItColor, COLOR_MAP } from '@/types/memo';
import { formatKoreanDate, formatIsoDateTime } from '@/lib/date';
import {
  loadLocalMemos,
  saveLocalMemos,
  syncWithGoogleSheet,
  getStoredSheetConfig,
  setStoredSheetConfig,
  parseSheetRowToMemo,
} from '@/lib/google-sheets';
import { PostItCard } from './PostItCard';
import { EditMemoModal } from './EditMemoModal';
import { GoogleSheetsConfigModal } from './GoogleSheetsConfigModal';

export function MemoBoard() {
  const [memos, setMemos] = useState<PostItMemo[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 작성 폼 상태
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<MemoCategory>('할 일');
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  // 필터링 상태
  const [selectedFilter, setSelectedFilter] = useState<CategoryType>('전체');

  // 모달 상태
  const [editingMemo, setEditingMemo] = useState<PostItMemo | null>(null);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [scriptUrl, setScriptUrl] = useState('');

  // 1. 클라이언트 마운트 시 초기화 및 시트 데이터 동기화
  useEffect(() => {
    setMounted(true);

    // 구글 시트 연결 우선: 구글 시트가 연동되어 있으면 시트 데이터 기준으로 동기화
    const sheetConf = getStoredSheetConfig();
    if (sheetConf?.scriptUrl) {
      setScriptUrl(sheetConf.scriptUrl);
      fetchSheetData(sheetConf.scriptUrl);
    } else {
      const initial = loadLocalMemos();
      setMemos(initial);
    }

    const savedTheme = localStorage.getItem('postit_theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, []);

  // 구글 시트에서 최신 데이터 가져오기
  const fetchSheetData = async (urlToUse?: string) => {
    const target = urlToUse || scriptUrl;
    if (!target) return;

    setIsSyncing(true);
    try {
      const res = await syncWithGoogleSheet('read');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const parsed = res.data.map((row: any, idx: number) => parseSheetRowToMemo(row, idx));
        setMemos(parsed);
        saveLocalMemos(parsed);
      }
    } catch (e) {
      console.warn('Failed to fetch from sheet', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // 전체 메모 및 구글 시트 초기화 (우측 상단 새로고침/전체삭제 기능)
  const handleClearAll = async () => {
    const isConfirmed = window.confirm(
      '⚠️ 정말로 모든 메모를 삭제하고 구글 스프레드시트까지 완전히 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'
    );
    if (!isConfirmed) return;

    setIsSyncing(true);
    setMemos([]);
    saveLocalMemos([]);

    try {
      await syncWithGoogleSheet('clearAll');
    } catch (e) {
      console.error('Failed to clear sheet', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // 다크/라이트 모드 토글
  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('postit_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('postit_theme', 'light');
    }
  };

  // DnD 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getRandomColor = (): PostItColor => {
    const colors: PostItColor[] = ['yellow', 'pink', 'green', 'blue'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // 작성 중간 취소 핸들러 (저장하지 않고 내용 초기화)
  const handleCancel = () => {
    setContent('');
    setCategory('할 일');
  };

  // 메모 작성 및 부착 핸들러 (구글 시트 규격에 맞춰 저장)
  const handleAddMemo = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const now = new Date();
    const datetimeStr = formatIsoDateTime(now);
    const id = `memo-${datetimeStr.replace(/[^0-9]/g, '')}`;
    const assignedColor = getRandomColor();
    const colorNum = COLOR_MAP[assignedColor].num;
    const createdAt = formatKoreanDate(now);

    let aiData: any = null;

    if (isAiEnabled) {
      try {
        const res = await fetch('/api/ai-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, category }),
        });
        if (res.ok) {
          aiData = await res.json();
        }
      } catch (err) {
        console.warn('AI Analysis failed:', err);
      }
    }

    const newMemo: PostItMemo = {
      id,
      datetime: datetimeStr,
      timestamp: datetimeStr,
      category,
      content: content.trim(),
      color: assignedColor,
      colorNum,
      state: '미완료',
      order: memos.length + 1,
      checklist: aiData?.checklist || (category === '할 일' ? '진행 상황 체크하기' : undefined),
      isCompleted: false,
      aiAnalysis: aiData?.aiAnalysis,
      aiScore: aiData?.aiScore,
      aiScoreLabel: aiData?.aiScoreLabel,
      statusBadge: aiData?.statusBadge || '진행중',
      createdAt,
    };

    const nextMemos = [newMemo, ...memos];
    setMemos(nextMemos);
    saveLocalMemos(nextMemos);
    setNewlyAddedId(id);
    setContent('');

    // 착! 붙는 느낌의 축하 파티클
    try {
      confetti({
        particleCount: 25,
        spread: 40,
        origin: { y: 0.65 },
        colors: ['#fde047', '#f472b6', '#86efac', '#7dd3fc'],
      });
    } catch {
      // ignore
    }

    // 구글 시트로 행 추가 동기화 (7개 컬럼 매핑)
    syncWithGoogleSheet('create', {
      datetime: newMemo.datetime,
      category: newMemo.category,
      content: newMemo.content,
      color: newMemo.colorNum,
      state: newMemo.state,
      order: newMemo.order,
      checklist: newMemo.checklist,
      aiAnalysis: newMemo.aiAnalysis,
      aiScore: newMemo.aiScore,
    });

    setIsSubmitting(false);
  };

  // 메모 즉시 삭제 핸들러 (구글 시트에서도 즉시 행 삭제)
  const handleDeleteMemo = (id: string) => {
    const target = memos.find((m) => m.id === id);
    const nextMemos = memos.filter((m) => m.id !== id);
    setMemos(nextMemos);
    saveLocalMemos(nextMemos);

    if (target) {
      syncWithGoogleSheet('delete', {
        datetime: target.datetime,
        content: target.content,
      });
    }
  };

  // 메모 내용 수정 핸들러 (구글 시트 반영)
  const handleSaveEdit = (updated: PostItMemo) => {
    const nextMemos = memos.map((m) => (m.id === updated.id ? updated : m));
    setMemos(nextMemos);
    saveLocalMemos(nextMemos);

    syncWithGoogleSheet('update', {
      datetime: updated.datetime,
      category: updated.category,
      content: updated.content,
      color: updated.colorNum,
      state: updated.state,
      order: updated.order,
    });
  };

  // 체크 버튼을 눌러 완료/미완료 토글 (구글 시트 state 열에 즉시 반영)
  const handleToggleComplete = (id: string) => {
    const target = memos.find((m) => m.id === id);
    if (!target) return;

    const nextIsCompleted = !target.isCompleted;
    const nextState = nextIsCompleted ? '완료' : '미완료';
    const nextStatusBadge = nextIsCompleted ? '완료됨' : '진행중';

    const updated: PostItMemo = {
      ...target,
      isCompleted: nextIsCompleted,
      state: nextState,
      statusBadge: nextStatusBadge,
    };

    const nextMemos = memos.map((m) => (m.id === id ? updated : m));
    setMemos(nextMemos);
    saveLocalMemos(nextMemos);

    syncWithGoogleSheet('update', {
      datetime: updated.datetime,
      category: updated.category,
      content: updated.content,
      color: updated.colorNum,
      state: updated.state,
      order: updated.order,
    });
  };

  // 드래그 앤 드롭 이동 후 order 열 갱신
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setMemos((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
          ...item,
          order: idx + 1,
        }));
        saveLocalMemos(reordered);

        // 구글 시트 순서 재배치
        syncWithGoogleSheet('reorder', {
          orders: reordered.map((m) => ({ datetime: m.datetime, order: m.order })),
        });

        return reordered;
      });
    }
  };

  // 구글 시트 스크립트 URL 설정 저장
  const handleSaveSheetUrl = (url: string) => {
    setScriptUrl(url);
    setStoredSheetConfig({ scriptUrl: url });
    if (url) {
      fetchSheetData(url);
    }
  };

  // 필터링 적용된 메모 목록
  const filteredMemos = memos.filter((m) => {
    if (selectedFilter === '전체') return true;
    return m.category === selectedFilter;
  });

  const categories: MemoCategory[] = ['할 일', '아이디어', '기타'];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-24">
      {/* 1. 글로벌 헤더 */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight">Post-it Todo list</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                  <Sparkles className="w-3 h-3" />
                  gemini-3.8-flash AI 활성화됨
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700">
            <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs">
              <LayoutGrid className="w-3.5 h-3.5 text-blue-500" />
              메모 보드
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {/* 전체 메모 및 구글 시트 초기화 새로고침 버튼 */}
            <button
              onClick={handleClearAll}
              disabled={isSyncing}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors shadow-2xs"
              title="전체 메모 및 구글 시트 초기화 (새로고침)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">전체 초기화</span>
            </button>

            {/* 구글 시트 연동 설정 모달 열기 */}
            <button
              onClick={() => setIsSheetModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs transition-all"
              title="구글 시트 연동 설정"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">구글 시트</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  scriptUrl ? 'bg-emerald-500 ring-2 ring-emerald-300' : 'bg-amber-400'
                }`}
                title={scriptUrl ? '구글 시트 연결됨' : '로컬 모드'}
              />
            </button>

            {/* 테마 토글 */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs"
              title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              G
            </div>
          </div>
        </div>
      </header>

      {/* 2. 메인 컨테이너 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* 새 메모 작성 및 AI 분석 카드 (입력 폼) */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  새 메모 작성 및 AI 분석
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gemini 3.8 Flash가 작성된 메모를 바탕으로 우선순위와 해결 액션을 실시간으로 코칭합니다.
                </p>
              </div>
            </div>

            {/* AI 코칭 토글 */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 cursor-pointer">
                AI 코칭
              </label>
              <button
                type="button"
                onClick={() => setIsAiEnabled(!isAiEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAiEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAiEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 카테고리 선택 */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                카테고리 선택 (Category)
              </span>
              <div className="flex gap-1.5">
                {categories.map((cat) => {
                  const isActive = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isActive && '✓ '}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
            <span className="text-[11px] text-slate-400">선택한 카테고리에 맞춰 포스트잇이 생성됩니다</span>
          </div>

          {/* 본문 텍스트 에어리어 */}
          <div className="mt-4 relative">
            <textarea
              rows={3}
              value={content}
              maxLength={300}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘 마주한 도전 과제, 새롭게 떠오른 아이디어, 또는 마음속 생각을 솔직하게 적어보세요..."
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
            />
            <div className="absolute right-3.5 bottom-3 text-[11px] text-slate-400 font-mono">
              {content.length} / 300자
            </div>
          </div>

          {/* 하단 컬러 안내 & 취소/부착 액션 버튼 */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold">랜덤 컬러 팔레트:</span>
              <div className="flex gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-yellow-300 border border-yellow-400 shadow-2xs" />
                <span className="w-3.5 h-3.5 rounded-full bg-pink-300 border border-pink-400 shadow-2xs" />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-300 border border-emerald-400 shadow-2xs" />
                <span className="w-3.5 h-3.5 rounded-full bg-sky-300 border border-sky-400 shadow-2xs" />
              </div>
              <span className="text-[11px] text-slate-400">· 4색 파스텔 랜덤 매칭 &amp; 착! 애니메이션</span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* 중간 취소 버튼 (작성 중 내용 취소 시 저장하지 않음) */}
              {content.length > 0 && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
                  title="작성 취소 (저장하지 않음)"
                >
                  <XCircle className="w-4 h-4 text-slate-400" />
                  작성 취소
                </button>
              )}

              {/* 포스트잇 부착 버튼 */}
              <button
                onClick={handleAddMemo}
                disabled={!content.trim() || isSubmitting}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-all ${
                  !content.trim() || isSubmitting
                    ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gemini 분석 및 부착 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    포스트잇 부착 및 Gemini 분석
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* 3. 생성된 포스트잇 목록 섹션 */}
        <section className="mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    생성된 포스트잇 목록
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    총 {filteredMemos.length}개
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  카드를 드래그 앤 드롭하여 자유롭게 순서를 재배치할 수 있습니다
                </p>
              </div>
            </div>

            {/* 카테고리 필터 드롭다운 */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                카테고리 필터:
              </span>
              <div className="relative">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value as CategoryType)}
                  className="appearance-none text-xs font-semibold px-3 py-1.5 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
                >
                  <option value="전체">카테고리: 전체</option>
                  <option value="할 일">카테고리: 할 일</option>
                  <option value="아이디어">카테고리: 아이디어</option>
                  <option value="기타">카테고리: 기타</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 한 행에 네 개까지 배치 (그리드) */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredMemos.map((m) => m.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                {filteredMemos.map((memo) => (
                  <PostItCard
                    key={memo.id}
                    memo={memo}
                    isNew={memo.id === newlyAddedId}
                    onEdit={(target) => setEditingMemo(target)}
                    onDelete={handleDeleteMemo}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {filteredMemos.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-400">
                표시할 포스트잇 메모가 없습니다. 위 입력창에서 새 메모를 부착해 보세요!
              </p>
            </div>
          )}
        </section>
      </main>

      {/* 최하단 Copyright 푸터 */}
      <footer className="mt-20 py-8 border-t border-slate-200/80 dark:border-slate-800 text-center transition-colors">
        <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-medium tracking-wide">
          Copyright INU Post-it Todo List by HYEMIN JUNG
        </p>
      </footer>

      {/* 수정 모달 */}
      <EditMemoModal
        isOpen={Boolean(editingMemo)}
        memo={editingMemo}
        onClose={() => setEditingMemo(null)}
        onSave={handleSaveEdit}
      />

      {/* 구글 시트 연동 모달 */}
      <GoogleSheetsConfigModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        scriptUrl={scriptUrl}
        onSaveUrl={handleSaveSheetUrl}
      />
    </div>
  );
}
