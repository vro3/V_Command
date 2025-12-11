import { Clock, Mail, Calendar, Users, Brain, LucideIcon } from 'lucide-react';

interface Activity {
  id: string;
  type: 'email' | 'show' | 'lead' | 'capture';
  title: string;
  description: string;
  timestamp: string;
  app: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const typeIcons: Record<string, LucideIcon> = {
  email: Mail,
  show: Calendar,
  lead: Users,
  capture: Brain,
};

const typeColors: Record<string, string> = {
  email: 'text-amber-400 bg-amber-400/10',
  show: 'text-emerald-400 bg-emerald-400/10',
  lead: 'text-blue-400 bg-blue-400/10',
  capture: 'text-accent bg-accent/10',
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 card-squircle overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
        <Clock className="w-4 h-4 text-slate-500" />
        <h3 className="text-[13px] font-semibold text-slate-200">Recent Activity</h3>
      </div>

      <div className="divide-y divide-slate-800/50">
        {activities.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-[13px] text-slate-500">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = typeIcons[activity.type] || Brain;
            const colorClass = typeColors[activity.type] || typeColors.capture;

            return (
              <div
                key={activity.id}
                className="px-5 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-7 h-7 icon-squircle flex items-center justify-center ${colorClass}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-slate-200 font-medium truncate">
                      {activity.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px] text-slate-500 tabular-nums">
                      {formatTime(activity.timestamp)}
                    </p>
                    <p className="text-[10px] text-slate-600">{activity.app}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
