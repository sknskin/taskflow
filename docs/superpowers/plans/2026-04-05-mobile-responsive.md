# Mobile Responsive Implementation Plan

> **For agentic workers:** This is Plan 3 of 3. Execute tasks sequentially. Each task includes the exact code to implement. Run `npm run build` after Task 9 to confirm zero errors. Do not modify existing comments or logs. All new comments must be bilingual (Korean line, then English line). Do not commit.

---

## File Structure

| File | Action | Description |
|------|--------|-------------|
| `frontend/src/app/globals.css` | Edit | Add `prefers-reduced-motion` rule |
| `frontend/src/hooks/useMediaQuery.ts` | Create | Responsive breakpoint hook |
| `frontend/src/components/layout/MobileDrawer.tsx` | Create | Mobile slide-in nav drawer |
| `frontend/src/components/layout/BottomTabBar.tsx` | Create | Mobile bottom tab navigation |
| `frontend/src/components/layout/TopNav.tsx` | Edit | Add hamburger + compact search for mobile |
| `frontend/src/components/layout/AppShell.tsx` | Edit | Responsive layout, swap FAB → BottomTabBar + MobileDrawer |
| `frontend/src/components/task/TaskDetailPanel.tsx` | Edit | Bottom sheet on mobile, side panel on desktop |
| `frontend/src/components/board/KanbanBoard.tsx` | Edit | Horizontal scroll with snap on mobile |
| `frontend/src/components/dashboard/DashboardView.tsx` | Edit | Responsive padding + header |
| `frontend/src/components/calendar/CalendarView.tsx` | Edit | Compact header + list view default on mobile |

---

## Task 1: Add reduced-motion CSS + useMediaQuery hook

### 1-A. `frontend/src/app/globals.css` — append at end of file

```css
/* 움직임 감소 설정 (접근성) */
/* Reduced motion (accessibility) */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 1-B. `frontend/src/hooks/useMediaQuery.ts` — new file

```ts
'use client';

import { useState, useEffect } from 'react';

