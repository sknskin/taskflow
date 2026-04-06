import { Global, Module } from '@nestjs/common';
import { MembershipService } from './membership.service';

// 공유 모듈 (전역 등록)
// Shared module (globally registered)
@Global()
@Module({
  providers: [MembershipService],
  exports: [MembershipService],
})
export class SharedModule {}
