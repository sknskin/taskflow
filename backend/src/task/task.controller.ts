import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

// 허용된 태스크 상태값 목록
// Allowed task status values
const VALID_TASK_STATUSES: string[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

@Controller()
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // 태스크 생성
  // Create task
  @Post('projects/:projectId/tasks')
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.taskService.create(projectId, dto, userId);
  }

  // 프로젝트별 태스크 목록
  // List tasks by project
  @Get('projects/:projectId/tasks')
  findByProject(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
  ) {
    // 유효한 상태값 검증 (유효하지 않은 값은 무시)
    // Validate status value (ignore invalid values)
    const validatedStatus =
      status && VALID_TASK_STATUSES.includes(status) ? (status as TaskStatus) : undefined;
    return this.taskService.findByProject(projectId, userId, validatedStatus);
  }

  // 내 전체 태스크 조회 (모든 프로젝트) — :id 라우트보다 먼저 선언해야 함
  // Get all my tasks across projects — must be declared before :id route
  @Get('tasks/mine')
  findAllMine(@CurrentUser('id') userId: string) {
    return this.taskService.findAllMine(userId);
  }

  // 태스크 상세
  // Get task detail
  @Get('tasks/:id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.taskService.findOne(id, userId);
  }

  // 태스크 수정
  // Update task
  @Patch('tasks/:id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser('id') userId: string) {
    return this.taskService.update(id, dto, userId);
  }

  // 태스크 삭제
  // Delete task
  @Delete('tasks/:id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.taskService.remove(id, userId);
  }
}
