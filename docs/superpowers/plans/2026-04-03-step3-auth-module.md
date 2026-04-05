# Step 3: NestJS Auth Module (JWT + Google OAuth) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** JWT 기반 인증(access token + refresh token httpOnly cookie) + Google OAuth 로그인을 구현한다.

**Architecture:** AuthModule이 JWT 발급/검증, Google OAuth 콜백을 담당. JwtStrategy + JwtAuthGuard로 API 보호. @CurrentUser() 커스텀 데코레이터로 인증된 유저 정보 접근. Refresh token은 httpOnly cookie로 관리.

**Tech Stack:** @nestjs/passport, @nestjs/jwt, passport-jwt, passport-google-oauth20, bcrypt

---

## File Structure

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `backend/src/auth/auth.module.ts` | Auth 모듈 등록 (JwtModule, PassportModule) |
| Create | `backend/src/auth/auth.service.ts` | 인증 비즈니스 로직 (토큰 발급, Google 유저 처리) |
| Create | `backend/src/auth/auth.controller.ts` | 인증 엔드포인트 (/auth/google, /auth/refresh, /auth/me, /auth/logout) |
| Create | `backend/src/auth/strategies/jwt.strategy.ts` | JWT 토큰 검증 전략 |
| Create | `backend/src/auth/strategies/google.strategy.ts` | Google OAuth 전략 |
| Create | `backend/src/auth/guards/jwt-auth.guard.ts` | JWT 인증 가드 |
| Create | `backend/src/auth/guards/google-auth.guard.ts` | Google OAuth 가드 |
| Create | `backend/src/auth/decorators/current-user.decorator.ts` | @CurrentUser() 파라미터 데코레이터 |
| Create | `backend/src/auth/dto/auth-response.dto.ts` | 인증 응답 DTO |
| Create | `backend/src/auth/constants.ts` | Auth 관련 상수 |
| Modify | `backend/src/app.module.ts` | AuthModule import 추가 |

---

### Task 1: Auth 상수 및 DTO 정의

**Files:**
- Create: `backend/src/auth/constants.ts`
- Create: `backend/src/auth/dto/auth-response.dto.ts`

- [ ] **Step 1: 디렉토리 구조 생성**

```bash
mkdir -p /Users/dohee/Documents/workspace/project/taskflow/backend/src/auth/{strategies,guards,decorators,dto}
```

- [ ] **Step 2: constants.ts 작성**

```typescript
// backend/src/auth/constants.ts

// 쿠키 이름 상수
// Cookie name constants
export const REFRESH_TOKEN_COOKIE = 'taskflow_refresh_token';

// 쿠키 옵션 상수
// Cookie option constants
export const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7일
// 7 days in milliseconds

// 프론트엔드 리다이렉트 URL
// Frontend redirect URL
export const FRONTEND_URL = 'http://localhost:3000';
```

- [ ] **Step 3: auth-response.dto.ts 작성**

```typescript
// backend/src/auth/dto/auth-response.dto.ts

// 인증 응답 DTO
// Auth response DTO
export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
}
```

---

### Task 2: JWT Strategy + Guard

**Files:**
- Create: `backend/src/auth/strategies/jwt.strategy.ts`
- Create: `backend/src/auth/guards/jwt-auth.guard.ts`

- [ ] **Step 1: jwt.strategy.ts 작성**

```typescript
// backend/src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

// JWT 페이로드 인터페이스
// JWT payload interface
interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // 토큰 검증 후 유저 조회
  // Validate token and find user
  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
```

- [ ] **Step 2: jwt-auth.guard.ts 작성**

```typescript
// backend/src/auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// JWT 인증 가드
// JWT authentication guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

---

### Task 3: Google OAuth Strategy + Guard

**Files:**
- Create: `backend/src/auth/strategies/google.strategy.ts`
- Create: `backend/src/auth/guards/google-auth.guard.ts`

- [ ] **Step 1: google.strategy.ts 작성**

```typescript
// backend/src/auth/strategies/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

// Google OAuth 프로필 인터페이스
// Google OAuth profile interface
interface GoogleProfile {
  id: string;
  emails: { value: string }[];
  displayName: string;
  photos: { value: string }[];
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  // Google 프로필에서 유저 정보 추출
  // Extract user info from Google profile
  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ): void {
    const user = {
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      avatarUrl: profile.photos[0]?.value ?? null,
    };

    done(null, user);
  }
}
```

- [ ] **Step 2: google-auth.guard.ts 작성**

```typescript
// backend/src/auth/guards/google-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Google OAuth 인증 가드
// Google OAuth authentication guard
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
```

---

### Task 4: @CurrentUser() 데코레이터

**Files:**
- Create: `backend/src/auth/decorators/current-user.decorator.ts`

- [ ] **Step 1: current-user.decorator.ts 작성**

```typescript
// backend/src/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// 인증된 유저 정보를 주입하는 파라미터 데코레이터
// Parameter decorator to inject authenticated user info
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    // 특정 필드만 요청한 경우
    // If a specific field is requested
    if (data && user) {
      return (user as Record<string, unknown>)[data];
    }

    return user;
  },
);
```

---

### Task 5: AuthService

**Files:**
- Create: `backend/src/auth/auth.service.ts`

- [ ] **Step 1: auth.service.ts 작성**

```typescript
// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthResponseDto } from './dto/auth-response.dto';

