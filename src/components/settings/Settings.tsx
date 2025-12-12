import { useState } from 'react';
import { Key, Eye, EyeOff, Check, AlertCircle, Cpu, Zap, Brain, PenLine, BookOpen, Trash2, Plus, Lightbulb } from 'lucide-react';
import {
  AppSettings,
  AVAILABLE_MODELS,
  AIModel,
  AIProvider,
  BrainMemory,
  DEFAULT_BRAIN_RULES,
} from '../../types/settings';

interface SettingsProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export function Settings({ settings, onSave }: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>({
    ...settings,
    brainRules: settings.brainRules || DEFAULT_BRAIN_RULES,
    brainMemories: settings.brainMemories || [],
  });
  const [showKeys, setShowKeys] = useState<Record<AIProvider, boolean>>({
    gemini: false,
    claude: false,
    openai: false,
  });
  const [saved, setSaved] = useState(false);
  const [newMemory, setNewMemory] = useState('');

  const handleApiKeyChange = (provider: AIProvider, value: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [provider]: value || undefined,
      },
    }));
    setSaved(false);
  };

  const handleModelChange = (task: keyof AppSettings['models'], model: AIModel) => {
    setLocalSettings((prev) => ({
      ...prev,
      models: {
        ...prev.models,
        [task]: model,
      },
    }));
    setSaved(false);
  };

  const handleBrainModeChange = (mode: AppSettings['brainMode']) => {
    setLocalSettings((prev) => ({
      ...prev,
      brainMode: mode,
    }));
    setSaved(false);
  };

  const handleRulesChange = (rules: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      brainRules: {
        ...prev.brainRules,
        customRules: rules,
      },
    }));
    setSaved(false);
  };

  const handleHighPriorityKeywordsChange = (keywords: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      brainRules: {
        ...prev.brainRules,
        priorityKeywords: {
          ...prev.brainRules.priorityKeywords,
          high: keywords.split(',').map(k => k.trim()).filter(Boolean),
        },
      },
    }));
    setSaved(false);
  };

  const handleAddMemory = () => {
    if (!newMemory.trim()) return;

    const memory: BrainMemory = {
      id: Date.now().toString(),
      content: newMemory.trim(),
      createdAt: new Date().toISOString(),
    };

    setLocalSettings((prev) => ({
      ...prev,
      brainMemories: [memory, ...prev.brainMemories],
    }));
    setNewMemory('');
    setSaved(false);
  };

  const handleDeleteMemory = (id: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      brainMemories: prev.brainMemories.filter(m => m.id !== id),
    }));
    setSaved(false);
  };

  const handleSave = () => {
    onSave(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getAvailableModelsForTask = () => {
    // Only show models from providers that have API keys configured
    const availableProviders: AIProvider[] = [];
    if (localSettings.apiKeys.gemini) availableProviders.push('gemini');
    if (localSettings.apiKeys.claude) availableProviders.push('claude');
    if (localSettings.apiKeys.openai) availableProviders.push('openai');

    if (availableProviders.length === 0) {
      // Show all models but they'll be disabled
      return AVAILABLE_MODELS;
    }

    return AVAILABLE_MODELS.filter((m) => availableProviders.includes(m.provider));
  };

  const availableModels = getAvailableModelsForTask();
  const hasAnyKey = !!(localSettings.apiKeys.gemini || localSettings.apiKeys.claude || localSettings.apiKeys.openai);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Settings</h1>
        <p className="text-[13px] text-slate-500 mt-1">
          Configure API keys and model preferences for Brain
        </p>
      </div>

      {/* API Keys Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-accent" />
          <h2 className="text-[15px] font-semibold text-slate-200">API Keys</h2>
        </div>

        <div className="space-y-3">
          {/* Gemini */}
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] font-bold text-blue-400">G</span>
                </div>
                <span className="text-[13px] font-medium text-slate-200">Google Gemini</span>
                {localSettings.apiKeys.gemini && (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <span className="text-[11px] text-slate-500">$600 credit available</span>
            </div>
            <div className="relative">
              <input
                type={showKeys.gemini ? 'text' : 'password'}
                value={localSettings.apiKeys.gemini || ''}
                onChange={(e) => handleApiKeyChange('gemini', e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 pr-10 text-[13px] bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              />
              <button
                onClick={() => setShowKeys((prev) => ({ ...prev, gemini: !prev.gemini }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showKeys.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Claude */}
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] font-bold text-orange-400">C</span>
                </div>
                <span className="text-[13px] font-medium text-slate-200">Anthropic Claude</span>
                {localSettings.apiKeys.claude && (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <span className="text-[11px] text-slate-500">Optional</span>
            </div>
            <div className="relative">
              <input
                type={showKeys.claude ? 'text' : 'password'}
                value={localSettings.apiKeys.claude || ''}
                onChange={(e) => handleApiKeyChange('claude', e.target.value)}
                placeholder="sk-ant-api03-..."
                className="w-full px-3 py-2 pr-10 text-[13px] bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              />
              <button
                onClick={() => setShowKeys((prev) => ({ ...prev, claude: !prev.claude }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showKeys.claude ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* OpenAI */}
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] font-bold text-emerald-400">O</span>
                </div>
                <span className="text-[13px] font-medium text-slate-200">OpenAI</span>
                {localSettings.apiKeys.openai && (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <span className="text-[11px] text-slate-500">Optional</span>
            </div>
            <div className="relative">
              <input
                type={showKeys.openai ? 'text' : 'password'}
                value={localSettings.apiKeys.openai || ''}
                onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 pr-10 text-[13px] bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              />
              <button
                onClick={() => setShowKeys((prev) => ({ ...prev, openai: !prev.openai }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showKeys.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {!hasAnyKey && (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-[12px] text-amber-200">
              Add at least one API key to enable Brain's AI features. Your Gemini $600 credit is recommended.
            </p>
          </div>
        )}
      </section>

      {/* Model Assignments Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-accent" />
          <h2 className="text-[15px] font-semibold text-slate-200">Model Assignments</h2>
        </div>

        <p className="text-[12px] text-slate-500">
          Choose which AI model handles each type of task. Faster models cost less.
        </p>

        <div className="space-y-3">
          {/* Quick Tasks */}
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-yellow-400" />
              <div>
                <span className="text-[13px] font-medium text-slate-200">Quick Tasks</span>
                <p className="text-[11px] text-slate-500">Categorize, tag, extract data</p>
              </div>
            </div>
            <select
              value={localSettings.models.quickTasks}
              onChange={(e) => handleModelChange('quickTasks', e.target.value as AIModel)}
              disabled={!hasAnyKey}
              className="w-full px-3 py-2 text-[13px] bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:opacity-50"
            >
              {availableModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} — ${model.costPer1MInput}/$1M in
                </option>
              ))}
            </select>
          </div>

          {/* Deep Analysis */}
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-purple-400" />
              <div>
                <span className="text-[13px] font-medium text-slate-200">Deep Analysis</span>
                <p className="text-[11px] text-slate-500">Reasoning, summaries, complex analysis</p>
              </div>
            </div>
            <select
              value={localSettings.models.deepAnalysis}
              onChange={(e) => handleModelChange('deepAnalysis', e.target.value as AIModel)}
              disabled={!hasAnyKey}
              className="w-full px-3 py-2 text-[13px] bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:opacity-50"
            >
              {availableModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} — ${model.costPer1MInput}/$1M in
                </option>
              ))}
            </select>
          </div>

          {/* Writing */}
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <PenLine className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-[13px] font-medium text-slate-200">Writing</span>
                <p className="text-[11px] text-slate-500">Emails, proposals, follow-ups</p>
              </div>
            </div>
            <select
              value={localSettings.models.writing}
              onChange={(e) => handleModelChange('writing', e.target.value as AIModel)}
              disabled={!hasAnyKey}
              className="w-full px-3 py-2 text-[13px] bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:opacity-50"
            >
              {availableModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} — ${model.costPer1MInput}/$1M in
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Brain Mode Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-accent" />
          <h2 className="text-[15px] font-semibold text-slate-200">Brain Mode</h2>
        </div>

        <p className="text-[12px] text-slate-500">
          Filter captures by context. Business mode focuses on leads, shows, and clients.
        </p>

        <div className="flex gap-2">
          {(['all', 'business', 'personal'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => handleBrainModeChange(mode)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                localSettings.brainMode === mode
                  ? 'bg-accent text-slate-950'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Brain Rules Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <h2 className="text-[15px] font-semibold text-slate-200">Brain Rules</h2>
        </div>

        <p className="text-[12px] text-slate-500">
          Define rules that Brain always follows. Write in plain English.
        </p>

        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-4">
          {/* Custom Rules */}
          <div>
            <label className="block text-[12px] font-medium text-slate-400 mb-2">
              Your Rules
            </label>
            <textarea
              value={localSettings.brainRules?.customRules || ''}
              onChange={(e) => handleRulesChange(e.target.value)}
              placeholder="Example rules:
- Marriott leads are always high priority
- Shows under $1500 are low priority
- Always suggest follow-up for venue inquiries
- DMC contacts should go to both LeadTrack AND ShowSync"
              rows={6}
              className="w-full px-3 py-2 text-[13px] bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent resize-none"
            />
          </div>

          {/* High Priority Keywords */}
          <div>
            <label className="block text-[12px] font-medium text-slate-400 mb-2">
              High Priority Keywords <span className="text-slate-500">(comma separated)</span>
            </label>
            <input
              type="text"
              value={localSettings.brainRules?.priorityKeywords?.high?.join(', ') || ''}
              onChange={(e) => handleHighPriorityKeywordsChange(e.target.value)}
              placeholder="Marriott, urgent, ASAP, corporate"
              className="w-full px-3 py-2 text-[13px] bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            />
            <p className="text-[10px] text-slate-600 mt-1">
              Any capture mentioning these words will be marked as high priority
            </p>
          </div>
        </div>
      </section>

      {/* Brain Memory Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <h2 className="text-[15px] font-semibold text-slate-200">Brain Memory</h2>
        </div>

        <p className="text-[12px] text-slate-500">
          Things you've told Brain to remember. Add facts, preferences, or context.
        </p>

        {/* Add Memory */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            placeholder="Remember: My standard corporate rate is $2500..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddMemory()}
            className="flex-1 px-3 py-2 text-[13px] bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
          />
          <button
            onClick={handleAddMemory}
            disabled={!newMemory.trim()}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg text-[13px] font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Memory List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {localSettings.brainMemories?.length === 0 ? (
            <div className="p-4 bg-slate-900/50 border border-slate-800 border-dashed rounded-xl text-center">
              <p className="text-[12px] text-slate-500">No memories yet</p>
              <p className="text-[10px] text-slate-600 mt-1">
                Add things like pricing, preferences, important clients
              </p>
            </div>
          ) : (
            localSettings.brainMemories?.map((memory) => (
              <div
                key={memory.id}
                className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg flex items-start gap-3 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-slate-300">{memory.content}</p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    {new Date(memory.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteMemory(memory.id)}
                  className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {localSettings.brainMemories && localSettings.brainMemories.length > 0 && (
          <p className="text-[10px] text-slate-600">
            {localSettings.brainMemories.length} memories stored • These are injected into every Brain analysis
          </p>
        )}
      </section>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-slate-800">
        <button
          onClick={handleSave}
          className={`px-6 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-accent text-slate-950 hover:bg-accent-hover'
          }`}
        >
          {saved ? (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Saved
            </span>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  );
}
