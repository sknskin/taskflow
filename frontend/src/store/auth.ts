import { create } from 'zustand';
import { AuthState } from '@/lib/types';

// 인증 상태 스토어
// Auth state store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  // 인증 정보 설정
  // Set auth info
  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
    set({ user, accessToken: token, isAuthenticated: true, isLoading: false });
  },

  // 인증 정보 초기화
  // Clear auth info
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },

  // 로딩 상태 설정
  // Set loading state
  setLoading: (loading) => set({ isLoading: loading }),
}));
