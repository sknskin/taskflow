'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Task, Project } from '@/lib/types';
import { useAuthStore } from '@/store/auth';
import { SummaryCards } from './SummaryCards';
import { MyTasks } from './MyTasks';
import { ActivityFeed } from './ActivityFeed';

// 대시보드 뷰 컴포넌트
// Dashboard view component
export function DashboardView() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 조회 (N+1 제거: /tasks/mine 단일 호출)
  // Fetch data (N+1 eliminated: single /tasks/mine call)
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [{ data: projectList }, { data: tasks }] = await Promise.all([
        api.get<Project[]>('/projects'),
        api.get<Task[]>('/tasks/mine'),
      ]);
      setProjects(projectList);
      setAllTasks(tasks);
    } catch (error) {
      console.error('[DashboardView] Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const inProgressCount = allTasks.filter((t) => t.status === 'IN_PROGRESS').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 custom-gradient rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div>
      {/* 환영 메시지 */}
      {/* Welcome message */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface mb-2">
          Welcome back, {user?.name?.split(' ')[0] ?? 'User'}.
        </h1>
        <p className="text-on-surface-variant font-medium">
          You have{' '}
          <span className="text-primary font-bold">{inProgressCount} tasks</span>{' '}
          in progress for today.
        </p>
      </div>

      {/* 요약 카드 */}
      {/* Summary cards */}
      <SummaryCards projects={projects} tasks={allTasks} inProgressCount={inProgressCount} />

      {/* 벤토 레이아웃: 태스크 + 액티비티 */}
      {/* Bento layout: tasks + activity */}
      <div className="grid grid-cols-12 gap-8">
        <MyTasks tasks={allTasks} onTaskUpdated={fetchData} />
        <ActivityFeed tasks={allTasks} />
      </div>
    </div>
  );
}
