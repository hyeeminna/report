import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Post-it Todo list - AI 포스트잇 투두리스트',
  description: 'Gemini AI 기반 실시간 코칭과 구글 시트 연동을 지원하는 감성 포스트잇 투두리스트',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
