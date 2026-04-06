'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Task, Project } from '@/lib/types';
import { useAuthStore } from '@/store/auth';
import { useTranslation } from '@/hooks/useTranslation';
import { SummaryCards } from './SummaryCards';
import { MyTasks } from './MyTasks';
import { ActivityFeed } from './ActivityFeed';

// 대시보드 뷰 컴포넌트
// Dashboard view component
export function DashboardView() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
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
      toast.error('Failed to load data');
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
      <div>
        {/* 환영 메시지 스켈레톤 */}
        {/* Welcome message skeleton */}
        <div className="mb-10">
          <div className="h-10 w-72 bg-surface-container-high rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-48 bg-surface-container-high rounded-lg animate-pulse" />
        </div>
        {/* 요약 카드 스켈레톤 */}
        {/* Summary cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest p-6 rounded-xl task-card-shadow h-32 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-surface-container-high rounded-lg" />
                <div className="w-16 h-3 bg-surface-container-high rounded" />
              </div>
              <div className="h-8 w-12 bg-surface-container-high rounded mt-2" />
              <div className="h-4 w-20 bg-surface-container-high rounded mt-2" />
            </div>
          ))}
        </div>
        {/* 태스크 + 액티비티 스켈레톤 */}
        {/* Tasks + activity skeleton */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-surface-container-lowest rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-surface-container-lowest rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 환영 메시지 */}
      {/* Welcome message */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface mb-2">
          {t('dashboard.welcome')}, {user?.name?.split(' ')[0] ?? 'User'}.
        </h1>
        <p className="text-on-surface-variant font-medium">
          You have{' '}
          <span className="text-primary font-bold">{inProgressCount} {t('dashboard.tasksInProgress')}</span>
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
