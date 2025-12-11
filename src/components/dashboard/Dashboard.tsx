import { useState } from 'react';
import { Mail, Plus } from 'lucide-react';
import { RecentActivity } from './RecentActivity';
import { ShowSyncWidget } from './ShowSyncWidget';
import { EmailComposer } from './EmailComposer';

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
  const [showEmailComposer, setShowEmailComposer] = useState(false);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowEmailComposer(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 rounded-lg text-[13px] font-medium transition-colors"
        >
          <Mail className="w-4 h-4" />
          New Email
        </button>
        <a
          href="https://docs.google.com/spreadsheets/d/16zVv27wNPiO2XwNkMkJpSTMX8iSiJdPn10vY5Ab1DD8/edit"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-lg text-[13px] font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Lead
        </a>
      </div>

      {/* Activity & Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={recentActivities} />
        <ShowSyncWidget />
      </div>

      {/* Email Composer Modal */}
      {showEmailComposer && (
        <EmailComposer
          onClose={() => setShowEmailComposer(false)}
          onSent={() => console.log('Email sent!')}
        />
      )}
    </div>
  );
}
