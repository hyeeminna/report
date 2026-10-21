import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { action, payload, scriptUrl: clientScriptUrl } = await req.json();

    const targetUrl =
      clientScriptUrl ||
      process.env.GOOGLE_SHEET_SCRIPT_URL ||
      process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

    if (targetUrl) {
      try {
        if (action === 'read') {
          // 구글 시트에서 전체 행 읽기 (GET, 302 리다이렉트 자동 추적)
          const gasRes = await fetch(targetUrl, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            redirect: 'follow',
            cache: 'no-store',
          });
          const gasData = await gasRes.json();
          return NextResponse.json({ success: true, data: gasData });
        } else {
          // 구글 시트로 변경사항 전송 (POST, 302 리다이렉트 자동 추적)
          const gasRes = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, payload }),
            redirect: 'follow',
          });

          const gasData = await gasRes.json();
          return NextResponse.json({ success: true, data: gasData });
        }
      } catch (gasError: any) {
        console.warn('Google Sheet Sync Error, falling back to local:', gasError);
        return NextResponse.json({
          success: false,
          error: '구글 시트 연동 실패: ' + gasError.message,
          isFallback: true,
        });
      }
    }

    return NextResponse.json({
      success: true,
      isLocalFallback: true,
      message: '구글 시트 URL 미설정 상태 (로컬 저장소 모드)',
      data: payload,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류' },
      { status: 500 }
    );
  }
}
