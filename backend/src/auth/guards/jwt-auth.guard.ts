import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// JWT 인증 가드
// JWT authentication guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
