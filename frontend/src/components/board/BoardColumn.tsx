'use client';

import { memo } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Task, TaskStatus } from '@/lib/types';
import { TaskCard } from './TaskCard';

// 컬럼 설정
// Column configuration
const COLUMN_CONFIG: Record<TaskStatus, { dot: string; label: string }> = {
  TODO: { dot: 'bg-slate-400', label: 'Todo' },
  IN_PROGRESS: { dot: 'bg-blue-500', label: 'In Progress' },
  IN_REVIEW: { dot: 'bg-amber-500', label: 'In Review' },
  DONE: { dot: 'bg-emerald-500', label: 'Done' },
};

interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onAddTask?: (status: TaskStatus) => void;
  onTaskDeleted?: () => void;
}

// BoardColumn 컴포넌트: React.memo로 불필요한 리렌더 방지
// BoardColumn component: wrapped with React.memo to prevent unnecessary re-renders
export const BoardColumn = memo(function BoardColumn({ status, tasks, onTaskClick, onAddTask, onTaskDeleted }: BoardColumnProps) {
  const config = COLUMN_CONFIG[status];
  const isDone = status === 'DONE';

  return (
    <div className={`flex flex-col gap-4 ${isDone ? 'opacity-75' : ''}`}>
      {/* 컬럼 헤더 */}
      {/* Column header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
            {config.label}
          </h3>
          <span className="bg-surface-container-high text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full font-bold">
            {tasks.length}
          </span>
        </div>
        <button
          className="material-symbols-outlined text-outline text-lg hover:text-primary transition-colors"
          aria-label="Add task"
          onClick={() => onAddTask?.(status)}
        >
          add
        </button>
      </div>

      {/* 드롭 영역 */}
      {/* Drop zone */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-col gap-3 min-h-[200px] rounded-xl p-1 transition-colors ${
              snapshot.isDraggingOver ? 'bg-primary/5' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onClick={onTaskClick}
                onDeleted={onTaskDeleted}
              />
            ))}
            {provided.placeholder}

            {/* 빈 슬롯 표시 */}
            {/* Empty slot placeholder */}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="border-2 border-dashed border-outline-variant/30 rounded-xl h-24 flex items-center justify-center">
                <span className="text-xs font-bold text-outline-variant/50">
                  Drop task here
                </span>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
});
