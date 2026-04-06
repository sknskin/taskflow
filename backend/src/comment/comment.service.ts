import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MembershipService } from '../shared/membership.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membershipService: MembershipService,
  ) {}

  // 댓글 작성
  // Create comment
  async create(taskId: string, dto: CreateCommentDto, userId: string) {
    // 태스크 존재 및 프로젝트 멤버 확인
    // Verify task exists and user is project member
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.membershipService.verifyMembership(task.projectId, userId);

    return this.prisma.comment.create({
      data: {
        content: dto.content,
        taskId,
        authorId: userId,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  // 태스크별 댓글 목록
  // List comments by task
  async findByTask(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.membershipService.verifyMembership(task.projectId, userId);

    return this.prisma.comment.findMany({
      where: { taskId },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // 댓글 삭제 (작성자만)
  // Delete comment (author only)
  async remove(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // 작성자 확인
    // Verify author
    if (comment.authorId !== userId) {
      throw new ForbiddenException('Only the author can delete this comment');
    }

    return this.prisma.comment.delete({ where: { id } });
  }
}
