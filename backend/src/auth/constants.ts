// 쿠키 이름 상수
// Cookie name constants
export const REFRESH_TOKEN_COOKIE = 'taskflow_refresh_token';

// 쿠키 최대 유효기간 (7일, 밀리초)
// Cookie max age (7 days, milliseconds)
export const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// 프론트엔드 리다이렉트 URL
// Frontend redirect URL
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
