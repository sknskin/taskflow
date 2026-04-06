'use client';

import { Task, Project } from '@/lib/types';
import { useTranslation } from '@/hooks/useTranslation';

interface SummaryCardsProps {
  projects: Project[];
  tasks: Task[];
  inProgressCount: number;
}

// 요약 카드 컴포넌트
// Summary cards component
export function SummaryCards({ projects, tasks, inProgressCount }: SummaryCardsProps) {
  const { t } = useTranslation();

  // 마감일 지난 태스크 (DONE 제외)
  // Overdue tasks (excluding DONE)
  const overdueCount = tasks.filter(
    (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
  ).length;

  // 오늘 완료된 태스크 (로컬 타임존 기준)
  // Tasks completed today (based on local timezone)
  const today = new Date();
  const doneToday = tasks.filter(
    (task) => task.status === 'DONE' && new Date(task.updatedAt).toDateString() === today.toDateString()
  ).length;

  const cards = [
    {
      icon: 'assignment',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      label: t('dashboard.totalProjects'),
      value: projects.length,
      subLabel: t('dashboard.workingNow'),
    },
    {
      icon: 'pending',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      label: t('dashboard.inProgress'),
      value: inProgressCount,
      subLabel: t('dashboard.workingNow'),
    },
    {
      icon: 'priority_high',
      iconBg: 'bg-error-container/40',
      iconColor: 'text-error',
      label: t('dashboard.overdue'),
      value: overdueCount,
      subLabel: t('dashboard.needsAttention'),
    },
    {
      icon: 'check_circle',
      iconBg: 'bg-tertiary-fixed/30',
      iconColor: 'text-tertiary',
      label: t('dashboard.completed'),
      value: doneToday,
      subLabel: t('dashboard.doneToday'),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-surface-container-lowest p-6 rounded-xl task-card-shadow flex flex-col group hover:translate-y-[-2px] transition-all"
        >
          <div className="flex justify-between items-start mb-4">
            <div
              className={`w-10 h-10 ${card.iconBg} rounded-lg flex items-center justify-center ${card.iconColor}`}
            >
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">
              {card.label}
            </span>
          </div>
          <span className="text-4xl font-black tracking-tighter">{card.value}</span>
          <span className="text-sm font-semibold text-on-surface-variant mt-1">
            {card.subLabel}
          </span>
        </div>
      ))}
    </div>
  );
}
