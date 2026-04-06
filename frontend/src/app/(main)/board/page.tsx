import { Suspense } from 'react';
import { KanbanBoard } from '@/components/board/KanbanBoard';

// 칸반 보드 페이지
// Kanban board page
export default function BoardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 custom-gradient rounded-lg animate-pulse" />
      </div>
    }>
      <KanbanBoard />
    </Suspense>
  );
}
