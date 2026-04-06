import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProjectService } from '@/project/project.service';
import { PrismaService } from '@/prisma/prisma.service';

// PrismaService 모의 객체 타입
// PrismaService mock type
type PrismaServiceMock = {
  project: {
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

describe('ProjectService', () => {
  let service: ProjectService;
  let prismaMock: PrismaServiceMock;

  // 테스트 고정 데이터
  // Fixed test data
  const OWNER_USER_ID = 'user-owner-001';
  const MEMBER_USER_ID = 'user-member-002';
  const PROJECT_ID = 'project-cuid-001';

  const mockProject = {
    id: PROJECT_ID,
    name: 'Test Project',
    description: 'A test project',
    color: '#005ea1',
    createdAt: new Date(),
    updatedAt: new Date(),
    members: [
      {
        userId: OWNER_USER_ID,
        role: 'OWNER',
        user: { id: OWNER_USER_ID, name: 'Owner', email: 'owner@example.com', avatarUrl: null },
      },
    ],
    _count: { tasks: 0 },
  };

  const mockOwnerMember = {
    userId: OWNER_USER_ID,
    projectId: PROJECT_ID,
    role: 'OWNER',
    joinedAt: new Date(),
  };

  const mockAdminMember = {
    userId: MEMBER_USER_ID,
    projectId: PROJECT_ID,
    role: 'ADMIN',
    joinedAt: new Date(),
  };

  const mockViewerMember = {
    userId: MEMBER_USER_ID,
    projectId: PROJECT_ID,
    role: 'VIEWER',
    joinedAt: new Date(),
  };

  beforeEach(async () => {
    // 각 테스트 전 모의 객체 초기화
    // Initialize mocks before each test
    prismaMock = {
      project: {
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  // ─────────────────────────────────────────────
  // create
  // ─────────────────────────────────────────────
  describe('create', () => {
    it('프로젝트를 생성하고 생성자를 OWNER로 추가한다', async () => {
      // should create project and add creator as OWNER
      prismaMock.project.create.mockResolvedValue(mockProject);

      const dto = { name: 'Test Project', description: 'A test project' };
      const result = await service.create(dto, OWNER_USER_ID);

      expect(prismaMock.project.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          description: dto.description,
          color: undefined,
          members: {
            create: { userId: OWNER_USER_ID, role: 'OWNER' },
          },
        },
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
          },
        },
      });
      expect(result).toEqual(mockProject);
    });

    it('color가 지정된 경우 포함하여 생성한다', async () => {
      // should create project with specified color
      const projectWithColor = { ...mockProject, color: '#FF0000' };
      prismaMock.project.create.mockResolvedValue(projectWithColor);

      const dto = { name: 'Colorful Project', color: '#FF0000' };
      const result = await service.create(dto, OWNER_USER_ID);

      expect(result.color).toBe('#FF0000');
    });
  });

  // ─────────────────────────────────────────────
  // findAll
  // ─────────────────────────────────────────────
  describe('findAll', () => {
    it('userId가 속한 프로젝트 목록을 반환한다', async () => {
      // should return projects where userId is a member
      prismaMock.project.findMany.mockResolvedValue([mockProject]);

      const result = await service.findAll(OWNER_USER_ID);

      expect(prismaMock.project.findMany).toHaveBeenCalledWith({
        where: { members: { some: { userId: OWNER_USER_ID } } },
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
          _count: { select: { tasks: true } },
        },
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual([mockProject]);
    });

    it('프로젝트가 없으면 빈 배열을 반환한다', async () => {
      // should return empty array when no projects found
      prismaMock.project.findMany.mockResolvedValue([]);

      const result = await service.findAll(OWNER_USER_ID);

      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // findOne
  // ─────────────────────────────────────────────
  describe('findOne', () => {
    it('멤버인 유저가 프로젝트 상세를 조회한다', async () => {
      // should return project detail for a member user
      prismaMock.project.findUnique.mockResolvedValue(mockProject);

      const result = await service.findOne(PROJECT_ID, OWNER_USER_ID);

      expect(prismaMock.project.findUnique).toHaveBeenCalledWith({
        where: { id: PROJECT_ID },
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
          },
          _count: { select: { tasks: true } },
        },
      });
      expect(result).toEqual(mockProject);
    });

    it('프로젝트가 없으면 NotFoundException을 던진다', async () => {
      // should throw NotFoundException when project not found
      prismaMock.project.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id', OWNER_USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('멤버가 아닌 유저가 조회하면 ForbiddenException을 던진다', async () => {
      // should throw ForbiddenException when user is not a member
      const projectWithoutRequester = {
        ...mockProject,
        members: [
          {
            userId: 'someone-else',
            role: 'OWNER',
            user: { id: 'someone-else', name: 'Other', email: 'other@example.com', avatarUrl: null },
          },
        ],
      };
      prismaMock.project.findUnique.mockResolvedValue(projectWithoutRequester);

      await expect(service.findOne(PROJECT_ID, MEMBER_USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ─────────────────────────────────────────────
  // update
  // ─────────────────────────────────────────────
  describe('update', () => {
    it('OWNER가 프로젝트를 수정한다', async () => {
      // should allow OWNER to update project
      prismaMock.projectMember.findUnique.mockResolvedValue(mockOwnerMember);
      const updatedProject = { ...mockProject, name: 'Updated Name' };
      prismaMock.project.update.mockResolvedValue(updatedProject);

      const dto = { name: 'Updated Name' };
      const result = await service.update(PROJECT_ID, dto, OWNER_USER_ID);

      expect(prismaMock.project.update).toHaveBeenCalledWith({
        where: { id: PROJECT_ID },
        data: { name: 'Updated Name' },
      });
      expect(result.name).toBe('Updated Name');
    });

    it('ADMIN이 프로젝트를 수정한다', async () => {
      // should allow ADMIN to update project
      prismaMock.projectMember.findUnique.mockResolvedValue(mockAdminMember);
      prismaMock.project.update.mockResolvedValue(mockProject);

      await expect(
        service.update(PROJECT_ID, { name: 'New' }, MEMBER_USER_ID),
      ).resolves.toBeDefined();
    });

    it('VIEWER가 수정을 시도하면 ForbiddenException을 던진다', async () => {
      // should throw ForbiddenException when VIEWER tries to update
      prismaMock.projectMember.findUnique.mockResolvedValue(mockViewerMember);

      await expect(
        service.update(PROJECT_ID, { name: 'New' }, MEMBER_USER_ID),
      ).rejects.toThrow(ForbiddenException);
    });

    it('멤버가 아닌 유저가 수정을 시도하면 ForbiddenException을 던진다', async () => {
      // should throw ForbiddenException when non-member tries to update
      prismaMock.projectMember.findUnique.mockResolvedValue(null);

      await expect(
        service.update(PROJECT_ID, { name: 'New' }, 'outsider-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('undefined 필드는 update data에 포함하지 않는다', async () => {
      // should exclude undefined fields from update data
      prismaMock.projectMember.findUnique.mockResolvedValue(mockOwnerMember);
      prismaMock.project.update.mockResolvedValue(mockProject);

      // description만 전달, name/color는 undefined
      // Only description passed, name/color are undefined
      await service.update(PROJECT_ID, { description: 'New desc' }, OWNER_USER_ID);

      const updateCall = prismaMock.project.update.mock.calls[0][0];
      expect(updateCall.data).toEqual({ description: 'New desc' });
      expect(updateCall.data.name).toBeUndefined();
      expect(updateCall.data.color).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────
  // remove
  // ─────────────────────────────────────────────
  describe('remove', () => {
    it('OWNER가 프로젝트를 삭제한다', async () => {
      // should allow OWNER to delete project
      prismaMock.projectMember.findUnique.mockResolvedValue(mockOwnerMember);
      prismaMock.project.delete.mockResolvedValue(mockProject);

      const result = await service.remove(PROJECT_ID, OWNER_USER_ID);

      expect(prismaMock.project.delete).toHaveBeenCalledWith({ where: { id: PROJECT_ID } });
      expect(result).toEqual(mockProject);
    });

    it('권한 없는 유저가 삭제를 시도하면 ForbiddenException을 던진다', async () => {
      // should throw ForbiddenException when unauthorized user tries to delete
      prismaMock.projectMember.findUnique.mockResolvedValue(mockViewerMember);

      await expect(service.remove(PROJECT_ID, MEMBER_USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
