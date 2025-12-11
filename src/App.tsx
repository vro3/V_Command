import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { AtlasChat } from './components/atlas/AtlasChat';
import { BrainSidebar } from './components/atlas/BrainSidebar';
import { Capture } from './types/atlas';
import {
  loadCaptures,
  saveCaptures,
  processCapture,
  searchCaptures,
} from './services/atlasService';

type View = 'dashboard' | 'brain';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load captures from localStorage on mount
  useEffect(() => {
    const stored = loadCaptures();
    setCaptures(stored);
  }, []);

  // Save captures whenever they change
  useEffect(() => {
    if (captures.length > 0) {
      saveCaptures(captures);
    }
  }, [captures]);

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const handleCapture = useCallback(
    async (
      content: string,
      type: 'text' | 'url' | 'voice'
    ): Promise<Capture | null> => {
      setIsProcessing(true);
      try {
        const newCapture = await processCapture(content, type);
        setCaptures((prev) => [newCapture, ...prev]);
        return newCapture;
      } catch (error) {
        console.error('Failed to capture:', error);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const handleSearch = useCallback(
    (query: string): Capture[] => {
      return searchCaptures(captures, query);
    },
    [captures]
  );

  const handleDeleteCapture = useCallback((id: string) => {
    setCaptures((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Stats for header
  const stats = {
    captures: captures.length,
    shows: '—',
    leads: '—',
    thisWeek: '—',
  };

  return (
    <MainLayout
      title="Command Center"
      stats={stats}
      currentView={currentView}
      onViewChange={handleViewChange}
      brainSidebar={
        <BrainSidebar
          captures={captures}
          onCapture={handleCapture}
          onDeleteCapture={handleDeleteCapture}
          isProcessing={isProcessing}
        />
      }
    >
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'brain' && (
        <div className="h-[calc(100vh-8rem)] max-w-4xl mx-auto">
          <AtlasChat
            captures={captures}
            onCapture={handleCapture}
            onSearch={handleSearch}
          />
        </div>
      )}
    </MainLayout>
  );
}

export default App;
