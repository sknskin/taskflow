import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MembershipService } from '../shared/membership.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membershipService: MembershipService,
  ) {}

  // 프로젝트 생성 (생성자를 OWNER로 자동 추가)
  // Create project (auto-add creator as OWNER)
  async create(dto: CreateProjectDto, userId: string) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
      },
    });
  }

  // 내 프로젝트 목록 조회
  // List my projects
  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // 프로젝트 상세 조회
  // Get project detail
  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
        _count: { select: { tasks: true } },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // 멤버 여부 확인
    // Check membership
    const isMember = project.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('Not a member of this project');
    }

    return project;
  }

  // 프로젝트 수정
  // Update project
  async update(id: string, dto: UpdateProjectDto, userId: string) {
    await this.membershipService.verifyOwnership(id, userId);

    return this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.color !== undefined && { color: dto.color }),
      },
    });
  }

  // 프로젝트 삭제
  // Delete project
  async remove(id: string, userId: string) {
    await this.membershipService.verifyOwnership(id, userId);

    return this.prisma.project.delete({ where: { id } });
  }
}
