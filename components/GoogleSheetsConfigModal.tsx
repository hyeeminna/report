'use client';

import React, { useState } from 'react';
import { X, Copy, Check, FileSpreadsheet, ExternalLink } from 'lucide-react';

interface GoogleSheetsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptUrl: string;
  onSaveUrl: (url: string) => void;
}

export function GoogleSheetsConfigModal({
  isOpen,
  onClose,
  scriptUrl,
  onSaveUrl,
}: GoogleSheetsConfigModalProps) {
  const [urlInput, setUrlInput] = useState(scriptUrl);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const gasCode = `// ========================================================
// 구글 시트 연동 Google Apps Script 코드
// 스프레드시트 메뉴 [확장 프로그램] > [Apps Script]에 붙여넣기
// ========================================================

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  
  if (rows.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var headers = rows[0]; // ["timestamp", "datetime", "category", "content", "color", "state", "order"]
  var result = [];
  
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = rows[i][j];
      // 날짜 포맷 변환
      if (val instanceof Date) {
        val = Utilities.formatDate(val, "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
      }
      obj[headers[j]] = val;
    }
    result.push(obj);
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var payload = data.payload;
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 1. 헤더가 없으면 첫 행 자동 생성 (A~G열 7개 규격)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["timestamp", "datetime", "category", "content", "color", "state", "order"]);
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#f1f5f9");
    }
    
    var nowStr = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    
    // 2. 신규 메모 생성 (Create)
    if (action === "create") {
      sheet.appendRow([
        nowStr,              // A: timestamp (시트기록날짜및시간)
        payload.datetime,    // B: datetime (메모생성날짜및시간)
        payload.category,    // C: category (메모범주)
        payload.content,     // D: content (메모내용)
        payload.color || 1,  // E: color (색상 숫자 1~4)
        payload.state || "미완료", // F: state (체크 완료 상태)
        payload.order || 1   // G: order (메모순서)
      ]);
    }
    // 3. 메모 내용 및 상태 수정 (Update)
    else if (action === "update") {
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        // datetime (B열) 기준으로 대상 메모 행 검색
        if (String(rows[i][1]) === String(payload.datetime)) {
          var rowNum = i + 1;
          sheet.getRange(rowNum, 1).setValue(nowStr); // A: timestamp 갱신
          if (payload.category !== undefined) sheet.getRange(rowNum, 3).setValue(payload.category);
          if (payload.content !== undefined) sheet.getRange(rowNum, 4).setValue(payload.content);
          if (payload.color !== undefined) sheet.getRange(rowNum, 5).setValue(payload.color);
          if (payload.state !== undefined) sheet.getRange(rowNum, 6).setValue(payload.state);
          if (payload.order !== undefined) sheet.getRange(rowNum, 7).setValue(payload.order);
          break;
        }
      }
    }
    // 4. 메모 즉시 삭제 (Delete)
    else if (action === "delete") {
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][1]) === String(payload.datetime)) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
    }
    // 5. 드래그 앤 드롭 순서 재배치 (Reorder)
    else if (action === "reorder" && payload.orders) {
      var rows = sheet.getDataRange().getValues();
      var orderMap = {};
      for (var k = 0; k < payload.orders.length; k++) {
        orderMap[payload.orders[k].datetime] = payload.orders[k].order;
      }
      for (var i = 1; i < rows.length; i++) {
        var dt = String(rows[i][1]);
        if (orderMap[dt] !== undefined) {
          sheet.getRange(i + 1, 7).setValue(orderMap[dt]);
        }
      }
    }
    // 6. 전체 초기화 (전체 메모 및 시트 데이터 삭제)
    else if (action === "clearAll") {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyAppsScript = () => {
    navigator.clipboard.writeText(gasCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSave = () => {
    onSaveUrl(urlInput.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                구글 스프레드시트 연동 설정
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                실제 구글 시트와 7개 열(A~G) 규격으로 CRUD를 양방향 연동합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 현재 지정된 구글 시트 링크 바로가기 */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">연동 대상 시트: </span>
            <span className="font-mono text-slate-500">1n_-upyNLQ2le_v-6M1T9VlCCMLVdxDzpqvYTGTOAhzc</span>
          </div>
          <a
            href="https://docs.google.com/spreadsheets/d/1n_-upyNLQ2le_v-6M1T9VlCCMLVdxDzpqvYTGTOAhzc/edit?usp=sharing"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>시트 열기</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 1. 열 정보 안내 표 (A~G 7개 열) */}
        <div className="mt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            구글 시트 7대 열 (Column A~G) 규격
          </h4>
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs overflow-x-auto">
            <table className="w-full text-left font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400">
                  <th className="pb-1 pr-2">열</th>
                  <th className="pb-1 pr-2">열 제목</th>
                  <th className="pb-1 pr-2">설명</th>
                  <th className="pb-1 pr-2">타입</th>
                  <th className="pb-1">예시</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                <tr><td>A</td><td className="text-blue-500 font-semibold">timestamp</td><td>시트기록날짜및시간</td><td>날짜 시간</td><td>2026-10-21 18:35:10</td></tr>
                <tr><td>B</td><td className="text-blue-500 font-semibold">datetime</td><td>메모생성날짜및시간</td><td>날짜 시간</td><td>2026-10-21 18:35:00</td></tr>
                <tr><td>C</td><td className="text-blue-500 font-semibold">category</td><td>메모범주</td><td>문자</td><td>할 일, 아이디어, 기타</td></tr>
                <tr><td>D</td><td className="text-blue-500 font-semibold">content</td><td>메모내용</td><td>문자</td><td>클라이언트 미팅 준비</td></tr>
                <tr><td>E</td><td className="text-blue-500 font-semibold">color</td><td>메모색상</td><td>색상(숫자)</td><td>1(노랑), 2(분홍), 3(초록), 4(파랑)</td></tr>
                <tr><td>F</td><td className="text-blue-500 font-semibold">state</td><td>체크 완료 상태</td><td>문자</td><td>완료 / 미완료</td></tr>
                <tr><td>G</td><td className="text-blue-500 font-semibold">order</td><td>메모순서</td><td>숫자</td><td>1, 2, 3...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Google Apps Script 코드 복사 */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-xs">
          <div className="flex items-center justify-between font-semibold text-blue-900 dark:text-blue-200 mb-2">
            <span>💡 Apps Script 코드 복사</span>
            <button
              onClick={copyAppsScript}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? '복사 완료!' : '스크립트 복사'}
            </button>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11.5px]">
            <li>위 구글 시트 링크를 열고 <b>확장 프로그램 &gt; Apps Script</b> 클릭</li>
            <li>기존 코드를 지우고 위 코드를 복사하여 붙여넣은 뒤 <b>배포 &gt; 새 배포</b> 클릭</li>
            <li>유형: <b>웹 앱</b>, 실행 대상: <b>나</b>, 액세스 권한: <b>모든 사용자(Anyone)</b> 선택 후 배포 URL 복사</li>
          </ol>
        </div>

        {/* 3. 웹 앱 URL 입력 */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            배포된 Google Apps Script 웹 앱 URL 입력
          </label>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 하단 버튼 */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            닫기
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
          >
            연동 저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
