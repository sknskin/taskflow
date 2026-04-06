// 공유 네비게이션 항목 상수 (Sidebar, MobileDrawer에서 공통 사용)
// Shared navigation items constant (used by Sidebar and MobileDrawer)
export const NAV_ITEMS = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/projects', icon: 'folder_shared', label: 'My Projects' },
  { href: '/calendar', icon: 'calendar_month', label: 'Calendar' },
  { href: '/board', icon: 'view_kanban', label: 'Board' },
  { href: '/settings', icon: 'settings', label: 'Settings' },
] as const;
