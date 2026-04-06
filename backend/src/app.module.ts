import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { CommentModule } from './comment/comment.module';
import { SharedModule } from './shared/shared.module';

// 요청 제한 설정 상수
// Rate limit configuration constants
const THROTTLE_TTL_MS = 60000;
const THROTTLE_LIMIT = 20;

@Module({
  imports: [
    // 환경변수 설정 (모노레포 루트의 .env 사용)
    // Environment config (use .env from monorepo root)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    // 요청 속도 제한 (60초당 20회)
    // Rate limiting (20 requests per 60 seconds)
    ThrottlerModule.forRoot([{ ttl: THROTTLE_TTL_MS, limit: THROTTLE_LIMIT }]),
    PrismaModule,
    SharedModule,
    AuthModule,
    ProjectModule,
    TaskModule,
    CommentModule,
  ],
  providers: [
    // 전역 요청 속도 제한 가드
    // Global rate limit guard
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
