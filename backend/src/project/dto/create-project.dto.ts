import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';

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

  // 6자리 HEX 색상 코드 형식 검증 (#RRGGBB)
  // Validate 6-digit HEX color code format (#RRGGBB)
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{6}$/)
  color?: string;
}
