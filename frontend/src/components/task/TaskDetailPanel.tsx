'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Task, TaskStatus, TaskPriority, Comment } from '@/lib/types';
import { useAuthStore } from '@/store/auth';
import { TaskDetailContent } from './TaskDetailContent';

interface TaskDetailPanelProps {
  taskId: string;
  onClose: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export function TaskDetailPanel({ taskId, onClose, onUpdated, onDeleted }: TaskDetailPanelProps) {
  const { user } = useAuthStore();
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 편집 상태
  // Edit state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);

  // 태스크 상세 조회
  // Fetch task detail
  const fetchTask = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get<Task>(`/tasks/${taskId}`);
      setTask(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setStatus(data.status);
      setPriority(data.priority);
      setDueDate(data.dueDate ? data.dueDate.split('T')[0] : '');
      setComments(data.comments || []);
    } catch (error) {
      console.error('[TaskDetailPanel] Failed to fetch task:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  // 변경사항 저장
  // Save changes
  const handleSave = async () => {
    if (!task) return;
    setIsSaving(true);

    try {
      await api.patch(`/tasks/${task.id}`, {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        dueDate: dueDate || null,
      });
      toast.success('Task saved');
      onUpdated?.();
      fetchTask();
    } catch (error) {
      console.error('[TaskDetailPanel] Failed to save task:', error);
      toast.error('Failed to save task');
    } finally {
      setIsSaving(false);
    }
  };

  // 태스크 삭제
  // Delete task
  const handleDelete = async () => {
    if (!task || !confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.delete(`/tasks/${task.id}`);
      toast.success('Task deleted');
      onDeleted?.();
      onClose();
    } catch (error) {
      console.error('[TaskDetailPanel] Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  // 댓글 작성
  // Post comment
  const handlePostComment = async () => {
    if (!newComment.trim() || !task) return;

    try {
      await api.post(`/tasks/${task.id}/comments`, {
        content: newComment.trim(),
      });
      setNewComment('');
      // 댓글 목록 새로고침
      // Refresh comments
      const { data } = await api.get<Comment[]>(`/tasks/${task.id}/comments`);
      setComments(data);
      toast.success('Comment posted');
    } catch (error) {
      console.error('[TaskDetailPanel] Failed to post comment:', error);
      toast.error('Failed to post comment');
    }
  };

  // 댓글 삭제
  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('[TaskDetailPanel] Failed to delete comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  // Escape 키로 패널 닫기
  // Close panel on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 공유 콘텐츠 props
  // Shared content props
  const contentProps = {
    task: task!,
    title,
    setTitle,
    description,
    setDescription,
    status,
    setStatus,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    isStatusOpen,
    setIsStatusOpen,
    isPriorityOpen,
    setIsPriorityOpen,
    comments,
    newComment,
    setNewComment,
    onPostComment: handlePostComment,
    onDeleteComment: handleDeleteComment,
    user,
  };

  // 푸터 렌더링 (데스크탑/모바일 공용)
  // Footer renderer (shared between desktop/mobile)
  const renderFooter = (compact: boolean) => (
    <div className={`${compact ? 'p-4' : 'p-8'} border-t border-surface-container flex items-center justify-between bg-surface-container-low/30 flex-shrink-0`}>
      <button
        onClick={handleDelete}
        className="flex items-center gap-2 text-on-surface-variant hover:text-error transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
        <span className="text-xs font-bold uppercase tracking-widest">{compact ? 'Delete' : 'Delete Task'}</span>
      </button>
      <div className={`flex ${compact ? 'gap-3' : 'gap-4'}`}>
        <button
          onClick={onClose}
          className={`${compact ? 'px-4 py-2' : 'px-6 py-2.5'} text-sm font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors`}
        >
          Discard
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`${compact ? 'px-6 py-2' : 'px-8 py-2.5'} custom-gradient text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50`}
        >
          {isSaving ? 'Saving...' : compact ? 'Save' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <>
        {/* 데스크탑 로딩 사이드 패널 */}
        {/* Desktop loading side panel */}
        <div className="hidden lg:flex fixed inset-0 bg-on-surface/5 backdrop-blur-sm z-40 justify-end">
          <div className="max-w-[600px] w-full bg-surface-container-lowest h-screen flex items-center justify-center">
            <div className="w-8 h-8 custom-gradient rounded-lg animate-pulse" />
          </div>
        </div>
        {/* 모바일 로딩 바텀 시트 */}
        {/* Mobile loading bottom sheet */}
        <div className="lg:hidden fixed inset-0 bg-on-surface/5 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full bg-surface-container-lowest rounded-t-2xl h-1/2 flex items-center justify-center">
            <div className="w-8 h-8 custom-gradient rounded-lg animate-pulse" />
          </div>
        </div>
      </>
    );
  }

  if (!task) return null;

  return (
    <>
      {/* 데스크탑: 오른쪽 고정 사이드 패널 */}
      {/* Desktop: fixed right side panel */}
      <div
        className="hidden lg:flex fixed inset-0 bg-on-surface/5 backdrop-blur-sm z-40 justify-end"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Task detail"
          className="max-w-[600px] w-full bg-surface-container-lowest h-screen shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 패널 헤더 */}
          {/* Panel header */}
          <div className="px-8 py-6 flex items-center justify-between border-b border-surface-container">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">task</span>
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Task-{task.id.slice(-4)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-surface-container rounded-lg transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">share</span>
              </button>
              <button className="p-2 hover:bg-surface-container rounded-lg transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">more_horiz</span>
              </button>
              <div className="w-px h-6 bg-surface-container mx-1" />
              <button
                onClick={onClose}
                className="p-2 hover:bg-error-container hover:text-error rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          {/* 스크롤 가능 콘텐츠 */}
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-8 py-8 no-scrollbar">
            <TaskDetailContent {...contentProps} titleId="task-detail-title-desktop" />
          </div>

          {renderFooter(false)}
        </div>
      </div>

      {/* 모바일: 하단에서 올라오는 바텀 시트 */}
      {/* Mobile: bottom sheet sliding up */}
      <div
        className="lg:hidden fixed inset-0 bg-on-surface/5 backdrop-blur-sm z-50 flex items-end"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Task detail"
          className="w-full bg-surface-container-lowest rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 드래그 핸들 */}
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-9 h-1.5 bg-outline-variant/40 rounded-full" />
          </div>

          {/* 패널 헤더 */}
          {/* Panel header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-surface-container flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">task</span>
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Task-{task.id.slice(-4)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-error-container hover:text-error rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* 스크롤 가능 콘텐츠 */}
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-5 no-scrollbar">
            <TaskDetailContent {...contentProps} titleId="task-detail-title-mobile" compact />
          </div>

          {renderFooter(true)}
        </div>
      </div>
    </>
  );
}
