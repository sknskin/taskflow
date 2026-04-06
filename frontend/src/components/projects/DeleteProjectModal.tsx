'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Project } from '@/lib/types';

interface DeleteProjectModalProps {
  project: Project;
  onClose: () => void;
  onDeleted: (projectId: string) => void;
}

// 프로젝트 삭제 확인 모달
// Delete project confirmation modal
export function DeleteProjectModal({ project, onClose, onDeleted }: DeleteProjectModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Escape 키로 모달 닫기
  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 삭제 확인 핸들러
  // Delete confirm handler
  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/projects/${project.id}`);
      onDeleted(project.id);
    } catch (error) {
      console.error('[DeleteProjectModal] Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
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
            <span className="font-bold text-on-surface">&quot;{project.name}&quot;</span>?
            This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
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
  );
}
