import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// 알림 생성 페이로드 타입
// Notification creation payload type
interface CreateNotificationPayload {
  type: string;
  message: string;
  userId: string;
  taskId?: string;
  projectId?: string;
}

// 최근 알림 조회 개수 상수
// Constant for number of recent notifications to fetch
const NOTIFICATION_FETCH_LIMIT = 20;

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  // 알림 생성
  // Create notification
  async create(payload: CreateNotificationPayload) {
    return this.prisma.notification.create({ data: payload });
  }

  // 유저 알림 목록 조회 (최근 20개)
  // Get user notifications (recent 20)
  async findByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: NOTIFICATION_FETCH_LIMIT,
    });
  }

  // 읽지 않은 알림 수
  // Unread notification count
  async countUnread(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  // 알림 읽음 처리
  // Mark notification as read
  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  // 전체 읽음 처리
  // Mark all as read
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
