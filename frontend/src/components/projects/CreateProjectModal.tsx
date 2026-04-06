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
