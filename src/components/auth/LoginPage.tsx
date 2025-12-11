import { useState } from 'react';
import { Command, Loader2 } from 'lucide-react';
import { getLoginUrl } from '../../services/authService';

interface LoginPageProps {
  error?: string | null;
}

export function LoginPage({ error }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(error || null);

  const handleLogin = async () => {
    setIsLoading(true);
    setLoginError(null);

    try {
      const authUrl = await getLoginUrl();
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Failed to connect to authentication server. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-4">
            <Command className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-slate-50 mb-2">V_Command</h1>
          <p className="text-[13px] text-slate-400">
            Your unified business command center
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="text-center mb-6">
            <h2 className="text-[15px] font-semibold text-slate-200 mb-2">
              Sign in to continue
            </h2>
            <p className="text-[12px] text-slate-500">
              Access is restricted to authorized VR Creative Group accounts
            </p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-[12px] text-red-400 text-center">{loginError}</p>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span>{isLoading ? 'Connecting...' : 'Sign in with Google'}</span>
          </button>

          {/* Allowed Accounts Note */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <p className="text-[11px] text-slate-600 text-center">
              Authorized accounts only
            </p>
            <div className="flex flex-col items-center gap-1 mt-2">
              <span className="text-[10px] text-slate-500">vince@vinceromanelli.com</span>
              <span className="text-[10px] text-slate-500">vr@vrcreativegroup.com</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-slate-600 text-center mt-6">
          VR Creative Group Command Center v1.0
        </p>
      </div>
    </div>
  );
}
