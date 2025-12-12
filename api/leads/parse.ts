import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: 'Contact person name' },
    company: { type: Type.STRING, description: 'Company or organization name' },
    email: { type: Type.STRING, description: 'Email address' },
    phone: { type: Type.STRING, description: 'Phone number' },
    eventType: { type: Type.STRING, description: 'Type of event (corporate, wedding, private, etc.)' },
    eventDate: { type: Type.STRING, description: 'Date of event if mentioned' },
    venue: { type: Type.STRING, description: 'Venue or location' },
    budget: { type: Type.STRING, description: 'Budget if mentioned' },
    notes: { type: Type.STRING, description: 'Any other relevant notes or context' },
    source: { type: Type.STRING, description: 'Lead source if identifiable (email, website, referral, etc.)' },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Extract lead/contact information from this text. This is for an entertainment business that books performances (DJ, drums, etc.).

Text to parse:
"""
${content}
"""

Extract:
- name: The contact person's name
- company: Company, organization, venue, or hotel name
- email: Email address
- phone: Phone number (any format)
- eventType: Type of event (corporate event, wedding, private party, conference, gala, etc.)
- eventDate: When is the event (parse any date format, output as readable date)
- venue: Where is the event
- budget: Any budget mentioned (keep original format like "$5k" or "$5,000")
- notes: Any other relevant info (requests, show preferences, timing, etc.)
- source: How did this lead come in (email inquiry, website form, referral, cold outreach, etc.)

Only include fields you can find in the text. Leave others empty.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    });

    const result = JSON.parse(response.text || '{}');

    return res.status(200).json({
      name: result.name || '',
      company: result.company || '',
      email: result.email || '',
      phone: result.phone || '',
      eventType: result.eventType || '',
      eventDate: result.eventDate || '',
      venue: result.venue || '',
      budget: result.budget || '',
      notes: result.notes || '',
      source: result.source || '',
    });
  } catch (error) {
    console.error('Lead parse API error:', error);
    return res.status(500).json({ error: 'Failed to parse lead information' });
  }
}
