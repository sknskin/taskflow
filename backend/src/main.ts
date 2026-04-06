import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 쿠키 파서 미들웨어
  // Cookie parser middleware
  app.use(cookieParser());

  // 보안 헤더 설정 (Helmet)
  // Security headers (Helmet)
  app.use(helmet());

  // 글로벌 유효성 검증 파이프
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS 설정 (환경변수에서 허용 출처 목록 로드)
  // CORS configuration (load allowed origins from env variable)
  const corsOrigins = configService.get<string>('CORS_ORIGINS')?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3100',
  ];
  app.enableCors({ origin: corsOrigins, credentials: true });

  const port = configService.get<number>('BACKEND_PORT', 4000);
  await app.listen(port);

  console.log(`[TaskFlow Backend] Running on port ${port}`);
}

bootstrap();
