import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GoogleUser } from '../../types/auth';

interface HeaderStats {
  captures: number;
  shows: string;
  leads: string;
  thisWeek: string;
}

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  stats?: HeaderStats;
  currentView: 'dashboard' | 'brain' | 'settings' | 'leadtrack';
  onViewChange: (view: 'dashboard' | 'brain' | 'settings' | 'leadtrack') => void;
  brainSidebar?: ReactNode;
  user?: GoogleUser;
  onLogout?: () => void;
}

export function MainLayout({
  children,
  title,
  stats,
  currentView,
  onViewChange,
  brainSidebar,
  user,
  onLogout,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-base flex">
      {/* Left Sidebar - Navigation */}
      <Sidebar
        currentView={currentView}
        onViewChange={onViewChange}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex-1 ml-60 flex">
        <div className="flex-1 flex flex-col mr-80">
          <Header title={title} stats={stats} />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>

        {/* Right Sidebar - Brain Capture (always visible) */}
        <aside className="w-80 bg-slate-950 border-l border-slate-800 fixed right-0 top-0 h-full overflow-hidden flex flex-col">
          {brainSidebar}
        </aside>
      </div>
    </div>
  );
}
