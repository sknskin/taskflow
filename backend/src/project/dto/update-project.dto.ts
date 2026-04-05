import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

// 프로젝트 수정 DTO
// Update project DTO
export class UpdateProjectDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;
}
