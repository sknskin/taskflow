# Frontend Features Implementation Plan

> **For agentic workers:** Execute tasks in order. Each task includes complete file content. Read each target file before editing. Run `cd /Users/dohee/Documents/workspace/project/taskflow/frontend && npx tsc --noEmit` after all tasks complete to verify zero type errors. Do not commit.

---

## File Structure

| Task | File | Action |
|------|------|--------|
| 1 | `src/components/projects/CreateProjectModal.tsx` | Create new |
| 2 | `src/components/projects/ProjectCard.tsx` | Create new |
| 3 | `src/app/(main)/projects/page.tsx` | Replace placeholder |
| 4 | `src/app/(main)/settings/page.tsx` | Replace placeholder |
| 5 | `src/components/dashboard/ActivityFeed.tsx` | Update props |
| 6 | `src/components/dashboard/DashboardView.tsx` | Pass tasks to ActivityFeed |
| 7 | `src/components/layout/Sidebar.tsx` | Wire New Project button |
| 8 | Build verify | `npx tsc --noEmit` |

---

## Task 1: CreateProjectModal Component

**File:** `src/components/projects/CreateProjectModal.tsx` (Create new — no read needed)

```tsx
'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Project } from '@/lib/types';

// 사전 정의된 프로젝트 색상 팔레트
// Pre-defined project color palette
const PRESET_COLORS = [
  '#005ea1', // primary blue
  '#7c3aed', // violet
  '#059669', // emerald
  '#d97706', // amber
  '#dc2626', // red
  '#0891b2', // cyan
] as const;

type PresetColor = (typeof PRESET_COLORS)[number];

interface CreateProjectModalProps {
  onClose: () => void;
  onCreated: (project: Project) => void;
}

// 프로젝트 생성 모달 컴포넌트
// Create project modal component
export function CreateProjectModal({ onClose, onCreated }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<PresetColor>(PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState('');

  // 폼 제출 핸들러
  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError('Project name is required.');
      return;
    }

    setIsSubmitting(true);
    setNameError('');

    try {
      const { data } = await api.post<Project>('/projects', {
        name: name.trim(),
        description: description.trim() || null,
        color,
      });
      onCreated(data);
    } catch (error) {
      console.error('[CreateProjectModal] Failed to create project:', error);
      setNameError('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 배경 클릭으로 모달 닫기
  // Close modal on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="glass-surface ghost-border w-full max-w-md mx-4 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* 모달 헤더 */}
        {/* Modal header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">
            New Project
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 프로젝트 이름 입력 */}
          {/* Project name input */}
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">
              Project Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError('');
              }}
              placeholder="e.g. Website Redesign"
              className={`w-full px-4 py-3 rounded-xl border bg-surface text-on-surface placeholder:text-on-surface-variant/50 text-sm font-medium outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 ${
                nameError ? 'border-error' : 'border-outline-variant focus:border-primary'
              }`}
              autoFocus
              maxLength={100}
            />
            {nameError && (
              <p className="mt-1.5 text-xs text-error font-medium">{nameError}</p>
            )}
          </div>

          {/* 프로젝트 설명 입력 */}
          {/* Project description input */}
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">
              Description{' '}
              <span className="text-on-surface-variant/50 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe this project..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-on-surface-variant/50 text-sm font-medium outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>

          {/* 프로젝트 색상 선택 */}
          {/* Project color picker */}
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">
              Color
            </label>
            <div className="flex gap-3">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none"
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                >
                  {color === c && (
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
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl custom-gradient text-white font-semibold text-sm shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## Task 2: ProjectCard Component

**File:** `src/components/projects/ProjectCard.tsx` (Create new)

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Project, Task } from '@/lib/types';

// 더보기 메뉴 액션 타입
// More menu action type
type MenuAction = 'edit' | 'delete';

interface ProjectCardProps {
  project: Project;
  tasks: Task[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

// 프로젝트 카드 컴포넌트
// Project card component
export function ProjectCard({ project, tasks, onEdit, onDelete }: ProjectCardProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 프로젝트별 태스크 필터링
  // Filter tasks for this project
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const totalCount = projectTasks.length;
  const doneCount = projectTasks.filter((t) => t.status === 'DONE').length;
  const inProgressCount = projectTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const overdueCount = projectTasks.filter((t) => {
    if (!t.dueDate || t.status === 'DONE') return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  // 진행률 계산 (0~100)
  // Calculate progress percentage (0–100)
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // 멤버 아바타 (최대 3명 + 나머지)
  // Member avatars (max 3 + overflow count)
  const visibleMembers = project.members.slice(0, 3);
  const overflowCount = project.members.length - visibleMembers.length;

  // 메뉴 바깥 클릭 시 닫기
  // Close menu when clicking outside
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

  // 카드 클릭 → 보드로 이동
  // Card click → navigate to board
  const handleCardClick = () => {
    router.push(`/board?projectId=${project.id}`);
  };

  // 더보기 메뉴 액션 핸들러
  // More menu action handler
  const handleMenuAction = (action: MenuAction, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (action === 'edit') onEdit(project);
    if (action === 'delete') onDelete(project);
  };

  return (
    <div
      className="relative bg-surface-container-low rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 task-card-shadow ghost-border group"
      onClick={handleCardClick}
    >
      {/* 색상 액센트 바 (왼쪽) */}
      {/* Color accent bar (left) */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
        style={{ backgroundColor: project.color }}
      />

      <div className="pl-6 pr-5 pt-5 pb-5">
        {/* 헤더: 프로젝트명 + 더보기 버튼 */}
        {/* Header: project name + more button */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-extrabold tracking-tight text-on-surface leading-tight line-clamp-1">
            {project.name}
          </h3>

          {/* 더보기 메뉴 */}
          {/* More menu */}
          <div ref={menuRef} className="relative flex-shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen((prev) => !prev);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant/50 hover:bg-surface-container-high hover:text-on-surface opacity-0 group-hover:opacity-100 transition-all duration-200"
              aria-label="More options"
            >
              <span className="material-symbols-outlined text-[20px]">more_horiz</span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-9 z-20 w-40 bg-surface rounded-xl shadow-xl ghost-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  className="w-full px-4 py-2.5 text-left text-sm text-on-surface font-medium hover:bg-surface-container flex items-center gap-2 transition-colors duration-150"
                  onClick={(e) => handleMenuAction('edit', e)}
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Edit
                </button>
                <button
                  type="button"
                  className="w-full px-4 py-2.5 text-left text-sm text-error font-medium hover:bg-error/10 flex items-center gap-2 transition-colors duration-150"
                  onClick={(e) => handleMenuAction('delete', e)}
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 프로젝트 설명 */}
        {/* Project description */}
        {project.description && (
          <p className="text-[13px] text-on-surface-variant font-medium line-clamp-2 mb-4 leading-relaxed">
            {project.description}
          </p>
        )}
        {!project.description && <div className="mb-4" />}

        {/* 태스크 통계 칩 */}
        {/* Task stat chips */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {inProgressCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              {inProgressCount} in progress
            </span>
          )}
          {overdueCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-red-50 text-error px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-error inline-block" />
              {overdueCount} overdue
            </span>
          )}
          {totalCount === 0 && (
            <span className="text-[11px] font-bold text-on-surface-variant/50">
              No tasks yet
            </span>
          )}
        </div>

        {/* 진행률 바 */}
        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-wider">
                Progress
              </span>
              <span className="text-[11px] font-bold text-on-surface-variant/60">
                {doneCount}/{totalCount}
              </span>
            </div>
            <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, backgroundColor: project.color }}
              />
            </div>
          </div>
        )}

        {/* 멤버 아바타 스택 */}
        {/* Stacked member avatars */}
        {project.members.length > 0 && (
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {visibleMembers.map((member) => (
                <div
                  key={member.id}
                  className="w-7 h-7 rounded-full border-2 border-surface-container-low overflow-hidden bg-surface-container-high flex items-center justify-center"
                  title={member.user.name}
                >
                  {member.user.avatarUrl ? (
                    <img
                      src={member.user.avatarUrl}
                      alt={member.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-on-surface-variant">
                      {member.user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              ))}
              {overflowCount > 0 && (
                <div className="w-7 h-7 rounded-full border-2 border-surface-container-low bg-surface-container-high flex items-center justify-center">
                  <span className="text-[10px] font-bold text-on-surface-variant">
                    +{overflowCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Task 3: Projects Page

**File:** `src/app/(main)/projects/page.tsx` (Replace placeholder — read first)

Read the file before editing. Current content is the placeholder shown below. Replace entirely:

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Project, Task } from '@/lib/types';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';

// 프로젝트 수정 폼 타입
// Project edit form type
interface EditForm {
  name: string;
  description: string;
  color: string;
}

// 사전 정의된 색상 팔레트 (수정용)
// Preset colors for edit modal
const PRESET_COLORS = [
  '#005ea1',
  '#7c3aed',
  '#059669',
  '#d97706',
  '#dc2626',
  '#0891b2',
] as const;

// 프로젝트 페이지 컴포넌트
// Projects page component
export default function ProjectsPage() {
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

  // 데이터 조회
  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: projectList } = await api.get<Project[]>('/projects');
      setProjects(projectList);

      // 모든 프로젝트의 태스크 조회
      // Fetch tasks across all projects
      const taskResults = await Promise.all(
        projectList.map((p) => api.get<Task[]>(`/projects/${p.id}/tasks`))
      );
      setAllTasks(taskResults.flatMap((r) => r.data));
    } catch (error) {
      console.error('[ProjectsPage] Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="glass-surface ghost-border w-full max-w-md mx-4 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="glass-surface ghost-border w-full max-w-sm mx-4 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-[28px]">
                  delete_forever
                </span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-on-surface">
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
```

