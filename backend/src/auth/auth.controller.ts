import { Controller, Get, Post, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
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
