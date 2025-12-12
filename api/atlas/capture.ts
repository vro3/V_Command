import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, Schema } from '@google/genai';

// Simplified schema for conversational assistant
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    // Conversational response - how Brain acknowledges this
    response: {
      type: Type.STRING,
      description: 'Short, conversational acknowledgment (e.g., "Got it, I\'ll remind you Tuesday" or "Saved that idea")',
    },

    // What Brain understood
    summary: {
      type: Type.STRING,
      description: 'Brief summary of what this is about',
    },

    // Simple type - not forced categories
    type: {
      type: Type.STRING,
      enum: ['task', 'reminder', 'idea', 'note', 'contact', 'show', 'lead', 'reference'],
      description: 'Simple type for filtering',
    },

    // Time-awareness - THE KEY FEATURE
    dueDate: {
      type: Type.STRING,
      description: 'If there\'s a deadline or "by X date" mentioned, extract it as ISO date string (YYYY-MM-DD). null if no deadline.',
    },
    reminderDate: {
      type: Type.STRING,
      description: 'When to remind about this (ISO date). For "call John Tuesday" = Tuesday morning. null if no reminder needed.',
    },
    timeContext: {
      type: Type.STRING,
      description: 'Human-readable time context (e.g., "by Tuesday", "next week", "February 26th", "no deadline")',
    },

    // People/things mentioned - for linking
    mentions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Names, companies, projects, or topics mentioned (for linking related items)',
    },

    // Simple tags for search
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2-4 searchable tags',
    },

    // Only if it's clearly business-related and needs routing
    needsAction: {
      type: Type.BOOLEAN,
      description: 'True if this requires Vince to DO something (call, email, follow up). False for ideas, notes, reference.',
    },
    suggestedAction: {
      type: Type.STRING,
      description: 'If needsAction is true, what should Vince do? (e.g., "Call Sarah", "Send quote", "Follow up on Ryman")',
    },
  },
  required: ['response', 'summary', 'type', 'tags', 'needsAction'],
};

// Types for brain rules and memories
interface BrainRules {
  customRules?: string;
  priorityKeywords?: {
    high?: string[];
    low?: string[];
  };
  defaults?: {
    newLeadAction?: string;
    showInquiryAction?: string;
    followUpDays?: number;
  };
}

interface BrainMemory {
  id: string;
  content: string;
  createdAt: string;
  source?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content, brainRules, brainMemories } = req.body as {
    content: string;
    brainRules?: BrainRules;
    brainMemories?: BrainMemory[];
  };

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  // Build the rules and memory sections for the prompt
  let rulesSection = '';
  let memorySection = '';

  if (brainRules?.customRules?.trim()) {
    rulesSection = `\n\nUSER'S RULES:\n${brainRules.customRules}\n`;
  }

  if (brainMemories && brainMemories.length > 0) {
    const memoryList = brainMemories.map(m => `• ${m.content}`).join('\n');
    memorySection = `\n\nTHINGS TO REMEMBER:\n${memoryList}\n`;
  }

  // Get today's date for time calculations
  const today = new Date().toISOString().split('T')[0];
  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are Brain, Vince's personal assistant. You're a smart note-taker with good recall and time-awareness.

TODAY: ${dayOfWeek}, ${today}
${rulesSection}${memorySection}
INPUT:
"""
${content}
"""

YOUR JOB - BE A HELPFUL ASSISTANT:

1. ACKNOWLEDGE CONVERSATIONALLY
   - "Got it, I'll remind you Tuesday"
   - "Saved that idea about wireless DMX"
   - "Noted - call Sarah by 5pm"
   - Keep it brief and natural, not formal

2. EXTRACT TIME/DEADLINES (CRITICAL)
   - "Call John by Tuesday" → dueDate = next Tuesday, reminderDate = Tuesday morning
   - "Follow up next week" → dueDate = next Monday
   - "Show on Feb 26" → dueDate = 2026-02-26
   - "Eventually try this" → no deadline
   - Convert relative dates to actual ISO dates based on today (${today})

3. IDENTIFY MENTIONS (for linking related items later)
   - People names: "Sarah", "John from Marriott"
   - Companies: "Ryman", "Marriott"
   - Projects/shows: "the corporate gig", "holiday show concept"
   - Topics: "wireless DMX", "drumline pricing"

4. SIMPLE TYPE (don't overthink):
   - task: Something to DO ("call", "send", "follow up", "schedule")
   - reminder: Time-based alert ("remind me", "don't forget", "by Tuesday")
   - idea: Creative thought, concept, "what if", brainstorm
   - note: General info, observation, thought
   - contact: Person/company info
   - show: Show/gig/event related
   - lead: Business opportunity, inquiry
   - reference: Info to save for later lookup

5. DOES THIS NEED ACTION?
   - needsAction: true if Vince needs to DO something
   - needsAction: false for ideas, notes, reference, FYI stuff

CONTEXT: Vince is an entertainer (LuminaDrums, DJ Drums, drumline). He gets inquiries from venues, event planners, corporate clients. He captures ideas, tasks, reminders, show concepts, people to call, random thoughts.

Be conversational, not formal. You're taking notes for a friend, not filing reports.

Return structured JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.4,
      },
    });

    const result = JSON.parse(response.text || '{}');

    // Map to response format with backward compatibility
    return res.status(200).json({
      // New conversational fields
      response: result.response || 'Got it',
      summary: result.summary || content.slice(0, 200),
      type: result.type || 'note',
      dueDate: result.dueDate || null,
      reminderDate: result.reminderDate || null,
      timeContext: result.timeContext || null,
      mentions: result.mentions || [],
      tags: result.tags || [],
      needsAction: result.needsAction || false,
      suggestedAction: result.suggestedAction || null,

      // Backward compatibility - map to old fields
      category: mapTypeToCategory(result.type),
      context: 'business',
      urgency: result.needsAction ? (result.dueDate ? 'today' : 'when_available') : 'fyi',
      destination: mapTypeToDestination(result.type),
      intentType: mapTypeToIntent(result.type),
      primaryAction: result.needsAction && result.suggestedAction ? {
        type: 'create_task',
        label: result.suggestedAction,
      } : { type: 'none', label: 'No action needed' },
      entities: extractMentionsAsEntities(result.mentions || []),
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ error: 'Failed to process content' });
  }
}

// Map simple type to legacy category
function mapTypeToCategory(type: string): string {
  const map: Record<string, string> = {
    task: 'tasks',
    reminder: 'tasks',
    idea: 'ideas',
    note: 'notes',
    contact: 'contacts',
    show: 'shows',
    lead: 'leads',
    reference: 'reference',
  };
  return map[type] || 'notes';
}

// Map type to destination
function mapTypeToDestination(type: string): string {
  if (type === 'lead' || type === 'contact') return 'leadtrack';
  if (type === 'show') return 'showsync';
  return 'archive';
}

// Map type to intent
function mapTypeToIntent(type: string): string {
  const map: Record<string, string> = {
    task: 'task',
    reminder: 'task',
    idea: 'idea',
    note: 'general',
    contact: 'performer_offer',
    show: 'show_inquiry',
    lead: 'new_lead',
    reference: 'reference',
  };
  return map[type] || 'general';
}

// Extract mentions as entities for backward compat
function extractMentionsAsEntities(mentions: string[]): Array<{type: string; value: string; confidence: number}> {
  return mentions.map(mention => ({
    type: 'person', // simplified - could be smarter
    value: mention,
    confidence: 0.8,
  }));
}
