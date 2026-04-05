'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  // 인증 상태에 따라 리다이렉트
  // Redirect based on auth state
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // 로딩 중 표시
  // Loading indicator
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
