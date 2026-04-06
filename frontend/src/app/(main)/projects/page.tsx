'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Project, Task } from '@/lib/types';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import { DeleteProjectModal } from '@/components/projects/DeleteProjectModal';

// 프로젝트 페이지 내부 컴포넌트 (useSearchParams 사용)
// Projects page inner component (uses useSearchParams)
function ProjectsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // 수정/삭제 모달 상태
  // Edit/delete modal state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // 데이터 조회 (N+1 제거: /tasks/mine 단일 호출)
  // Fetch data (N+1 eliminated: single /tasks/mine call)
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [{ data: projectList }, { data: allTasksData }] = await Promise.all([
        api.get<Project[]>('/projects'),
        api.get<Task[]>('/tasks/mine'),
      ]);
      setProjects(projectList);
      setAllTasks(allTasksData);
    } catch (error) {
      console.error('[ProjectsPage] Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ?new=1 쿼리 파라미터 감지 시 생성 모달 자동 오픈
  // Auto-open create modal when ?new=1 query param detected
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setIsCreateOpen(true);
      // 쿼리 파라미터 제거 (뒤로가기 시 모달 재오픈 방지)
      // Remove query param to prevent modal re-opening on back navigation
      router.replace('/projects');
    }
  }, [searchParams, router]);

  // 프로젝트 생성 완료 핸들러
  // Handle project created
  const handleCreated = (project: Project) => {
    setProjects((prev) => [...prev, project]);
    setIsCreateOpen(false);
  };

  // 프로젝트 수정 완료 핸들러
  // Handle project updated
  const handleUpdated = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingProject(null);
  };

  // 프로젝트 삭제 완료 핸들러
  // Handle project deleted
  const handleDeleted = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setDeletingProject(null);
  };

  return (
    <div>
      {/* 페이지 헤더 */}
      {/* Page header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface mb-1">
            My Projects
          </h1>
          <p className="text-on-surface-variant font-medium">
            {isLoading ? (
              <span className="opacity-0">Loading...</span>
            ) : (
              <>
                <span className="text-primary font-bold">{projects.length} projects</span>{' '}
                in your workspace
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="custom-gradient text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-lg active:scale-[0.98] transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Project
        </button>
      </div>

      {/* 로딩 상태 */}
      {/* Loading state */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 bg-surface-container-low rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        /* 빈 상태 */
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant/20 mb-4">
            folder_open
          </span>
          <h3 className="text-xl font-bold text-on-surface mb-2">No projects yet</h3>
          <p className="text-on-surface-variant font-medium mb-6">
            Create your first project to get started.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="custom-gradient text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-lg active:scale-[0.98] transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Create Project
          </button>
        </div>
      ) : (
        /* 프로젝트 카드 그리드 */
        /* Project card grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={allTasks}
              onEdit={setEditingProject}
              onDelete={setDeletingProject}
            />
          ))}
        </div>
      )}

      {/* 프로젝트 생성 모달 */}
      {/* Create project modal */}
      {isCreateOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={handleCreated}
        />
      )}

      {/* 프로젝트 수정 모달 */}
      {/* Edit project modal */}
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onUpdated={handleUpdated}
        />
      )}

      {/* 프로젝트 삭제 확인 모달 */}
      {/* Delete confirmation modal */}
      {deletingProject && (
        <DeleteProjectModal
          project={deletingProject}
          onClose={() => setDeletingProject(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}

// Suspense 래퍼 (useSearchParams 사용으로 필요)
// Suspense wrapper required for useSearchParams usage in Next.js 15
export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 custom-gradient rounded-lg animate-pulse" />
        </div>
      }
    >
      <ProjectsPageInner />
    </Suspense>
  );
}
