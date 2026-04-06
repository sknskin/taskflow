import { Controller, Get, Post, Req, Res, Body, UseGuards, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  REFRESH_TOKEN_COOKIE,
  REFRESH_COOKIE_MAX_AGE,
} from './constants';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

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

    // Refresh token 생성
    // Generate refresh token
    const refreshToken = this.authService.generateRefreshToken(
      authResponse.user.id,
      authResponse.user.email,
    );

    // 일회용 인증 코드 생성 (토큰을 URL에 직접 노출하지 않음)
    // Create one-time auth code (avoids exposing tokens in URL)
    const code = this.authService.createAuthCode(authResponse.accessToken, refreshToken);

    // 프론트엔드로 인증 코드와 함께 리다이렉트
    // Redirect to frontend with auth code
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    res.redirect(`${frontendUrl}/auth/callback?code=${code}`);
  }

  // 인증 코드를 토큰으로 교환
  // Exchange auth code for tokens
  @Post('exchange')
  async exchangeCode(
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = this.authService.exchangeAuthCode(code);
    if (!result) {
      throw new UnauthorizedException('Invalid or expired auth code');
    }

    // Refresh token을 httpOnly 쿠키에 설정
    // Set refresh token in httpOnly cookie
    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_COOKIE_MAX_AGE,
      path: '/',
    });

    return { accessToken: result.accessToken };
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
      throw new UnauthorizedException('No refresh token');
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
