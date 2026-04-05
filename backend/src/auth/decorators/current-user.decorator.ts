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
