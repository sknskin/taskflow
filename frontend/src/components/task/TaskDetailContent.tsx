'use client';

import Image from 'next/image';
import { Task, TaskStatus, TaskPriority, Comment } from '@/lib/types';
import { User } from '@/lib/types';

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

// 마감일까지 남은 일수 계산
// Calculate days remaining
function getDaysRemaining(dateStr: string) {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  if (diff === 0) return 'Due today';
  return `${diff} days remaining`;
}

// 상대 시간 포맷
// Relative time format
function getRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// 태스크 상세 콘텐츠 Props
// Task detail content Props
interface TaskDetailContentProps {
  task: Task;
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  status: TaskStatus;
  setStatus: (v: TaskStatus) => void;
  priority: TaskPriority;
  setPriority: (v: TaskPriority) => void;
  dueDate: string;
  setDueDate: (v: string) => void;
  isStatusOpen: boolean;
  setIsStatusOpen: (v: boolean) => void;
  isPriorityOpen: boolean;
  setIsPriorityOpen: (v: boolean) => void;
  comments: Comment[];
  newComment: string;
  setNewComment: (v: string) => void;
  onPostComment: () => void;
  onDeleteComment: (id: string) => void;
  user: User | null;
  titleId: string;
  // 모바일 여부 (레이아웃 미세 조정용)
  // Mobile flag (for layout fine-tuning)
  compact?: boolean;
}

// 태스크 상세 공유 콘텐츠 컴포넌트
// Shared task detail content component
export function TaskDetailContent({
  task,
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
  onPostComment,
  onDeleteComment,
  user,
  titleId,
  compact = false,
}: TaskDetailContentProps) {
  const currentStatus = STATUS_OPTIONS.find((s) => s.value === status);
  const currentPriority = PRIORITY_OPTIONS.find((p) => p.value === priority);

  return (
    <>
      {/* 제목 */}
      {/* Title */}
      <input
        id={titleId}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={`w-full font-extrabold tracking-tight text-on-surface border-none focus:ring-0 px-0 bg-transparent outline-none placeholder:text-on-surface-variant/30 ${
          compact ? 'text-2xl mb-6' : 'text-3xl mb-8'
        }`}
        placeholder="Task title..."
      />

      {/* 메타데이터 그리드 */}
      {/* Metadata grid */}
      <div className={`grid grid-cols-2 mb-${compact ? '8' : '10'} ${compact ? 'gap-y-5 gap-x-4' : 'gap-y-6 gap-x-8'}`}>
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
                    <span className={priority === opt.value ? 'font-bold' : ''}>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 담당자 (데스크탑에서만 표시) */}
        {/* Assignee (desktop only) */}
        {!compact && (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              Assignee
            </label>
            <div className="flex items-center gap-3 p-2 hover:bg-surface-container rounded-xl transition-colors cursor-pointer group">
              {task.assignee?.avatarUrl ? (
                <Image
                  src={task.assignee.avatarUrl}
                  alt={task.assignee.name}
                  width={32}
                  height={32}
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
        )}

        {/* 마감일 */}
        {/* Due date */}
        <div className={`space-y-2 ${compact ? 'col-span-2' : ''}`}>
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
      <div className={`space-y-3 mb-${compact ? '6' : '10'}`}>
        <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the task and key deliverables..."
          className={`w-full bg-surface-container-low border-none focus:ring-0 rounded-xl p-4 text-sm leading-relaxed text-on-surface outline-none resize-none ${
            compact ? 'min-h-[100px]' : 'min-h-[120px]'
          }`}
        />
      </div>

      {/* 첨부파일 (데스크탑에서만 표시) */}
      {/* Attachments (desktop only) */}
      {!compact && task.attachments && task.attachments.length > 0 && (
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

      {/* 댓글 (데스크탑에서만 표시) */}
      {/* Comments (desktop only) */}
      {!compact && (
        <div className="space-y-6">
          <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            Comments
          </label>
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                {comment.author?.avatarUrl ? (
                  <Image
                    src={comment.author.avatarUrl}
                    alt={comment.author.name}
                    width={32}
                    height={32}
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
                        onClick={() => onDeleteComment(comment.id)}
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
                <Image src={user.avatarUrl} alt={user.name} width={32} height={32} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onPostComment(); } }}
                placeholder="Add a comment..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none"
              />
              <button
                onClick={onPostComment}
                disabled={!newComment.trim()}
                className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
