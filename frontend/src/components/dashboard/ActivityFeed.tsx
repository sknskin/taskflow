'use client';

// 액티비티 항목 타입
// Activity item type
interface ActivityItem {
  id: string;
  userName: string;
  action: string;
  target: string;
  targetStyle: 'primary' | 'italic' | 'error';
  actionIcon: string;
  actionColor: string;
  timeAgo: string;
}

// 데모 액티비티 데이터 (추후 API 연동)
// Demo activity data (connect API later)
const DEMO_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    userName: 'Team Member',
    action: 'added a new file to',
    target: 'Project',
    targetStyle: 'primary',
    actionIcon: 'add',
    actionColor: 'bg-primary',
    timeAgo: 'Recently',
  },
  {
    id: '2',
    userName: 'Team Member',
    action: 'completed task',
    target: 'Task Update',
    targetStyle: 'italic',
    actionIcon: 'check',
    actionColor: 'bg-tertiary',
    timeAgo: '2 Hours Ago',
  },
  {
    id: '3',
    userName: 'Team Member',
    action: 'flagged',
    target: 'Overdue Task',
    targetStyle: 'error',
    actionIcon: 'priority_high',
    actionColor: 'bg-error',
    timeAgo: '4 Hours Ago',
  },
];

// 타겟 텍스트 스타일 클래스 맵
// Target text style class map
const TARGET_STYLE_CLASS: Record<ActivityItem['targetStyle'], string> = {
  primary: 'text-primary font-semibold',
  italic: 'italic text-on-surface-variant',
  error: 'text-error font-semibold',
};

// 액티비티 피드 컴포넌트
// Activity feed component
export function ActivityFeed() {
  return (
    <div className="col-span-12 lg:col-span-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight">Activity</h2>
        <span className="material-symbols-outlined text-on-surface-variant/40 cursor-pointer">
          more_horiz
        </span>
      </div>

      {/* 액티비티 목록 */}
      {/* Activity list */}
      <div className="bg-surface-container-low p-6 rounded-xl space-y-8 relative overflow-hidden">
        {DEMO_ACTIVITIES.map((activity) => (
          <div key={activity.id} className="flex gap-4 relative z-10">
            <div className="relative">
              {/* 유저 아바타 플레이스홀더 */}
              {/* User avatar placeholder */}
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-sm font-bold text-on-surface-variant">
                {activity.userName.charAt(0)}
              </div>
              {/* 액션 배지 */}
              {/* Action badge */}
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 ${activity.actionColor} rounded-full border-2 border-surface-container-low flex items-center justify-center`}
              >
                <span className="material-symbols-outlined text-white text-[12px] font-bold">
                  {activity.actionIcon}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-on-surface leading-tight">
                <span className="font-bold">{activity.userName}</span>{' '}
                {activity.action}{' '}
                <span className={TARGET_STYLE_CLASS[activity.targetStyle]}>
                  {activity.target}
                </span>
              </p>
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/50 mt-1 block">
                {activity.timeAgo}
              </span>
            </div>
          </div>
        ))}

        {/* 장식 요소 */}
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
      </div>

      {/* Up Next 카드 */}
      {/* Up Next card */}
      <div className="mt-8 p-6 custom-gradient rounded-xl text-white task-card-shadow relative overflow-hidden group cursor-pointer active:scale-[0.99] transition-transform">
        <div className="relative z-10">
          <h5 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
            Up Next
          </h5>
          <h4 className="text-xl font-black tracking-tight leading-tight">
            Stakeholder Weekly Meeting
          </h4>
          <div className="flex items-center gap-2 mt-4 text-sm opacity-90 font-medium">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            14:00 - 15:30 (Today)
          </div>
        </div>
        <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-10 group-hover:scale-110 transition-transform">
          event
        </span>
      </div>
    </div>
  );
}
