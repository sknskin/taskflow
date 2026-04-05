# Step 4: Task/Project/Comment CRUD API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development

**Goal:** Project, Task, Comment 3개 리소스의 CRUD REST API를 구현한다.

**Architecture:** NestJS 모듈 단위로 분리 (ProjectModule, TaskModule, CommentModule). 각 모듈은 Controller + Service + DTO로 구성. 모든 API는 JwtAuthGuard로 보호. Task는 프로젝트에 종속, Comment는 태스크에 종속.

**Tech Stack:** NestJS, Prisma, class-validator, class-transformer

---

## File Structure

### Project Module
| Action | Path |
|--------|------|
| Create | `backend/src/project/dto/create-project.dto.ts` |
| Create | `backend/src/project/dto/update-project.dto.ts` |
| Create | `backend/src/project/project.service.ts` |
| Create | `backend/src/project/project.controller.ts` |
| Create | `backend/src/project/project.module.ts` |

### Task Module
| Action | Path |
|--------|------|
| Create | `backend/src/task/dto/create-task.dto.ts` |
| Create | `backend/src/task/dto/update-task.dto.ts` |
| Create | `backend/src/task/task.service.ts` |
| Create | `backend/src/task/task.controller.ts` |
| Create | `backend/src/task/task.module.ts` |

### Comment Module
| Action | Path |
|--------|------|
| Create | `backend/src/comment/dto/create-comment.dto.ts` |
| Create | `backend/src/comment/comment.service.ts` |
| Create | `backend/src/comment/comment.controller.ts` |
| Create | `backend/src/comment/comment.module.ts` |

### App Module
| Action | Path |
|--------|------|
| Modify | `backend/src/app.module.ts` — ProjectModule, TaskModule, CommentModule import 추가 |

---

## API Endpoints

### Project
| Method | Path | Description |
|--------|------|-------------|
| POST | /projects | 프로젝트 생성 (자동으로 OWNER 멤버 추가) |
| GET | /projects | 내 프로젝트 목록 |
| GET | /projects/:id | 프로젝트 상세 (멤버 포함) |
| PATCH | /projects/:id | 프로젝트 수정 |
| DELETE | /projects/:id | 프로젝트 삭제 |

### Task
| Method | Path | Description |
|--------|------|-------------|
| POST | /projects/:projectId/tasks | 태스크 생성 |
| GET | /projects/:projectId/tasks | 태스크 목록 (status 필터링) |
| GET | /tasks/:id | 태스크 상세 (댓글, 첨부 포함) |
| PATCH | /tasks/:id | 태스크 수정 (status/priority/assignee 등) |
| DELETE | /tasks/:id | 태스크 삭제 |

### Comment
| Method | Path | Description |
|--------|------|-------------|
| POST | /tasks/:taskId/comments | 댓글 작성 |
| GET | /tasks/:taskId/comments | 댓글 목록 |
| DELETE | /comments/:id | 댓글 삭제 (작성자만) |