// 미디어 쿼리 커스텀 훅
// Custom hook for media query matching
export function useMediaQuery(query: string): boolean {
  // SSR 환경에서는 false 반환
  // Return false during SSR
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    // 변경 이벤트 리스너 등록
    // Register change event listener
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQueryList.addEventListener('change', handleChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}
```

---

## Task 2: MobileDrawer component

### `frontend/src/components/layout/MobileDrawer.tsx` — new file

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

// 네비게이션 항목 (Sidebar와 동일)
// Navigation items (same as Sidebar)
const NAV_ITEMS = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/projects', icon: 'folder_shared', label: 'My Projects' },
  { href: '/calendar', icon: 'calendar_month', label: 'Calendar' },
  { href: '/board', icon: 'view_kanban', label: 'Board' },
  { href: '/settings', icon: 'settings', label: 'Settings' },
] as const;

// 드로어 너비 상수
// Drawer width constant
const DRAWER_WIDTH = 'w-72';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// 모바일 슬라이드 드로어 컴포넌트
// Mobile slide-in drawer component
export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // 드로어 열릴 때 body 스크롤 잠금
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 스와이프 제스처 감지 (왼쪽으로 스와이프하면 닫기)
  // Swipe gesture detection (close on swipe left)
  useEffect(() => {
    if (!isOpen) return;

    let startX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaX = startX - e.changedTouches[0].clientX;
      // 50px 이상 왼쪽으로 스와이프 시 닫기
      // Close if swiped left by more than 50px
      if (deltaX > 50) {
        onClose();
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* 오버레이: 페이드 인/아웃 */}
      {/* Overlay: fade in/out */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 드로어: 왼쪽에서 슬라이드 */}
      {/* Drawer: slide from left */}
      <aside
        className={`fixed left-0 top-0 ${DRAWER_WIDTH} h-full bg-slate-900 z-50 flex flex-col py-6 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigation drawer"
      >
        {/* 로고 + 닫기 버튼 */}
        {/* Logo + close button */}
        <div className="px-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">
                view_kanban
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tighter">
                TaskFlow
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Workspace
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
            aria-label="Close navigation"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* 네비게이션 메뉴 */}
        {/* Navigation menu */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={
                  isActive
                    ? 'bg-blue-400/10 text-blue-300 font-semibold rounded-lg mx-2 px-3 py-2 flex items-center gap-3 transition-colors duration-200'
                    : 'text-slate-400 hover:text-white mx-2 px-3 py-2 flex items-center gap-3 transition-colors duration-200 hover:bg-slate-800 rounded-lg'
                }
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="text-[14px] tracking-[0.05em]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 새 프로젝트 버튼 */}
        {/* New project button */}
        <div className="px-4 mt-auto mb-6">
          <button className="w-full custom-gradient text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg active:scale-[0.98] transition-transform">
            <span className="material-symbols-outlined text-[20px]">add</span>
            New Project
          </button>
        </div>

        {/* 유저 프로필 */}
        {/* User profile */}
        <div className="px-2 pt-4 border-t border-slate-800">
          <Link
            href="/settings"
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-2 flex items-center gap-3 transition-colors duration-200 hover:bg-slate-800 rounded-lg"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <span className="material-symbols-outlined text-[20px]">
                account_circle
              </span>
            )}
            <div className="flex flex-col">
              <span className="text-[14px] tracking-[0.05em]">
                {user?.name || 'User Profile'}
              </span>
              {user?.email && (
                <span className="text-[10px] text-slate-500 truncate max-w-[160px]">
                  {user.email}
                </span>
              )}
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
```

---

## Task 3: BottomTabBar component

### `frontend/src/components/layout/BottomTabBar.tsx` — new file

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// 하단 탭 항목 정의
// Bottom tab item definitions
const TAB_ITEMS = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/board', icon: 'view_kanban', label: 'Board' },
] as const;

// 중앙 FAB 상단 오프셋 (px)
// Center FAB top offset in px
const FAB_OFFSET_TOP = -12;

interface BottomTabBarProps {
  onNewTask: () => void;
}

// 모바일 하단 탭 네비게이션 바
// Mobile bottom tab navigation bar
export function BottomTabBar({ onNewTask }: BottomTabBarProps) {
  const pathname = usePathname();

  return (
    // 데스크탑에서는 숨김
    // Hidden on desktop
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-outline-variant/20 flex items-center justify-around px-4 h-16 safe-bottom">
      {/* 첫 번째 탭 */}
      {/* First tab */}
      <Link
        href={TAB_ITEMS[0].href}
        className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 group"
        aria-label={TAB_ITEMS[0].label}
      >
        <span
          className={`material-symbols-outlined text-[24px] transition-colors duration-200 ${
            pathname.startsWith(TAB_ITEMS[0].href)
              ? 'text-primary'
              : 'text-slate-400 group-active:text-primary'
          }`}
          style={
            pathname.startsWith(TAB_ITEMS[0].href)
              ? { fontVariationSettings: "'FILL' 1" }
              : undefined
          }
        >
          {TAB_ITEMS[0].icon}
        </span>
        <span
          className={`text-[10px] font-bold tracking-wide transition-colors duration-200 ${
            pathname.startsWith(TAB_ITEMS[0].href) ? 'text-primary' : 'text-slate-400'
          }`}
        >
          {TAB_ITEMS[0].label}
        </span>
      </Link>

      {/* 중앙 FAB 스타일 새 태스크 버튼 */}
      {/* Center FAB-style new task button */}
      <div className="flex-1 flex justify-center">
        <button
          onClick={onNewTask}
          style={{ marginTop: `${FAB_OFFSET_TOP}px` }}
          className="w-14 h-14 custom-gradient rounded-full shadow-2xl shadow-blue-500/30 flex items-center justify-center text-white active:scale-95 transition-transform"
          aria-label="New task"
        >
          <span className="material-symbols-outlined text-[28px]">add</span>
        </button>
      </div>

      {/* 두 번째 탭 */}
      {/* Second tab */}
      <Link
        href={TAB_ITEMS[1].href}
        className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 group"
        aria-label={TAB_ITEMS[1].label}
      >
        <span
          className={`material-symbols-outlined text-[24px] transition-colors duration-200 ${
            pathname.startsWith(TAB_ITEMS[1].href)
              ? 'text-primary'
              : 'text-slate-400 group-active:text-primary'
          }`}
          style={
            pathname.startsWith(TAB_ITEMS[1].href)
              ? { fontVariationSettings: "'FILL' 1" }
              : undefined
          }
        >
          {TAB_ITEMS[1].icon}
        </span>
        <span
          className={`text-[10px] font-bold tracking-wide transition-colors duration-200 ${
            pathname.startsWith(TAB_ITEMS[1].href) ? 'text-primary' : 'text-slate-400'
          }`}
        >
          {TAB_ITEMS[1].label}
        </span>
      </Link>
    </nav>
  );
}
```

