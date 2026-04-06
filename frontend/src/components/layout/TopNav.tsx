'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { useTranslation } from '@/hooks/useTranslation';
import api from '@/lib/api';

// 뷰 토글 항목
// View toggle items
const VIEW_TOGGLES = [
  { href: '/calendar', label: 'Calendar' },
  { href: '/board', label: 'Board' },
] as const;

// 최소 검색어 길이
// Minimum search query length
const MIN_SEARCH_LENGTH = 2;

// 검색 디바운스 지연 시간 (ms)
// Search debounce delay in milliseconds
const SEARCH_DEBOUNCE_MS = 300;

// 검색 결과 태스크 타입 (project.color 포함)
// Search result task type (includes project.color)
interface SearchResultTask {
  id: string;
  title: string;
  project?: {
    id: string;
    name: string;
    color: string;
  } | null;
  assignee?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
}

interface TopNavProps {
  onMenuOpen?: () => void;
}

export function TopNav({ onMenuOpen }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  // 검색 상태
  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultTask[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // 모바일 검색 오버레이 표시 여부
  // Whether the mobile search overlay is shown
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 검색 API 호출
  // Call search API
  const fetchSearchResults = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < MIN_SEARCH_LENGTH) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    setIsOpen(true);

    try {
      const { data } = await api.get<SearchResultTask[]>('/tasks/search', {
        params: { q: searchQuery.trim() },
      });
      setResults(data);
    } catch (error) {
      console.error('[TopNav] 검색 실패 / Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // 검색어 변경 핸들러 (디바운스 적용)
  // Query change handler with debounce
  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (value.trim().length < MIN_SEARCH_LENGTH) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      debounceTimerRef.current = setTimeout(() => {
        fetchSearchResults(value);
      }, SEARCH_DEBOUNCE_MS);
    },
    [fetchSearchResults],
  );

  // 검색 결과 클릭 핸들러
  // Search result click handler
  const handleResultClick = useCallback(
    (task: SearchResultTask) => {
      if (task.project?.id) {
        router.push(`/board?projectId=${task.project.id}`);
      }
      setQuery('');
      setResults([]);
      setIsOpen(false);
      setIsMobileSearchOpen(false);
    },
    [router],
  );

  // ESC 키 및 외부 클릭으로 드롭다운 닫기
  // Close dropdown on Escape key and outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsMobileSearchOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isOutsideDesktop =
        desktopContainerRef.current && !desktopContainerRef.current.contains(target);
      const isOutsideMobile =
        mobileContainerRef.current && !mobileContainerRef.current.contains(target);

      if (isOutsideDesktop && isOutsideMobile) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 컴포넌트 언마운트 시 타이머 정리
  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 검색 드롭다운 공통 JSX
  // Shared search dropdown JSX
  const renderDropdown = () => (
    <>
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/20 max-h-80 overflow-y-auto z-50">
          {results.map((task) => (
            <button
              key={task.id}
              onClick={() => handleResultClick(task)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{task.title}</p>
                <p className="text-xs text-on-surface-variant truncate">
                  {task.project?.name}
                </p>
              </div>
              {task.assignee?.avatarUrl && (
                <Image
                  src={task.assignee.avatarUrl}
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= MIN_SEARCH_LENGTH && results.length === 0 && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/20 p-6 text-center z-50">
          <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">
            search_off
          </span>
          <p className="text-sm text-on-surface-variant mt-2">No results found</p>
        </div>
      )}
    </>
  );

  return (
    <header className="flex justify-between items-center px-4 lg:px-8 h-16 bg-slate-50 sticky top-0 z-30 transition-all duration-300 ease-in-out">
      {/* 모바일: 햄버거 버튼 + 로고 텍스트 / 데스크탑: 검색창 */}
      {/* Mobile: hamburger + logo text / Desktop: search input */}
      <div className="flex items-center gap-3 flex-1">
        {/* 모바일 햄버거 버튼 */}
        {/* Mobile hamburger button */}
        <button
          onClick={onMenuOpen}
          className="lg:hidden p-2 text-slate-500 hover:text-primary transition-colors rounded-lg hover:bg-surface-container"
          aria-label="Open navigation"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* 모바일 로고 텍스트 */}
        {/* Mobile logo text */}
        <span className="lg:hidden text-base font-black text-on-surface tracking-tighter">
          TaskFlow
        </span>

        {/* 데스크탑 검색창 */}
        {/* Desktop search input */}
        <div ref={desktopContainerRef} className="hidden lg:block relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-container border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder={t('common.search')}
            type="text"
            aria-label={t('common.search')}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => {
              // 포커스 시 쿼리가 충분하면 드롭다운 열기
              // Open dropdown on focus if query is sufficient
              if (query.trim().length >= MIN_SEARCH_LENGTH) {
                setIsOpen(true);
              }
            }}
          />
          {renderDropdown()}
        </div>
      </div>

      {/* 모바일 검색 오버레이 */}
      {/* Mobile search overlay */}
      {isMobileSearchOpen && (
        <div
          ref={mobileContainerRef}
          className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-slate-50 z-40 flex items-center px-4 gap-2"
        >
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input
              autoFocus
              className="w-full pl-10 pr-4 py-2 bg-surface-container border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder={t('common.search')}
              type="text"
              aria-label={t('common.search')}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
            />
            {renderDropdown()}
          </div>
          <button
            onClick={() => {
              setIsMobileSearchOpen(false);
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="p-2 text-slate-500 hover:text-primary transition-colors"
            aria-label="Close search"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* 중앙: 뷰 토글 (데스크탑만) */}
      {/* Center: View toggles (desktop only) */}
      <div className="flex items-center gap-4 lg:gap-6">
        <nav className="hidden lg:flex items-center gap-6">
          {VIEW_TOGGLES.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? 'text-blue-600 text-sm font-bold border-b-2 border-blue-600 h-16 flex items-center'
                    : 'text-slate-500 hover:text-slate-900 text-sm font-medium tracking-tight h-16 flex items-center'
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block h-6 w-[1px] bg-outline-variant/30" />

        {/* 우측: 모바일 검색 아이콘 + 알림 + 아바타 */}
        {/* Right: mobile search icon + notifications + avatar */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* 모바일 검색 아이콘 버튼 */}
          {/* Mobile search icon button */}
          <button
            className="lg:hidden p-2 text-slate-500 hover:text-primary transition-colors"
            aria-label="Search"
            onClick={() => setIsMobileSearchOpen(true)}
          >
            <span className="material-symbols-outlined">search</span>
          </button>

          <button className="p-2 text-slate-500 hover:text-primary transition-colors" aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="hidden lg:block p-2 text-slate-500 hover:text-primary transition-colors" aria-label="Help">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full border border-outline-variant"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
