'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Project } from '@/lib/types';

// 사전 정의된 색상 팔레트
// Preset color palette
const PRESET_COLORS = [
  '#005ea1',
  '#7c3aed',
  '#059669',
  '#d97706',
  '#dc2626',
  '#0891b2',
] as const;

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onUpdated: (project: Project) => void;
}

// 프로젝트 수정 모달
// Edit project modal
export function EditProjectModal({ project, onClose, onUpdated }: EditProjectModalProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [color, setColor] = useState(project.color);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Escape 키로 모달 닫기
  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 저장 핸들러
  // Save handler
  const handleSave = async () => {
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const { data } = await api.patch<Project>(`/projects/${project.id}`, {
        name: name.trim(),
        description: description.trim() || null,
        color,
      });
      toast.success('Project updated');
      onUpdated(data);
    } catch (err) {
      console.error('[EditProjectModal] Failed to update project:', err);
      toast.error('Failed to update project');
      setError('Failed to update project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
            onClick={onClose}
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
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className={`w-full px-4 py-3 rounded-xl border bg-surface text-on-surface text-sm font-medium outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 ${
                error ? 'border-error' : 'border-outline-variant focus:border-primary'
              }`}
              maxLength={100}
            />
            {error && (
              <p className="mt-1.5 text-xs text-error font-medium">{error}</p>
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                  onClick={() => setColor(c)}
                  aria-label={`Select color ${c}`}
                  className="w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none"
                  style={{ backgroundColor: c }}
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
              type="button"
              onClick={handleSave}
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
  );
}
