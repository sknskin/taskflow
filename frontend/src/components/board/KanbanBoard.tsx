'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Task, TaskStatus, Project } from '@/lib/types';
import { BoardColumn } from './BoardColumn';
import { TaskDetailPanel } from '@/components/task/TaskDetailPanel';
import { CreateTaskModal } from '@/components/calendar/CreateTaskModal';

// 컬럼 순서
// Column order
const COLUMNS: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export function KanbanBoard() {
  const searchParams = useSearchParams();
  // URL에서 projectId 쿼리 파라미터 읽기
  // Read projectId query param from URL
  const initialProjectId = searchParams.get('projectId') || '';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId);
  const [isLoading, setIsLoading] = useState(true);

  // 선택된 태스크 ID (상세 패널 표시용)
  // Selected task ID for detail panel
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // 태스크 생성 모달 상태
  // Create task modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTaskStatus, setCreateTaskStatus] = useState<TaskStatus>('TODO');

  // 프로젝트 목록 조회
  // Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get<Project[]>('/projects');
      setProjects(data);
      if (data.length > 0) {
        // 이미 선택된 프로젝트가 있으면 변경하지 않음
        // Do not override if a project is already selected
        setSelectedProjectId((prev) => prev || data[0].id);
      }
    } catch (error) {
      console.error('[KanbanBoard] Failed to fetch projects:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 태스크 목록 조회
  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!selectedProjectId) return;

    try {
      const { data } = await api.get<Task[]>(`/projects/${selectedProjectId}/tasks`);
      setTasks(data);
    } catch (error) {
      console.error('[KanbanBoard] Failed to fetch tasks:', error);
      toast.error('Failed to load data');
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // 상태별 태스크 그룹핑
  // Group tasks by status
  const tasksByStatus: Record<TaskStatus, Task[]> = {
    TODO: [],
    IN_PROGRESS: [],
    IN_REVIEW: [],
    DONE: [],
  };

  tasks.forEach((task) => {
    if (tasksByStatus[task.status]) {
      tasksByStatus[task.status].push(task);
    }
  });

  // 드래그 완료 핸들러
  // Drag end handler
  const handleDragEnd = async (result: DropResult) => {
    const { draggableId, source, destination } = result;

    // 드롭 영역 밖이면 무시
    // Ignore if dropped outside
    if (!destination) return;

    // 같은 위치면 무시
    // Ignore if same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    const taskId = draggableId;

    // 낙관적 업데이트 (position 재계산 포함)
    // Optimistic update (with position recalculation)
    setTasks((prev) => {
      // 이동할 태스크 찾기
      // Find the task being moved
      const movedTask = prev.find((t) => t.id === taskId);
      if (!movedTask) return prev;

      // 태스크를 원래 위치에서 제거
      // Remove task from original position
      const withoutMoved = prev.filter((t) => t.id !== taskId);

      // 대상 컬럼의 태스크만 추출 (position 순 정렬)
      // Extract tasks in target column (sorted by position)
      const targetColumnTasks = withoutMoved
        .filter((t) => t.status === newStatus)
        .sort((a, b) => a.position - b.position);

      // 이동된 태스크를 대상 인덱스에 삽입
      // Insert moved task at target index
      const updatedTask = { ...movedTask, status: newStatus };
      targetColumnTasks.splice(destination.index, 0, updatedTask);

      // 대상 컬럼 내 모든 태스크의 position 재할당
      // Reassign positions for all tasks in target column
      const reindexed = targetColumnTasks.map((t, i) => ({ ...t, position: i }));

      // 다른 컬럼 태스크와 합치기
      // Merge with tasks from other columns
      const otherTasks = withoutMoved.filter((t) => t.status !== newStatus);
      return [...otherTasks, ...reindexed];
    });

    // API 호출
    // API call
    try {
      await api.patch(`/tasks/${taskId}`, {
        status: newStatus,
        position: destination.index,
      });
      toast.success('Task moved');
    } catch (error) {
      console.error('[KanbanBoard] Failed to update task status:', error);
      toast.error('Failed to move task');
      // 실패 시 원복
      // Revert on failure
      fetchTasks();
    }
  };

  // 현재 프로젝트
  // Current project
  const currentProject = projects.find((p) => p.id === selectedProjectId);

  // 로딩 중 스켈레톤 표시
  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 custom-gradient rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div>
      {/* 프로젝트 헤더 */}
      {/* Project header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-6 lg:mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-on-surface">
              {currentProject?.name || 'Select a Project'}
            </h1>
            {/* 프로젝트 스위처 */}
            {/* Project switcher */}
            {projects.length > 1 && (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-surface-container-high text-on-surface-variant text-xs font-bold px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-primary/20 outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
          {currentProject?.description && (
            <p className="text-on-surface-variant text-sm font-medium">
              {currentProject.description}
            </p>
          )}
        </div>

        {/* 팀 아바타 */}
        {/* Team avatars */}
        {currentProject?.members && (
          <div className="flex -space-x-2">
            {currentProject.members.slice(0, 4).map((member) => (
              member.user.avatarUrl ? (
                <Image
                  key={member.id}
                  src={member.user.avatarUrl}
                  alt={member.user.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full border-2 border-surface"
                />
              ) : (
                <div
                  key={member.id}
                  className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-outline"
                >
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
              )
            ))}
            {currentProject.members.length > 4 && (
              <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-outline">
                +{currentProject.members.length - 4}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 프로젝트 미선택 시 */}
      {/* No project selected */}
      {!selectedProjectId && projects.length === 0 && (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-outline-variant/30 mb-4">
            view_kanban
          </span>
          <p className="text-on-surface-variant font-medium">
            Create a project to get started
          </p>
        </div>
      )}

      {/* 칸반 보드 */}
      {/* Kanban board */}
      {selectedProjectId && (
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* 모바일: 수평 스크롤 + 스냅 / 데스크탑: 4열 그리드 */}
          {/* Mobile: horizontal scroll + snap / Desktop: 4-column grid */}
          <div className="flex lg:grid lg:grid-cols-4 gap-4 lg:gap-6 items-start overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory lg:snap-none pb-4 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 no-scrollbar">
            {COLUMNS.map((status) => (
              // 모바일: 최소 너비 280px + 스냅 포인트
              // Mobile: min-width 280px + snap point
              <div
                key={status}
                className="min-w-[280px] lg:min-w-0 snap-start flex-shrink-0 lg:flex-shrink"
              >
                <BoardColumn
                  status={status}
                  tasks={tasksByStatus[status]}
                  onTaskClick={(task) => {
                    setSelectedTaskId(task.id);
                  }}
                  onAddTask={(s) => {
                    setCreateTaskStatus(s);
                    setIsCreateModalOpen(true);
                  }}
                />
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* 태스크 상세 사이드 패널 */}
      {/* Task detail side panel */}
      {selectedTaskId && (
        <TaskDetailPanel
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onUpdated={fetchTasks}
          onDeleted={fetchTasks}
        />
      )}

      {/* 태스크 생성 모달 */}
      {/* Task creation modal */}
      {isCreateModalOpen && (
        <CreateTaskModal
          projects={projects}
          defaultDate={null}
          defaultStatus={createTaskStatus}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={() => {
            setIsCreateModalOpen(false);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
}
