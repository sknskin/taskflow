'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { User } from '@/lib/types';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      router.replace('/login');
      return;
    }

    // URL에서 토큰 즉시 제거 (히스토리/레퍼러 노출 방지)
    // Remove token from URL immediately to prevent history/referrer leakage
    window.history.replaceState({}, '', '/auth/callback');

    // 유저 정보 조회 후 토큰 저장
    // Fetch user info then save token
    const handleCallback = async () => {
      try {
        const { data } = await api.get<User>('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAuth(data, token);
        router.replace('/');
      } catch {
        clearAuth();
        router.replace('/login');
      }
    };

    handleCallback();
  }, [searchParams, router, setAuth, clearAuth]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 custom-gradient rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="material-symbols-outlined text-white text-2xl">
            sync
          </span>
        </div>
        <p className="text-on-surface-variant font-medium">
          Signing you in...
        </p>
      </div>
    </div>
  );
}

// Suspense로 감싸서 useSearchParams 지원
// Wrap with Suspense for useSearchParams support
export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <p className="text-on-surface-variant">Loading...</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
