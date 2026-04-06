'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// React Query 프로바이더
// React Query provider
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // 컴포넌트별 QueryClient 인스턴스 (SSR 안전)
  // Per-component QueryClient instance (SSR safe)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // 탭 포커스 시 자동 리페치
        // Auto refetch on window focus
        refetchOnWindowFocus: true,
        // 5분 stale 시간
        // 5 minute stale time
        staleTime: 5 * 60 * 1000,
        // 재시도 1회
        // Retry once
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
