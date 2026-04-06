'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { NAV_ITEMS } from '@/lib/navigation';
import { useTranslation } from '@/hooks/useTranslation';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  return (
    <aside className="bg-slate-900 h-screen w-64 flex flex-col fixed left-0 top-0 py-6 z-40">
      {/* 로고 */}
      {/* Logo */}
      <div className="px-6 mb-8 flex items-center gap-3">
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

      {/* 네비게이션 메뉴 */}
      {/* Navigation menu */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
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
              <span className="text-[14px] tracking-[0.05em]">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      {/* 새 프로젝트 버튼 */}
      {/* New project button */}
      <div className="px-4 mt-auto mb-6">
        <button
          onClick={() => router.push('/projects?new=1')}
          className="w-full custom-gradient text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg active:scale-[0.98] transition-transform"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          {t('nav.newProject')}
        </button>
      </div>

      {/* 유저 프로필 */}
      {/* User profile */}
      <div className="px-2 pt-4 border-t border-slate-800">
        <Link
          href="/settings"
          className="text-slate-400 hover:text-white px-3 py-2 flex items-center gap-3 transition-colors duration-200 hover:bg-slate-800 rounded-lg"
        >
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <span className="material-symbols-outlined text-[20px]">
              account_circle
            </span>
          )}
          <span className="text-[14px] tracking-[0.05em]">
            {user?.name || 'User Profile'}
          </span>
        </Link>
      </div>
    </aside>
  );
}
