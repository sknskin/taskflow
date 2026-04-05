import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // 댓글 작성
  // Create comment
  @Post('tasks/:taskId/comments')
  create(
    @Param('taskId') taskId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.commentService.create(taskId, dto, userId);
  }

  // 태스크별 댓글 목록
  // List comments by task
  @Get('tasks/:taskId/comments')
  findByTask(@Param('taskId') taskId: string, @CurrentUser('id') userId: string) {
    return this.commentService.findByTask(taskId, userId);
  }

  // 댓글 삭제
  // Delete comment
  @Delete('comments/:id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.commentService.remove(id, userId);
  }
}
