'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventContentArg } from '@fullcalendar/core';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Task, Project } from '@/lib/types';
import { CreateTaskModal } from './CreateTaskModal';

// 우선순위별 도트 색상 매핑
// Priority dot color mapping
const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-green-600',
  MEDIUM: 'bg-amber-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-600',
};

// 상태별 배경 색상 매핑
// Status background color mapping
const STATUS_BG: Record<string, string> = {
  TODO: 'bg-slate-100/50',
  IN_PROGRESS: 'bg-blue-100/50',
  IN_REVIEW: 'bg-amber-100/50',
  DONE: 'bg-green-100/50',
};

export function CalendarView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
  const calendarRef = useRef<FullCalendar | null>(null);

  // 프로젝트 + 태스크 동시 조회 (N+1 제거: /tasks/mine 단일 호출로 통합)
  // Fetch projects and tasks simultaneously (N+1 eliminated: combined with /tasks/mine)
  const fetchData = useCallback(async () => {
    try {
      const [{ data: projectList }, { data: allTasks }] = await Promise.all([
        api.get<Project[]>('/projects'),
        api.get<Task[]>('/tasks/mine'),
      ]);
      setProjects(projectList);
      setTasks(allTasks);
    } catch (error) {
      console.error('[CalendarView] Failed to fetch data:', error);
      toast.error('Failed to load data');
    }
  }, []);

  // 태스크만 새로고침 (생성 완료 후 사용)
  // Refresh only tasks (used after task creation)
  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get<Task[]>('/tasks/mine');
      setTasks(data);
    } catch (error) {
      console.error('[CalendarView] Failed to fetch tasks:', error);
      toast.error('Failed to load data');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // FullCalendar 이벤트 변환
  // Convert to FullCalendar events
  const events = tasks
    .filter((task) => task.dueDate)
    .map((task) => ({
      id: task.id,
      title: task.title,
      date: task.dueDate!,
      extendedProps: {
        priority: task.priority,
        status: task.status,
      },
    }));

  // 날짜 클릭 핸들러
  // Date click handler
  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.dateStr);
    setIsModalOpen(true);
  };

  // 뷰 변경 핸들러
  // View change handler
  const handleViewChange = (view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
    setCurrentView(view);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(view);
    }
  };

  // 커스텀 이벤트 렌더링
  // Custom event rendering
  const renderEventContent = (eventInfo: EventContentArg) => {
    const { priority, status } = eventInfo.event.extendedProps as {
      priority: string;
      status: string;
    };

    return (
      <div
        className={`px-2 py-1 ${STATUS_BG[status] || 'bg-slate-100/50'} rounded-lg flex items-center gap-2 cursor-pointer overflow-hidden`}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_COLORS[priority] || 'bg-blue-600'}`}
        />
        <span className="text-[11px] font-semibold text-on-surface truncate">
          {eventInfo.event.title}
        </span>
      </div>
    );
  };

  // 태스크 생성 완료 핸들러
  // Task creation complete handler
  const handleTaskCreated = () => {
    setIsModalOpen(false);
    fetchTasks();
  };

  return (
    <div>
      {/* 캘린더 헤더 */}
      {/* Calendar header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8 gap-4">
        <div className="flex items-center gap-3 lg:gap-4">
          <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight text-on-surface">
            Calendar
          </h2>
          <div className="flex items-center bg-surface-container-low rounded-lg p-1">
            <button
              onClick={() => calendarRef.current?.getApi().prev()}
              className="p-1 hover:bg-white rounded-md transition-all"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button
              onClick={() => calendarRef.current?.getApi().next()}
              className="p-1 hover:bg-white rounded-md transition-all"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
          <button
            onClick={() => calendarRef.current?.getApi().today()}
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest bg-surface-container-high rounded-full hover:bg-surface-container-highest transition-colors"
          >
            Today
          </button>
        </div>

        {/* 뷰 토글 (모바일에서도 표시) */}
        {/* View toggle (also visible on mobile) */}
        <div className="flex bg-surface-container-low p-1 rounded-xl">
          {[
            { key: 'dayGridMonth' as const, label: 'Month' },
            { key: 'timeGridWeek' as const, label: 'Week' },
            { key: 'timeGridDay' as const, label: 'Day' },
          ].map((view) => (
            <button
              key={view.key}
              onClick={() => handleViewChange(view.key)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                currentView === view.key
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* FullCalendar */}
      <div className="fc-taskflow">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventContent={renderEventContent}
          headerToolbar={false}
          height="auto"
          dayMaxEvents={3}
          firstDay={0}
          fixedWeekCount={false}
        />
      </div>

      {/* 하단 인사이트 카드 */}
      {/* Bottom insight cards */}
      <div className="mt-8 lg:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        <div className="bg-surface-container-low rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-primary">
            <span className="material-symbols-outlined text-2xl">pending_actions</span>
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">
              Active Tasks
            </p>
            <p className="text-2xl font-black text-on-surface">
              {tasks.filter((t) => t.status !== 'DONE').length}{' '}
              <span className="text-sm font-medium text-slate-400">Tasks</span>
            </p>
          </div>
        </div>
        <div className="bg-surface-container-low rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-tertiary">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">
              Completed This Month
            </p>
            <p className="text-2xl font-black text-on-surface">
              {tasks.filter((t) => t.status === 'DONE').length}{' '}
              <span className="text-sm font-medium text-slate-400">Tasks</span>
            </p>
          </div>
        </div>
        <div className="bg-primary/5 rounded-2xl p-6 flex items-center gap-4 border border-primary/5">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm text-white">
            <span className="material-symbols-outlined text-2xl">bolt</span>
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-primary/60">
              Productivity Score
            </p>
            <p className="text-2xl font-black text-primary">
              {tasks.length > 0
                ? `${Math.round((tasks.filter((t) => t.status === 'DONE').length / tasks.length) * 100)}%`
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* 태스크 생성 모달 */}
      {/* Task creation modal */}
      {isModalOpen && (
        <CreateTaskModal
          projects={projects}
          defaultDate={selectedDate}
          onClose={() => setIsModalOpen(false)}
          onCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}
