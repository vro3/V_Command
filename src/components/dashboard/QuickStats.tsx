import { LucideIcon } from 'lucide-react';

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
}

interface QuickStatsProps {
  stats: StatItem[];
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-slate-900/50 border border-slate-800 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className="w-4 h-4 text-slate-500" />
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
          <p className="text-2xl font-semibold text-slate-50 tabular-nums">
            {stat.value}
          </p>
          {stat.trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-[11px] font-medium tabular-nums ${
                  stat.trend.positive ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {stat.trend.positive ? '+' : ''}
                {stat.trend.value}
              </span>
              <span className="text-[11px] text-slate-600">vs last week</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
