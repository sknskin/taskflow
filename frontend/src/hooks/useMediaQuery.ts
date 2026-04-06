'use client';

import { useState, useEffect } from 'react';

// 미디어 쿼리 커스텀 훅
// Custom hook for media query matching
export function useMediaQuery(query: string): boolean {
  // SSR 환경에서는 false 반환
  // Return false during SSR
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    // 변경 이벤트 리스너 등록
    // Register change event listener
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQueryList.addEventListener('change', handleChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}
