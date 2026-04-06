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

  // 인증은 클라이언트 사이드에서 처리 (localStorage 기반)
  // Auth is handled client-side (localStorage based)
  // 서버에서는 쿠키 확인 불가 (백엔드와 프론트엔드 포트가 다를 수 있음)
  // Server cannot check cookies (backend and frontend may be on different ports)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
