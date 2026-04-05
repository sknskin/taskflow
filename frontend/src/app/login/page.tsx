'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  // 이미 로그인된 경우 대시보드로 리다이렉트
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Google OAuth 로그인 시작
  // Start Google OAuth login
  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* 좌측 브랜딩 패널 */}
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="relative z-10 text-center px-16">
          <div className="w-20 h-20 custom-gradient rounded-3xl flex items-center justify-center mx-auto mb-8">
            <span className="material-symbols-outlined text-white text-4xl">
              view_kanban
            </span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
            TaskFlow
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            Manage your tasks, projects, and team<br />
            with calendar and kanban board.
          </p>
        </div>
        {/* 장식 요소 */}
        {/* Decorative elements */}
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl" />
      </div>

      {/* 우측 로그인 폼 */}
      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          {/* 모바일 로고 */}
          {/* Mobile logo */}
          <div className="lg:hidden mb-12 text-center">
            <div className="w-16 h-16 custom-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-white text-3xl">
                view_kanban
              </span>
            </div>
            <h1 className="text-3xl font-black text-on-surface tracking-tighter">
              TaskFlow
            </h1>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">
            Welcome back
          </h2>
          <p className="text-on-surface-variant font-medium mb-10">
            Sign in to continue to your workspace
          </p>

          {/* Google 로그인 버튼 */}
          {/* Google login button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-surface-container-lowest px-6 py-4 rounded-xl task-card-shadow hover:bg-surface-container-low transition-colors group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-on-surface font-semibold text-sm">
              Continue with Google
            </span>
          </button>

          <p className="text-center text-on-surface-variant/60 text-xs mt-8">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
