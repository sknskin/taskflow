import { IsString, MaxLength } from 'class-validator';

// 댓글 생성 DTO
// Create comment DTO
export class CreateCommentDto {
  @IsString()
  @MaxLength(2000)
  content!: string;
}
