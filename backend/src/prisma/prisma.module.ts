import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// 글로벌 모듈로 등록하여 어디서든 PrismaService 주입 가능
// Register as global module so PrismaService can be injected anywhere
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
