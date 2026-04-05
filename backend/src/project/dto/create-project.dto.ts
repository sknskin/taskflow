import { IsString, IsOptional, MaxLength } from 'class-validator';

// 프로젝트 생성 DTO
// Create project DTO
export class CreateProjectDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;
}
