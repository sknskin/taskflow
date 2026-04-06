'use client';

import { Draggable } from '@hello-pangea/dnd';
import Image from 'next/image';
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
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
  const isDone = task.status === 'DONE';
  const isInProgress = task.status === 'IN_PROGRESS';
  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick?.(task)}
          className={`
            p-4 rounded-xl transition-all group
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
            <span className="material-symbols-outlined text-outline-variant text-[18px] opacity-0 group-hover:opacity-100 transition-opacity">
              more_horiz
            </span>
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
                <span className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1">
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
}
