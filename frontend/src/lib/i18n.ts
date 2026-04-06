// 지원 언어 타입
// Supported language type
export type Locale = 'ko' | 'en';

// 번역 사전
// Translation dictionary
export const translations = {
  en: {
    // 공통
    // Common
    'common.save': 'Save Changes',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.create': 'Create',
    'common.edit': 'Edit',
    'common.search': 'Search tasks, people, or projects...',
    'common.loading': 'Loading...',
    'common.noData': 'No data',

    // 네비게이션
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.projects': 'My Projects',
    'nav.calendar': 'Calendar',
    'nav.board': 'Board',
    'nav.settings': 'Settings',
    'nav.newProject': 'New Project',

    // 대시보드
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.tasksInProgress': 'tasks in progress for today.',
    'dashboard.totalProjects': 'Active Projects',
    'dashboard.inProgress': 'In Progress',
    'dashboard.workingNow': 'Working Now',
    'dashboard.overdue': 'Overdue',
    'dashboard.needsAttention': 'Needs Attention',
    'dashboard.completed': 'Completed',
    'dashboard.doneToday': 'Done Today',
    'dashboard.activity': 'Activity',
    'dashboard.myTasks': 'My Tasks',
    'dashboard.upNext': 'Up Next',
    'dashboard.activeTasks': 'Active Tasks',
    'dashboard.noDueTasks': 'No upcoming due tasks',

    // 프로젝트
    // Projects
    'projects.title': 'My Projects',
    'projects.inWorkspace': 'in your workspace',
    'projects.newProject': 'New Project',
    'projects.noProjects': 'No projects yet',
    'projects.createFirst': 'Create your first project to get started.',
    'projects.createProject': 'Create Project',
    'projects.editProject': 'Edit Project',
    'projects.deleteProject': 'Delete Project',
    'projects.deleteConfirm': 'Are you sure you want to delete',
    'projects.deleteWarning': 'This action cannot be undone.',
    'projects.projectName': 'Project Name',
    'projects.description': 'Description',
    'projects.optional': 'optional',
    'projects.color': 'Color',
    'projects.tasks': 'tasks',
    'projects.overdue': 'overdue',
    'projects.complete': 'complete',

    // 설정
    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your account and preferences.',
    'settings.profile': 'Profile',
    'settings.signedInWithGoogle': 'Signed in with Google · Read-only',
    'settings.notifications': 'Notifications',
    'settings.emailNotifications': 'Email Notifications',
    'settings.emailDesc': 'Receive email updates about task activity.',
    'settings.theme': 'Theme',
    'settings.darkMode': 'Dark Mode',
    'settings.darkModeDesc': 'Switch between light and dark appearance.',
    'settings.language': 'Language',
    'settings.languageToggle': 'Language',
    'settings.languageDesc': 'Switch between Korean and English.',
    'settings.account': 'Account',
    'settings.signOut': 'Sign Out',
    'settings.signOutDesc': 'You will be redirected to the login page.',
    'settings.signingOut': 'Signing out...',

    // 태스크
    // Tasks
    'task.status': 'Status',
    'task.priority': 'Priority',
    'task.assignee': 'Assignee',
    'task.unassigned': 'Unassigned',
    'task.dueDate': 'Due Date',
    'task.description': 'Description',
    'task.descPlaceholder': 'Describe the task and key deliverables...',
    'task.attachments': 'Attachments',
    'task.comments': 'Comments',
    'task.addComment': 'Add a comment...',
    'task.deleteTask': 'Delete Task',
    'task.discard': 'Discard',
    'task.saving': 'Saving...',
    'task.daysOverdue': 'days overdue',
    'task.dueToday': 'Due today',
    'task.daysRemaining': 'days remaining',

    // 칸반
    // Kanban
    'kanban.selectProject': 'Select a Project',
    'kanban.createToStart': 'Create a project to get started',
    'kanban.todo': 'Todo',
    'kanban.inProgress': 'In Progress',
    'kanban.inReview': 'In Review',
    'kanban.done': 'Done',

    // 로그인
    // Login
    'login.title': 'Welcome to TaskFlow',
    'login.subtitle': 'Sign in to manage your tasks and projects.',
    'login.google': 'Continue with Google',
  },
  ko: {
    'common.save': '변경사항 저장',
    'common.cancel': '취소',
    'common.delete': '삭제',
    'common.create': '생성',
    'common.edit': '수정',
    'common.search': '태스크, 사람, 프로젝트 검색...',
    'common.loading': '로딩 중...',
    'common.noData': '데이터 없음',

    'nav.dashboard': '대시보드',
    'nav.projects': '내 프로젝트',
    'nav.calendar': '캘린더',
    'nav.board': '보드',
    'nav.settings': '설정',
    'nav.newProject': '새 프로젝트',

    'dashboard.welcome': '돌아오셨군요',
    'dashboard.tasksInProgress': '개 태스크가 진행 중입니다.',
    'dashboard.totalProjects': '활성 프로젝트',
    'dashboard.inProgress': '진행 중',
    'dashboard.workingNow': '작업 중',
    'dashboard.overdue': '마감 초과',
    'dashboard.needsAttention': '확인 필요',
    'dashboard.completed': '완료',
    'dashboard.doneToday': '오늘 완료',
    'dashboard.activity': '활동',
    'dashboard.myTasks': '내 태스크',
    'dashboard.upNext': '다음 일정',
    'dashboard.activeTasks': '활성 태스크',
    'dashboard.noDueTasks': '예정된 마감 태스크 없음',

    'projects.title': '내 프로젝트',
    'projects.inWorkspace': '워크스페이스',
    'projects.newProject': '새 프로젝트',
    'projects.noProjects': '프로젝트가 없습니다',
    'projects.createFirst': '첫 프로젝트를 만들어 시작하세요.',
    'projects.createProject': '프로젝트 생성',
    'projects.editProject': '프로젝트 수정',
    'projects.deleteProject': '프로젝트 삭제',
    'projects.deleteConfirm': '정말 삭제하시겠습니까?',
    'projects.deleteWarning': '이 작업은 되돌릴 수 없습니다.',
    'projects.projectName': '프로젝트 이름',
    'projects.description': '설명',
    'projects.optional': '선택사항',
    'projects.color': '색상',
    'projects.tasks': '태스크',
    'projects.overdue': '마감 초과',
    'projects.complete': '완료',

    'settings.title': '설정',
    'settings.subtitle': '계정 및 환경설정을 관리합니다.',
    'settings.profile': '프로필',
    'settings.signedInWithGoogle': 'Google 계정으로 로그인 · 읽기 전용',
    'settings.notifications': '알림',
    'settings.emailNotifications': '이메일 알림',
    'settings.emailDesc': '태스크 활동에 대한 이메일 알림을 받습니다.',
    'settings.theme': '테마',
    'settings.darkMode': '다크 모드',
    'settings.darkModeDesc': '라이트/다크 모드를 전환합니다.',
    'settings.language': '언어',
    'settings.languageToggle': '언어',
    'settings.languageDesc': '한국어/영어를 전환합니다.',
    'settings.account': '계정',
    'settings.signOut': '로그아웃',
    'settings.signOutDesc': '로그인 페이지로 이동합니다.',
    'settings.signingOut': '로그아웃 중...',

    'task.status': '상태',
    'task.priority': '우선순위',
    'task.assignee': '담당자',
    'task.unassigned': '미지정',
    'task.dueDate': '마감일',
    'task.description': '설명',
    'task.descPlaceholder': '태스크와 핵심 결과물을 설명하세요...',
    'task.attachments': '첨부파일',
    'task.comments': '댓글',
    'task.addComment': '댓글을 입력하세요...',
    'task.deleteTask': '태스크 삭제',
    'task.discard': '취소',
    'task.saving': '저장 중...',
    'task.daysOverdue': '일 초과',
    'task.dueToday': '오늘 마감',
    'task.daysRemaining': '일 남음',

    'kanban.selectProject': '프로젝트를 선택하세요',
    'kanban.createToStart': '프로젝트를 만들어 시작하세요',
    'kanban.todo': '할 일',
    'kanban.inProgress': '진행 중',
    'kanban.inReview': '검토 중',
    'kanban.done': '완료',

    'login.title': 'TaskFlow에 오신 것을 환영합니다',
    'login.subtitle': '태스크와 프로젝트를 관리하려면 로그인하세요.',
    'login.google': 'Google로 계속하기',
  },
} as const;

// 번역 키 타입 (en 키 기준으로 추론)
// Translation key type (inferred from en keys)
export type TranslationKey = keyof typeof translations.en;

// 번역 함수
// Translation function
export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] ?? key;
}