---

## Task 4: Settings Page

**File:** `src/app/(main)/settings/page.tsx` (Replace placeholder — read first)

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

// 로컬스토리지 키 상수
// localStorage key constants
const LS_EMAIL_NOTIFICATIONS = 'taskflow_emailNotifications';
const LS_THEME = 'taskflow_theme';

// 설정 페이지 컴포넌트
// Settings page component
export default function SettingsPage() {
  const { user, clearAuth } = useAuthStore();

  // 이메일 알림 설정 (localStorage 전용)
  // Email notifications setting (localStorage only)
  const [emailNotifications, setEmailNotifications] = useState(false);

  // 테마 설정 (localStorage + html class)
  // Theme setting (localStorage + html class)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 로그아웃 로딩 상태
  // Logout loading state
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 컴포넌트 마운트 시 설정 불러오기
  // Load settings on mount
  useEffect(() => {
    const savedNotif = localStorage.getItem(LS_EMAIL_NOTIFICATIONS);
    setEmailNotifications(savedNotif === 'true');

    const savedTheme = localStorage.getItem(LS_THEME);
    const dark = savedTheme === 'dark';
    setIsDarkMode(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // 이메일 알림 토글 핸들러
  // Toggle email notifications handler
  const handleEmailNotificationsToggle = () => {
    const next = !emailNotifications;
    setEmailNotifications(next);
    localStorage.setItem(LS_EMAIL_NOTIFICATIONS, String(next));
  };

  // 테마 토글 핸들러
  // Toggle theme handler
  const handleThemeToggle = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem(LS_THEME, next ? 'dark' : 'light');
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 로그아웃 핸들러
  // Logout handler
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // 로그아웃 API 실패 시에도 클라이언트 인증 정보 초기화
      // Clear client auth even if logout API fails
      console.error('[SettingsPage] Logout API error (clearing auth anyway):', error);
    } finally {
      clearAuth();
      // 리다이렉트는 AppShell의 useEffect가 처리
      // AppShell useEffect handles redirect
    }
  };

  return (
    <div className="max-w-2xl">
      {/* 페이지 헤더 */}
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface mb-1">
          Settings
        </h1>
        <p className="text-on-surface-variant font-medium">
          Manage your account and preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* ── 섹션 1: 프로필 ── */}
        {/* ── Section 1: Profile ── */}
        <section className="bg-surface-container-low rounded-2xl p-6 ghost-border">
          <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/60 mb-5">
            Profile
          </h2>
          <div className="flex items-center gap-4">
            {/* 아바타 */}
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center flex-shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant">
                  account_circle
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-extrabold tracking-tight text-on-surface truncate">
                {user?.name ?? '—'}
              </p>
              <p className="text-sm text-on-surface-variant font-medium truncate">
                {user?.email ?? '—'}
              </p>
              <p className="text-xs text-on-surface-variant/50 font-medium mt-1">
                Signed in with Google · Read-only
              </p>
            </div>
          </div>
        </section>

        {/* ── 섹션 2: 알림 ── */}
        {/* ── Section 2: Notifications ── */}
        <section className="bg-surface-container-low rounded-2xl p-6 ghost-border">
          <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/60 mb-5">
            Notifications
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-on-surface">
                Email Notifications
              </p>
              <p className="text-xs text-on-surface-variant/70 font-medium mt-0.5">
                Receive email updates about task activity.
              </p>
            </div>
            {/* 토글 스위치 */}
            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={emailNotifications}
              onClick={handleEmailNotificationsToggle}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                emailNotifications ? 'bg-primary' : 'bg-surface-container-high'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${
                  emailNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* ── 섹션 3: 테마 ── */}
        {/* ── Section 3: Theme ── */}
        <section className="bg-surface-container-low rounded-2xl p-6 ghost-border">
          <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/60 mb-5">
            Theme
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-on-surface">
                Dark Mode
              </p>
              <p className="text-xs text-on-surface-variant/70 font-medium mt-0.5">
                Switch between light and dark appearance.
              </p>
            </div>
            {/* 토글 스위치 */}
            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={isDarkMode}
              onClick={handleThemeToggle}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                isDarkMode ? 'bg-primary' : 'bg-surface-container-high'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* ── 섹션 4: 계정 ── */}
        {/* ── Section 4: Account ── */}
        <section className="bg-surface-container-low rounded-2xl p-6 ghost-border">
          <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/60 mb-5">
            Account
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-on-surface">Sign Out</p>
              <p className="text-xs text-on-surface-variant/70 font-medium mt-0.5">
                You will be redirected to the login page.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 rounded-xl bg-error/10 text-error font-semibold text-sm hover:bg-error/20 active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoggingOut ? (
                <>
                  <span className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Sign Out
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
```

---

## Task 5: ActivityFeed Real Data

**File:** `src/components/dashboard/ActivityFeed.tsx` (Update — read first)

Replace the hardcoded `DEMO_ACTIVITIES` with real data derived from `tasks` prop. The component receives `tasks: Task[]` from `DashboardView`. Keep the card structure and "Up Next" section — update Up Next to show the nearest due task instead of a hardcoded meeting.

Complete replacement:

```tsx
'use client';

import { useMemo } from 'react';
import { Task } from '@/lib/types';

// 상대 시간 포맷 유틸리티
// Relative time format utility
function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

// 태스크 액션 판별 (생성 vs 업데이트)
// Determine task action (created vs updated)
function getTaskAction(task: Task): { action: string; icon: string; color: string } {
  const createdAt = new Date(task.createdAt).getTime();
  const updatedAt = new Date(task.updatedAt).getTime();
  // 5초 이내 차이면 생성으로 간주
  // Consider as created if diff within 5 seconds
  const IS_CREATED_THRESHOLD_MS = 5_000;

  if (Math.abs(updatedAt - createdAt) <= IS_CREATED_THRESHOLD_MS) {
    return { action: 'created task', icon: 'add', color: 'bg-primary' };
  }
  if (task.status === 'DONE') {
    return { action: 'completed task', icon: 'check', color: 'bg-tertiary' };
  }
  return { action: 'updated task', icon: 'edit', color: 'bg-secondary' };
}

// 날짜 포맷 유틸리티 (Up Next 카드용)
// Date format utility for Up Next card
function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Due Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Due Tomorrow';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface ActivityFeedProps {
  tasks: Task[];
}

// 액티비티 피드 컴포넌트
// Activity feed component
export function ActivityFeed({ tasks }: ActivityFeedProps) {
  // 최근 업데이트된 태스크 상위 5개 (updatedAt 내림차순)
  // Top 5 recently updated tasks (updatedAt descending)
  const MAX_ACTIVITY_ITEMS = 5;

  const recentActivities = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, MAX_ACTIVITY_ITEMS);
  }, [tasks]);

  // 가장 빠른 마감일 태스크 (완료 제외, 마감일 있는 것만)
  // Nearest due task (excluding DONE, only tasks with dueDate)
  const upNextTask = useMemo(() => {
    const now = Date.now();
    return tasks
      .filter((t) => t.dueDate && t.status !== 'DONE' && new Date(t.dueDate).getTime() >= now)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0] ?? null;
  }, [tasks]);

  return (
    <div className="col-span-12 lg:col-span-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight">Activity</h2>
        <span className="material-symbols-outlined text-on-surface-variant/40 cursor-pointer">
          more_horiz
        </span>
      </div>

      {/* 액티비티 목록 */}
      {/* Activity list */}
      <div className="bg-surface-container-low p-6 rounded-xl space-y-8 relative overflow-hidden">
        {recentActivities.length === 0 ? (
          <p className="text-sm text-on-surface-variant/60 font-medium text-center py-4">
            No recent activity.
          </p>
        ) : (
          recentActivities.map((task) => {
            const { action, icon, color } = getTaskAction(task);
            const actorName = task.creator?.name ?? 'Someone';
            const timeAgo = formatRelativeTime(task.updatedAt);

            return (
              <div key={task.id} className="flex gap-4 relative z-10">
                <div className="relative flex-shrink-0">
                  {/* 유저 아바타 */}
                  {/* User avatar */}
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-sm font-bold text-on-surface-variant overflow-hidden">
                    {task.creator?.avatarUrl ? (
                      <img
                        src={task.creator.avatarUrl}
                        alt={actorName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      actorName.charAt(0).toUpperCase()
                    )}
                  </div>
                  {/* 액션 배지 */}
                  {/* Action badge */}
                  <div
                    className={`absolute -bottom-1 -right-1 w-5 h-5 ${color} rounded-full border-2 border-surface-container-low flex items-center justify-center`}
                  >
                    <span className="material-symbols-outlined text-white text-[12px] font-bold">
                      {icon}
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-on-surface leading-tight">
                    <span className="font-bold">{actorName}</span>{' '}
                    {action}{' '}
                    <span className="text-primary font-semibold line-clamp-1">
                      {task.title}
                    </span>
                  </p>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/50 mt-1 block">
                    {timeAgo}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* 장식 요소 */}
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
      </div>

      {/* Up Next 카드 */}
      {/* Up Next card */}
      <div className="mt-8 p-6 custom-gradient rounded-xl text-white task-card-shadow relative overflow-hidden group cursor-pointer active:scale-[0.99] transition-transform">
        <div className="relative z-10">
          <h5 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
            Up Next
          </h5>
          {upNextTask ? (
            <>
              <h4 className="text-xl font-black tracking-tight leading-tight line-clamp-2">
                {upNextTask.title}
              </h4>
              <div className="flex items-center gap-2 mt-4 text-sm opacity-90 font-medium">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                {formatDueDate(upNextTask.dueDate!)}
              </div>
            </>
          ) : (
            <>
              <h4 className="text-xl font-black tracking-tight leading-tight opacity-70">
                No upcoming tasks
              </h4>
              <div className="flex items-center gap-2 mt-4 text-sm opacity-60 font-medium">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                All caught up!
              </div>
            </>
          )}
        </div>
        <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-10 group-hover:scale-110 transition-transform">
          event
        </span>
      </div>
    </div>
  );
}
```

---

## Task 6: Wire DashboardView → ActivityFeed prop

**File:** `src/components/dashboard/DashboardView.tsx` (Update — read first)

Change the `<ActivityFeed />` call to pass `allTasks`:

```diff
- <ActivityFeed />
+ <ActivityFeed tasks={allTasks} />
```

Full updated file for reference:

```tsx
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

  // 데이터 조회
  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: projectList } = await api.get<Project[]>('/projects');
      setProjects(projectList);

      // 모든 프로젝트의 태스크 조회
      // Fetch tasks from all projects
      const taskPromises = projectList.map((p) =>
        api.get<Task[]>(`/projects/${p.id}/tasks`)
      );
      const taskResults = await Promise.all(taskPromises);
      const tasks = taskResults.flatMap((r) => r.data);
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
      <SummaryCards projects={projects} tasks={allTasks} />

      {/* 벤토 레이아웃: 태스크 + 액티비티 */}
      {/* Bento layout: tasks + activity */}
      <div className="grid grid-cols-12 gap-8">
        <MyTasks tasks={allTasks} onTaskUpdated={fetchData} />
        <ActivityFeed tasks={allTasks} />
      </div>
    </div>
  );
}
```

---

## Task 7: Wire Sidebar "New Project" Button

**File:** `src/components/layout/Sidebar.tsx` (Update — read first)

The Sidebar's "New Project" button is a plain `<button>` with no handler. To wire it to `CreateProjectModal`, the Sidebar needs a way to open the modal. The cleanest approach without a global store is a URL-based approach: clicking "New Project" in the sidebar navigates to `/projects?new=1`, and the Projects page opens the modal when that query param is present.

This avoids adding Zustand state or lifting state into AppShell.

**Sidebar change** — replace the `<button>` with a router push:

```tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

// 네비게이션 항목 정의
// Navigation item definitions
const NAV_ITEMS = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/projects', icon: 'folder_shared', label: 'My Projects' },
  { href: '/calendar', icon: 'calendar_month', label: 'Calendar' },
  { href: '/board', icon: 'view_kanban', label: 'Board' },
  { href: '/settings', icon: 'settings', label: 'Settings' },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  // "New Project" 클릭 시 프로젝트 페이지로 이동 + 모달 쿼리 파라미터 전달
  // Navigate to projects page with modal open query param on "New Project" click
  const handleNewProject = () => {
    router.push('/projects?new=1');
  };

  return (
    <aside className="bg-slate-900 h-screen w-64 flex flex-col fixed left-0 top-0 py-6 z-40">
      {/* 로고 */}
      {/* Logo */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-lg">
            view_kanban
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black text-white tracking-tighter">
            TaskFlow
          </span>
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            Workspace
          </span>
        </div>
      </div>

      {/* 네비게이션 메뉴 */}
      {/* Navigation menu */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? 'bg-blue-400/10 text-blue-300 font-semibold rounded-lg mx-2 px-3 py-2 flex items-center gap-3 transition-colors duration-200'
                  : 'text-slate-400 hover:text-white mx-2 px-3 py-2 flex items-center gap-3 transition-colors duration-200 hover:bg-slate-800 rounded-lg'
              }
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="text-[14px] tracking-[0.05em]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 새 프로젝트 버튼 */}
      {/* New project button */}
      <div className="px-4 mt-auto mb-6">
        <button
          type="button"
          onClick={handleNewProject}
          className="w-full custom-gradient text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg active:scale-[0.98] transition-transform"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Project
        </button>
      </div>

      {/* 유저 프로필 */}
      {/* User profile */}
      <div className="px-2 pt-4 border-t border-slate-800">
        <Link
          href="/settings"
          className="text-slate-400 hover:text-white px-3 py-2 flex items-center gap-3 transition-colors duration-200 hover:bg-slate-800 rounded-lg"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <span className="material-symbols-outlined text-[20px]">
              account_circle
            </span>
          )}
          <span className="text-[14px] tracking-[0.05em]">
            {user?.name || 'User Profile'}
          </span>
        </Link>
      </div>
    </aside>
  );
}
```

**Projects page addition** — add `useSearchParams` to auto-open the modal when `?new=1` is present. Add to the top of the `ProjectsPage` component:

```tsx
import { useSearchParams, useRouter as useNextRouter } from 'next/navigation';

