'use client';

import { memo, useState, useRef, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import Image from 'next/image';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Task } from '@/lib/types';

// 마감일 포맷팅 (모듈 레벨 — 리렌더 시마다 재생성 방지)
// Format due date (module level — prevents recreation on each render)
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// 우선순위 칩 설정
// Priority chip configuration
const PRIORITY_CONFIG: Record<string, { bg: string; text: string; icon: string }> = {
  URGENT: { bg: 'bg-red-50', text: 'text-red-600', icon: 'error' },
  HIGH: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'priority_high' },
  MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'warning' },
  LOW: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'low_priority' },
};

interface TaskCardProps {
  task: Task;
  index: number;
  onClick?: (task: Task) => void;
  onDeleted?: () => void;
}

// TaskCard 컴포넌트: React.memo로 불필요한 리렌더 방지
// TaskCard component: wrapped with React.memo to prevent unnecessary re-renders
export const TaskCard = memo(function TaskCard({ task, index, onClick, onDeleted }: TaskCardProps) {
  const isDone = task.status === 'DONE';
  const isInProgress = task.status === 'IN_PROGRESS';
  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;

  // 더보기 메뉴 열림 상태
  // More menu open state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 마감일 초과 여부 (완료 상태 제외)
  // Whether the due date is overdue (excluding DONE status)
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  // 메뉴 외부 클릭 시 닫기
  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // 태스크 삭제 핸들러
  // Task delete handler
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/tasks/${task.id}`);
      toast.success('Task deleted');
      onDeleted?.();
    } catch {
      toast.error('Failed to delete');
    }
    setIsMenuOpen(false);
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick?.(task)}
          className={`
            p-4 rounded-xl transition-all group relative
            ${isDone
              ? 'bg-surface-container'
              : 'bg-surface-container-lowest task-card-shadow border border-transparent hover:border-primary/10'
            }
            ${isInProgress ? 'border-l-4 border-l-primary' : ''}
            ${snapshot.isDragging ? 'shadow-xl rotate-2 cursor-grabbing' : 'cursor-grab'}
          `}
        >
          {/* 우선순위 칩 */}
          {/* Priority chip */}
          <div className="flex justify-between items-start mb-3">
            {!isDone ? (
              <span className={`${priorityConfig.bg} ${priorityConfig.text} text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1`}>
                <span
                  className="material-symbols-outlined text-[12px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {priorityConfig.icon}
                </span>
                {task.priority}
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1">
                <span
                  className="material-symbols-outlined text-[12px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                Completed
              </span>
            )}

            {/* 더보기 버튼 + 드롭다운 메뉴 */}
            {/* More button + dropdown menu */}
            <div ref={menuRef} className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen((prev) => !prev); }}
                className="material-symbols-outlined text-outline-variant text-[18px] opacity-0 group-hover:opacity-100 transition-opacity hover:text-on-surface"
                aria-label="More options"
              >
                more_horiz
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-surface-container-lowest rounded-xl shadow-xl z-20 py-1 w-36">
                  <button
                    onClick={(e) => { e.stopPropagation(); onClick?.(task); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    View Details
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error-container/30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 태스크 제목 */}
          {/* Task title */}
          <h4 className={`text-sm font-bold leading-snug mb-4 ${isDone ? 'text-on-surface/60 line-through' : 'text-on-surface'}`}>
            {task.title}
          </h4>

          {/* 푸터: 담당자 + 날짜 */}
          {/* Footer: assignee + date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {task.assignee?.avatarUrl ? (
                <Image
                  src={task.assignee.avatarUrl}
                  alt={task.assignee.name}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full"
                />
              ) : task.assignee ? (
                <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-outline">
                  {task.assignee.name.charAt(0).toUpperCase()}
                </div>
              ) : null}
              {task.dueDate && (
                <span className={`text-[11px] font-bold flex items-center gap-1 ${isOverdue ? 'text-error font-bold' : 'text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  {formatDate(task.dueDate)}
                </span>
              )}
            </div>
            {task._count?.comments ? (
              <span className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
                {task._count.comments}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </Draggable>
  );
});
