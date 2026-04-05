import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  // 태스크 생성
  // Create task
  async create(projectId: string, dto: CreateTaskDto, userId: string) {
    // 프로젝트 멤버 확인
    // Verify project membership
    await this.verifyMembership(projectId, userId);

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        assigneeId: dto.assigneeId,
        projectId,
        creatorId: userId,
      },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        creator: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  // 프로젝트별 태스크 목록 (status 필터링)
  // List tasks by project (with status filter)
  async findByProject(projectId: string, userId: string, status?: TaskStatus) {
    await this.verifyMembership(projectId, userId);

    return this.prisma.task.findMany({
      where: {
        projectId,
        ...(status && { status }),
      },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { comments: true } },
      },
      orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'desc' }],
    });
  }

  // 태스크 상세 조회 (댓글, 첨부 포함)
  // Get task detail (with comments, attachments)
  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        creator: { select: { id: true, name: true, avatarUrl: true } },
        comments: {
          include: { author: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'asc' },
        },
        attachments: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // 프로젝트 멤버 확인
    // Verify project membership
    await this.verifyMembership(task.projectId, userId);

    return task;
  }

  // 태스크 수정
  // Update task
  async update(id: string, dto: UpdateTaskDto, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.verifyMembership(task.projectId, userId);

    return this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.dueDate !== undefined && { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }),
        ...(dto.assigneeId !== undefined && { assigneeId: dto.assigneeId }),
        ...(dto.position !== undefined && { position: dto.position }),
      },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        creator: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  // 태스크 삭제
  // Delete task
  async remove(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.verifyMembership(task.projectId, userId);

    return this.prisma.task.delete({ where: { id } });
  }

  // 프로젝트 멤버 확인
  // Verify project membership
  private async verifyMembership(projectId: string, userId: string) {
    const member = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });

    if (!member) {
      throw new ForbiddenException('Not a member of this project');
    }
  }
}
