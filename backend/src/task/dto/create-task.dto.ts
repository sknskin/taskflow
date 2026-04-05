import { IsString, IsOptional, IsEnum, IsDateString, MaxLength } from 'class-validator';
import { TaskPriority } from '@prisma/client';

// 태스크 생성 DTO
// Create task DTO
export class CreateTaskDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;
}
