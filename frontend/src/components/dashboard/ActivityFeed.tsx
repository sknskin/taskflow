'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Task } from '@/lib/types';

// 상대 시간 포맷 유틸리티
// Relative time format utility
function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

// 태스크 액션 판별 (생성 vs 업데이트)
// Determine task action (created vs updated)
function getTaskAction(task: Task): { action: string; icon: string; color: string } {
  const createdAt = new Date(task.createdAt).getTime();
  const updatedAt = new Date(task.updatedAt).getTime();
  // 5초 이내 차이면 생성으로 간주
  // Consider as created if diff within 5 seconds
  const IS_CREATED_THRESHOLD_MS = 5_000;

  if (Math.abs(updatedAt - createdAt) <= IS_CREATED_THRESHOLD_MS) {
    return { action: 'created task', icon: 'add', color: 'bg-primary' };
  }
  if (task.status === 'DONE') {
    return { action: 'completed task', icon: 'check', color: 'bg-tertiary' };
  }
  return { action: 'updated task', icon: 'edit', color: 'bg-secondary' };
}

// 날짜 포맷 유틸리티 (Up Next 카드용)
// Date format utility for Up Next card
function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Due Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Due Tomorrow';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface ActivityFeedProps {
  tasks: Task[];
}

// 액티비티 피드 컴포넌트
// Activity feed component
export function ActivityFeed({ tasks }: ActivityFeedProps) {
  // 최근 업데이트된 태스크 상위 5개 (updatedAt 내림차순)
  // Top 5 recently updated tasks (updatedAt descending)
  const MAX_ACTIVITY_ITEMS = 5;

  const recentActivities = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, MAX_ACTIVITY_ITEMS);
  }, [tasks]);

  // 가장 빠른 마감일 태스크 (완료 제외, 마감일 있는 것만)
  // Nearest due task (excluding DONE, only tasks with dueDate)
  const upNextTask = useMemo(() => {
    const now = Date.now();
    return tasks
      .filter((t) => t.dueDate && t.status !== 'DONE' && new Date(t.dueDate).getTime() >= now)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0] ?? null;
  }, [tasks]);

  return (
    <div className="col-span-12 lg:col-span-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight">Activity</h2>
        <span className="material-symbols-outlined text-on-surface-variant/40 cursor-pointer">
          more_horiz
        </span>
      </div>

      {/* 액티비티 목록 */}
      {/* Activity list */}
      <div className="bg-surface-container-low p-6 rounded-xl space-y-8 relative overflow-hidden">
        {recentActivities.length === 0 ? (
          <p className="text-sm text-on-surface-variant/60 font-medium text-center py-4">
            No recent activity.
          </p>
        ) : (
          recentActivities.map((task) => {
            const { action, icon, color } = getTaskAction(task);
            const actorName = task.creator?.name ?? 'Someone';
            const timeAgo = formatRelativeTime(task.updatedAt);

            return (
              <div key={task.id} className="flex gap-4 relative z-10">
                <div className="relative flex-shrink-0">
                  {/* 유저 아바타 */}
                  {/* User avatar */}
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-sm font-bold text-on-surface-variant overflow-hidden">
                    {task.creator?.avatarUrl ? (
                      <Image
                        src={task.creator.avatarUrl}
                        alt={actorName}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      actorName.charAt(0).toUpperCase()
                    )}
                  </div>
                  {/* 액션 배지 */}
                  {/* Action badge */}
                  <div
                    className={`absolute -bottom-1 -right-1 w-5 h-5 ${color} rounded-full border-2 border-surface-container-low flex items-center justify-center`}
                  >
                    <span className="material-symbols-outlined text-white text-[12px] font-bold">
                      {icon}
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-on-surface leading-tight">
                    <span className="font-bold">{actorName}</span>{' '}
                    {action}{' '}
                    <span className="text-primary font-semibold line-clamp-1">
                      {task.title}
                    </span>
                  </p>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/50 mt-1 block">
                    {timeAgo}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* 장식 요소 */}
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
      </div>

      {/* Up Next 카드 */}
      {/* Up Next card */}
      <div className="mt-8 p-6 custom-gradient rounded-xl text-white task-card-shadow relative overflow-hidden group cursor-pointer active:scale-[0.99] transition-transform">
        <div className="relative z-10">
          <h5 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
            Up Next
          </h5>
          {upNextTask ? (
            <>
              <h4 className="text-xl font-black tracking-tight leading-tight line-clamp-2">
                {upNextTask.title}
              </h4>
              <div className="flex items-center gap-2 mt-4 text-sm opacity-90 font-medium">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                {formatDueDate(upNextTask.dueDate!)}
              </div>
            </>
          ) : (
            <>
              <h4 className="text-xl font-black tracking-tight leading-tight opacity-70">
                No upcoming tasks
              </h4>
              <div className="flex items-center gap-2 mt-4 text-sm opacity-60 font-medium">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                All caught up!
              </div>
            </>
          )}
        </div>
        <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-10 group-hover:scale-110 transition-transform">
          event
        </span>
      </div>
    </div>
  );
}
