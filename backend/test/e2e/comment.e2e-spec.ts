import { INestApplication } from '@nestjs/common';
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

describe('Comments E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // 테스트 상태 변수
  // Test state variables
  let authorId: string;
  let authorHeader: string;
  let otherMemberId: string;
  let otherMemberHeader: string;
  let outsiderId: string;
  let outsiderHeader: string;
  let projectId: string;
  let taskId: string;

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

    // 댓글 작성자 (프로젝트 OWNER)
    // Comment author (project OWNER)
    const author = await createTestUser(prisma, {
      email: 'author@example.com',
      name: 'Author',
      googleId: 'google-author-001',
    });
    authorId = author.id;
    authorHeader = `Bearer ${generateTestAccessToken(author.id, author.email)}`;

    // 다른 프로젝트 멤버
    // Another project member
    const otherMember = await createTestUser(prisma, {
      email: 'othermember@example.com',
      name: 'Other Member',
      googleId: 'google-member-002',
    });
    otherMemberId = otherMember.id;
    otherMemberHeader = `Bearer ${generateTestAccessToken(otherMember.id, otherMember.email)}`;

    // 프로젝트 외부 유저
    // User outside the project
    const outsider = await createTestUser(prisma, {
      email: 'outsider@example.com',
      name: 'Outsider',
      googleId: 'google-outsider-003',
    });
    outsiderId = outsider.id;
    outsiderHeader = `Bearer ${generateTestAccessToken(outsider.id, outsider.email)}`;

    // 프로젝트 생성 (author가 OWNER)
    // Create project (author as OWNER)
    const project = await createTestProject(prisma, authorId, { name: 'Comment Test Project' });
    projectId = project.id;

    // otherMember를 MEMBER로 추가
    // Add otherMember as MEMBER
    await prisma.projectMember.create({
      data: { userId: otherMemberId, projectId, role: 'MEMBER' },
    });

    // 태스크 생성
    // Create task
    const task = await createTestTask(prisma, projectId, authorId, { title: 'Comment Task' });
    taskId = task.id;
  });

  // 테스트 종료 후 앱 종료
  // Close app after all tests
  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  // ─────────────────────────────────────────────
  // POST /tasks/:taskId/comments
  // ─────────────────────────────────────────────
  describe('POST /tasks/:taskId/comments', () => {
    it('201: 프로젝트 멤버가 댓글을 작성한다', async () => {
      // should allow project member to create comment
      const body = { content: 'Great progress!' };

      const res = await request(app.getHttpServer())
        .post(`/tasks/${taskId}/comments`)
        .set('Authorization', authorHeader)
        .send(body)
        .expect(201);

      expect(res.body).toMatchObject({
        content: 'Great progress!',
        taskId,
        authorId,
        author: expect.objectContaining({ id: authorId }),
      });
      expect(res.body.id).toBeDefined();
    });

    it('201: 다른 멤버도 댓글을 작성한다', async () => {
      // should allow other member to create comment
      const res = await request(app.getHttpServer())
        .post(`/tasks/${taskId}/comments`)
        .set('Authorization', otherMemberHeader)
        .send({ content: 'I agree!' })
        .expect(201);

      expect(res.body.authorId).toBe(otherMemberId);
    });

    it('400: content가 없으면 Bad Request를 반환한다', async () => {
      // should return 400 when content is missing
      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/comments`)
        .set('Authorization', authorHeader)
        .send({})
        .expect(400);
    });

    it('400: content가 2000자를 초과하면 Bad Request를 반환한다', async () => {
      // should return 400 when content exceeds 2000 chars
      const longContent = 'a'.repeat(2001);

      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/comments`)
        .set('Authorization', authorHeader)
        .send({ content: longContent })
        .expect(400);
    });

    it('403: 프로젝트 외부 유저가 댓글을 작성하려 하면 Forbidden을 반환한다', async () => {
      // should return 403 when outsider tries to create comment
      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/comments`)
        .set('Authorization', outsiderHeader)
        .send({ content: 'Sneaky comment' })
        .expect(403);
    });

    it('404: 존재하지 않는 태스크에 댓글을 작성하면 Not Found를 반환한다', async () => {
      // should return 404 when task not found
      await request(app.getHttpServer())
        .post('/tasks/non-existent-task/comments')
        .set('Authorization', authorHeader)
        .send({ content: 'comment' })
        .expect(404);
    });

    it('401: 인증 없이 접근하면 Unauthorized를 반환한다', async () => {
      // should return 401 without authentication
      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/comments`)
        .send({ content: 'comment' })
        .expect(401);
    });
  });

  // ─────────────────────────────────────────────
  // GET /tasks/:taskId/comments
  // ─────────────────────────────────────────────
  describe('GET /tasks/:taskId/comments', () => {
    it('200: 태스크의 댓글 목록을 반환한다', async () => {
      // should return comment list for task
      // 댓글 2개 생성
      // Create 2 comments
      await prisma.comment.create({
        data: { content: 'First comment', taskId, authorId },
      });
      await prisma.comment.create({
        data: { content: 'Second comment', taskId, authorId: otherMemberId },
      });

      const res = await request(app.getHttpServer())
        .get(`/tasks/${taskId}/comments`)
        .set('Authorization', authorHeader)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      // 오름차순 정렬 확인
      // Verify ascending order
      expect(res.body[0].content).toBe('First comment');
      expect(res.body[1].content).toBe('Second comment');
    });

    it('200: 댓글이 없으면 빈 배열을 반환한다', async () => {
      // should return empty array when no comments
      const res = await request(app.getHttpServer())
        .get(`/tasks/${taskId}/comments`)
        .set('Authorization', authorHeader)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('403: 멤버가 아닌 유저가 목록 조회하면 Forbidden을 반환한다', async () => {
      // should return 403 when non-member accesses comment list
      await request(app.getHttpServer())
        .get(`/tasks/${taskId}/comments`)
        .set('Authorization', outsiderHeader)
        .expect(403);
    });

    it('404: 존재하지 않는 태스크의 댓글 조회 시 Not Found를 반환한다', async () => {
      // should return 404 when task not found
      await request(app.getHttpServer())
        .get('/tasks/non-existent-task/comments')
        .set('Authorization', authorHeader)
        .expect(404);
    });
  });

  // ─────────────────────────────────────────────
  // DELETE /comments/:id
  // ─────────────────────────────────────────────
  describe('DELETE /comments/:id', () => {
    it('200: 작성자가 본인 댓글을 삭제한다', async () => {
      // should allow author to delete their own comment
      const comment = await prisma.comment.create({
        data: { content: 'To be deleted', taskId, authorId },
      });

      await request(app.getHttpServer())
        .delete(`/comments/${comment.id}`)
        .set('Authorization', authorHeader)
        .expect(200);

      // 삭제 후 댓글 목록에 없는지 확인
      // Verify comment is gone from list
      const listRes = await request(app.getHttpServer())
        .get(`/tasks/${taskId}/comments`)
        .set('Authorization', authorHeader)
        .expect(200);
      expect(listRes.body).toHaveLength(0);
    });

    it('403: 다른 유저가 댓글을 삭제하려 하면 Forbidden을 반환한다', async () => {
      // should return 403 when non-author tries to delete comment
      const comment = await prisma.comment.create({
        data: { content: 'Author comment', taskId, authorId },
      });

      await request(app.getHttpServer())
        .delete(`/comments/${comment.id}`)
        .set('Authorization', otherMemberHeader)
        .expect(403);
    });

    it('404: 존재하지 않는 댓글 삭제 시 Not Found를 반환한다', async () => {
      // should return 404 when deleting non-existent comment
      await request(app.getHttpServer())
        .delete('/comments/non-existent-comment')
        .set('Authorization', authorHeader)
        .expect(404);
    });

    it('401: 인증 없이 접근하면 Unauthorized를 반환한다', async () => {
      // should return 401 without authentication
      const comment = await prisma.comment.create({
        data: { content: 'some comment', taskId, authorId },
      });

      await request(app.getHttpServer())
        .delete(`/comments/${comment.id}`)
        .expect(401);
    });
  });
});
