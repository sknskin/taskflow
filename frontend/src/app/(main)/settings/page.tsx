'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { useTranslation } from '@/hooks/useTranslation';
import api from '@/lib/api';

// 로컬스토리지 키 상수
// localStorage key constants
const LS_EMAIL_NOTIFICATIONS = 'taskflow_emailNotifications';
const LS_THEME = 'taskflow_theme';

// 설정 페이지 컴포넌트
// Settings page component
export default function SettingsPage() {
  const { user, clearAuth } = useAuthStore();
  const { t, locale, setLocale } = useTranslation();

  // 이메일 알림 설정 (localStorage 전용)
  // Email notifications setting (localStorage only)
  const [emailNotifications, setEmailNotifications] = useState(false);

  // 테마 설정 (localStorage + html class)
  // Theme setting (localStorage + html class)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 로그아웃 로딩 상태
  // Logout loading state
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 컴포넌트 마운트 시 설정 불러오기
  // Load settings on mount
  useEffect(() => {
    const savedNotif = localStorage.getItem(LS_EMAIL_NOTIFICATIONS);
    setEmailNotifications(savedNotif === 'true');

    const savedTheme = localStorage.getItem(LS_THEME);
    const dark = savedTheme === 'dark';
    setIsDarkMode(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // 이메일 알림 토글 핸들러
  // Toggle email notifications handler
  const handleEmailNotificationsToggle = () => {
    const next = !emailNotifications;
    setEmailNotifications(next);
    localStorage.setItem(LS_EMAIL_NOTIFICATIONS, String(next));
  };

  // 테마 토글 핸들러
  // Toggle theme handler
  const handleThemeToggle = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem(LS_THEME, next ? 'dark' : 'light');
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 로그아웃 핸들러
  // Logout handler
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // 로그아웃 API 실패 시에도 클라이언트 인증 정보 초기화
      // Clear client auth even if logout API fails
      console.error('[SettingsPage] Logout API error (clearing auth anyway):', error);
      toast.error('Logout failed');
    } finally {
      clearAuth();
      // 리다이렉트는 AppShell의 useEffect가 처리
      // AppShell useEffect handles redirect
    }
  };

  return (
    <div className="max-w-2xl">
      {/* 페이지 헤더 */}
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface mb-1">
          {t('settings.title')}
        </h1>
        <p className="text-on-surface-variant font-medium">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        {/* ── 섹션 1: 프로필 ── */}
        {/* ── Section 1: Profile ── */}
        <section className="bg-surface-container-low rounded-2xl p-6 ghost-border">
          <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/60 mb-5">
            {t('settings.profile')}
          </h2>
          <div className="flex items-center gap-4">
            {/* 아바타 */}
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center flex-shrink-0">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant">
                  account_circle
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-extrabold tracking-tight text-on-surface truncate">
                {user?.name ?? '—'}
              </p>
              <p className="text-sm text-on-surface-variant font-medium truncate">
                {user?.email ?? '—'}
              </p>
              <p className="text-xs text-on-surface-variant/50 font-medium mt-1">
                {t('settings.signedInWithGoogle')}
              </p>
            </div>
          </div>
        </section>

        {/* ── 섹션 2: 알림 ── */}
        {/* ── Section 2: Notifications ── */}
        <section className="bg-surface-container-low rounded-2xl p-6 ghost-border">
          <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/60 mb-5">
            {t('settings.notifications')}
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-on-surface">
                {t('settings.emailNotifications')}
              </p>
              <p className="text-xs text-on-surface-variant/70 font-medium mt-0.5">
                {t('settings.emailDesc')}
              </p>
            </div>
            {/* 토글 스위치 */}
            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={emailNotifications}
              onClick={handleEmailNotificationsToggle}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                emailNotifications ? 'bg-primary' : 'bg-surface-container-high'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${
                  emailNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* ── 섹션 3: 테마 ── */}
        {/* ── Section 3: Theme ── */}
        <section className="bg-surface-container-low rounded-2xl p-6 ghost-border">
          <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/60 mb-5">
            {t('settings.theme')}
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-on-surface">
                {t('settings.darkMode')}
              </p>
              <p className="text-xs text-on-surface-variant/70 font-medium mt-0.5">
                {t('settings.darkModeDesc')}
              </p>
            </div>
            {/* 토글 스위치 */}
            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={isDarkMode}
              onClick={handleThemeToggle}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                isDarkMode ? 'bg-primary' : 'bg-surface-container-high'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* ── 섹션 4: 언어 ── */}
        {/* ── Section 4: Language ── */}
        <section className="bg-surface-container-low rounded-2xl p-6 ghost-border">
          <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/60 mb-5">
            {t('settings.language')}
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-on-surface">
                {t('settings.languageToggle')}
              </p>
              <p className="text-xs text-on-surface-variant/70 font-medium mt-0.5">
                {t('settings.languageDesc')}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-high rounded-xl p-1">
              <button
                type="button"
                onClick={() => setLocale('ko')}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                  locale === 'ko'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                한국어
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                  locale === 'en'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </section>

        {/* ── 섹션 5: 계정 ── */}
        {/* ── Section 5: Account ── */}
        <section className="bg-surface-container-low rounded-2xl p-6 ghost-border">
          <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/60 mb-5">
            {t('settings.account')}
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-on-surface">{t('settings.signOut')}</p>
              <p className="text-xs text-on-surface-variant/70 font-medium mt-0.5">
                {t('settings.signOutDesc')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 rounded-xl bg-error/10 text-error font-semibold text-sm hover:bg-error/20 active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoggingOut ? (
                <>
                  <span className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin" />
                  {t('settings.signingOut')}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  {t('settings.signOut')}
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
