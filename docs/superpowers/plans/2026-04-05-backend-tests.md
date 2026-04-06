# Backend Tests Implementation Plan

> **For agentic workers:** Execute each step sequentially. Mark each checkbox `[x]` immediately after completion. Never skip verification steps. Run `npx jest` after each task group to confirm accumulating test count. All file paths are relative to `/Users/dohee/Documents/workspace/project/taskflow/backend`.

## Goal

백엔드 테스트 인프라를 구축하고 모든 서비스(AuthService, ProjectService, TaskService, CommentService)에 대한 유닛 테스트와 E2E 테스트를 작성한다.
Build backend test infrastructure and write unit tests + E2E tests for all services (AuthService, ProjectService, TaskService, CommentService).

## Architecture

```
backend/
├── src/
│   ├── auth/
│   │   └── auth.service.ts          ← AuthService (JwtService, ConfigService, PrismaService)
│   ├── project/
│   │   └── project.service.ts       ← ProjectService (PrismaService)
│   ├── task/
│   │   └── task.service.ts          ← TaskService (PrismaService)
│   └── comment/
│       └── comment.service.ts       ← CommentService (PrismaService)
└── test/
    ├── unit/
    │   ├── auth.service.spec.ts
    │   ├── project.service.spec.ts
    │   ├── task.service.spec.ts
    │   └── comment.service.spec.ts
    ├── e2e/
    │   ├── project.e2e-spec.ts
    │   ├── task.e2e-spec.ts
    │   └── comment.e2e-spec.ts
    └── helpers/
        ├── test-setup.ts
        └── jwt.helper.ts
```

## Tech Stack

