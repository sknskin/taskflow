'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
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

// 알림 폴링 간격 (ms) — 30초
// Notification polling interval in milliseconds — 30 seconds
const NOTIFICATION_POLL_INTERVAL_MS = 30000;

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

// 상대 시간 포맷 헬퍼 (외부 라이브러리 없이 구현)
// Relative time formatter helper (no external library)
function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

// 알림 아이템 타입
// Notification item type
interface NotificationItem {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  taskId: string | null;
  projectId: string | null;
  createdAt: string;
}

// 알림 API 응답 타입
// Notification API response type
interface NotificationResponse {
  notifications: NotificationItem[];
  unreadCount: number;
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

  // 알림 상태
  // Notification state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);
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

  // 알림 목록 조회
  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get<NotificationResponse>('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('[TopNav] 알림 조회 실패 / Failed to fetch notifications:', error);
    }
  }, []);

  // 마운트 시 알림 조회 및 30초 폴링
  // Fetch notifications on mount and poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const pollInterval = setInterval(fetchNotifications, NOTIFICATION_POLL_INTERVAL_MS);
    return () => clearInterval(pollInterval);
  }, [fetchNotifications]);

  // 알림 읽음 처리 핸들러
  // Mark notification as read handler
  const handleNotifClick = useCallback(
    async (notif: NotificationItem) => {
      try {
        await api.patch(`/notifications/${notif.id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - (notif.isRead ? 0 : 1)));
      } catch (error) {
        console.error('[TopNav] 알림 읽음 처리 실패 / Failed to mark notification as read:', error);
      }
      if (notif.projectId) {
        router.push(`/board?projectId=${notif.projectId}`);
      }
      setIsNotifOpen(false);
    },
    [router],
  );

  // 전체 읽음 처리 핸들러
  // Mark all notifications as read handler
  const handleMarkAllRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('[TopNav] 전체 읽음 처리 실패 / Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all as read');
    }
  }, []);

  // ESC 키 및 외부 클릭으로 드롭다운 닫기
  // Close dropdown on Escape key and outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsMobileSearchOpen(false);
        setIsNotifOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isOutsideDesktop =
        desktopContainerRef.current && !desktopContainerRef.current.contains(target);
      const isOutsideMobile =
        mobileContainerRef.current && !mobileContainerRef.current.contains(target);
      const isOutsideNotif =
        notifContainerRef.current && !notifContainerRef.current.contains(target);

      if (isOutsideDesktop && isOutsideMobile) {
        setIsOpen(false);
      }
      if (isOutsideNotif) {
        setIsNotifOpen(false);
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

          {/* 알림 버튼 및 드롭다운 */}
          {/* Notification bell button and dropdown */}
          <div ref={notifContainerRef} className="relative">
            <button
              className="relative p-2 text-slate-500 hover:text-primary transition-colors"
              aria-label="Notifications"
              onClick={() => setIsNotifOpen((prev) => !prev)}
            >
              <span className="material-symbols-outlined">notifications</span>
              {/* 읽지 않은 알림 뱃지 */}
              {/* Unread notification badge */}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* 알림 드롭다운 */}
            {/* Notification dropdown */}
            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/20 z-50 overflow-hidden">
                {/* 드롭다운 헤더 */}
                {/* Dropdown header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20">
                  <span className="text-sm font-semibold text-on-surface">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* 알림 목록 */}
                {/* Notification list */}
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-on-surface-variant/50">
                      <span className="material-symbols-outlined text-3xl">notifications_none</span>
                      <p className="text-sm mt-2">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-surface-container-low transition-colors border-b border-outline-variant/10 last:border-b-0 ${
                          notif.isRead ? 'opacity-60' : ''
                        }`}
                      >
                        {/* 읽음 여부 인디케이터 */}
                        {/* Read/unread indicator */}
                        <span
                          className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                            notif.isRead ? 'bg-transparent' : 'bg-primary'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-on-surface leading-snug">{notif.message}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            {formatRelativeTime(notif.createdAt)}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          {/* 헬프 버튼: 도움말 준비 중 안내 */}
          {/* Help button: notify that documentation is coming soon */}
          <button
            className="hidden lg:block p-2 text-slate-500 hover:text-primary transition-colors"
            aria-label="Help"
            onClick={() => toast.info('Help & documentation coming soon')}
          >
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
