export type AIProvider = 'gemini' | 'claude' | 'openai';

export type GeminiModel = 'gemini-2.0-flash' | 'gemini-3-pro';
export type ClaudeModel = 'claude-3-haiku' | 'claude-sonnet-4' | 'claude-opus-4';
export type OpenAIModel = 'gpt-4o-mini' | 'gpt-4o';

export type AIModel = GeminiModel | ClaudeModel | OpenAIModel;

export interface ModelConfig {
  id: AIModel;
  name: string;
  provider: AIProvider;
  description: string;
  costPer1MInput: number;
  costPer1MOutput: number;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  // Gemini
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    description: 'Fast & cheap. Best for categorization, tagging, extraction.',
    costPer1MInput: 0.10,
    costPer1MOutput: 0.40,
  },
  {
    id: 'gemini-3-pro',
    name: 'Gemini 3 Pro',
    provider: 'gemini',
    description: 'Deep reasoning. Best for analysis, summaries, complex tasks.',
    costPer1MInput: 2.00,
    costPer1MOutput: 12.00,
  },
  // Claude
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'claude',
    description: 'Fast & affordable. Good for simple tasks.',
    costPer1MInput: 0.25,
    costPer1MOutput: 1.25,
  },
  {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'claude',
    description: 'Balanced. Great for writing and analysis.',
    costPer1MInput: 3.00,
    costPer1MOutput: 15.00,
  },
  {
    id: 'claude-opus-4',
    name: 'Claude Opus 4.5',
    provider: 'claude',
    description: 'Most capable. Best for complex reasoning.',
    costPer1MInput: 5.00,
    costPer1MOutput: 25.00,
  },
  // OpenAI
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Fast & cheap. Good general purpose.',
    costPer1MInput: 0.15,
    costPer1MOutput: 0.60,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Powerful multimodal model.',
    costPer1MInput: 2.50,
    costPer1MOutput: 10.00,
  },
];

export interface APIKeys {
  gemini?: string;
  claude?: string;
  openai?: string;
}

export interface ModelAssignments {
  quickTasks: AIModel;      // categorize, tag, extract
  deepAnalysis: AIModel;    // reasoning, summaries
  writing: AIModel;         // emails, proposals
}

// Brain Memory - things you tell it to remember
export interface BrainMemory {
  id: string;
  content: string;
  createdAt: string;
  source?: string; // Optional: what triggered this memory
}

// Brain Rules - predefined rules that always apply
export interface BrainRules {
  // Plain text rules the user writes
  customRules: string;

  // Priority overrides
  priorityKeywords: {
    high: string[];    // e.g., ["Marriott", "urgent", "ASAP"]
    low: string[];     // e.g., ["someday", "maybe", "FYI"]
  };

  // Default behaviors
  defaults: {
    newLeadAction: 'add_to_leadtrack' | 'send_quote' | 'research' | 'none';
    showInquiryAction: 'add_to_showsync' | 'send_quote' | 'none';
    followUpDays: number; // Default follow-up reminder days
  };
}

export interface AppSettings {
  apiKeys: APIKeys;
  models: ModelAssignments;
  brainMode: 'business' | 'personal' | 'all';

  // NEW: Brain intelligence
  brainRules: BrainRules;
  brainMemories: BrainMemory[];
}

export const DEFAULT_BRAIN_RULES: BrainRules = {
  customRules: `- "Submit an Offer" or "requested to Submit an Offer" = PROPOSAL SUBMITTED (not a lead, not a show yet)
- These come from booking platforms (GigSalad, The Bash) - I don't know who the client is yet
- Route to: archive (just tracking for date conflicts, no action needed)
- Urgency: fyi (no action required)
- Extract: event date, event name, platform source
- Tag with: proposal-pending
- Purpose: Track dates I've pitched so I don't double-book or overlap
- These only become real leads/shows if the client accepts the offer`,
  priorityKeywords: {
    high: [],
    low: ['Submit an Offer', 'requested to Submit an Offer'],
  },
  defaults: {
    newLeadAction: 'add_to_leadtrack',
    showInquiryAction: 'add_to_showsync',
    followUpDays: 3,
  },
};

export const DEFAULT_SETTINGS: AppSettings = {
  apiKeys: {},
  models: {
    quickTasks: 'gemini-2.0-flash',
    deepAnalysis: 'gemini-3-pro',
    writing: 'gemini-3-pro',
  },
  brainMode: 'all',
  brainRules: DEFAULT_BRAIN_RULES,
  brainMemories: [],
};
