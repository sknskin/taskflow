import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { NotificationModule } from '../notification/notification.module';

// 태스크 모듈
// Task module
@Module({
  imports: [NotificationModule],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
