# Step 2: Prisma Schema & DB Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prisma ORM을 설정하고 TaskFlow의 핵심 데이터 모델(User, Project, Task, Comment, Attachment)을 정의한 뒤 DB에 반영한다.

**Architecture:** NestJS에 @Global() PrismaModule을 등록하여 모든 모듈에서 PrismaService를 주입받을 수 있게 한다. Prisma 스키마에 5개 모델과 관계를 정의하고, `prisma db push`로 PostgreSQL에 반영한다.

**Tech Stack:** Prisma ORM 6, PostgreSQL 16, NestJS 10, TypeScript strict

---

## File Structure

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `backend/prisma/schema.prisma` | 데이터 모델 정의 (User, Project, Task, Comment, Attachment) |
| Create | `backend/src/prisma/prisma.module.ts` | @Global() PrismaModule 등록 |
| Create | `backend/src/prisma/prisma.service.ts` | PrismaClient 래핑, 연결 생명주기 관리 |
| Modify | `backend/src/app.module.ts` | PrismaModule import 추가 |

---

### Task 1: Prisma 초기화 및 스키마 정의

**Files:**
- Create: `backend/prisma/schema.prisma`

- [ ] **Step 1: Prisma 초기화**

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/backend
npx prisma init --datasource-provider postgresql
```

Expected: `prisma/schema.prisma` 파일과 `.env` 참조가 생성됨

- [ ] **Step 2: schema.prisma에 전체 모델 정의**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 태스크 상태 열거형
// Task status enum
enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
}

// 태스크 우선순위 열거형
// Task priority enum
enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

// 프로젝트 멤버 역할 열거형
// Project member role enum
enum ProjectRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

// 사용자 모델
// User model
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  avatarUrl String?
  googleId  String?  @unique

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 관계: 프로젝트 멤버십
  // Relations: project memberships
  projectMembers ProjectMember[]
  // 관계: 담당 태스크
  // Relations: assigned tasks
  assignedTasks  Task[]          @relation("TaskAssignee")
  // 관계: 작성한 태스크
  // Relations: created tasks
  createdTasks   Task[]          @relation("TaskCreator")
  // 관계: 댓글
  // Relations: comments
  comments       Comment[]

  @@map("users")
}

// 프로젝트 모델
// Project model
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  color       String   @default("#005ea1")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 관계: 멤버
  // Relations: members
  members ProjectMember[]
  // 관계: 태스크
  // Relations: tasks
  tasks   Task[]

  @@map("projects")
}

// 프로젝트 멤버 (User-Project 다대다)
// Project member (User-Project many-to-many)
model ProjectMember {
  id   String      @id @default(cuid())
  role ProjectRole @default(MEMBER)

  userId    String
  projectId String

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  joinedAt DateTime @default(now())

  @@unique([userId, projectId])
  @@map("project_members")
}

// 태스크 모델
// Task model
model Task {
  id          String       @id @default(cuid())
  title       String
  description String?
  status      TaskStatus   @default(TODO)
  priority    TaskPriority @default(MEDIUM)
  dueDate     DateTime?
  position    Int          @default(0)

  projectId  String
  assigneeId String?
  creatorId  String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 관계
  // Relations
  project    Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee   User?        @relation("TaskAssignee", fields: [assigneeId], references: [id], onDelete: SetNull)
  creator    User         @relation("TaskCreator", fields: [creatorId], references: [id], onDelete: Cascade)
  comments   Comment[]
  attachments Attachment[]

  @@index([projectId])
  @@index([assigneeId])
  @@index([status])
  @@map("tasks")
}

// 댓글 모델
// Comment model
model Comment {
  id      String @id @default(cuid())
  content String

  taskId   String
  authorId String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 관계
  // Relations
  task   Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([taskId])
  @@map("comments")
}

// 첨부파일 모델
// Attachment model
model Attachment {
  id       String @id @default(cuid())
  fileName String
  fileUrl  String
  fileSize Int
  mimeType String

  taskId String

  createdAt DateTime @default(now())

  // 관계
  // Relations
  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([taskId])
  @@map("attachments")
}
```

- [ ] **Step 3: .env에 DATABASE_URL 확인**

`backend/.env` 파일에 아래 내용이 있는지 확인 (prisma init이 생성). 이미 루트 `.env`에 있으므로 심링크 또는 복사:

```
DATABASE_URL=postgresql://taskflow:taskflow_secret@localhost:5432/taskflow
```

Note: Docker 내에서는 `@db:5432`, 로컬 개발에서는 `@localhost:5432` 사용

---

### Task 2: PrismaService 생성

**Files:**
- Create: `backend/src/prisma/prisma.service.ts`

- [ ] **Step 1: prisma 디렉토리 생성**

```bash
mkdir -p /Users/dohee/Documents/workspace/project/taskflow/backend/src/prisma
```

- [ ] **Step 2: PrismaService 작성**

```typescript
// backend/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // 모듈 초기화 시 DB 연결
  // Connect to DB on module init
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  // 모듈 종료 시 DB 연결 해제
  // Disconnect from DB on module destroy
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
```

---

### Task 3: PrismaModule 생성

**Files:**
- Create: `backend/src/prisma/prisma.module.ts`

- [ ] **Step 1: PrismaModule 작성**

```typescript
// backend/src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// 글로벌 모듈로 등록하여 어디서든 PrismaService 주입 가능
// Register as global module so PrismaService can be injected anywhere
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

---

### Task 4: AppModule에 PrismaModule 등록

**Files:**
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: AppModule 수정**

```typescript
// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // 환경변수 설정 (모노레포 루트의 .env 사용)
    // Environment config (use .env from monorepo root)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    PrismaModule,
  ],
})
export class AppModule {}
```

---

### Task 5: Prisma Client 생성 및 DB 반영

- [ ] **Step 1: Prisma Client 생성**

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/backend
npx prisma generate
```

Expected: `@prisma/client`가 정상 생성됨

- [ ] **Step 2: PostgreSQL 기동 (Docker)**

```bash
cd /Users/dohee/Documents/workspace/project/taskflow
docker compose up -d db
```

Expected: PostgreSQL 컨테이너가 healthy 상태로 기동됨

- [ ] **Step 3: DB에 스키마 반영**

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/backend
npx prisma db push
```

Expected: 6개 테이블(users, projects, project_members, tasks, comments, attachments)이 생성됨

- [ ] **Step 4: 빌드 검증**

```bash
cd /Users/dohee/Documents/workspace/project/taskflow/backend
npm run build
```

Expected: 컴파일 에러 없이 빌드 성공

- [ ] **Step 5: DB 컨테이너 정리**

```bash
cd /Users/dohee/Documents/workspace/project/taskflow
docker compose down
```
