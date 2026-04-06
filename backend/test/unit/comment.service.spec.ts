import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommentService } from '@/comment/comment.service';
import { PrismaService } from '@/prisma/prisma.service';

// PrismaService 모의 객체 타입
// PrismaService mock type
type PrismaServiceMock = {
  task: {
    findUnique: jest.Mock;
  };
  comment: {
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    delete: jest.Mock;
  };
  projectMember: {
    findUnique: jest.Mock;
  };
};

describe('CommentService', () => {
  let service: CommentService;
  let prismaMock: PrismaServiceMock;

  // 테스트 고정 데이터
  // Fixed test data
  const AUTHOR_USER_ID = 'user-author-001';
  const OTHER_USER_ID = 'user-other-002';
  const PROJECT_ID = 'project-cuid-001';
  const TASK_ID = 'task-cuid-001';
  const COMMENT_ID = 'comment-cuid-001';

  const mockTask = {
    id: TASK_ID,
    projectId: PROJECT_ID,
  };

  const mockMember = {
    userId: AUTHOR_USER_ID,
    projectId: PROJECT_ID,
    role: 'MEMBER',
    joinedAt: new Date(),
  };

  const mockComment = {
    id: COMMENT_ID,
    content: 'Test comment',
    taskId: TASK_ID,
    authorId: AUTHOR_USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: { id: AUTHOR_USER_ID, name: 'Author', avatarUrl: null },
  };

  beforeEach(async () => {
    // 각 테스트 전 모의 객체 초기화
    // Initialize mocks before each test
    prismaMock = {
      task: {
        findUnique: jest.fn(),
      },
      comment: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      projectMember: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  // ─────────────────────────────────────────────
  // create
  // ─────────────────────────────────────────────
  describe('create', () => {
    it('프로젝트 멤버가 댓글을 작성한다', async () => {
      // should allow project member to create comment
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      prismaMock.projectMember.findUnique.mockResolvedValue(mockMember);
      prismaMock.comment.create.mockResolvedValue(mockComment);

      const dto = { content: 'Test comment' };
      const result = await service.create(TASK_ID, dto, AUTHOR_USER_ID);

      expect(prismaMock.task.findUnique).toHaveBeenCalledWith({
        where: { id: TASK_ID },
        select: { projectId: true },
      });
      expect(prismaMock.comment.create).toHaveBeenCalledWith({
        data: {
          content: dto.content,
          taskId: TASK_ID,
          authorId: AUTHOR_USER_ID,
        },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
      });
      expect(result).toEqual(mockComment);
    });

    it('태스크가 없으면 NotFoundException을 던진다', async () => {
      // should throw NotFoundException when task not found
      prismaMock.task.findUnique.mockResolvedValue(null);

      await expect(
        service.create('non-existent-task', { content: 'hi' }, AUTHOR_USER_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('프로젝트 멤버가 아니면 ForbiddenException을 던진다', async () => {
      // should throw ForbiddenException when user is not a project member
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      prismaMock.projectMember.findUnique.mockResolvedValue(null);

      await expect(
        service.create(TASK_ID, { content: 'hi' }, 'outsider-id'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─────────────────────────────────────────────
  // findByTask
  // ─────────────────────────────────────────────
  describe('findByTask', () => {
    it('태스크의 댓글 목록을 오름차순으로 반환한다', async () => {
      // should return comments for task ordered ascending
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      prismaMock.projectMember.findUnique.mockResolvedValue(mockMember);
      prismaMock.comment.findMany.mockResolvedValue([mockComment]);

      const result = await service.findByTask(TASK_ID, AUTHOR_USER_ID);

      expect(prismaMock.comment.findMany).toHaveBeenCalledWith({
        where: { taskId: TASK_ID },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual([mockComment]);
    });

    it('태스크가 없으면 NotFoundException을 던진다', async () => {
      // should throw NotFoundException when task not found
      prismaMock.task.findUnique.mockResolvedValue(null);

      await expect(
        service.findByTask('non-existent-task', AUTHOR_USER_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('프로젝트 멤버가 아니면 ForbiddenException을 던진다', async () => {
      // should throw ForbiddenException when user is not a project member
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      prismaMock.projectMember.findUnique.mockResolvedValue(null);

      await expect(
        service.findByTask(TASK_ID, 'outsider-id'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─────────────────────────────────────────────
  // remove
  // ─────────────────────────────────────────────
  describe('remove', () => {
    it('작성자가 본인 댓글을 삭제한다', async () => {
      // should allow author to delete their own comment
      prismaMock.comment.findUnique.mockResolvedValue(mockComment);
      prismaMock.comment.delete.mockResolvedValue(mockComment);

      const result = await service.remove(COMMENT_ID, AUTHOR_USER_ID);

      expect(prismaMock.comment.delete).toHaveBeenCalledWith({ where: { id: COMMENT_ID } });
      expect(result).toEqual(mockComment);
    });

    it('댓글이 없으면 NotFoundException을 던진다', async () => {
      // should throw NotFoundException when comment not found
      prismaMock.comment.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent', AUTHOR_USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('다른 유저가 삭제를 시도하면 ForbiddenException을 던진다', async () => {
      // should throw ForbiddenException when non-author tries to delete
      prismaMock.comment.findUnique.mockResolvedValue(mockComment);

      await expect(service.remove(COMMENT_ID, OTHER_USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
