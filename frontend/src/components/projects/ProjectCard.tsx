'use client';

import { memo, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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

// 프로젝트 카드 컴포넌트: React.memo로 불필요한 리렌더 방지
// Project card component: wrapped with React.memo to prevent unnecessary re-renders
export const ProjectCard = memo(function ProjectCard({ project, tasks, onEdit, onDelete }: ProjectCardProps) {
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
                    <Image
                      src={member.user.avatarUrl}
                      alt={member.user.name}
                      width={28}
                      height={28}
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
});
