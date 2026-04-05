import { AppShell } from '@/components/layout/AppShell';

// 인증된 페이지 라우트 그룹 레이아웃
// Authenticated pages route group layout
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
