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

// 테스트 환경 설정 맵
// Test environment configuration map
const TEST_CONFIG: Record<string, string> = {
  JWT_SECRET: getTestJwtSecret(),
  JWT_EXPIRES_IN: '1h',
  JWT_REFRESH_SECRET: 'test-refresh-secret',
  JWT_REFRESH_EXPIRES_IN: '7d',
  DATABASE_URL: process.env['TEST_DATABASE_URL'] ?? process.env['DATABASE_URL'] ?? '',
  FRONTEND_URL: 'http://localhost:3000',
  // Google OAuth 더미 값 (E2E 테스트에서 실제 사용하지 않음)
  // Google OAuth dummy values (not actually used in E2E tests)
  GOOGLE_CLIENT_ID: 'test-google-client-id',
  GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
  GOOGLE_CALLBACK_URL: 'http://localhost:4000/auth/google/callback',
};

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
      get: (key: string) => TEST_CONFIG[key],
      getOrThrow: (key: string) => {
        const value = TEST_CONFIG[key];
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
