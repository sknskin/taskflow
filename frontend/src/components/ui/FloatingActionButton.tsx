'use client';

// 플로팅 액션 버튼
// Floating action button
export function FloatingActionButton() {
  return (
    <button className="fixed bottom-8 right-8 w-14 h-14 custom-gradient rounded-full shadow-2xl flex items-center justify-center text-white active:scale-95 transition-all z-50">
      <span className="material-symbols-outlined text-[32px]">add</span>
    </button>
  );
}
