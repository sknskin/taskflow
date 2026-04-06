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
