import {
  LayoutDashboard,
  Brain,
  Calendar,
  Users,
  Globe,
  Sparkles,
  Settings,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'atlas';
  onViewChange: (view: 'dashboard' | 'atlas') => void;
  atlasOpen: boolean;
}

const apps = [
  {
    id: 'show-sync',
    name: 'Show Sync',
    icon: Calendar,
    url: 'https://script.google.com/macros/s/AKfycbxIIaIOJNVEXxfjdQOEOzox8wwqrGYn1HEiea5Fp5bUQ2w5YurZISCuxe7P0nJV3nI/exec',
  },
  {
    id: 'leadtrack',
    name: 'LeadTrack',
    icon: Users,
    url: 'https://vrcgoutreach.vercel.app',
  },
  {
    id: 'overlap',
    name: 'The Overlap',
    icon: Sparkles,
    url: 'https://theoverlap.vercel.app',
  },
  {
    id: 'seo-codex',
    name: 'SEO Codex',
    icon: Globe,
    url: '#',
  },
];

export function Sidebar({ currentView, onViewChange, atlasOpen }: SidebarProps) {
  return (
    <aside className="w-60 bg-slate-950 border-r border-slate-800 flex flex-col fixed h-full z-10">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-hover rounded-lg flex items-center justify-center">
            <span className="text-base font-bold text-slate-950">V</span>
          </div>
          <span className="text-[15px] font-bold text-slate-50 tracking-tight">
            V_COMMAND
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <button
          onClick={() => onViewChange('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
            currentView === 'dashboard'
              ? 'bg-slate-800 text-slate-50'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="font-medium">Dashboard</span>
        </button>

        <button
          onClick={() => onViewChange('atlas')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
            currentView === 'atlas' || atlasOpen
              ? 'bg-accent-subtle text-accent border border-accent/20'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span className="font-medium">Atlas</span>
          <ChevronRight
            className={`w-3.5 h-3.5 ml-auto transition-transform ${
              atlasOpen ? 'rotate-90' : ''
            }`}
          />
        </button>

        {/* Apps Section */}
        <div className="pt-4 mt-4 border-t border-slate-800">
          <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Apps
          </p>
          {apps.map((app) => (
            <a
              key={app.id}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-colors group"
            >
              <app.icon className="w-4 h-4" />
              <span className="font-medium">{app.name}</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-colors">
          <Settings className="w-4 h-4" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}
