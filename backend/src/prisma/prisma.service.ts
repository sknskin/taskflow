import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // 모듈 초기화 시 DB 연결
  // Connect to DB on module init
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  // 모듈 종료 시 DB 연결 해제
  // Disconnect from DB on module destroy
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
