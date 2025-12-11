import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: 'A concise 1-2 sentence summary of the content',
    },
    category: {
      type: Type.STRING,
      enum: [
        'leads',
        'shows',
        'ideas',
        'tasks',
        'contacts',
        'notes',
        'reference',
        'quotes',
        'bookmarks',
        'meetings',
        'projects',
      ],
      description: 'The best category for this content',
    },
    context: {
      type: Type.STRING,
      enum: ['business', 'personal'],
      description: 'Whether this is business or personal content',
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3-5 relevant tags for easy searching',
    },
    entities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            enum: ['person', 'company', 'date', 'location', 'project', 'email', 'phone', 'money'],
          },
          value: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
        },
        required: ['type', 'value', 'confidence'],
      },
      description: 'Extracted entities',
    },
    suggestedActions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            enum: ['add_to_leadtrack', 'add_to_showsync', 'send_email', 'schedule_followup', 'create_task', 'add_to_calendar', 'research', 'call', 'none'],
          },
          label: { type: Type.STRING },
          description: { type: Type.STRING },
          priority: {
            type: Type.STRING,
            enum: ['high', 'medium', 'low'],
          },
        },
        required: ['type', 'label', 'priority'],
      },
      description: 'Recommended next actions based on the content',
    },
    leadData: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        company: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        eventDate: { type: Type.STRING },
        budget: { type: Type.STRING },
      },
      description: 'Structured lead data if this is a business lead',
    },
    showData: {
      type: Type.OBJECT,
      properties: {
        client: { type: Type.STRING },
        showType: { type: Type.STRING },
        date: { type: Type.STRING },
        venue: { type: Type.STRING },
        fee: { type: Type.STRING },
        status: { type: Type.STRING, enum: ['inquiry', 'quoted', 'confirmed', 'completed'] },
      },
      description: 'Structured show/booking data if this is performance-related',
    },
    taskData: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        dueDate: { type: Type.STRING },
        priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
      },
      description: 'Structured task data if this is an action item',
    },
  },
  required: ['summary', 'category', 'context', 'tags', 'suggestedActions'],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content, contentType } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an AI assistant for a professional entertainer/performer who manages business leads and bookings. Analyze this content and suggest ACTIONS to take.

Content to analyze:
"""
${content}
"""

Context: The user is Vince, a professional entertainer who:
- Gets booking inquiries for performances (LuminaDrums, DJ Drums, drumline, karaoke, etc.)
- Manages leads from venues, event planners, DMCs, and corporate clients
- Needs to track shows, send quotes, follow up with leads
- Uses LeadTrack for CRM and Show Sync for booking management

Instructions:
1. Create a concise summary (1-2 sentences) focusing on what matters
2. Determine the category:
   - leads: Potential business contact, inquiry, or client (email addresses, companies reaching out)
   - shows: Show/booking/performance related info (dates, venues, fees, confirmations)
   - tasks: Action items, todos, follow-ups needed
   - contacts: Contact information to save
   - ideas: Creative thoughts, business ideas
   - notes: General notes, observations
   - reference: Documentation, guides, research
   - quotes: Memorable quotes
   - bookmarks: URLs to save
   - meetings: Meeting schedules, agendas
   - projects: Project info
3. Determine if this is business or personal context
4. Generate 3-5 searchable tags
5. Extract entities (people, companies, dates, emails, phone numbers, money amounts)

MOST IMPORTANTLY - Suggest 1-3 specific ACTIONS the user should take:
- add_to_leadtrack: Add this person/company to CRM (for new leads/contacts)
- add_to_showsync: Add this show/booking to the calendar
- send_email: Compose and send an email (for replies, quotes, follow-ups)
- schedule_followup: Set a reminder to follow up later
- create_task: Create a specific task/todo
- add_to_calendar: Add a date/event to calendar
- research: Look up more info about this company/person
- call: Make a phone call
- none: No action needed (just informational)

Prioritize actions as:
- high: Needs immediate attention (hot lead, urgent request, time-sensitive)
- medium: Should do soon (follow-up, add to system)
- low: Nice to do when time permits

If this looks like a business lead or inquiry, ALWAYS suggest "add_to_leadtrack" as a high priority action.
If this mentions a show date or booking, suggest "add_to_showsync".
If this requires a response, suggest "send_email".

Return structured JSON with all fields including suggestedActions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.3,
      },
    });

    const result = JSON.parse(response.text || '{}');

    return res.status(200).json({
      summary: result.summary || content.slice(0, 200),
      category: result.category || 'notes',
      context: result.context || 'personal',
      tags: result.tags || [],
      entities: result.entities || [],
      suggestedActions: result.suggestedActions || [],
      leadData: result.leadData,
      showData: result.showData,
      taskData: result.taskData,
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ error: 'Failed to process content' });
  }
}