// Google 유저 정보 인터페이스
// Google user info interface
interface GoogleUserInfo {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // Google OAuth 로그인/회원가입 처리
  // Handle Google OAuth login/signup
  async handleGoogleLogin(googleUser: GoogleUserInfo): Promise<AuthResponseDto> {
    // 기존 유저 조회 또는 신규 생성
    // Find existing user or create new one
    const user = await this.prisma.user.upsert({
      where: { googleId: googleUser.googleId },
      update: {
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.avatarUrl,
      },
      create: {
        googleId: googleUser.googleId,
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.avatarUrl,
      },
    });

    const accessToken = this.generateAccessToken(user.id, user.email);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  // Refresh token으로 새 access token 발급
  // Issue new access token using refresh token
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify<{ sub: string; email: string }>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const accessToken = this.generateAccessToken(user.id, user.email);
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // 유저 정보 조회
  // Get user profile
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  // Access token 생성
  // Generate access token
  private generateAccessToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email },
      {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.configService.getOrThrow<string>('JWT_EXPIRES_IN'),
      },
    );
  }

  // Refresh token 생성
  // Generate refresh token
  generateRefreshToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN'),
      },
    );
  }
}
```

---

### Task 6: AuthController

**Files:**
- Create: `backend/src/auth/auth.controller.ts`

- [ ] **Step 1: auth.controller.ts 작성**

```typescript
// backend/src/auth/auth.controller.ts
import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  REFRESH_TOKEN_COOKIE,
  REFRESH_COOKIE_MAX_AGE,
  FRONTEND_URL,
} from './constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Google OAuth 로그인 시작
  // Start Google OAuth login
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin(): void {
    // Guard가 Google로 리다이렉트 처리
    // Guard handles redirect to Google
  }

  // Google OAuth 콜백 처리
  // Handle Google OAuth callback
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const googleUser = req.user as {
      googleId: string;
      email: string;
      name: string;
      avatarUrl: string | null;
    };

    const authResponse = await this.authService.handleGoogleLogin(googleUser);

    // Refresh token을 httpOnly 쿠키에 설정
    // Set refresh token in httpOnly cookie
    const refreshToken = this.authService.generateRefreshToken(
      authResponse.user.id,
      authResponse.user.email,
    );

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_COOKIE_MAX_AGE,
      path: '/',
    });

    // 프론트엔드로 access token과 함께 리다이렉트
    // Redirect to frontend with access token
    res.redirect(
      `${FRONTEND_URL}/auth/callback?token=${authResponse.accessToken}`,
    );
  }

  // Access token 갱신
  // Refresh access token
  @Post('refresh')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;

    if (!refreshToken) {
      res.status(401).json({ message: 'No refresh token' });
      return;
    }

    const result = await this.authService.refreshAccessToken(refreshToken);
    return result;
  }

  // 현재 유저 정보 조회
  // Get current user profile
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  // 로그아웃 (refresh token 쿠키 제거)
  // Logout (clear refresh token cookie)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
    return { message: 'Logged out successfully' };
  }
}
```

---

### Task 7: AuthModule + AppModule 등록

**Files:**
- Create: `backend/src/auth/auth.module.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: auth.module.ts 작성**

```typescript
// backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

// 인증 모듈
// Authentication module
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

- [ ] **Step 2: app.module.ts에 AuthModule 추가**

`backend/src/app.module.ts`의 imports 배열에 AuthModule을 추가. 기존 ConfigModule, PrismaModule 유지:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    PrismaModule,
    AuthModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 3: cookie-parser 설치 및 main.ts에 적용**

cookie-parser는 refresh token 쿠키 읽기에 필요. package.json에 추가:

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/backend
npm install cookie-parser
npm install -D @types/cookie-parser
```

main.ts에 cookie-parser 미들웨어 추가 (기존 코드 유지하며 추가):

```typescript
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
    origin: ['http://localhost:3000', 'http://localhost:80'],
    credentials: true,
  });

  const port = configService.get<number>('BACKEND_PORT', 4000);
  await app.listen(port);

  console.log(`[TaskFlow Backend] Running on port ${port}`);
}

bootstrap();
```

- [ ] **Step 4: 빌드 검증**

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/backend
npm run build
```

Expected: 컴파일 에러 없이 빌드 성공
