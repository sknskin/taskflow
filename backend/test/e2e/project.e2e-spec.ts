import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '@/prisma/prisma.service';
import {
  buildTestApp,
  cleanDatabase,
  createTestUser,
  createTestProject,
} from '../helpers/test-setup';
import { generateTestAccessToken } from '../helpers/jwt.helper';

describe('Projects E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // 테스트용 유저 데이터
  // Test user data
  let testUserId: string;
  let authHeader: string;
  let otherUserId: string;
  let otherAuthHeader: string;

  // 전체 테스트 스위트 전에 앱 초기화
  // Initialize app before all tests
  beforeAll(async () => {
    const setup = await buildTestApp();
    app = setup.app;
    prisma = setup.prisma;
  });

  // 각 테스트 전 DB 정리 및 테스트 유저 생성
  // Clean DB and create test users before each test
  beforeEach(async () => {
    await cleanDatabase(prisma);

    const user = await createTestUser(prisma, {
      email: 'owner@example.com',
      name: 'Owner User',
      googleId: 'google-owner-001',
    });
    testUserId = user.id;
    authHeader = `Bearer ${generateTestAccessToken(user.id, user.email)}`;

    const other = await createTestUser(prisma, {
      email: 'other@example.com',
      name: 'Other User',
      googleId: 'google-other-002',
    });
    otherUserId = other.id;
    otherAuthHeader = `Bearer ${generateTestAccessToken(other.id, other.email)}`;
  });

  // 테스트 종료 후 앱 종료
  // Close app after all tests
  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  // ─────────────────────────────────────────────
  // POST /projects
  // ─────────────────────────────────────────────
  describe('POST /projects', () => {
    it('201: 프로젝트를 생성하고 반환한다', async () => {
      // should create and return project
      const body = { name: 'My Project', description: 'A description' };

      const res = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', authHeader)
        .send(body)
        .expect(201);

      expect(res.body).toMatchObject({
        name: 'My Project',
        description: 'A description',
        members: expect.arrayContaining([
          expect.objectContaining({ userId: testUserId, role: 'OWNER' }),
        ]),
      });
      expect(res.body.id).toBeDefined();
    });

    it('400: name이 없으면 Bad Request를 반환한다', async () => {
      // should return 400 when name is missing
      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', authHeader)
        .send({ description: 'No name' })
        .expect(400);
    });

    it('401: Authorization 헤더 없으면 Unauthorized를 반환한다', async () => {
      // should return 401 when Authorization header is missing
      await request(app.getHttpServer())
        .post('/projects')
        .send({ name: 'Project' })
        .expect(401);
    });
  });

  // ─────────────────────────────────────────────
  // GET /projects
  // ─────────────────────────────────────────────
  describe('GET /projects', () => {
    it('200: 내 프로젝트 목록을 반환한다', async () => {
      // should return my project list
      await createTestProject(prisma, testUserId, { name: 'Project A' });
      await createTestProject(prisma, testUserId, { name: 'Project B' });

      const res = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', authHeader)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
    });

    it('200: 다른 유저의 프로젝트는 포함되지 않는다', async () => {
      // should not include other user's projects
      await createTestProject(prisma, testUserId, { name: 'My Project' });
      await createTestProject(prisma, otherUserId, { name: 'Other Project' });

      const res = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', authHeader)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('My Project');
    });

    it('200: 프로젝트가 없으면 빈 배열을 반환한다', async () => {
      // should return empty array when no projects
      const res = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', authHeader)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('401: 인증 없이 접근하면 Unauthorized를 반환한다', async () => {
      // should return 401 without authentication
      await request(app.getHttpServer()).get('/projects').expect(401);
    });
  });

  // ─────────────────────────────────────────────
  // GET /projects/:id
  // ─────────────────────────────────────────────
  describe('GET /projects/:id', () => {
    it('200: 멤버가 프로젝트 상세를 조회한다', async () => {
      // should return project detail for member
      const project = await createTestProject(prisma, testUserId, { name: 'Detail Project' });

      const res = await request(app.getHttpServer())
        .get(`/projects/${project.id}`)
        .set('Authorization', authHeader)
        .expect(200);

      expect(res.body.id).toBe(project.id);
      expect(res.body.name).toBe('Detail Project');
      expect(res.body._count.tasks).toBe(0);
    });

    it('404: 존재하지 않는 프로젝트를 조회하면 Not Found를 반환한다', async () => {
      // should return 404 for non-existent project
      await request(app.getHttpServer())
        .get('/projects/non-existent-id')
        .set('Authorization', authHeader)
        .expect(404);
    });

    it('403: 멤버가 아닌 유저가 조회하면 Forbidden을 반환한다', async () => {
      // should return 403 when non-member accesses project
      const project = await createTestProject(prisma, testUserId);

      await request(app.getHttpServer())
        .get(`/projects/${project.id}`)
        .set('Authorization', otherAuthHeader)
        .expect(403);
    });
  });

  // ─────────────────────────────────────────────
  // PATCH /projects/:id
  // ─────────────────────────────────────────────
  describe('PATCH /projects/:id', () => {
    it('200: OWNER가 프로젝트를 수정한다', async () => {
      // should allow OWNER to update project
      const project = await createTestProject(prisma, testUserId, { name: 'Old Name' });

      const res = await request(app.getHttpServer())
        .patch(`/projects/${project.id}`)
        .set('Authorization', authHeader)
        .send({ name: 'New Name' })
        .expect(200);

      expect(res.body.name).toBe('New Name');
    });

    it('403: 권한 없는 유저가 수정을 시도하면 Forbidden을 반환한다', async () => {
      // should return 403 when unauthorized user tries to update
      const project = await createTestProject(prisma, testUserId);

      await request(app.getHttpServer())
        .patch(`/projects/${project.id}`)
        .set('Authorization', otherAuthHeader)
        .send({ name: 'Hacked' })
        .expect(403);
    });
  });

  // ─────────────────────────────────────────────
  // DELETE /projects/:id
  // ─────────────────────────────────────────────
  describe('DELETE /projects/:id', () => {
    it('200: OWNER가 프로젝트를 삭제한다', async () => {
      // should allow OWNER to delete project
      const project = await createTestProject(prisma, testUserId);

      await request(app.getHttpServer())
        .delete(`/projects/${project.id}`)
        .set('Authorization', authHeader)
        .expect(200);

      // 삭제 후 조회하면 404 반환 확인
      // Verify 404 after deletion
      await request(app.getHttpServer())
        .get(`/projects/${project.id}`)
        .set('Authorization', authHeader)
        .expect(404);
    });

    it('403: 권한 없는 유저가 삭제를 시도하면 Forbidden을 반환한다', async () => {
      // should return 403 when unauthorized user tries to delete
      const project = await createTestProject(prisma, testUserId);

      await request(app.getHttpServer())
        .delete(`/projects/${project.id}`)
        .set('Authorization', otherAuthHeader)
        .expect(403);
    });
  });
});
