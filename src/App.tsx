import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { AtlasChat } from './components/atlas/AtlasChat';
import { AtlasSidebar } from './components/atlas/AtlasSidebar';
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
  const [brainOpen, setBrainOpen] = useState(false);
  const [captures, setCaptures] = useState<Capture[]>([]);

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

  // Keyboard shortcut for Brain (Cmd+J)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setBrainOpen((prev) => !prev);
        if (!brainOpen) {
          setCurrentView('brain');
        }
      }
      // Cmd+K for search (just opens Brain for now)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setBrainOpen(true);
        setCurrentView('brain');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [brainOpen]);

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    if (view === 'brain') {
      setBrainOpen(true);
    }
  };

  const handleOpenBrain = () => {
    setCurrentView('brain');
    setBrainOpen(true);
  };

  const handleCloseBrain = () => {
    setBrainOpen(false);
    if (currentView === 'brain') {
      setCurrentView('dashboard');
    }
  };

  const handleCapture = useCallback(
    async (
      content: string,
      type: 'text' | 'url' | 'voice'
    ): Promise<Capture | null> => {
      try {
        const newCapture = await processCapture(content, type);
        setCaptures((prev) => [newCapture, ...prev]);
        return newCapture;
      } catch (error) {
        console.error('Failed to capture:', error);
        return null;
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

  const getTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Command Center';
      case 'brain':
        return 'Brain';
      default:
        return 'V_Command';
    }
  };

  const getSubtitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Your unified workspace';
      case 'brain':
        return `${captures.length} captures`;
      default:
        return '';
    }
  };

  return (
    <MainLayout
      title={getTitle()}
      subtitle={getSubtitle()}
      currentView={currentView}
      onViewChange={handleViewChange}
      brainOpen={brainOpen}
      brainSidebar={
        <AtlasSidebar
          captures={captures}
          onClose={handleCloseBrain}
          onDeleteCapture={handleDeleteCapture}
        />
      }
    >
      {currentView === 'dashboard' && <Dashboard onOpenBrain={handleOpenBrain} />}
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
