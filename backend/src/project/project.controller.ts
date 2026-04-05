import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // 프로젝트 생성
  // Create project
  @Post()
  create(@Body() dto: CreateProjectDto, @CurrentUser('id') userId: string) {
    return this.projectService.create(dto, userId);
  }

  // 내 프로젝트 목록
  // List my projects
  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.projectService.findAll(userId);
  }

  // 프로젝트 상세
  // Get project detail
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.projectService.findOne(id, userId);
  }

  // 프로젝트 수정
  // Update project
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto, @CurrentUser('id') userId: string) {
    return this.projectService.update(id, dto, userId);
  }

  // 프로젝트 삭제
  // Delete project
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.projectService.remove(id, userId);
  }
}
