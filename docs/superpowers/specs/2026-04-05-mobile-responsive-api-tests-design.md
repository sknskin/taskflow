# TaskFlow: 모바일 반응형 + API 완성 + 테스트 설계

> 작성일: 2026-04-05

## 1. 모바일 반응형 (하이브리드 네비게이션)

### 브레이크포인트 전략
- `<lg` (< 1024px): 모바일 레이아웃
- `>=lg` (>= 1024px): 데스크톱 레이아웃 (기존 유지)

### AppShell 변경
- 데스크톱: 고정 사이드바 256px + `ml-64` 메인 영역
- 모바일: 사이드바 숨김, `ml-0`, 상단 햄버거 + 하단 탭 바

### 모바일 하단 탭 바 (BottomTabBar)
- 3개 항목: 대시보드, + 새 태스크(FAB 스타일), 보드
- 모바일에서만 표시 (`lg:hidden`)
- 기존 FloatingActionButton 제거 → 하단 탭의 + 버튼으로 통합

### 모바일 상단 바 변경 (TopNav)
- 모바일: 좌측 햄버거 버튼 추가, 검색바 축소(아이콘화)
- 데스크톱: 기존 유지

### 햄버거 드로어 (MobileDrawer)
- 기존 Sidebar 메뉴 항목 재사용
- 오버레이(fade) + 좌측 슬라이드 애니메이션 (transform + transition 300ms ease-out)
- 바깥 클릭/스와이프로 닫기

### 모션/애니메이션 원칙
- 모든 전환: `transition` 기반, 최소 200ms ~ 최대 400ms
- 드로어: `translateX(-100%) → 0` + 오버레이 opacity fade (300ms ease-out)
- 바텀 시트: `translateY(100%) → 0` (300ms cubic-bezier(0.32, 0.72, 0, 1))
- 탭 전환: opacity crossfade (200ms)
- 카드 호버/터치: `scale(1.02)` + shadow 확대 (150ms)
- `prefers-reduced-motion: reduce` 미디어쿼리 대응

### TaskDetailPanel 모바일 대응
- 데스크톱: 기존 사이드 패널 (`w-[600px]` → `max-w-[600px] w-full`)
- 모바일: 바텀 시트 (하단에서 올라옴, 드래그 핸들, 70% 높이)

### 페이지별 반응형
- KanbanBoard: 모바일에서 가로 스크롤 또는 단일 컬럼 뷰
- CalendarView: FullCalendar 자체 반응형 (listWeek 뷰 모바일 기본)
- Dashboard: 기존 그리드 반응형 유지 (이미 양호)

## 2. 프로젝트 페이지 (카드 그리드)

### 레이아웃
- 헤더: 타이틀 + 프로젝트 수 + "새 프로젝트" 버튼
- 그리드: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- 프로젝트 카드: 색상 왼쪽 보더, 이름, 설명, 태스크 수(진행/마감), 멤버 아바타, 진행률 바

### 프로젝트 생성 모달 (CreateProjectModal)
- 이름 (필수, max 100자)
- 설명 (선택, max 500자)
- 색상 선택 (프리셋 6~8색)
- API: `POST /projects`

### 프로젝트 카드 액션
- 클릭 → 해당 프로젝트 보드 페이지로 이동 (query param으로 projectId 전달)
- 더보기 메뉴: 수정, 삭제
- API: `GET /projects`, `PATCH /projects/:id`, `DELETE /projects/:id`

## 3. 설정 페이지

### 섹션 구성
1. **프로필**: Google 아바타, 이름, 이메일 (읽기 전용)
2. **알림 설정**: 이메일 알림 토글 (UI만, 로컬 상태)
3. **테마**: 다크/라이트 모드 토글
4. **계정**: 로그아웃 버튼

### 데이터
- 프로필: `GET /auth/me`에서 가져옴 (이미 AuthProvider에서 로드)
- 테마: localStorage 저장
- 알림: localStorage 저장 (백엔드 미구현)

## 4. API 연동 완성

### ActivityFeed 실데이터 전환
- mock `DEMO_ACTIVITIES` 제거
- 전체 프로젝트의 최근 태스크를 시간순 정렬하여 "최근 활동"으로 표시
- 이미 DashboardView에서 전체 태스크를 fetch하고 있으므로 props로 전달

## 5. 테스트 전략

### 유닛 테스트 (Service 레이어)
- `project.service.spec.ts`: CRUD 5개 메서드
- `task.service.spec.ts`: CRUD 5개 메서드
- `comment.service.spec.ts`: CRUD 3개 메서드
- `auth.service.spec.ts`: Google 로그인, 토큰 갱신, 프로필 조회
- PrismaService mock 사용

### E2E 테스트 (Controller 레이어)
- `auth.e2e-spec.ts`: 인증 흐름
- `project.e2e-spec.ts`: 프로젝트 CRUD 전체 흐름
- `task.e2e-spec.ts`: 태스크 CRUD + 프로젝트 연동
- `comment.e2e-spec.ts`: 댓글 CRUD + 권한 검증
- 테스트 DB: Docker PostgreSQL (별도 test DB)
- JWT mock: 테스트용 토큰 생성 유틸리티

### 테스트 환경
- Jest (NestJS 기본)
- `@nestjs/testing` TestingModule
- E2E: `supertest` + 실제 DB
