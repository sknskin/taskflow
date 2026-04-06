import { Injectable, UnauthorizedException, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthResponseDto } from './dto/auth-response.dto';

// 인증 코드 만료 시간 (60초)
// Auth code expiry duration (60 seconds)
const AUTH_CODE_TTL_MS = 60 * 1000;

// 만료 코드 정리 주기 (5분)
// Expired code cleanup interval (5 minutes)
const AUTH_CODE_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

// Google 유저 정보 인터페이스
// Google user info interface
interface GoogleUserInfo {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

// 인증 코드 저장소 항목 타입
// Auth code store entry type
interface AuthCodeEntry {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

@Injectable()
export class AuthService implements OnModuleInit, OnModuleDestroy {
  // 일회용 인증 코드 저장소 (메모리)
  // One-time auth code store (in-memory)
  private readonly authCodes = new Map<string, AuthCodeEntry>();

  // 정리 타이머 참조
  // Cleanup timer reference
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    // 만료된 인증 코드를 주기적으로 정리
    // Periodically clean up expired auth codes
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [code, entry] of this.authCodes) {
        if (now > entry.expiresAt) {
          this.authCodes.delete(code);
        }
      }
    }, AUTH_CODE_CLEANUP_INTERVAL_MS);
  }

  onModuleDestroy() {
    // 모듈 종료 시 타이머 정리
    // Clean up timer on module destroy
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  // Google OAuth 로그인/회원가입 처리
  // Handle Google OAuth login/signup
  async handleGoogleLogin(googleUser: GoogleUserInfo): Promise<AuthResponseDto> {
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

  // 일회용 인증 코드 생성 (60초 만료)
  // Create one-time auth code (expires in 60 seconds)
  createAuthCode(accessToken: string, refreshToken: string): string {
    const code = crypto.randomUUID();
    this.authCodes.set(code, {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + AUTH_CODE_TTL_MS,
    });
    return code;
  }

  // 인증 코드를 토큰으로 교환 (일회용, 만료 시 null 반환)
  // Exchange auth code for tokens (one-time use, returns null if expired/invalid)
  exchangeAuthCode(code: string): { accessToken: string; refreshToken: string } | null {
    const entry = this.authCodes.get(code);
    if (!entry) {
      return null;
    }

    // 코드를 즉시 삭제하여 일회용 보장
    // Delete code immediately to ensure one-time use
    this.authCodes.delete(code);

    if (Date.now() > entry.expiresAt) {
      return null;
    }

    return {
      accessToken: entry.accessToken,
      refreshToken: entry.refreshToken,
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
    } catch (error) {
      // 이미 UnauthorizedException인 경우 그대로 전파
      // Re-throw UnauthorizedException as-is
      if (error instanceof UnauthorizedException) {
        throw error;
      }
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
