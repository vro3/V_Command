import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  currentView: 'dashboard' | 'brain';
  onViewChange: (view: 'dashboard' | 'brain') => void;
  brainOpen: boolean;
  brainSidebar?: ReactNode;
}

export function MainLayout({
  children,
  title,
  subtitle,
  currentView,
  onViewChange,
  brainOpen,
  brainSidebar,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-base flex">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={onViewChange}
        brainOpen={brainOpen}
      />

      {/* Main Content */}
      <div className="flex-1 ml-60 flex">
        <div className={`flex-1 flex flex-col transition-all duration-300 ${brainOpen ? 'mr-80' : ''}`}>
          <Header title={title} subtitle={subtitle} />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>

        {/* Brain Sidebar */}
        {brainOpen && brainSidebar && (
          <aside className="w-80 bg-slate-950 border-l border-slate-800 fixed right-0 top-0 h-full overflow-hidden flex flex-col">
            {brainSidebar}
          </aside>
        )}
      </div>
    </div>
  );
}
