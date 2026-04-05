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

export function TopNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <header className="flex justify-between items-center px-8 h-16 bg-slate-50 sticky top-0 z-30 transition-all duration-300 ease-in-out">
      {/* 좌측: 검색 */}
      {/* Left: Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
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

      {/* 중앙: 뷰 토글 */}
      {/* Center: View toggles */}
      <div className="flex items-center gap-6">
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

        <div className="h-6 w-[1px] bg-outline-variant/30" />

        {/* 우측: 알림, 도움말, 아바타 */}
        {/* Right: Notifications, help, avatar */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-500 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 text-slate-500 hover:text-primary transition-colors">
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
