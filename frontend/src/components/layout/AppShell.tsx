'use client';

import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { FloatingActionButton } from '../ui/FloatingActionButton';

// 인증된 페이지의 앱 셸 레이아웃
// App shell layout for authenticated pages
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="ml-64">
        <TopNav />
        <main className="p-8 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
      <FloatingActionButton />
    </div>
  );
}
