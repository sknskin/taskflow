import { IsString, IsOptional, IsEnum, IsDateString, IsInt, MaxLength, Min, ValidateIf } from 'class-validator';
import { TaskStatus, TaskPriority } from '@prisma/client';

// 태스크 수정 DTO
// Update task DTO
export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ValidateIf((o) => o.dueDate !== null)
  @IsDateString()
  @IsOptional()
  dueDate?: string | null;

  @IsString()
  @IsOptional()
  assigneeId?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;
}
