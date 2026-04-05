'use client';

import { useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { User } from '@/lib/types';

// 인증 상태 초기화 프로바이더
// Auth state initialization provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');

        if (!token) {
          setLoading(false);
          return;
        }

        const { data } = await api.get<User>('/auth/me');
        setAuth(data, token);
      } catch {
        clearAuth();
      }
    };

    initAuth();
  }, [setAuth, clearAuth, setLoading]);

  return <>{children}</>;
}
