import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// 멤버십 검증 공유 서비스
// Shared service for membership verification
@Injectable()
export class MembershipService {
  constructor(private readonly prisma: PrismaService) {}

  // 프로젝트 멤버 여부 확인
  // Verify project membership
  async verifyMembership(projectId: string, userId: string) {
    const member = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (!member) {
      throw new ForbiddenException('Not a member of this project');
    }
    return member;
  }

  // OWNER 또는 ADMIN 권한 확인
  // Verify OWNER or ADMIN permission
  async verifyOwnership(projectId: string, userId: string) {
    const member = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }
}
