import * as jwt from 'jsonwebtoken';

// 테스트용 JWT 시크릿 상수
// Test JWT secret constants
const TEST_JWT_SECRET = 'test-jwt-secret-for-e2e';
const TEST_JWT_EXPIRES_IN = '1h';

// 테스트용 유저 데이터 타입
// Test user data type
interface TestUserPayload {
  sub: string;
  email: string;
}

// 테스트용 JWT access token 생성
// Generate JWT access token for testing
export function generateTestAccessToken(userId: string, email: string): string {
  const payload: TestUserPayload = { sub: userId, email };
  return jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: TEST_JWT_EXPIRES_IN });
}

// 테스트용 JWT 시크릿 반환 (모듈 설정 시 사용)
// Return test JWT secret (for module configuration)
export function getTestJwtSecret(): string {
  return TEST_JWT_SECRET;
}
