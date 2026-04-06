'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Task } from '@/lib/types';
import { TaskDetailPanel } from '../task/TaskDetailPanel';

// 우선순위별 보더 색상
// Border color by priority
const PRIORITY_BORDER: Record<string, string> = {
  URGENT: 'border-red-500',
  HIGH: 'border-primary',
  MEDIUM: 'border-amber-400',
  LOW: 'border-tertiary',
};

// 우선순위별 칩 스타일
// Chip style by priority
const PRIORITY_CHIP: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700',
  HIGH: 'bg-blue-100 text-primary',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-green-100 text-tertiary',
};

interface MyTasksProps {
  tasks: Task[];
  onTaskUpdated?: () => void;
}

// 내 태스크 리스트 컴포넌트
// My tasks list component
export function MyTasks({ tasks, onTaskUpdated }: MyTasksProps) {
  const router = useRouter();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // 진행 중인 태스크만 표시 (DONE 제외), 최대 5개
  // Show only active tasks (exclude DONE), max 5
  const activeTasks = tasks.filter((t) => t.status !== 'DONE').slice(0, 5);

  return (
    <>
      <div className="col-span-12 lg:col-span-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight">
            My Tasks{' '}
            <span className="text-on-surface-variant/40 font-medium ml-2">Today</span>
          </h2>
          <button
            className="text-primary font-bold text-sm hover:underline"
            onClick={() => router.push('/board')}
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {activeTasks.length === 0 && (
            <div className="bg-surface-container-lowest p-8 rounded-xl task-card-shadow text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2 block">
                task_alt
              </span>
              <p className="text-on-surface-variant font-medium">No active tasks</p>
            </div>
          )}
          {activeTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              className={`bg-surface-container-lowest p-5 rounded-xl task-card-shadow flex items-center gap-5 border-l-4 ${PRIORITY_BORDER[task.priority] ?? 'border-primary'} group cursor-pointer hover:bg-surface-container-low transition-colors`}
            >
              {/* 체크박스 */}
              {/* Checkbox */}
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await api.patch(`/tasks/${task.id}`, { status: 'DONE' });
                    toast.success('Task completed');
                    onTaskUpdated?.();
                  } catch (err) {
                    console.error('[MyTasks] Failed to complete task:', err);
                    toast.error('Failed to complete task');
                  }
                }}
                className="w-6 h-6 rounded-full border-2 border-outline flex items-center justify-center group-hover:border-primary flex-shrink-0"
              >
                <span className="material-symbols-outlined text-[16px] text-transparent group-hover:text-primary">
                  check
                </span>
              </button>

              {/* 태스크 정보 */}
              {/* Task info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-bold text-on-surface tracking-tight">
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-sm text-on-surface-variant truncate">
                    {task.description}
                  </p>
                )}
              </div>

              {/* 우선순위 + 담당자 */}
              {/* Priority + assignee */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${PRIORITY_CHIP[task.priority] ?? 'bg-blue-100 text-primary'}`}
                >
                  {task.priority}
                </div>
                {task.assignee?.avatarUrl ? (
                  <Image
                    src={task.assignee.avatarUrl}
                    alt={task.assignee.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border-2 border-surface-container-lowest"
                  />
                ) : task.assignee ? (
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-outline border-2 border-surface-container-lowest">
                    {task.assignee.name.charAt(0).toUpperCase()}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 태스크 상세 패널 */}
      {/* Task detail panel */}
      {selectedTaskId && (
        <TaskDetailPanel
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onUpdated={onTaskUpdated}
          onDeleted={onTaskUpdated}
        />
      )}
    </>
  );
}
