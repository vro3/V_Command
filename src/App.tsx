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

type View = 'dashboard' | 'atlas';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [atlasOpen, setAtlasOpen] = useState(false);
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

  // Keyboard shortcut for Atlas (Cmd+J)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setAtlasOpen((prev) => !prev);
        if (!atlasOpen) {
          setCurrentView('atlas');
        }
      }
      // Cmd+K for search (just opens Atlas for now)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setAtlasOpen(true);
        setCurrentView('atlas');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [atlasOpen]);

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    if (view === 'atlas') {
      setAtlasOpen(true);
    }
  };

  const handleOpenAtlas = () => {
    setCurrentView('atlas');
    setAtlasOpen(true);
  };

  const handleCloseAtlas = () => {
    setAtlasOpen(false);
    if (currentView === 'atlas') {
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
      case 'atlas':
        return 'Atlas';
      default:
        return 'V_Command';
    }
  };

  const getSubtitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Your unified workspace';
      case 'atlas':
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
      atlasOpen={atlasOpen}
      atlasSidebar={
        <AtlasSidebar
          captures={captures}
          onClose={handleCloseAtlas}
          onDeleteCapture={handleDeleteCapture}
        />
      }
    >
      {currentView === 'dashboard' && <Dashboard onOpenAtlas={handleOpenAtlas} />}
      {currentView === 'atlas' && (
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
