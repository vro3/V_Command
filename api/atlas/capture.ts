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
            enum: ['person', 'company', 'date', 'location', 'project'],
          },
          value: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
        },
        required: ['type', 'value', 'confidence'],
      },
      description: 'Extracted entities (people, companies, dates, locations, projects)',
    },
  },
  required: ['summary', 'category', 'tags'],
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

    const prompt = `Analyze the following ${contentType === 'url' ? 'URL/link' : 'text'} and extract structured information.

Content to analyze:
"""
${content}
"""

Instructions:
1. Create a concise summary (1-2 sentences) that captures the key information
2. Determine the best category:
   - ideas: Creative thoughts, concepts, brainstorms
   - tasks: Action items, todos, things to do
   - contacts: People, companies, contact information
   - notes: General notes, observations
   - reference: Documentation, how-tos, guides
   - quotes: Memorable quotes, sayings
   - bookmarks: Saved URLs, links to remember
   - meetings: Meeting notes, agendas, schedules
   - projects: Project-related information
3. Generate 3-5 relevant tags for easy searching
4. Extract any entities (people, companies, dates, locations, projects) mentioned

Return your analysis in the specified JSON format.`;

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
      tags: result.tags || [],
      entities: result.entities || [],
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ error: 'Failed to process content' });
  }
}
