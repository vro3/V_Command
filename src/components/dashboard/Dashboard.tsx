import { Calendar, Users, Sparkles, Globe, Clock } from 'lucide-react';
import { AppCard } from './AppCard';
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

// Sample activities - these would be fetched from your apps
const recentActivities = [
  {
    id: '1',
    type: 'capture' as const,
    title: 'Welcome to V_Command',
    description: 'Your unified dashboard is ready',
    timestamp: new Date().toISOString(),
    app: 'Brain',
  },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Apps Grid - Prominent at top */}
      <div>
        <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Your Apps
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {apps.map((app) => (
            <AppCard key={app.name} {...app} />
          ))}
        </div>
      </div>

      {/* Activity & Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={recentActivities} />

        {/* Placeholder for future data */}
        <div className="bg-slate-900/50 border border-slate-800 card-squircle overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-[13px] font-semibold text-slate-200">Upcoming</h3>
          </div>
          <div className="p-5">
            <p className="text-[13px] text-slate-500 text-center py-4">
              No upcoming events
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
