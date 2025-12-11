import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { AtlasChat } from './components/atlas/AtlasChat';
import { BrainSidebar } from './components/atlas/BrainSidebar';
import { Settings } from './components/settings/Settings';
import { LoginPage } from './components/auth/LoginPage';
import { Capture } from './types/atlas';
import { AppSettings } from './types/settings';
import { AuthData, isAllowedUser } from './types/auth';
import {
  loadCaptures,
  saveCaptures,
  processCapture,
  searchCaptures,
} from './services/atlasService';
import { loadSettings, saveSettings } from './services/settingsService';
import { getStoredAuth, storeAuth, clearAuth } from './services/authService';
import { Loader2 } from 'lucide-react';

type View = 'dashboard' | 'brain' | 'settings' | 'leadtrack';

function App() {
  // Auth state
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // App state
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [isProcessing, setIsProcessing] = useState(false);

  // Check for auth on mount
  useEffect(() => {
    const initAuth = async () => {
      // Check URL for OAuth callback token
      const urlParams = new URLSearchParams(window.location.search);
      const authToken = urlParams.get('auth_token');

      if (authToken) {
        try {
          // Decode the token from LeadTrack
          const decoded = decodeURIComponent(authToken);
          // LeadTrack encrypts with AES - for now we'll parse if it's base64 JSON
          // In production, we'd need to share decryption or have backend validate

          // Try to parse as base64 JSON first
          let data: AuthData | null = null;
          try {
            data = JSON.parse(atob(decoded));
          } catch {
            // If encrypted, store raw and we'll handle differently
            console.log('Token appears encrypted, trying alternative parse');
            // The token format is: iv.authTag.encrypted
            // For now, we'll just indicate auth failed - need backend support
          }

          if (data && data.user) {
            // Check if user is allowed
            if (isAllowedUser(data.user.email)) {
              storeAuth(data);
              setAuthData(data);
              // Clear URL params
              window.history.replaceState({}, '', window.location.pathname);
            } else {
              setAuthError(`Access denied. ${data.user.email} is not authorized.`);
              clearAuth();
            }
          } else {
            setAuthError('Failed to parse authentication token. Please try again.');
          }
        } catch (err) {
          console.error('Auth callback error:', err);
          setAuthError('Authentication failed. Please try again.');
        }
        // Clear URL params regardless
        window.history.replaceState({}, '', window.location.pathname);
      } else {
        // Check for stored auth
        const stored = getStoredAuth();
        if (stored && stored.user && isAllowedUser(stored.user.email)) {
          setAuthData(stored);
        }
      }

      setAuthLoading(false);
    };

    initAuth();
  }, []);

  // Load captures from localStorage on mount
  useEffect(() => {
    const stored = loadCaptures();
    setCaptures(stored);
  }, []);

  // Handle settings save
  const handleSaveSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
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

  const handleAddToLeadTrack = useCallback((capture: Capture) => {
    // Mark capture as added to LeadTrack
    setCaptures((prev) =>
      prev.map((c) =>
        c.id === capture.id ? { ...c, actionTaken: 'added_to_leadtrack' as const } : c
      )
    );

    // Open LeadTrack CRM with pre-filled data (if available)
    const crmUrl = 'https://docs.google.com/spreadsheets/d/16zVv27wNPiO2XwNkMkJpSTMX8iSiJdPn10vY5Ab1DD8/edit';
    window.open(crmUrl, '_blank');

    // Log for future API integration
    console.log('Adding to LeadTrack:', capture.leadData || capture.rawContent);
  }, []);

  const handleLogout = useCallback(() => {
    clearAuth();
    setAuthData(null);
    setAuthError(null);
  }, []);

  // Stats for header
  const stats = {
    captures: captures.length,
    shows: '—',
    leads: '—',
    thisWeek: '—',
  };

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
          <p className="text-[13px] text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!authData) {
    return <LoginPage error={authError} />;
  }

  return (
    <MainLayout
      title="Command Center"
      stats={stats}
      currentView={currentView}
      onViewChange={handleViewChange}
      user={authData.user}
      onLogout={handleLogout}
      brainSidebar={
        <BrainSidebar
          captures={captures}
          onCapture={handleCapture}
          onDeleteCapture={handleDeleteCapture}
          onAddToLeadTrack={handleAddToLeadTrack}
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
      {currentView === 'leadtrack' && (
        <div className="h-[calc(100vh-5rem)] -m-6">
          <iframe
            src="https://vrcgoutreach.vercel.app"
            className="w-full h-full border-0"
            title="LeadTrack"
            allow="clipboard-write"
          />
        </div>
      )}
      {currentView === 'settings' && (
        <Settings settings={settings} onSave={handleSaveSettings} />
      )}
    </MainLayout>
  );
}

export default App;
