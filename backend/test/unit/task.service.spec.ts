import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { TaskService } from '@/task/task.service';
import { PrismaService } from '@/prisma/prisma.service';
import { MembershipService } from '@/shared/membership.service';

// PrismaService 모의 객체 타입
// PrismaService mock type
type PrismaServiceMock = {
  task: {
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  projectMember: {
    findUnique: jest.Mock;
  };
};

// MembershipService 모의 객체 타입
// MembershipService mock type
type MembershipServiceMock = {
  verifyMembership: jest.Mock;
  verifyOwnership: jest.Mock;
};

describe('TaskService', () => {
  let service: TaskService;
  let prismaMock: PrismaServiceMock;
  let membershipMock: MembershipServiceMock;

  // 테스트 고정 데이터
  // Fixed test data
  const USER_ID = 'user-cuid-001';
  const PROJECT_ID = 'project-cuid-001';
  const TASK_ID = 'task-cuid-001';

  const mockMember = {
    userId: USER_ID,
    projectId: PROJECT_ID,
    role: 'MEMBER',
    joinedAt: new Date(),
  };

  const mockTask = {
    id: TASK_ID,
    title: 'Test Task',
    description: null,
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: null,
    position: 0,
    projectId: PROJECT_ID,
    assigneeId: null,
    creatorId: USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignee: null,
    creator: { id: USER_ID, name: 'Test User', avatarUrl: null },
  };

  const mockTaskWithRelations = {
    ...mockTask,
    project: { id: PROJECT_ID, name: 'Test Project' },
    comments: [],
    attachments: [],
  };

  beforeEach(async () => {
    // 각 테스트 전 모의 객체 초기화
    // Initialize mocks before each test
    prismaMock = {
      task: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      projectMember: {
        findUnique: jest.fn(),
      },
    };

    membershipMock = {
      verifyMembership: jest.fn(),
      verifyOwnership: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: MembershipService, useValue: membershipMock },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  // ─────────────────────────────────────────────
  // create
  // ─────────────────────────────────────────────
  describe('create', () => {
    it('멤버가 태스크를 생성한다', async () => {
      // should allow member to create task
      membershipMock.verifyMembership.mockResolvedValue(mockMember);
      prismaMock.task.create.mockResolvedValue(mockTask);

      const dto = { title: 'Test Task' };
      const result = await service.create(PROJECT_ID, dto, USER_ID);

      expect(membershipMock.verifyMembership).toHaveBeenCalledWith(PROJECT_ID, USER_ID);
      expect(prismaMock.task.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          description: undefined,
          priority: undefined,
          dueDate: undefined,
          assigneeId: undefined,
          projectId: PROJECT_ID,
          creatorId: USER_ID,
        },
        include: {
          assignee: { select: { id: true, name: true, avatarUrl: true } },
          creator: { select: { id: true, name: true, avatarUrl: true } },
        },
      });
      expect(result).toEqual(mockTask);
    });

    it('dueDate 문자열을 Date 객체로 변환한다', async () => {
      // should convert dueDate string to Date object
      membershipMock.verifyMembership.mockResolvedValue(mockMember);
      prismaMock.task.create.mockResolvedValue(mockTask);

      const dueDateStr = '2026-12-31';
      await service.create(PROJECT_ID, { title: 'Task', dueDate: dueDateStr }, USER_ID);

      const createCall = prismaMock.task.create.mock.calls[0][0];
      expect(createCall.data.dueDate).toBeInstanceOf(Date);
    });

    it('프로젝트 멤버가 아니면 ForbiddenException을 던진다', async () => {
      // should throw ForbiddenException when user is not a project member
      membershipMock.verifyMembership.mockRejectedValue(new ForbiddenException('Not a member of this project'));

      await expect(
        service.create(PROJECT_ID, { title: 'Task' }, 'outsider-id'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─────────────────────────────────────────────
  // findByProject
  // ─────────────────────────────────────────────
  describe('findByProject', () => {
    it('프로젝트의 모든 태스크를 반환한다', async () => {
      // should return all tasks for the project
      membershipMock.verifyMembership.mockResolvedValue(mockMember);
      prismaMock.task.findMany.mockResolvedValue([mockTask]);

      const result = await service.findByProject(PROJECT_ID, USER_ID);

      expect(prismaMock.task.findMany).toHaveBeenCalledWith({
        where: { projectId: PROJECT_ID },
        include: {
          assignee: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { comments: true } },
        },
        orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'desc' }],
      });
      expect(result).toEqual([mockTask]);
    });

    it('status 필터가 있으면 where 조건에 포함한다', async () => {
      // should include status filter in where clause
      membershipMock.verifyMembership.mockResolvedValue(mockMember);
      prismaMock.task.findMany.mockResolvedValue([]);

      await service.findByProject(PROJECT_ID, USER_ID, TaskStatus.TODO);

      const findCall = prismaMock.task.findMany.mock.calls[0][0];
      expect(findCall.where).toEqual({ projectId: PROJECT_ID, status: TaskStatus.TODO });
    });

    it('프로젝트 멤버가 아니면 ForbiddenException을 던진다', async () => {
      // should throw ForbiddenException when user is not a project member
      membershipMock.verifyMembership.mockRejectedValue(new ForbiddenException('Not a member of this project'));

      await expect(
        service.findByProject(PROJECT_ID, 'outsider-id'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─────────────────────────────────────────────
  // findOne
  // ─────────────────────────────────────────────
  describe('findOne', () => {
    it('멤버가 태스크 상세를 조회한다', async () => {
      // should return task detail for a member
      prismaMock.task.findUnique.mockResolvedValue(mockTaskWithRelations);
      membershipMock.verifyMembership.mockResolvedValue(mockMember);

      const result = await service.findOne(TASK_ID, USER_ID);

      expect(prismaMock.task.findUnique).toHaveBeenCalledWith({
        where: { id: TASK_ID },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
          creator: { select: { id: true, name: true, avatarUrl: true } },
          comments: {
            include: { author: { select: { id: true, name: true, avatarUrl: true } } },
            orderBy: { createdAt: 'asc' },
          },
          attachments: true,
        },
      });
      expect(result).toEqual(mockTaskWithRelations);
    });

    it('태스크가 없으면 NotFoundException을 던진다', async () => {
      // should throw NotFoundException when task not found
      prismaMock.task.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent', USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('프로젝트 멤버가 아니면 ForbiddenException을 던진다', async () => {
      // should throw ForbiddenException when user is not a project member
      prismaMock.task.findUnique.mockResolvedValue(mockTaskWithRelations);
      membershipMock.verifyMembership.mockRejectedValue(new ForbiddenException('Not a member of this project'));

      await expect(service.findOne(TASK_ID, 'outsider-id')).rejects.toThrow(ForbiddenException);
    });
  });

  // ─────────────────────────────────────────────
  // update
  // ─────────────────────────────────────────────
  describe('update', () => {
    it('멤버가 태스크를 수정한다', async () => {
      // should allow member to update task
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      membershipMock.verifyMembership.mockResolvedValue(mockMember);
      const updatedTask = { ...mockTask, title: 'Updated Task' };
      prismaMock.task.update.mockResolvedValue(updatedTask);

      const dto = { title: 'Updated Task' };
      const result = await service.update(TASK_ID, dto, USER_ID);

      expect(result.title).toBe('Updated Task');
    });

    it('태스크가 없으면 NotFoundException을 던진다', async () => {
      // should throw NotFoundException when task not found
      prismaMock.task.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { title: 'x' }, USER_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('프로젝트 멤버가 아니면 ForbiddenException을 던진다', async () => {
      // should throw ForbiddenException when user is not a project member
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      membershipMock.verifyMembership.mockRejectedValue(new ForbiddenException('Not a member of this project'));

      await expect(
        service.update(TASK_ID, { title: 'x' }, 'outsider-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('status를 DONE으로 변경한다', async () => {
      // should update task status to DONE
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      membershipMock.verifyMembership.mockResolvedValue(mockMember);
      prismaMock.task.update.mockResolvedValue({ ...mockTask, status: TaskStatus.DONE });

      const result = await service.update(TASK_ID, { status: TaskStatus.DONE }, USER_ID);

      const updateCall = prismaMock.task.update.mock.calls[0][0];
      expect(updateCall.data.status).toBe(TaskStatus.DONE);
      expect(result.status).toBe(TaskStatus.DONE);
    });

    it('dueDate를 null로 설정할 수 있다', async () => {
      // should allow setting dueDate to null
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      membershipMock.verifyMembership.mockResolvedValue(mockMember);
      prismaMock.task.update.mockResolvedValue({ ...mockTask, dueDate: null });

      await service.update(TASK_ID, { dueDate: null }, USER_ID);

      const updateCall = prismaMock.task.update.mock.calls[0][0];
      expect(updateCall.data.dueDate).toBeNull();
    });
  });

  // ─────────────────────────────────────────────
  // remove
  // ─────────────────────────────────────────────
  describe('remove', () => {
    it('멤버가 태스크를 삭제한다', async () => {
      // should allow member to delete task
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      membershipMock.verifyMembership.mockResolvedValue(mockMember);
      prismaMock.task.delete.mockResolvedValue(mockTask);

      const result = await service.remove(TASK_ID, USER_ID);

      expect(prismaMock.task.delete).toHaveBeenCalledWith({ where: { id: TASK_ID } });
      expect(result).toEqual(mockTask);
    });

    it('태스크가 없으면 NotFoundException을 던진다', async () => {
      // should throw NotFoundException when task not found
      prismaMock.task.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent', USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('프로젝트 멤버가 아니면 ForbiddenException을 던진다', async () => {
      // should throw ForbiddenException when user is not a project member
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      membershipMock.verifyMembership.mockRejectedValue(new ForbiddenException('Not a member of this project'));

      await expect(service.remove(TASK_ID, 'outsider-id')).rejects.toThrow(ForbiddenException);
    });
  });
});
