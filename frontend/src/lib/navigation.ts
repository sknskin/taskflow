// 공유 네비게이션 항목 상수 (Sidebar, MobileDrawer에서 공통 사용)
// Shared navigation items constant (used by Sidebar and MobileDrawer)
export const NAV_ITEMS = [
  { href: '/dashboard', icon: 'dashboard', labelKey: 'nav.dashboard' as const },
  { href: '/projects', icon: 'folder_shared', labelKey: 'nav.projects' as const },
  { href: '/calendar', icon: 'calendar_month', labelKey: 'nav.calendar' as const },
  { href: '/board', icon: 'view_kanban', labelKey: 'nav.board' as const },
  { href: '/settings', icon: 'settings', labelKey: 'nav.settings' as const },
] as const;
