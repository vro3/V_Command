import { useState } from 'react';
import {
  LayoutDashboard,
  Brain,
  Calendar,
  Users,
  Globe,
  FileText,
  Table,
  Youtube,
  Settings,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { GoogleUser } from '../../types/auth';

interface SidebarProps {
  currentView: 'dashboard' | 'brain' | 'settings' | 'leadtrack';
  onViewChange: (view: 'dashboard' | 'brain' | 'settings' | 'leadtrack') => void;
  user?: GoogleUser;
  onLogout?: () => void;
}

// External apps that open in new window
const externalApps = [
  {
    id: 'show-sync',
    name: 'Show Sync',
    icon: Calendar,
    url: 'https://script.google.com/macros/s/AKfycbxIIaIOJNVEXxfjdQOEOzox8wwqrGYn1HEiea5Fp5bUQ2w5YurZISCuxe7P0nJV3nI/exec',
  },
];

const sheets = [
  {
    id: 'show-sync-sheet',
    name: 'Shows Database',
    icon: Table,
    url: 'https://docs.google.com/spreadsheets/d/1FEI9bnW3NHpDgJiWJ1XhOH8BORSQZQqlGwCz4sIHgEs/edit?gid=60795181#gid=60795181',
  },
  {
    id: 'crm-sheet',
    name: 'CRM Database',
    icon: Table,
    url: 'https://docs.google.com/spreadsheets/d/16zVv27wNPiO2XwNkMkJpSTMX8iSiJdPn10vY5Ab1DD8/edit?gid=2129660453#gid=2129660453',
  },
  {
    id: 'website-sheet',
    name: 'Website Data',
    icon: Table,
    url: 'https://docs.google.com/spreadsheets/d/1xfA5PDnydzFoMq85lEtpF9HwdLq8i9kEE0wV-iosiX4/edit?gid=0#gid=0',
  },
  {
    id: 'invoice-form',
    name: 'Invoice Form',
    icon: FileText,
    url: 'https://docs.google.com/forms/d/1Sg4i0cNUJaxtsUvMZpKQGbLFwZnWd07yTnYgrR8iXrw/edit',
  },
  {
    id: 'youtube',
    name: 'YouTube Studio',
    icon: Youtube,
    url: 'https://studio.youtube.com/channel/UCy-TipxZKkpeH6kit3PpS-A/videos/upload?filter=%5B%5D&sort=%7B%22columnType%22%3A%22date%22%2C%22sortOrder%22%3A%22DESCENDING%22%7D',
  },
  {
    id: 'squarespace',
    name: 'Squarespace',
    icon: Globe,
    url: 'https://mauve-semicircle-alth.squarespace.com/config/',
  },
];

export function Sidebar({ currentView, onViewChange, user, onLogout }: SidebarProps) {
  const [dataToolsExpanded, setDataToolsExpanded] = useState(false);

  return (
    <aside className="w-60 bg-slate-950 border-r border-slate-800 flex flex-col fixed h-full z-10">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-hover icon-squircle flex items-center justify-center">
            <span className="text-base font-bold text-slate-950">V</span>
          </div>
          <span className="text-[15px] font-bold text-slate-50 tracking-tight">
            V_COMMAND
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <button
          onClick={() => onViewChange('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 btn-squircle text-[13px] transition-colors ${
            currentView === 'dashboard'
              ? 'bg-slate-800 text-slate-50'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="font-medium">Dashboard</span>
        </button>

        <button
          onClick={() => onViewChange('brain')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 btn-squircle text-[13px] transition-colors ${
            currentView === 'brain'
              ? 'bg-accent-subtle text-accent border border-accent/20'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span className="font-medium">Brain</span>
        </button>

        {/* Apps Section */}
        <div className="pt-4 mt-4 border-t border-slate-800">
          <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Apps
          </p>

          {/* LeadTrack - embedded */}
          <button
            onClick={() => onViewChange('leadtrack')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors ${
              currentView === 'leadtrack'
                ? 'bg-slate-800 text-slate-50'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="font-medium">LeadTrack</span>
          </button>

          {/* External apps */}
          {externalApps.map((app) => (
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

        {/* Data & Tools Section - Collapsible */}
        <div className="pt-4 mt-4 border-t border-slate-800">
          <button
            onClick={() => setDataToolsExpanded(!dataToolsExpanded)}
            className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-400 transition-colors"
          >
            <span>Data & Tools</span>
            {dataToolsExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {dataToolsExpanded && (
            <div className="mt-2 space-y-0.5">
              {sheets.map((sheet) => (
                <a
                  key={sheet.id}
                  href={sheet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[12px] text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 transition-colors group"
                >
                  <sheet.icon className="w-3.5 h-3.5" />
                  <span className="font-medium">{sheet.name}</span>
                  <ExternalLink className="w-2.5 h-2.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <button
          onClick={() => onViewChange('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors ${
            currentView === 'settings'
              ? 'bg-slate-800 text-slate-50'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="font-medium">Settings</span>
        </button>

        {/* User Info & Logout */}
        {user && (
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center gap-3 px-3 py-2">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-7 h-7 rounded-full"
                />
              ) : (
                <div className="w-7 h-7 bg-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-[11px] font-semibold text-accent">
                    {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-slate-300 truncate">
                  {user.name || 'User'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