// ... inside ProjectsPage:
const searchParams = useSearchParams();
const nextRouter = useNextRouter();

// ?new=1 쿼리 파라미터 감지 시 생성 모달 자동 오픈
// Auto-open create modal when ?new=1 query param detected
useEffect(() => {
  if (searchParams.get('new') === '1') {
    setIsCreateOpen(true);
    // 쿼리 파라미터 제거 (뒤로가기 시 모달 재오픈 방지)
    // Remove query param to prevent modal re-opening on back navigation
    nextRouter.replace('/projects');
  }
}, [searchParams, nextRouter]);
```

Add `'use client'` directive is already present. The `searchParams` import requires wrapping this page in a `Suspense` boundary per Next.js 15 rules. Add a thin wrapper at the bottom of the file:

```tsx
import { Suspense } from 'react';

// Suspense 래퍼 (useSearchParams 사용으로 필요)
// Suspense wrapper required for useSearchParams
function ProjectsPageInner() {
  // ... (move all current ProjectsPage logic here)
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 custom-gradient rounded-lg animate-pulse" /></div>}>
      <ProjectsPageInner />
    </Suspense>
  );
}
```

**Practical note for the executor:** The full `projects/page.tsx` code from Task 3 should be restructured to move the component body to `ProjectsPageInner` and export `ProjectsPage` as the Suspense shell. Here is the complete final version combining Tasks 3 + 7:

```tsx
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

  // 데이터 조회
  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: projectList } = await api.get<Project[]>('/projects');
      setProjects(projectList);

      // 모든 프로젝트의 태스크 조회
      // Fetch tasks across all projects
      const taskResults = await Promise.all(
        projectList.map((p) => api.get<Task[]>(`/projects/${p.id}/tasks`))
      );
      setAllTasks(taskResults.flatMap((r) => r.data));
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="glass-surface ghost-border w-full max-w-md mx-4 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="glass-surface ghost-border w-full max-w-sm mx-4 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-[28px]">
                  delete_forever
                </span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-on-surface">
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
```

---

## Task 8: Build Verification

Run from the frontend directory:

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/frontend
npx tsc --noEmit
```

Expected: zero errors. If type errors are found, fix them in the relevant files before claiming completion.

Also ensure the new `src/components/projects/` directory exists before creating the files:

```bash
mkdir -p /Users/dohee/Documents/workspace/project/taskflow/frontend/src/components/projects
```

---

## Summary

| Feature | Files Changed | Notes |
|---------|--------------|-------|
| CreateProjectModal | `components/projects/CreateProjectModal.tsx` (new) | POST /projects, 6 preset colors, error state |
| ProjectCard | `components/projects/ProjectCard.tsx` (new) | Progress bar, member avatars, more menu |
| Projects page | `app/(main)/projects/page.tsx` (replace) | Grid + edit modal + delete confirm + Suspense |
| Settings page | `app/(main)/settings/page.tsx` (replace) | 4 sections, localStorage toggles, logout |
| ActivityFeed | `components/dashboard/ActivityFeed.tsx` (update) | `tasks` prop, real data, Up Next = nearest due |
| DashboardView | `components/dashboard/DashboardView.tsx` (update) | Pass `allTasks` to ActivityFeed |
| Sidebar | `components/layout/Sidebar.tsx` (update) | `useRouter` push to `/projects?new=1` |
