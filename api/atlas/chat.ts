import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, captures } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Build context from captures
    const capturesContext =
      captures && captures.length > 0
        ? captures
            .map(
              (c: { summary: string; category: string; tags: string[]; createdAt: string }) =>
                `[${c.category.toUpperCase()}] ${c.summary} (Tags: ${c.tags.join(', ')}) - Created: ${new Date(c.createdAt).toLocaleDateString()}`
            )
            .join('\n')
        : 'No captures available yet.';

    const prompt = `You are Atlas, a helpful AI assistant that helps users organize and retrieve their captured knowledge. You have access to the user's captures (notes, ideas, tasks, contacts, etc.).

User's Captures:
${capturesContext}

User's Question: "${query}"

Instructions:
1. Answer the user's question based on their captures
2. If asked to find something, reference specific captures
3. If asked about something not in captures, say so helpfully
4. Be concise but helpful
5. If the user wants to save something new, guide them to just type/paste it

Respond naturally and conversationally.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    return res.status(200).json({
      response: response.text || "I'm not sure how to help with that.",
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Chat failed' });
  }
}
