import { Search, Bell, User, Brain, Calendar, Users, TrendingUp } from 'lucide-react';

interface HeaderStats {
  captures: number;
  shows: string;
  leads: string;
  thisWeek: string;
}

interface HeaderProps {
  title: string;
  stats?: HeaderStats;
}

export function Header({ title, stats }: HeaderProps) {
  return (
    <header className="h-14 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Left: Title */}
      <h1 className="text-[15px] font-semibold text-slate-50">{title}</h1>

      {/* Center: Inline Stats */}
      {stats && (
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-400">
            <Brain className="w-3.5 h-3.5 text-accent" />
            <span className="text-[12px] tabular-nums">
              <span className="text-slate-200 font-medium">{stats.captures}</span>
              <span className="text-slate-500 ml-1">captures</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[12px] tabular-nums">
              <span className="text-slate-200 font-medium">{stats.shows}</span>
              <span className="text-slate-500 ml-1">shows</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[12px] tabular-nums">
              <span className="text-slate-200 font-medium">{stats.leads}</span>
              <span className="text-slate-500 ml-1">leads</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[12px] tabular-nums">
              <span className="text-slate-200 font-medium">{stats.thisWeek}</span>
              <span className="text-slate-500 ml-1">this week</span>
            </span>
          </div>
        </div>
      )}

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-48 pl-9 pr-4 py-1.5 text-[13px] bg-slate-800/50 border border-slate-700 input-squircle text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 bg-slate-800 px-1.5 py-0.5 btn-squircle">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 btn-squircle transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 btn-squircle transition-colors">
          <div className="w-7 h-7 bg-gradient-to-br from-accent to-accent-hover icon-squircle flex items-center justify-center">
            <User className="w-4 h-4 text-slate-950" />
          </div>
        </button>
      </div>
    </header>
  );
}
