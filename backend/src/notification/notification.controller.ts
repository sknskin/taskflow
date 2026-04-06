import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // 내 알림 목록
  // Get my notifications
  @Get()
  async findMine(@CurrentUser('id') userId: string) {
    const [notifications, unreadCount] = await Promise.all([
      this.notificationService.findByUser(userId),
      this.notificationService.countUnread(userId),
    ]);
    return { notifications, unreadCount };
  }

  // 전체 읽음 처리 (/:id/read 보다 먼저 등록해야 라우팅 충돌 없음)
  // Mark all as read (must be registered before /:id/read to avoid route conflict)
  @Patch('read-all')
  async markAllAsRead(@CurrentUser('id') userId: string) {
    await this.notificationService.markAllAsRead(userId);
    return { success: true };
  }

  // 알림 읽음 처리
  // Mark notification as read
  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.notificationService.markAsRead(id, userId);
    return { success: true };
  }
}
