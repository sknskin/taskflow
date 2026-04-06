import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '@/prisma/prisma.service';
import {
  buildTestApp,
  cleanDatabase,
  createTestUser,
} from '../helpers/test-setup';
import { generateTestAccessToken } from '../helpers/jwt.helper';

describe('Auth E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // 테스트용 유저 데이터
  // Test user data
  let testUserId: string;
  let authToken: string;

  // 전체 테스트 스위트 전에 앱 초기화
  // Initialize app before all tests
  beforeAll(async () => {
    const setup = await buildTestApp();
    app = setup.app;
    prisma = setup.prisma;
  });

  // 각 테스트 전에 DB 초기화 및 유저 생성
  // Clean DB and create user before each test
  beforeEach(async () => {
    await cleanDatabase(prisma);
    const user = await createTestUser(prisma);
    testUserId = user.id;
    authToken = generateTestAccessToken(user.id, user.email);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  // GET /auth/me
  describe('GET /auth/me', () => {
    // 인증된 유저의 프로필 반환
    // Should return authenticated user profile
    it('인증된 유저의 프로필을 반환한다', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', testUserId);
      expect(res.body).toHaveProperty('email', 'testuser@example.com');
      expect(res.body).toHaveProperty('name', 'Test User');
      expect(res.body).toHaveProperty('createdAt');
    });

    // 토큰 없이 요청하면 401
    // Should return 401 without token
    it('토큰 없이 요청하면 401을 반환한다', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    // 잘못된 토큰으로 요청하면 401
    // Should return 401 with invalid token
    it('잘못된 토큰으로 요청하면 401을 반환한다', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token-xxx')
        .expect(401);
    });
  });

  // POST /auth/refresh
  describe('POST /auth/refresh', () => {
    // refresh token 쿠키 없이 요청하면 401
    // Should return 401 without refresh token cookie
    it('refresh token 쿠키 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .expect(401);

      expect(res.body.message).toBe('No refresh token');
    });

    // 잘못된 refresh token 쿠키로 요청하면 401
    // Should return 401 with invalid refresh token cookie
    it('잘못된 refresh token으로 요청하면 401을 반환한다', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', 'taskflow_refresh_token=invalid-refresh-token')
        .expect(401);

      expect(res.body.message).toBe('Invalid refresh token');
    });
  });

  // POST /auth/logout
  describe('POST /auth/logout', () => {
    // 로그아웃 시 refresh token 쿠키 제거
    // Should clear refresh token cookie on logout
    it('로그아웃 시 성공 메시지와 쿠키 제거를 반환한다', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(201);

      expect(res.body.message).toBe('Logged out successfully');

      // Set-Cookie 헤더에서 쿠키 삭제 확인
      // Verify cookie clearance in Set-Cookie header
      const cookies = res.headers['set-cookie'];
      if (cookies) {
        const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
        expect(cookieStr).toContain('taskflow_refresh_token');
      }
    });
  });

  // POST /auth/exchange
  describe('POST /auth/exchange', () => {
    // 잘못된 코드로 요청하면 401
    // Should return 401 with invalid code
    it('잘못된 인증 코드로 요청하면 401을 반환한다', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/exchange')
        .send({ code: 'invalid-code-xxx' })
        .expect(401);

      expect(res.body.message).toBe('Invalid or expired auth code');
    });

    // 코드 없이 요청하면 401
    // Should return 401 without code
    it('코드 없이 요청하면 401을 반환한다', async () => {
      await request(app.getHttpServer())
        .post('/auth/exchange')
        .send({})
        .expect(401);
    });
  });
});
