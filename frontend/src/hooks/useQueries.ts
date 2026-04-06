import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Project, Task } from '@/lib/types';

// 쿼리 키 상수
// Query key constants
export const queryKeys = {
  projects: ['projects'] as const,
  tasks: ['tasks', 'mine'] as const,
  taskDetail: (id: string) => ['tasks', id] as const,
  projectTasks: (projectId: string) => ['projects', projectId, 'tasks'] as const,
};

// 프로젝트 목록 조회 훅
// Projects list query hook
export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: async () => {
      const { data } = await api.get<Project[]>('/projects');
      return data;
    },
  });
}

// 내 전체 태스크 조회 훅
// All my tasks query hook
export function useMyTasks() {
  return useQuery({
    queryKey: queryKeys.tasks,
    queryFn: async () => {
      const { data } = await api.get<Task[]>('/tasks/mine');
      return data;
    },
  });
}

// 프로젝트별 태스크 조회 훅
// Project tasks query hook
export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projectTasks(projectId),
    queryFn: async () => {
      const { data } = await api.get<Task[]>(`/projects/${projectId}/tasks`);
      return data;
    },
    enabled: !!projectId,
  });
}

// 태스크 상세 조회 훅
// Task detail query hook
export function useTaskDetail(taskId: string) {
  return useQuery({
    queryKey: queryKeys.taskDetail(taskId),
    queryFn: async () => {
      const { data } = await api.get<Task>(`/tasks/${taskId}`);
      return data;
    },
    enabled: !!taskId,
  });
}

// useQueryClient 재-export (편의용)
// Re-export useQueryClient for convenience
export { useQueryClient };
