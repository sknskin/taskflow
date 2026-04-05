// 사용자 타입
// User type
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

// 인증 상태 타입
// Auth state type
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

// 태스크 상태 열거형
// Task status enum
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

// 태스크 우선순위 열거형
// Task priority enum
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// 프로젝트 타입
// Project type
export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
  members: ProjectMember[];
  _count?: { tasks: number };
}

// 프로젝트 멤버 타입
// Project member type
export interface ProjectMember {
  id: string;
  role: string;
  userId: string;
  projectId: string;
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

// 태스크 타입
// Task type
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  position: number;
  projectId: string;
  assigneeId: string | null;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  assignee?: Pick<User, 'id' | 'name' | 'avatarUrl'> | null;
  creator?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  project?: Pick<Project, 'id' | 'name'>;
  comments?: Comment[];
  attachments?: Attachment[];
  _count?: { comments: number };
}

// 댓글 타입
// Comment type
export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

// 첨부파일 타입
// Attachment type
export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  taskId: string;
  createdAt: string;
}
