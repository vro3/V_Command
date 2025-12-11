import { Calendar, Users, Sparkles, Globe, Brain, Mail, TrendingUp, Clock } from 'lucide-react';
import { AppCard } from './AppCard';
import { QuickStats } from './QuickStats';
import { RecentActivity } from './RecentActivity';

const apps = [
  {
    name: 'Show Sync',
    description: 'Booking Management',
    url: 'https://script.google.com/macros/s/AKfycbxIIaIOJNVEXxfjdQOEOzox8wwqrGYn1HEiea5Fp5bUQ2w5YurZISCuxe7P0nJV3nI/exec',
    icon: Calendar,
    iconColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    stats: { label: 'upcoming shows', value: '—' },
    status: 'online' as const,
  },
  {
    name: 'LeadTrack',
    description: 'CRM & Outreach',
    url: 'https://vrcgoutreach.vercel.app',
    icon: Users,
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    stats: { label: 'active leads', value: '—' },
    status: 'online' as const,
  },
  {
    name: 'The Overlap',
    description: 'Brand Development',
    url: 'https://theoverlap.vercel.app',
    icon: Sparkles,
    iconColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    stats: { label: 'sessions', value: '—' },
    status: 'online' as const,
  },
  {
    name: 'SEO Codex',
    description: 'SEO Documentation',
    url: '#',
    icon: Globe,
    iconColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    status: 'unknown' as const,
  },
];

const quickStats = [
  {
    label: 'Total Captures',
    value: 0,
    icon: Brain,
    trend: { value: '—', positive: true },
  },
  {
    label: 'Upcoming Shows',
    value: '—',
    icon: Calendar,
  },
  {
    label: 'Active Leads',
    value: '—',
    icon: Users,
  },
  {
    label: 'This Week',
    value: '—',
    icon: TrendingUp,
  },
];

// Sample activities - these would be fetched from your apps
const recentActivities = [
  {
    id: '1',
    type: 'capture' as const,
    title: 'Welcome to V_Command',
    description: 'Your unified dashboard is ready',
    timestamp: new Date().toISOString(),
    app: 'Atlas',
  },
];

interface DashboardProps {
  onOpenAtlas: () => void;
}

export function Dashboard({ onOpenAtlas }: DashboardProps) {
  return (
    <div className="space-y-6 max-w-6xl">
      {/* Quick capture prompt */}
      <button
        onClick={onOpenAtlas}
        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-accent/50 hover:bg-slate-900/70 transition-all duration-200 group text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <Brain className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-[15px] text-slate-300 group-hover:text-slate-100 transition-colors">
              Capture something to Atlas...
            </p>
            <p className="text-[11px] text-slate-600">
              Type or paste anything — ideas, notes, contacts, links
            </p>
          </div>
          <kbd className="text-[11px] text-slate-600 bg-slate-800 px-2 py-1 rounded border border-slate-700">
            ⌘ + J
          </kbd>
        </div>
      </button>

      {/* Quick Stats */}
      <QuickStats stats={quickStats} />

      {/* Apps Grid */}
      <div>
        <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>Your Apps</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {apps.map((app) => (
            <AppCard key={app.name} {...app} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={recentActivities} />

        {/* Quick Actions */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-[13px] font-semibold text-slate-200">Quick Actions</h3>
          </div>
          <div className="p-4 space-y-2">
            <a
              href="https://script.google.com/macros/s/AKfycbxIIaIOJNVEXxfjdQOEOzox8wwqrGYn1HEiea5Fp5bUQ2w5YurZISCuxe7P0nJV3nI/exec"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="text-[13px] text-slate-300">Open Show Dashboard</span>
            </a>
            <a
              href="https://vrcgoutreach.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Mail className="w-4 h-4 text-blue-400" />
              <span className="text-[13px] text-slate-300">Check Lead Follow-ups</span>
            </a>
            <button
              onClick={onOpenAtlas}
              className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Brain className="w-4 h-4 text-accent" />
              <span className="text-[13px] text-slate-300">New Atlas Capture</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
