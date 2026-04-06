import { INestApplication } from '@nestjs/common';
import { TaskStatus, TaskPriority } from '@prisma/client';
import * as request from 'supertest';
import { PrismaService } from '@/prisma/prisma.service';
import {
  buildTestApp,
  cleanDatabase,
  createTestUser,
  createTestProject,
  createTestTask,
} from '../helpers/test-setup';
import { generateTestAccessToken } from '../helpers/jwt.helper';

describe('Tasks E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // 테스트 상태 변수
  // Test state variables
  let testUserId: string;
  let authHeader: string;
  let otherUserId: string;
  let otherAuthHeader: string;
  let projectId: string;

  // 전체 테스트 스위트 전에 앱 초기화
  // Initialize app before all tests
  beforeAll(async () => {
    const setup = await buildTestApp();
    app = setup.app;
    prisma = setup.prisma;
  });

  // 각 테스트 전 DB 정리 및 공통 데이터 생성
  // Clean DB and create shared data before each test
  beforeEach(async () => {
    await cleanDatabase(prisma);

    const user = await createTestUser(prisma, {
      email: 'member@example.com',
      name: 'Member User',
      googleId: 'google-member-001',
    });
    testUserId = user.id;
    authHeader = `Bearer ${generateTestAccessToken(user.id, user.email)}`;

    const other = await createTestUser(prisma, {
      email: 'outsider@example.com',
      name: 'Outsider',
      googleId: 'google-outsider-002',
    });
    otherUserId = other.id;
    otherAuthHeader = `Bearer ${generateTestAccessToken(other.id, other.email)}`;

    const project = await createTestProject(prisma, testUserId, { name: 'Test Project' });
    projectId = project.id;
  });

  // 테스트 종료 후 앱 종료
  // Close app after all tests
  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  // ─────────────────────────────────────────────
  // POST /projects/:projectId/tasks
  // ─────────────────────────────────────────────
  describe('POST /projects/:projectId/tasks', () => {
    it('201: 멤버가 태스크를 생성한다', async () => {
      // should allow member to create task
      const body = { title: 'New Task', priority: TaskPriority.HIGH };

      const res = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', authHeader)
        .send(body)
        .expect(201);

      expect(res.body).toMatchObject({
        title: 'New Task',
        priority: TaskPriority.HIGH,
        projectId,
        creatorId: testUserId,
        status: TaskStatus.TODO,
      });
      expect(res.body.id).toBeDefined();
    });

    it('201: dueDate가 있는 태스크를 생성한다', async () => {
      // should create task with dueDate
      const dueDate = '2026-12-31';

      const res = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', authHeader)
        .send({ title: 'Task with Due', dueDate })
        .expect(201);

      expect(res.body.dueDate).toBeDefined();
    });

    it('400: title이 없으면 Bad Request를 반환한다', async () => {
      // should return 400 when title is missing
      await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', authHeader)
        .send({ priority: TaskPriority.LOW })
        .expect(400);
    });

    it('403: 프로젝트 멤버가 아닌 유저가 태스크를 생성하려 하면 Forbidden을 반환한다', async () => {
      // should return 403 when non-member tries to create task
      await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', otherAuthHeader)
        .send({ title: 'Task' })
        .expect(403);
    });

    it('401: 인증 없이 접근하면 Unauthorized를 반환한다', async () => {
      // should return 401 without authentication
      await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .send({ title: 'Task' })
        .expect(401);
    });
  });

  // ─────────────────────────────────────────────
  // GET /projects/:projectId/tasks
  // ─────────────────────────────────────────────
  describe('GET /projects/:projectId/tasks', () => {
    it('200: 프로젝트의 태스크 목록을 반환한다', async () => {
      // should return task list for project
      await createTestTask(prisma, projectId, testUserId, { title: 'Task A' });
      await createTestTask(prisma, projectId, testUserId, { title: 'Task B' });

      const res = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks`)
        .set('Authorization', authHeader)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
    });

    it('200: status 쿼리로 필터링한다', async () => {
      // should filter by status query
      await createTestTask(prisma, projectId, testUserId, { title: 'Todo Task' });

      // 한 태스크를 IN_PROGRESS로 업데이트
      // Update one task to IN_PROGRESS
      const inProgressTask = await createTestTask(prisma, projectId, testUserId, {
        title: 'In Progress Task',
      });
      await prisma.task.update({
        where: { id: inProgressTask.id },
        data: { status: TaskStatus.IN_PROGRESS },
      });

      const res = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks?status=${TaskStatus.TODO}`)
        .set('Authorization', authHeader)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].status).toBe(TaskStatus.TODO);
    });

    it('403: 멤버가 아닌 유저가 목록 조회하면 Forbidden을 반환한다', async () => {
      // should return 403 when non-member accesses task list
      await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks`)
        .set('Authorization', otherAuthHeader)
        .expect(403);
    });
  });

  // ─────────────────────────────────────────────
  // GET /tasks/:id
  // ─────────────────────────────────────────────
  describe('GET /tasks/:id', () => {
    it('200: 멤버가 태스크 상세를 조회한다', async () => {
      // should return task detail for member
      const task = await createTestTask(prisma, projectId, testUserId, { title: 'Detail Task' });

      const res = await request(app.getHttpServer())
        .get(`/tasks/${task.id}`)
        .set('Authorization', authHeader)
        .expect(200);

      expect(res.body.id).toBe(task.id);
      expect(res.body.title).toBe('Detail Task');
      expect(res.body.comments).toBeDefined();
      expect(res.body.attachments).toBeDefined();
      expect(res.body.project).toMatchObject({ id: projectId });
    });

    it('404: 존재하지 않는 태스크 조회 시 Not Found를 반환한다', async () => {
      // should return 404 for non-existent task
      await request(app.getHttpServer())
        .get('/tasks/non-existent-task-id')
        .set('Authorization', authHeader)
        .expect(404);
    });

    it('403: 멤버가 아닌 유저가 조회하면 Forbidden을 반환한다', async () => {
      // should return 403 when non-member accesses task
      const task = await createTestTask(prisma, projectId, testUserId);

      await request(app.getHttpServer())
        .get(`/tasks/${task.id}`)
        .set('Authorization', otherAuthHeader)
        .expect(403);
    });
  });

  // ─────────────────────────────────────────────
  // PATCH /tasks/:id
  // ─────────────────────────────────────────────
  describe('PATCH /tasks/:id', () => {
    it('200: 멤버가 태스크 제목을 수정한다', async () => {
      // should allow member to update task title
      const task = await createTestTask(prisma, projectId, testUserId, { title: 'Original' });

      const res = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('Authorization', authHeader)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(res.body.title).toBe('Updated Title');
    });

    it('200: status를 DONE으로 변경한다', async () => {
      // should update task status to DONE
      const task = await createTestTask(prisma, projectId, testUserId);

      const res = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('Authorization', authHeader)
        .send({ status: TaskStatus.DONE })
        .expect(200);

      expect(res.body.status).toBe(TaskStatus.DONE);
    });

    it('200: priority를 URGENT로 변경한다', async () => {
      // should update task priority to URGENT
      const task = await createTestTask(prisma, projectId, testUserId);

      const res = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('Authorization', authHeader)
        .send({ priority: TaskPriority.URGENT })
        .expect(200);

      expect(res.body.priority).toBe(TaskPriority.URGENT);
    });

    it('404: 존재하지 않는 태스크 수정 시 Not Found를 반환한다', async () => {
      // should return 404 when task not found
      await request(app.getHttpServer())
        .patch('/tasks/non-existent-task-id')
        .set('Authorization', authHeader)
        .send({ title: 'x' })
        .expect(404);
    });

    it('403: 멤버가 아닌 유저가 수정하면 Forbidden을 반환한다', async () => {
      // should return 403 when non-member tries to update
      const task = await createTestTask(prisma, projectId, testUserId);

      await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('Authorization', otherAuthHeader)
        .send({ title: 'Hacked' })
        .expect(403);
    });
  });

  // ─────────────────────────────────────────────
  // DELETE /tasks/:id
  // ─────────────────────────────────────────────
  describe('DELETE /tasks/:id', () => {
    it('200: 멤버가 태스크를 삭제한다', async () => {
      // should allow member to delete task
      const task = await createTestTask(prisma, projectId, testUserId);

      await request(app.getHttpServer())
        .delete(`/tasks/${task.id}`)
        .set('Authorization', authHeader)
        .expect(200);

      // 삭제 후 조회하면 404 확인
      // Verify 404 after deletion
      await request(app.getHttpServer())
        .get(`/tasks/${task.id}`)
        .set('Authorization', authHeader)
        .expect(404);
    });

    it('404: 존재하지 않는 태스크 삭제 시 Not Found를 반환한다', async () => {
      // should return 404 when deleting non-existent task
      await request(app.getHttpServer())
        .delete('/tasks/non-existent-task-id')
        .set('Authorization', authHeader)
        .expect(404);
    });

    it('403: 멤버가 아닌 유저가 삭제하면 Forbidden을 반환한다', async () => {
      // should return 403 when non-member tries to delete
      const task = await createTestTask(prisma, projectId, testUserId);

      await request(app.getHttpServer())
        .delete(`/tasks/${task.id}`)
        .set('Authorization', otherAuthHeader)
        .expect(403);
    });
  });
});
