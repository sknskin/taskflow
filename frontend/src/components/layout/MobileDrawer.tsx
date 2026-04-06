'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { NAV_ITEMS } from '@/lib/navigation';
import { useTranslation } from '@/hooks/useTranslation';

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
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useTranslation();

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
                <span className="text-[14px] tracking-[0.05em]">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        {/* 새 프로젝트 버튼 */}
        {/* New project button */}
        <div className="px-4 mt-auto mb-6">
          <button
            onClick={() => { onClose(); router.push('/projects?new=1'); }}
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
            onClick={onClose}
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
