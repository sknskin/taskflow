'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Project, Task } from '@/lib/types';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';

// 사전 정의된 색상 팔레트 (수정 모달용)
// Preset colors for edit modal
const PRESET_COLORS = [
  '#005ea1',
  '#7c3aed',
  '#059669',
  '#d97706',
  '#dc2626',
  '#0891b2',
] as const;

// 프로젝트 수정 폼 타입
// Project edit form type
interface EditForm {
  name: string;
  description: string;
  color: string;
}

// 프로젝트 페이지 내부 컴포넌트 (useSearchParams 사용)
// Projects page inner component (uses useSearchParams)
function ProjectsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // 수정 모달 상태
  // Edit modal state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: '', description: '', color: '' });
  const [editError, setEditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 삭제 확인 모달 상태
  // Delete confirmation modal state
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // 수정 모달 열기
  // Open edit modal
  const handleEditOpen = (project: Project) => {
    setEditingProject(project);
    setEditForm({
      name: project.name,
      description: project.description ?? '',
      color: project.color,
    });
    setEditError('');
  };

  // 수정 저장
  // Save edit
  const handleEditSave = async () => {
    if (!editingProject) return;
    if (!editForm.name.trim()) {
      setEditError('Project name is required.');
      return;
    }

    setIsSaving(true);
    setEditError('');

    try {
      const { data } = await api.patch<Project>(`/projects/${editingProject.id}`, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || null,
        color: editForm.color,
      });
      setProjects((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      setEditingProject(null);
    } catch (error) {
      console.error('[ProjectsPage] Failed to update project:', error);
      setEditError('Failed to update project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Escape 키 입력 시 열린 모달 닫기
  // Close open modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingProject) {
          setEditingProject(null);
        } else if (deletingProject) {
          setDeletingProject(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingProject, deletingProject]);

  // 프로젝트 삭제
  // Delete project
  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;

    setIsDeleting(true);
    try {
      await api.delete(`/projects/${deletingProject.id}`);
      setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
      setDeletingProject(null);
    } catch (error) {
      console.error('[ProjectsPage] Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
    }
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
              onEdit={handleEditOpen}
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-project-title"
        >
          <div className="glass-surface ghost-border w-full max-w-md mx-4 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 id="edit-project-title" className="text-2xl font-extrabold tracking-tight text-on-surface">
                Edit Project
              </h2>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-5">
              {/* 이름 필드 */}
              {/* Name field */}
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">
                  Project Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => {
                    setEditForm((f) => ({ ...f, name: e.target.value }));
                    if (editError) setEditError('');
                  }}
                  className={`w-full px-4 py-3 rounded-xl border bg-surface text-on-surface text-sm font-medium outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 ${
                    editError ? 'border-error' : 'border-outline-variant focus:border-primary'
                  }`}
                  maxLength={100}
                />
                {editError && (
                  <p className="mt-1.5 text-xs text-error font-medium">{editError}</p>
                )}
              </div>

              {/* 설명 필드 */}
              {/* Description field */}
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">
                  Description{' '}
                  <span className="text-on-surface-variant/50 font-normal">(optional)</span>
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm font-medium outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>

              {/* 색상 선택 */}
              {/* Color picker */}
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">
                  Color
                </label>
                <div className="flex gap-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditForm((f) => ({ ...f, color: c }))}
                      className="w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none"
                      style={{ backgroundColor: c }}
                    >
                      {editForm.color === c && (
                        <span className="flex items-center justify-center w-full h-full">
                          <span className="material-symbols-outlined text-white text-[16px] font-bold">
                            check
                          </span>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 액션 버튼 */}
              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditSave}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl custom-gradient text-white font-semibold text-sm shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 프로젝트 삭제 확인 모달 */}
      {/* Delete confirmation modal */}
      {deletingProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-project-title"
        >
          <div className="glass-surface ghost-border w-full max-w-sm mx-4 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-[28px]">
                  delete_forever
                </span>
              </div>
              <h2 id="delete-project-title" className="text-xl font-extrabold tracking-tight text-on-surface">
                Delete Project
              </h2>
              <p className="text-sm text-on-surface-variant font-medium">
                Are you sure you want to delete{' '}
                <span className="font-bold text-on-surface">"{deletingProject.name}"</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingProject(null)}
                className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-error text-white font-semibold text-sm active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
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