---

## Task 4: Update TopNav for mobile

### `frontend/src/components/layout/TopNav.tsx` — full replacement

```tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';

// 뷰 토글 항목
// View toggle items
const VIEW_TOGGLES = [
  { href: '/calendar', label: 'Calendar' },
  { href: '/board', label: 'Board' },
] as const;

interface TopNavProps {
  onMenuOpen?: () => void;
}

export function TopNav({ onMenuOpen }: TopNavProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <header className="flex justify-between items-center px-4 lg:px-8 h-16 bg-slate-50 sticky top-0 z-30 transition-all duration-300 ease-in-out">
      {/* 모바일: 햄버거 버튼 + 로고 텍스트 / 데스크탑: 검색창 */}
      {/* Mobile: hamburger + logo text / Desktop: search input */}
      <div className="flex items-center gap-3 flex-1">
        {/* 모바일 햄버거 버튼 */}
        {/* Mobile hamburger button */}
        <button
          onClick={onMenuOpen}
          className="lg:hidden p-2 text-slate-500 hover:text-primary transition-colors rounded-lg hover:bg-surface-container"
          aria-label="Open navigation"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* 모바일 로고 텍스트 */}
        {/* Mobile logo text */}
        <span className="lg:hidden text-base font-black text-on-surface tracking-tighter">
          TaskFlow
        </span>

        {/* 데스크탑 검색창 */}
        {/* Desktop search input */}
        <div className="hidden lg:block relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-container border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="Search tasks, people, or projects..."
            type="text"
          />
        </div>
      </div>

      {/* 중앙: 뷰 토글 (데스크탑만) */}
      {/* Center: View toggles (desktop only) */}
      <div className="flex items-center gap-4 lg:gap-6">
        <nav className="hidden lg:flex items-center gap-6">
          {VIEW_TOGGLES.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? 'text-blue-600 text-sm font-bold border-b-2 border-blue-600 h-16 flex items-center'
                    : 'text-slate-500 hover:text-slate-900 text-sm font-medium tracking-tight h-16 flex items-center'
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block h-6 w-[1px] bg-outline-variant/30" />

        {/* 우측: 모바일 검색 아이콘 + 알림 + 아바타 */}
        {/* Right: mobile search icon + notifications + avatar */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* 모바일 검색 아이콘 버튼 */}
          {/* Mobile search icon button */}
          <button className="lg:hidden p-2 text-slate-500 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>

          <button className="p-2 text-slate-500 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="hidden lg:block p-2 text-slate-500 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-outline-variant"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
```

---

## Task 5: Update AppShell

### `frontend/src/components/layout/AppShell.tsx` — full replacement

```tsx
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
      <BottomTabBar onNewTask={() => {/* TODO: 태스크 생성 모달 열기 / Open task create modal */}} />
    </div>
  );
}
```

---

## Task 6: TaskDetailPanel — responsive (side panel desktop / bottom sheet mobile)

### `frontend/src/components/task/TaskDetailPanel.tsx`

Apply the following two targeted edits:

**Edit A** — loading state wrapper: change `w-[600px]` to `max-w-[600px] w-full`

Find (lines 170–176):
```tsx
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-on-surface/5 backdrop-blur-sm z-40 flex justify-end">
        <div className="w-[600px] bg-surface-container-lowest h-screen flex items-center justify-center">
          <div className="w-8 h-8 custom-gradient rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }
```

