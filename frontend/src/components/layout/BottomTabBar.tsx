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
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-outline-variant/20 flex items-center justify-around px-4 h-16 pb-[env(safe-area-inset-bottom)]">
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
