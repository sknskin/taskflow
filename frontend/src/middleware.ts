import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 공개 경로 (인증 불필요)
// Public paths (no auth required)
const PUBLIC_PATHS = ['/login', '/auth/callback'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 공개 경로는 통과
  // Allow public paths
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 정적 파일 및 API 경로 제외
  // Exclude static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 인증은 refresh token 쿠키로 서버 사이드 확인
  // Server-side auth check via refresh token cookie
  const refreshToken = request.cookies.get('taskflow_refresh_token');
  if (!refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
