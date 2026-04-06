import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 쿠키 파서 미들웨어
  // Cookie parser middleware
  app.use(cookieParser());

  // 글로벌 유효성 검증 파이프
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS 설정
  // CORS configuration
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3100', 'http://localhost:80'],
    credentials: true,
  });

  const port = configService.get<number>('BACKEND_PORT', 4000);
  await app.listen(port);

  console.log(`[TaskFlow Backend] Running on port ${port}`);
}

bootstrap();