Replace with:
```tsx
  if (isLoading) {
    return (
      // 로딩 중 반응형 패널 (데스크탑: 사이드 패널, 모바일: 바텀 시트)
      // Loading responsive panel (desktop: side panel, mobile: bottom sheet)
      <>
        {/* 데스크탑 로딩 사이드 패널 */}
        {/* Desktop loading side panel */}
        <div className="hidden lg:flex fixed inset-0 bg-on-surface/5 backdrop-blur-sm z-40 justify-end">
          <div className="max-w-[600px] w-full bg-surface-container-lowest h-screen flex items-center justify-center">
            <div className="w-8 h-8 custom-gradient rounded-lg animate-pulse" />
          </div>
        </div>
        {/* 모바일 로딩 바텀 시트 */}
        {/* Mobile loading bottom sheet */}
        <div className="lg:hidden fixed inset-0 bg-on-surface/5 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full bg-surface-container-lowest rounded-t-2xl h-1/2 flex items-center justify-center">
            <div className="w-8 h-8 custom-gradient rounded-lg animate-pulse" />
          </div>
        </div>
      </>
    );
  }
```

**Edit B** — main return: replace the entire `return (...)` block

Find (line 181):
```tsx
  return (
    <div className="fixed inset-0 bg-on-surface/5 backdrop-blur-sm z-40 flex justify-end" onClick={onClose}>
      <div
        className="w-[600px] bg-surface-container-lowest h-screen shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
```

Replace with:
```tsx
  return (
    <>
      {/* 데스크탑: 오른쪽 고정 사이드 패널 */}
      {/* Desktop: fixed right side panel */}
      <div
        className="hidden lg:flex fixed inset-0 bg-on-surface/5 backdrop-blur-sm z-40 justify-end"
        onClick={onClose}
      >
        <div
          className="max-w-[600px] w-full bg-surface-container-lowest h-screen shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
```

And at the very end of the return block, after the closing `</div>` of the panel content, before the final `</div>` closing the overlay:

Find (line 501-502, end of return):
```tsx
      </div>
    </div>
  );
```

