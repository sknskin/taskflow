import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

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
    @Query('status') status?: TaskStatus,
  ) {
    return this.taskService.findByProject(projectId, userId, status);
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
