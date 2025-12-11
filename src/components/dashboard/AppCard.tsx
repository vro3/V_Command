import { ExternalLink, LucideIcon } from 'lucide-react';

interface AppCardProps {
  name: string;
  description: string;
  url: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  stats?: {
    label: string;
    value: string | number;
  };
  status?: 'online' | 'offline' | 'unknown';
}

export function AppCard({
  name,
  description,
  url,
  icon: Icon,
  iconColor,
  bgColor,
  stats,
  status = 'unknown',
}: AppCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-accent/50 hover:bg-slate-900/70 transition-all duration-200 cursor-pointer group block"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 ${bgColor} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-slate-50 group-hover:text-accent transition-colors">
              {name}
            </h3>
            <p className="text-[11px] text-slate-500">{description}</p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'online'
                ? 'bg-emerald-400'
                : status === 'offline'
                ? 'bg-red-400'
                : 'bg-slate-600'
            }`}
          />
          <span className="text-[10px] text-slate-600 uppercase tracking-wider">
            {status}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
        {stats ? (
          <div>
            <span className="text-[20px] font-semibold text-slate-100 tabular-nums">
              {stats.value}
            </span>
            <span className="text-[11px] text-slate-500 ml-2">{stats.label}</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-600">Click to open</span>
        )}
        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-accent transition-colors" />
      </div>
    </a>
  );
}
