import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Google OAuth 인증 가드
// Google OAuth authentication guard
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