- **Test Framework**: Jest 29 + ts-jest
- **NestJS Testing**: @nestjs/testing (TestingModule)
- **HTTP Testing**: supertest
- **Unit Mocks**: jest.fn() on PrismaService methods
- **E2E DB**: Real PrismaService with TEST_DATABASE_URL
- **TypeScript**: paths @/* → src/*

---

## File Structure

| 파일 경로 / File Path | 설명 / Description |
|---|---|
| `jest.config.ts` | Jest 설정 (ts-jest, paths, coverage) |
| `test/helpers/test-setup.ts` | E2E DB 정리 헬퍼 |
| `test/helpers/jwt.helper.ts` | 테스트용 JWT 생성 |
| `test/unit/auth.service.spec.ts` | AuthService 유닛 테스트 |
| `test/unit/project.service.spec.ts` | ProjectService 유닛 테스트 |
| `test/unit/task.service.spec.ts` | TaskService 유닛 테스트 |
| `test/unit/comment.service.spec.ts` | CommentService 유닛 테스트 |
| `test/e2e/project.e2e-spec.ts` | Project E2E 테스트 |
| `test/e2e/task.e2e-spec.ts` | Task E2E 테스트 |
| `test/e2e/comment.e2e-spec.ts` | Comment E2E 테스트 |

---

## Task 1: Test Infrastructure Setup

- [ ] **Step 1: Install testing dependencies**

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/backend

npm install --save-dev \
  @nestjs/testing \
  jest \
  ts-jest \
  @types/jest \
  supertest \
  @types/supertest
```

- [ ] **Step 2: Create `jest.config.ts`**

파일 경로 / File path: `backend/jest.config.ts`

```typescript
import type { Config } from 'jest';

// Jest 설정 파일
// Jest configuration file
const config: Config = {
  // TypeScript 변환기로 ts-jest 사용
  // Use ts-jest as TypeScript transformer
  preset: 'ts-jest',
  testEnvironment: 'node',

  // 루트 디렉토리
  // Root directory
  rootDir: '.',

  // 테스트 파일 패턴 (유닛 + E2E)
  // Test file patterns (unit + E2E)
  testRegex: '.*\\.spec\\.ts$',

  // ts-jest 설정: paths alias 지원
  // ts-jest config: support paths alias
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.json',
      },
    ],
  },

  // @/* → src/* 경로 매핑
  // @/* → src/* path mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // 커버리지 수집 대상
  // Coverage collection targets
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
    '!src/**/dto/**',
    '!src/prisma/**',
  ],

  // 커버리지 출력 디렉토리
  // Coverage output directory
  coverageDirectory: './coverage',

  // 유닛 테스트 설정
  // Unit test configuration
  projects: [
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: '.',
      testRegex: 'test/unit/.*\\.spec\\.ts$',
      transform: {
        '^.+\\.(t|j)s$': [
          'ts-jest',
          { tsconfig: './tsconfig.json' },
        ],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
    {
      displayName: 'e2e',
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: '.',
      testRegex: 'test/e2e/.*\\.e2e-spec\\.ts$',
      transform: {
        '^.+\\.(t|j)s$': [
          'ts-jest',
          { tsconfig: './tsconfig.json' },
        ],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      // E2E 테스트는 시간이 오래 걸릴 수 있음
      // E2E tests may take longer
      testTimeout: 30000,
    },
  ],
};

export default config;
```

- [ ] **Step 3: Add test scripts to `package.json`**

`package.json`의 `"scripts"` 섹션에 아래 항목 추가 / Add these entries to the `"scripts"` section in `package.json`:

```json
"test": "jest --config jest.config.ts",
"test:unit": "jest --config jest.config.ts --selectProjects unit",
"test:e2e": "jest --config jest.config.ts --selectProjects e2e",
"test:cov": "jest --config jest.config.ts --coverage",
"test:watch": "jest --config jest.config.ts --watch"
```

- [ ] **Step 4: Create test directory structure**

```bash
mkdir -p /Users/dohee/Documents/workspace/project/taskflow/backend/test/unit
mkdir -p /Users/dohee/Documents/workspace/project/taskflow/backend/test/e2e
mkdir -p /Users/dohee/Documents/workspace/project/taskflow/backend/test/helpers
```

- [ ] **Step 5: Verify Jest resolves TypeScript**

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/backend
npx jest --version
```

기대 출력 / Expected output: Jest version number (29.x)

---

## Task 2: AuthService Unit Tests

파일 경로 / File path: `backend/test/unit/auth.service.spec.ts`

- [ ] **Step 6: Create `test/unit/auth.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '@/auth/auth.service';
import { PrismaService } from '@/prisma/prisma.service';

// PrismaService 모의 객체 타입
// PrismaService mock type
type PrismaServiceMock = {
  user: {
    upsert: jest.Mock;
    findUnique: jest.Mock;
  };
};

// JwtService 모의 객체 타입
// JwtService mock type
type JwtServiceMock = {
  sign: jest.Mock;
  verify: jest.Mock;
};

// ConfigService 모의 객체 타입
// ConfigService mock type
type ConfigServiceMock = {
  getOrThrow: jest.Mock;
};

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: PrismaServiceMock;
  let jwtMock: JwtServiceMock;
  let configMock: ConfigServiceMock;

  // 테스트용 고정 데이터
  // Fixed test data
  const TEST_USER_ID = 'user-cuid-001';
  const TEST_USER_EMAIL = 'test@example.com';
  const TEST_USER_NAME = 'Test User';
  const TEST_GOOGLE_ID = 'google-123';
  const TEST_ACCESS_TOKEN = 'access.token.value';
  const TEST_REFRESH_TOKEN = 'refresh.token.value';

  const mockUser = {
    id: TEST_USER_ID,
    email: TEST_USER_EMAIL,
    name: TEST_USER_NAME,
    avatarUrl: null,
    googleId: TEST_GOOGLE_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // 각 테스트 전 모의 객체 초기화
    // Initialize mocks before each test
    prismaMock = {
      user: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    jwtMock = {
      sign: jest.fn().mockReturnValue(TEST_ACCESS_TOKEN),
      verify: jest.fn(),
    };

    configMock = {
      getOrThrow: jest.fn().mockImplementation((key: string) => {
        const configMap: Record<string, string> = {
          JWT_SECRET: 'test-jwt-secret',
          JWT_EXPIRES_IN: '15m',
          JWT_REFRESH_SECRET: 'test-refresh-secret',
          JWT_REFRESH_EXPIRES_IN: '7d',
        };
        return configMap[key] ?? '';
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ─────────────────────────────────────────────
  // handleGoogleLogin
  // ─────────────────────────────────────────────
  describe('handleGoogleLogin', () => {
    const googleUser = {
      googleId: TEST_GOOGLE_ID,
      email: TEST_USER_EMAIL,
      name: TEST_USER_NAME,
      avatarUrl: null,
    };

    it('신규 유저를 upsert하고 accessToken과 user를 반환한다', async () => {
      // should upsert user and return accessToken + user
      prismaMock.user.upsert.mockResolvedValue(mockUser);

      const result = await service.handleGoogleLogin(googleUser);

      expect(prismaMock.user.upsert).toHaveBeenCalledWith({
        where: { googleId: TEST_GOOGLE_ID },
        update: {
          email: TEST_USER_EMAIL,
          name: TEST_USER_NAME,
          avatarUrl: null,
        },
        create: {
          googleId: TEST_GOOGLE_ID,
          email: TEST_USER_EMAIL,
          name: TEST_USER_NAME,
          avatarUrl: null,
        },
      });

      expect(result).toMatchObject({
        accessToken: TEST_ACCESS_TOKEN,
        user: {
          id: TEST_USER_ID,
          email: TEST_USER_EMAIL,
          name: TEST_USER_NAME,
          avatarUrl: null,
        },
      });
    });

    it('jwtService.sign을 올바른 페이로드와 옵션으로 호출한다', async () => {
      // should call jwtService.sign with correct payload and options
      prismaMock.user.upsert.mockResolvedValue(mockUser);

      await service.handleGoogleLogin(googleUser);

      expect(jwtMock.sign).toHaveBeenCalledWith(
        { sub: TEST_USER_ID, email: TEST_USER_EMAIL },
        { secret: 'test-jwt-secret', expiresIn: '15m' },
      );
    });
  });

  // ─────────────────────────────────────────────
  // refreshAccessToken
  // ─────────────────────────────────────────────
  describe('refreshAccessToken', () => {
    it('유효한 refresh token으로 새 access token을 발급한다', async () => {
      // should issue new access token with valid refresh token
      const jwtPayload = { sub: TEST_USER_ID, email: TEST_USER_EMAIL };
      jwtMock.verify.mockReturnValue(jwtPayload);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.refreshAccessToken(TEST_REFRESH_TOKEN);

      expect(jwtMock.verify).toHaveBeenCalledWith(TEST_REFRESH_TOKEN, {
        secret: 'test-refresh-secret',
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: TEST_USER_ID },
      });
      expect(result).toEqual({ accessToken: TEST_ACCESS_TOKEN });
    });

    it('refresh token이 만료되거나 유효하지 않으면 UnauthorizedException을 던진다', async () => {
      // should throw UnauthorizedException when refresh token is invalid
      jwtMock.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refreshAccessToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('payload의 userId에 해당하는 유저가 없으면 UnauthorizedException을 던진다', async () => {
      // should throw UnauthorizedException when user not found by payload sub
      const jwtPayload = { sub: 'non-existent-id', email: 'none@example.com' };
      jwtMock.verify.mockReturnValue(jwtPayload);
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshAccessToken(TEST_REFRESH_TOKEN)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ─────────────────────────────────────────────
  // getProfile
  // ─────────────────────────────────────────────
  describe('getProfile', () => {
    it('userId로 유저 프로필을 반환한다', async () => {
      // should return user profile by userId
      const profileData = {
        id: TEST_USER_ID,
        email: TEST_USER_EMAIL,
        name: TEST_USER_NAME,
        avatarUrl: null,
        createdAt: new Date(),
      };
      prismaMock.user.findUnique.mockResolvedValue(profileData);

      const result = await service.getProfile(TEST_USER_ID);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: TEST_USER_ID },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(profileData);
    });

    it('유저가 없으면 UnauthorizedException을 던진다', async () => {
      // should throw UnauthorizedException when user not found
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('no-such-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ─────────────────────────────────────────────
  // generateRefreshToken (public 메서드)
  // generateRefreshToken (public method)
  // ─────────────────────────────────────────────
  describe('generateRefreshToken', () => {
    it('refresh secret으로 토큰을 서명하여 반환한다', () => {
      // should sign and return token with refresh secret
      jwtMock.sign.mockReturnValue(TEST_REFRESH_TOKEN);

      const token = service.generateRefreshToken(TEST_USER_ID, TEST_USER_EMAIL);

      expect(jwtMock.sign).toHaveBeenCalledWith(
        { sub: TEST_USER_ID, email: TEST_USER_EMAIL },
        { secret: 'test-refresh-secret', expiresIn: '7d' },
      );
      expect(token).toBe(TEST_REFRESH_TOKEN);
    });
  });
});
```

- [ ] **Step 7: Run AuthService unit tests**

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/backend
npx jest --config jest.config.ts --selectProjects unit --testPathPattern auth.service.spec.ts --verbose
```

기대 결과 / Expected: All tests in `auth.service.spec.ts` pass (7 tests).

---

## Task 3: ProjectService Unit Tests

파일 경로 / File path: `backend/test/unit/project.service.spec.ts`

- [ ] **Step 8: Create `test/unit/project.service.spec.ts`**

```typescript
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
```

- [ ] **Step 9: Run ProjectService unit tests**

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/backend
npx jest --config jest.config.ts --selectProjects unit --testPathPattern project.service.spec.ts --verbose
```

기대 결과 / Expected: All tests pass.

---

## Task 4: TaskService Unit Tests

파일 경로 / File path: `backend/test/unit/task.service.spec.ts`

- [ ] **Step 10: Create `test/unit/task.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { TaskService } from '@/task/task.service';
import { PrismaService } from '@/prisma/prisma.service';

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

describe('TaskService', () => {
  let service: TaskService;
  let prismaMock: PrismaServiceMock;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: PrismaService, useValue: prismaMock },
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
      prismaMock.projectMember.findUnique.mockResolvedValue(mockMember);
      prismaMock.task.create.mockResolvedValue(mockTask);

      const dto = { title: 'Test Task' };
      const result = await service.create(PROJECT_ID, dto, USER_ID);

      expect(prismaMock.projectMember.findUnique).toHaveBeenCalledWith({
        where: { userId_projectId: { userId: USER_ID, projectId: PROJECT_ID } },
      });
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
      prismaMock.projectMember.findUnique.mockResolvedValue(mockMember);
      prismaMock.task.create.mockResolvedValue(mockTask);

      const dueDateStr = '2026-12-31';
      await service.create(PROJECT_ID, { title: 'Task', dueDate: dueDateStr }, USER_ID);

      const createCall = prismaMock.task.create.mock.calls[0][0];
      expect(createCall.data.dueDate).toBeInstanceOf(Date);
    });

    it('프로젝트 멤버가 아니면 ForbiddenException을 던진다', async () => {
      // should throw ForbiddenException when user is not a project member
      prismaMock.projectMember.findUnique.mockResolvedValue(null);

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
      prismaMock.projectMember.findUnique.mockResolvedValue(mockMember);
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
      prismaMock.projectMember.findUnique.mockResolvedValue(mockMember);
      prismaMock.task.findMany.mockResolvedValue([]);

      await service.findByProject(PROJECT_ID, USER_ID, TaskStatus.TODO);

      const findCall = prismaMock.task.findMany.mock.calls[0][0];
      expect(findCall.where).toEqual({ projectId: PROJECT_ID, status: TaskStatus.TODO });
    });

    it('프로젝트 멤버가 아니면 ForbiddenException을 던진다', async () => {
      // should throw ForbiddenException when user is not a project member
      prismaMock.projectMember.findUnique.mockResolvedValue(null);

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
      prismaMock.projectMember.findUnique.mockResolvedValue(mockMember);

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
      prismaMock.projectMember.findUnique.mockResolvedValue(null);

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
      prismaMock.projectMember.findUnique.mockResolvedValue(mockMember);
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
      prismaMock.projectMember.findUnique.mockResolvedValue(null);

      await expect(
        service.update(TASK_ID, { title: 'x' }, 'outsider-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('status를 DONE으로 변경한다', async () => {
      // should update task status to DONE
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      prismaMock.projectMember.findUnique.mockResolvedValue(mockMember);
      prismaMock.task.update.mockResolvedValue({ ...mockTask, status: TaskStatus.DONE });

      const result = await service.update(TASK_ID, { status: TaskStatus.DONE }, USER_ID);

      const updateCall = prismaMock.task.update.mock.calls[0][0];
      expect(updateCall.data.status).toBe(TaskStatus.DONE);
      expect(result.status).toBe(TaskStatus.DONE);
    });

    it('dueDate를 null로 설정할 수 있다', async () => {
      // should allow setting dueDate to null
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      prismaMock.projectMember.findUnique.mockResolvedValue(mockMember);
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
      prismaMock.projectMember.findUnique.mockResolvedValue(mockMember);
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
      prismaMock.projectMember.findUnique.mockResolvedValue(null);

      await expect(service.remove(TASK_ID, 'outsider-id')).rejects.toThrow(ForbiddenException);
    });
  });
});
```

- [ ] **Step 11: Run TaskService unit tests**

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/backend
npx jest --config jest.config.ts --selectProjects unit --testPathPattern task.service.spec.ts --verbose
```

기대 결과 / Expected: All tests pass.

---

## Task 5: CommentService Unit Tests

파일 경로 / File path: `backend/test/unit/comment.service.spec.ts`

- [ ] **Step 12: Create `test/unit/comment.service.spec.ts`**

```typescript
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
```

- [ ] **Step 13: Run all unit tests**

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/backend
npx jest --config jest.config.ts --selectProjects unit --verbose
```

기대 결과 / Expected: All unit tests pass (approx. 30+ tests).

---

## Task 6: E2E Test Setup

E2E 테스트는 실제 TestingModule과 supertest를 사용하며, 테스트 전용 DB를 사용한다.
E2E tests use real TestingModule with supertest and a dedicated test database.

**사전 요구사항 / Prerequisites:**
- `.env`에 `TEST_DATABASE_URL`이 정의되어 있어야 한다 (기존 DB와 별개)
- `TEST_DATABASE_URL` must be defined in `.env` (separate from production DB)
- 예시 / Example: `TEST_DATABASE_URL=postgresql://postgres:password@localhost:5432/taskflow_test`

- [ ] **Step 14: Create `test/helpers/jwt.helper.ts`**

파일 경로 / File path: `backend/test/helpers/jwt.helper.ts`

```typescript
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
```

- [ ] **Step 15: Create `test/helpers/test-setup.ts`**

파일 경로 / File path: `backend/test/helpers/test-setup.ts`

```typescript
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as cookieParser from 'cookie-parser';
import { PrismaService } from '@/prisma/prisma.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@/auth/auth.module';
import { ProjectModule } from '@/project/project.module';
import { TaskModule } from '@/task/task.module';
import { CommentModule } from '@/comment/comment.module';
import { getTestJwtSecret } from './jwt.helper';

// 테스트 앱 빌드 및 초기화
// Build and initialize test application
export async function buildTestApp(): Promise<{
  app: INestApplication;
  prisma: PrismaService;
}> {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      // 테스트 환경 변수 설정
      // Test environment variable configuration
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '../.env',
        // 테스트용 DATABASE_URL 오버라이드
        // Override DATABASE_URL for tests
      }),
      PrismaModule,
      PassportModule.register({ defaultStrategy: 'jwt' }),
      // 테스트용 JWT 시크릿으로 JwtModule 구성
      // Configure JwtModule with test JWT secret
      JwtModule.registerAsync({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          secret: config.get<string>('JWT_SECRET') ?? getTestJwtSecret(),
          signOptions: { expiresIn: '1h' },
        }),
      }),
      AuthModule,
      ProjectModule,
      TaskModule,
      CommentModule,
    ],
  })
    .overrideProvider(ConfigService)
    .useValue({
      get: (key: string) => {
        const testConfig: Record<string, string> = {
          JWT_SECRET: getTestJwtSecret(),
          JWT_EXPIRES_IN: '1h',
          JWT_REFRESH_SECRET: 'test-refresh-secret',
          JWT_REFRESH_EXPIRES_IN: '7d',
          DATABASE_URL: process.env['TEST_DATABASE_URL'] ?? process.env['DATABASE_URL'] ?? '',
          FRONTEND_URL: 'http://localhost:3000',
        };
        return testConfig[key];
      },
      getOrThrow: (key: string) => {
        const testConfig: Record<string, string> = {
          JWT_SECRET: getTestJwtSecret(),
          JWT_EXPIRES_IN: '1h',
          JWT_REFRESH_SECRET: 'test-refresh-secret',
          JWT_REFRESH_EXPIRES_IN: '7d',
          DATABASE_URL: process.env['TEST_DATABASE_URL'] ?? process.env['DATABASE_URL'] ?? '',
          FRONTEND_URL: 'http://localhost:3000',
        };
        const value = testConfig[key];
        if (value === undefined) {
          throw new Error(`Config key "${key}" not found in test config`);
        }
        return value;
      },
    })
    .compile();

  const app = moduleRef.createNestApplication();

  // 전역 ValidationPipe 설정 (실제 앱과 동일하게)
  // Global ValidationPipe (same as real app)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 쿠키 파서 설정
  // Cookie parser setup
  app.use(cookieParser());

  await app.init();

  const prisma = moduleRef.get<PrismaService>(PrismaService);

  return { app, prisma };
}

// E2E 테스트 전 DB 데이터 정리
// Clean DB data before E2E tests
export async function cleanDatabase(prisma: PrismaService): Promise<void> {
  // 외래키 의존 순서에 맞게 삭제
  // Delete in order respecting foreign key dependencies
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
}

// 테스트용 유저 생성
// Create test user
export async function createTestUser(
  prisma: PrismaService,
  overrides: Partial<{
    id: string;
    email: string;
    name: string;
    googleId: string;
    avatarUrl: string | null;
  }> = {},
) {
  return prisma.user.create({
    data: {
      email: overrides.email ?? 'testuser@example.com',
      name: overrides.name ?? 'Test User',
      googleId: overrides.googleId ?? 'google-test-001',
      avatarUrl: overrides.avatarUrl ?? null,
    },
  });
}

// 테스트용 프로젝트 생성 (유저를 OWNER로 추가)
// Create test project (add user as OWNER)
export async function createTestProject(
  prisma: PrismaService,
  userId: string,
  overrides: Partial<{ name: string; description: string; color: string }> = {},
) {
  return prisma.project.create({
    data: {
      name: overrides.name ?? 'Test Project',
      description: overrides.description ?? null,
      color: overrides.color ?? '#005ea1',
      members: {
        create: { userId, role: 'OWNER' },
      },
    },
    include: {
      members: true,
    },
  });
}

// 테스트용 태스크 생성
// Create test task
export async function createTestTask(
  prisma: PrismaService,
  projectId: string,
  creatorId: string,
  overrides: Partial<{ title: string; description: string }> = {},
) {
  return prisma.task.create({
    data: {
      title: overrides.title ?? 'Test Task',
      description: overrides.description ?? null,
      projectId,
      creatorId,
    },
  });
}
```

- [ ] **Step 16: Verify test helpers compile**

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/backend
npx tsc --noEmit --project tsconfig.json 2>&1 | head -30
```

TypeScript 에러가 없어야 한다 / Should show no TypeScript errors.

---

## Task 7: Project E2E Tests

- [ ] **Step 17: Create `test/e2e/project.e2e-spec.ts`**

파일 경로 / File path: `backend/test/e2e/project.e2e-spec.ts`

```typescript
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
```

- [ ] **Step 18: Run Project E2E tests**

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/backend
npx jest --config jest.config.ts --selectProjects e2e --testPathPattern project.e2e-spec.ts --verbose
```

기대 결과 / Expected: All project E2E tests pass.

---

## Task 8: Task E2E Tests

- [ ] **Step 19: Create `test/e2e/task.e2e-spec.ts`**

파일 경로 / File path: `backend/test/e2e/task.e2e-spec.ts`

```typescript
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
```

- [ ] **Step 20: Run Task E2E tests**

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/backend
npx jest --config jest.config.ts --selectProjects e2e --testPathPattern task.e2e-spec.ts --verbose
```

기대 결과 / Expected: All task E2E tests pass.

---

## Task 9: Comment E2E Tests

- [ ] **Step 21: Create `test/e2e/comment.e2e-spec.ts`**

파일 경로 / File path: `backend/test/e2e/comment.e2e-spec.ts`

```typescript
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
```

- [ ] **Step 22: Run Comment E2E tests**

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/backend
npx jest --config jest.config.ts --selectProjects e2e --testPathPattern comment.e2e-spec.ts --verbose
```

기대 결과 / Expected: All comment E2E tests pass.

---

## Final Verification

- [ ] **Step 23: Run all unit tests together**

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/backend
npx jest --config jest.config.ts --selectProjects unit --verbose
```

기대 결과 / Expected: 30+ tests all passing.

- [ ] **Step 24: Run all E2E tests together**

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/backend
npx jest --config jest.config.ts --selectProjects e2e --verbose
```

기대 결과 / Expected: 30+ E2E tests all passing.

- [ ] **Step 25: Run full test suite with coverage**

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/backend
npx jest --config jest.config.ts --coverage 2>&1 | tail -30
```

기대 결과 / Expected: Coverage report generated, all tests passing.

---

## Notes for Executors

### E2E 테스트 DB 설정 / E2E Test DB Setup

E2E 테스트를 실행하기 전에 `TEST_DATABASE_URL` 환경 변수가 설정되어 있어야 한다.
Before running E2E tests, `TEST_DATABASE_URL` environment variable must be set.

`.env` 파일에 추가 / Add to `.env` file:
```
TEST_DATABASE_URL=postgresql://postgres:password@localhost:5432/taskflow_test
```

그 후 테스트 DB에 스키마 적용 / Then apply schema to test DB:
```bash
cd /Users/dohee/Documents/workspace/project/taskflow/backend
DATABASE_URL=postgresql://postgres:password@localhost:5432/taskflow_test npx prisma db push
```

### jsonwebtoken 패키지 / jsonwebtoken package

`jwt.helper.ts`에서 `jsonwebtoken`을 직접 사용한다. 이미 `passport-jwt`의 의존성으로 설치되어 있으나, 타입 정의가 없으면 추가 설치가 필요할 수 있다.
`jwt.helper.ts` uses `jsonwebtoken` directly. It is already installed as a dependency of `passport-jwt`, but type definitions may need to be added if missing.

```bash
npm install --save-dev @types/jsonwebtoken
```

### 모의 객체 패턴 / Mock Pattern

유닛 테스트에서 PrismaService는 완전히 모의 처리된다. 실제 DB 연결 없이 서비스 로직만 테스트한다.
In unit tests, PrismaService is fully mocked. Only service logic is tested without real DB connection.

모든 Prisma 메서드는 `jest.fn()`으로 대체되며, 각 테스트에서 `.mockResolvedValue()` 또는 `.mockImplementation()`으로 반환값을 설정한다.
All Prisma methods are replaced with `jest.fn()`, and each test sets return values via `.mockResolvedValue()` or `.mockImplementation()`.