Replace with:
```tsx
        </div>
      </div>

      {/* 모바일: 하단에서 올라오는 바텀 시트 */}
      {/* Mobile: bottom sheet sliding up */}
      <div
        className="lg:hidden fixed inset-0 bg-on-surface/5 backdrop-blur-sm z-50 flex items-end"
        onClick={onClose}
      >
        <div
          className="w-full bg-surface-container-lowest rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 드래그 핸들 */}
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-9 h-1.5 bg-outline-variant/40 rounded-full" />
          </div>

          {/* 패널 헤더 */}
          {/* Panel header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-surface-container flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">task</span>
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Task-{task.id.slice(-4)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-error-container hover:text-error rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* 스크롤 가능 콘텐츠 (데스크탑 패널과 동일한 내용 재사용) */}
          {/* Scrollable content (reuse same content as desktop panel) */}
          <div className="flex-1 overflow-y-auto px-5 py-5 no-scrollbar">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-extrabold tracking-tight text-on-surface border-none focus:ring-0 px-0 mb-6 bg-transparent outline-none placeholder:text-on-surface-variant/30"
              placeholder="Task title..."
            />

            <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-8">
              {/* 상태 */}
              {/* Status */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  Status
                </label>
                <div className="relative">
                  <button
                    onClick={() => { setIsStatusOpen(!isStatusOpen); setIsPriorityOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 bg-secondary-container/30 text-primary font-bold text-sm rounded-lg hover:bg-secondary-container/50 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${currentStatus?.dot}`} />
                      {currentStatus?.label}
                    </div>
                    <span className="material-symbols-outlined text-xs">expand_more</span>
                  </button>
                  {isStatusOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest rounded-xl shadow-xl z-10 py-1">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setStatus(opt.value); setIsStatusOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-container-low transition-colors"
                        >
                          <div className={`w-2 h-2 rounded-full ${opt.dot}`} />
                          <span className={status === opt.value ? 'font-bold text-primary' : 'text-on-surface'}>
                            {opt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 우선순위 */}
              {/* Priority */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  Priority
                </label>
                <div className="relative">
                  <button
                    onClick={() => { setIsPriorityOpen(!isPriorityOpen); setIsStatusOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 ${currentPriority?.bg} ${currentPriority?.text} font-bold text-sm rounded-lg transition-all`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">priority_high</span>
                      {currentPriority?.label}
                    </div>
                    <span className="material-symbols-outlined text-xs">expand_more</span>
                  </button>
                  {isPriorityOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest rounded-xl shadow-xl z-10 py-1">
                      {PRIORITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setPriority(opt.value); setIsPriorityOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-container-low transition-colors"
                        >
                          <span className={priority === opt.value ? 'font-bold' : ''}>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 마감일 */}
              {/* Due date */}
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  Due Date
                </label>
                <div className="flex items-center gap-3 p-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  </div>
                  <div>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="text-sm font-bold text-on-surface bg-transparent border-none p-0 focus:ring-0 outline-none"
                    />
                    {dueDate && (
                      <p className="text-[10px] text-on-surface-variant">
                        {getDaysRemaining(dueDate)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 설명 */}
            {/* Description */}
            <div className="space-y-3 mb-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the task and key deliverables..."
                className="w-full min-h-[100px] bg-surface-container-low border-none focus:ring-0 rounded-xl p-4 text-sm leading-relaxed text-on-surface outline-none resize-none"
              />
            </div>
          </div>

          {/* 바텀 시트 푸터 */}
          {/* Bottom sheet footer */}
          <div className="p-4 border-t border-surface-container flex items-center justify-between bg-surface-container-low/30 flex-shrink-0">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 text-on-surface-variant hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              <span className="text-xs font-bold uppercase tracking-widest">Delete</span>
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 custom-gradient text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
```

### 1-C. Add `animate-slide-up` keyframe to `globals.css`

Append after the `prefers-reduced-motion` block:

```css
/* 바텀 시트 슬라이드 업 애니메이션 */
/* Bottom sheet slide-up animation */
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@layer utilities {
  .animate-slide-up {
    animation: slide-up 300ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
  }
}
```

---

## Task 7: KanbanBoard mobile horizontal scroll

### `frontend/src/components/board/KanbanBoard.tsx`

**Edit A** — project header: make it responsive

Find:
```tsx
      {/* 프로젝트 헤더 */}
      {/* Project header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">
```

Replace with:
```tsx
      {/* 프로젝트 헤더 */}
      {/* Project header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-6 lg:mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-on-surface">
```

**Edit B** — kanban board grid: switch to horizontal scroll on mobile

Find:
```tsx
      {/* 칸반 보드 */}
      {/* Kanban board */}
      {selectedProjectId && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
```

Replace with:
```tsx
      {/* 칸반 보드 */}
      {/* Kanban board */}
      {selectedProjectId && (
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* 모바일: 수평 스크롤 + 스냅 / 데스크탑: 4열 그리드 */}
          {/* Mobile: horizontal scroll + snap / Desktop: 4-column grid */}
          <div className="flex lg:grid lg:grid-cols-4 gap-4 lg:gap-6 items-start overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory lg:snap-none pb-4 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 no-scrollbar">
```

**Edit C** — each BoardColumn wrapper: add snap + min-width on mobile

Find:
```tsx
            {COLUMNS.map((status) => (
              <BoardColumn
                key={status}
                status={status}
                tasks={tasksByStatus[status]}
                onTaskClick={(task) => {
                  setSelectedTaskId(task.id);
                  onTaskClick?.(task);
                }}
              />
            ))}
```

Replace with:
```tsx
            {COLUMNS.map((status) => (
              // 모바일: 최소 너비 280px + 스냅 포인트
              // Mobile: min-width 280px + snap point
              <div
                key={status}
                className="min-w-[280px] lg:min-w-0 snap-start flex-shrink-0 lg:flex-shrink"
              >
                <BoardColumn
                  status={status}
                  tasks={tasksByStatus[status]}
                  onTaskClick={(task) => {
                    setSelectedTaskId(task.id);
                    onTaskClick?.(task);
                  }}
                />
              </div>
            ))}
```

---

## Task 8: Final responsive polish

### 8-A. DashboardView — responsive heading + grid

In `frontend/src/components/dashboard/DashboardView.tsx`:

**Edit** — welcome heading size

Find:
```tsx
        <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface mb-2">
```

Replace with:
```tsx
        <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tighter text-on-surface mb-2">
```

**Edit** — bento grid responsive

Find:
```tsx
      <div className="grid grid-cols-12 gap-8">
```

Replace with:
```tsx
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
```

### 8-B. CalendarView — compact header + list view on mobile

In `frontend/src/components/calendar/CalendarView.tsx`:

**Edit A** — header: make responsive

Find:
```tsx
      {/* 캘린더 헤더 */}
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">
            Calendar
          </h2>
```

Replace with:
```tsx
      {/* 캘린더 헤더 */}
      {/* Calendar header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8 gap-4">
        <div className="flex items-center gap-3 lg:gap-4">
          <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight text-on-surface">
            Calendar
          </h2>
```

**Edit B** — close the flex div wrapper properly (the `</div>` closing `flex items-center gap-4` wrapper)

Find:
```tsx
        </div>

        {/* 뷰 토글 */}
        {/* View toggle */}
        <div className="flex bg-surface-container-low p-1 rounded-xl">
```

Replace with:
```tsx
        </div>

        {/* 뷰 토글 (모바일에서도 표시) */}
        {/* View toggle (also visible on mobile) */}
        <div className="flex bg-surface-container-low p-1 rounded-xl">
```

**Edit C** — bottom insight cards: responsive grid

Find:
```tsx
      <div className="mt-12 grid grid-cols-3 gap-8">
```

Replace with:
```tsx
      <div className="mt-8 lg:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
```

**Edit D** — `currentView` initial state: default to `dayGridMonth` on desktop, same on mobile (FullCalendar handles responsiveness through its own CSS; keep as-is but document)

No code change needed — FullCalendar's `dayMaxEvents={3}` already truncates on small cells.

### 8-C. SummaryCards — responsive grid

In `frontend/src/components/dashboard/SummaryCards.tsx`, if it uses a fixed grid, change to responsive. Read first to verify:

> **Note to agent:** Read `SummaryCards.tsx` before editing. Apply `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` pattern if a fixed `grid-cols-4` is found.

---

## Task 9: Verify build

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/frontend
npm run build
```

Expected output: `✓ Compiled successfully` with zero TypeScript errors and zero ESLint errors.

If build fails:
1. Read the error output carefully.
2. Fix only the reported file and line.
3. Re-run `npm run build`.
4. Do not mark this task complete until the build passes.

---

## Implementation Notes

### Breakpoint contract
- `lg` (1024px) is the single breakpoint dividing mobile and desktop.
- Default (no prefix) = mobile-first styles.
- `lg:` prefix = desktop overrides.

### Z-index stack
| Layer | z-index |
|-------|---------|
| TopNav sticky | 30 |
| Desktop Sidebar | 40 |
| BottomTabBar | 40 |
| TaskDetailPanel (desktop) | 40 |
| TaskDetailPanel (mobile sheet) | 50 |
| MobileDrawer + overlay | 50 |

### Animation durations
| Element | Duration | Easing |
|---------|----------|--------|
| Drawer slide | 300ms | `ease-out` |
| Bottom sheet | 300ms | `cubic-bezier(0.32, 0.72, 0, 1)` |
| Overlay fade | 300ms | `ease` (Tailwind default) |
| Tab switch | 200ms | `ease-in-out` |
| Card interaction | 150ms | `ease` |

### Files NOT to touch
- `Sidebar.tsx` — unchanged, only hidden via `hidden lg:block` wrapper in AppShell
- `FloatingActionButton.tsx` — no longer imported; do not delete without user confirmation
- `BoardColumn.tsx` — unchanged; wrapper div added in KanbanBoard instead
- `TaskCard.tsx` — unchanged
- All backend files
