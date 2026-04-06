'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { MobileDrawer } from './MobileDrawer';
import { BottomTabBar } from './BottomTabBar';

// 인증된 페이지의 앱 셸 레이아웃
// App shell layout for authenticated pages
export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  // 모바일 드로어 열림 상태
  // Mobile drawer open state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // 미인증 시 로그인 페이지로 리다이렉트
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // 로딩 중이거나 미인증 시 로딩 표시
  // Show loading while checking auth or if not authenticated
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 custom-gradient rounded-xl flex items-center justify-center animate-pulse">
          <span className="material-symbols-outlined text-white text-2xl">
            view_kanban
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* 데스크탑 사이드바 (lg 이상에서만 표시) */}
      {/* Desktop sidebar (visible on lg and above only) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* 모바일 드로어 (lg 미만에서만 표시) */}
      {/* Mobile drawer (visible on below lg only) */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />

      {/* 메인 콘텐츠 영역 */}
      {/* Main content area */}
      <div className="lg:ml-64">
        <TopNav onMenuOpen={() => setIsMobileDrawerOpen(true)} />
        {/* 모바일 하단 탭 바 높이 만큼 패딩 추가 */}
        {/* Add padding for mobile bottom tab bar height */}
        <main className="lg:p-8 p-4 pb-24 lg:pb-8 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>

      {/* 모바일 하단 탭 바 (FAB 역할 포함) */}
      {/* Mobile bottom tab bar (includes FAB role) */}
      <BottomTabBar onNewTask={() => router.push('/board')} />
    </div>
  );
}
