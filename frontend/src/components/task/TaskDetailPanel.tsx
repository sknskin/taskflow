'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Task, TaskStatus, TaskPriority, Comment } from '@/lib/types';
import { useAuthStore } from '@/store/auth';

// 상태 설정
// Status configuration
const STATUS_OPTIONS: { value: TaskStatus; label: string; dot: string }[] = [
  { value: 'TODO', label: 'Todo', dot: 'bg-slate-400' },
  { value: 'IN_PROGRESS', label: 'In Progress', dot: 'bg-blue-500' },
  { value: 'IN_REVIEW', label: 'In Review', dot: 'bg-amber-500' },
  { value: 'DONE', label: 'Done', dot: 'bg-emerald-500' },
];

// 우선순위 설정
// Priority configuration
const PRIORITY_OPTIONS: { value: TaskPriority; label: string; bg: string; text: string }[] = [
  { value: 'LOW', label: 'Low', bg: 'bg-green-100/50', text: 'text-green-700' },
  { value: 'MEDIUM', label: 'Medium', bg: 'bg-amber-100/50', text: 'text-amber-700' },
  { value: 'HIGH', label: 'High', bg: 'bg-orange-100/50', text: 'text-orange-700' },
  { value: 'URGENT', label: 'Urgent', bg: 'bg-red-100/50', text: 'text-red-700' },
];

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
      onUpdated?.();
      fetchTask();
    } catch (error) {
      console.error('[TaskDetailPanel] Failed to save task:', error);
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
      onDeleted?.();
      onClose();
    } catch (error) {
      console.error('[TaskDetailPanel] Failed to delete task:', error);
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
    } catch (error) {
      console.error('[TaskDetailPanel] Failed to post comment:', error);
    }
  };

  // 댓글 삭제
  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error('[TaskDetailPanel] Failed to delete comment:', error);
    }
  };

  // 마감일까지 남은 일수 계산
  // Calculate days remaining
  const getDaysRemaining = (dateStr: string) => {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)} days overdue`;
    if (diff === 0) return 'Due today';
    return `${diff} days remaining`;
  };

  // 상대 시간 포맷
  // Relative time format
  const getRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // 현재 상태/우선순위 설정
  // Current status/priority config
  const currentStatus = STATUS_OPTIONS.find((s) => s.value === status);
  const currentPriority = PRIORITY_OPTIONS.find((p) => p.value === priority);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-on-surface/5 backdrop-blur-sm z-40 flex justify-end">
        <div className="w-[600px] bg-surface-container-lowest h-screen flex items-center justify-center">
          <div className="w-8 h-8 custom-gradient rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-on-surface/5 backdrop-blur-sm z-40 flex justify-end" onClick={onClose}>
      <div
        className="w-[600px] bg-surface-container-lowest h-screen shadow-2xl flex flex-col"
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
          {/* 제목 */}
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-extrabold tracking-tight text-on-surface border-none focus:ring-0 px-0 mb-8 bg-transparent outline-none placeholder:text-on-surface-variant/30"
            placeholder="Task title..."
          />

          {/* 메타데이터 그리드 */}
          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-8 mb-10">
            {/* 상태 */}
            {/* Status */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                Status
              </label>
              <div className="relative">
                <button
                  onClick={() => { setIsStatusOpen(!isStatusOpen); setIsPriorityOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-secondary-container/30 text-primary font-bold text-sm rounded-lg hover:bg-secondary-container/50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${currentStatus?.dot}`} />
                    {currentStatus?.label}
                  </div>
                  <span className="material-symbols-outlined text-xs">expand_more</span>
                </button>
                {isStatusOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest rounded-xl shadow-xl z-10 py-1">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setStatus(opt.value); setIsStatusOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-container-low transition-colors"
                      >
                        <div className={`w-2 h-2 rounded-full ${opt.dot}`} />
                        <span className={status === opt.value ? 'font-bold text-primary' : 'text-on-surface'}>
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 우선순위 */}
            {/* Priority */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                Priority
              </label>
              <div className="relative">
                <button
                  onClick={() => { setIsPriorityOpen(!isPriorityOpen); setIsStatusOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 ${currentPriority?.bg} ${currentPriority?.text} font-bold text-sm rounded-lg transition-all`}
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">priority_high</span>
                    {currentPriority?.label}
                  </div>
                  <span className="material-symbols-outlined text-xs">expand_more</span>
                </button>
                {isPriorityOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest rounded-xl shadow-xl z-10 py-1">
                    {PRIORITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setPriority(opt.value); setIsPriorityOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-container-low transition-colors"
                      >
                        <span className={priority === opt.value ? 'font-bold' : ''}>
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 담당자 */}
            {/* Assignee */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                Assignee
              </label>
              <div className="flex items-center gap-3 p-2 hover:bg-surface-container rounded-xl transition-colors cursor-pointer group">
                {task.assignee?.avatarUrl ? (
                  <img
                    src={task.assignee.avatarUrl}
                    alt={task.assignee.name}
                    className="w-8 h-8 rounded-full border-2 border-surface group-hover:border-primary-container transition-colors"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-on-surface">
                    {task.assignee?.name || 'Unassigned'}
                  </p>
                </div>
                <span className="material-symbols-outlined ml-auto text-on-surface-variant opacity-0 group-hover:opacity-100">
                  edit
                </span>
              </div>
            </div>

            {/* 마감일 */}
            {/* Due date */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                Due Date
              </label>
              <div className="flex items-center gap-3 p-2">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                </div>
                <div>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="text-sm font-bold text-on-surface bg-transparent border-none p-0 focus:ring-0 outline-none"
                  />
                  {dueDate && (
                    <p className="text-[10px] text-on-surface-variant">
                      {getDaysRemaining(dueDate)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 설명 */}
          {/* Description */}
          <div className="space-y-3 mb-10">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                Description
              </label>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task and key deliverables..."
              className="w-full min-h-[120px] bg-surface-container-low border-none focus:ring-0 rounded-xl p-4 text-sm leading-relaxed text-on-surface outline-none resize-none"
            />
          </div>

          {/* 첨부파일 */}
          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="space-y-3 mb-10">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                Attachments ({task.attachments.length})
              </label>
              <div className="grid grid-cols-2 gap-4">
                {task.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/10 flex items-center gap-3 hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-surface-container-highest rounded-lg flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate">{att.fileName}</p>
                      <p className="text-[10px] text-on-surface-variant">
                        {(att.fileSize / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 댓글 */}
          {/* Comments */}
          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              Comments
            </label>
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  {comment.author?.avatarUrl ? (
                    <img
                      src={comment.author.avatarUrl}
                      alt={comment.author.name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex-shrink-0 flex items-center justify-center text-xs font-bold text-on-surface-variant">
                      {comment.author?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-on-surface">
                        {comment.author?.name}
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        {getRelativeTime(comment.createdAt)}
                      </span>
                      {comment.authorId === user?.id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="ml-auto text-on-surface-variant/40 hover:text-error transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      )}
                    </div>
                    <div className="bg-surface-container rounded-2xl rounded-tl-none p-3 text-sm text-on-surface shadow-sm">
                      {comment.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 댓글 입력 */}
            {/* Comment input */}
            <div className="pt-4 sticky bottom-0 bg-surface-container-lowest">
              <div className="flex items-center gap-4 bg-surface-container-low rounded-2xl p-2 border border-outline-variant/10 focus-within:border-primary/30 transition-all">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePostComment(); } }}
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none"
                />
                <button
                  onClick={handlePostComment}
                  disabled={!newComment.trim()}
                  className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors disabled:opacity-30"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 패널 푸터 */}
        {/* Panel footer */}
        <div className="p-8 border-t border-surface-container flex items-center justify-between bg-surface-container-low/30">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 text-on-surface-variant hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            <span className="text-xs font-bold uppercase tracking-widest">Delete Task</span>
          </button>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-2.5 custom-gradient text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
