import { AppSettings, DEFAULT_SETTINGS, APIKeys } from '../types/settings';

const SETTINGS_KEY = 'v_command_settings';

// Simple encryption for API keys (not secure, but better than plaintext)
// In production, these should be stored server-side
const encode = (str: string): string => {
  return btoa(str.split('').reverse().join(''));
};

const decode = (str: string): string => {
  try {
    return atob(str).split('').reverse().join('');
  } catch {
    return '';
  }
};

export function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(stored);

    // Decode API keys
    const apiKeys: APIKeys = {};
    if (parsed.apiKeys?.gemini) apiKeys.gemini = decode(parsed.apiKeys.gemini);
    if (parsed.apiKeys?.claude) apiKeys.claude = decode(parsed.apiKeys.claude);
    if (parsed.apiKeys?.openai) apiKeys.openai = decode(parsed.apiKeys.openai);

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      apiKeys,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  // Encode API keys before storing
  const toStore = {
    ...settings,
    apiKeys: {
      gemini: settings.apiKeys.gemini ? encode(settings.apiKeys.gemini) : undefined,
      claude: settings.apiKeys.claude ? encode(settings.apiKeys.claude) : undefined,
      openai: settings.apiKeys.openai ? encode(settings.apiKeys.openai) : undefined,
    },
  };

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(toStore));
}

export function hasApiKey(settings: AppSettings, provider: 'gemini' | 'claude' | 'openai'): boolean {
  return !!settings.apiKeys[provider];
}

export function getAvailableProviders(settings: AppSettings): ('gemini' | 'claude' | 'openai')[] {
  const providers: ('gemini' | 'claude' | 'openai')[] = [];
  if (settings.apiKeys.gemini) providers.push('gemini');
  if (settings.apiKeys.claude) providers.push('claude');
  if (settings.apiKeys.openai) providers.push('openai');
  return providers;
}
