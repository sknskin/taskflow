import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TaskFlow — Task & Schedule Management',
  description: 'Jira-style task and schedule management app with calendar and kanban board',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={inter.variable}>
      <head>
        {/* 저장된 테마를 즉시 적용하여 라이트 모드 깜빡임 방지 (블로킹 스크립트) */}
        {/* Apply saved theme immediately to prevent flash of light mode (blocking script) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('taskflow_theme');if(t==='dark')document.documentElement.classList.add('dark');})();`,
          }}
        />
        {/* Material Symbols 아이콘 */}
        {/* Material Symbols Icons */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface font-sans antialiased selection:bg-primary-fixed-dim">
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
        {/* 전역 토스트 알림 */}
        {/* Global toast notifications */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
