import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    matchingIds: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'IDs of captures that match the search query, ordered by relevance',
    },
    explanation: {
      type: Type.STRING,
      description: 'Brief explanation of why these captures match',
    },
  },
  required: ['matchingIds'],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, captures } = req.body;

  if (!query || !captures) {
    return res.status(400).json({ error: 'Query and captures are required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Create a summary of captures for the AI to search through
    const capturesSummary = captures
      .map(
        (c: { id: string; summary: string; category: string; tags: string[] }) =>
          `ID: ${c.id}\nSummary: ${c.summary}\nCategory: ${c.category}\nTags: ${c.tags.join(', ')}`
      )
      .join('\n\n---\n\n');

    const prompt = `You are a semantic search engine. Given the user's search query and a list of captured notes, find the most relevant captures.

Search Query: "${query}"

Available Captures:
${capturesSummary}

Instructions:
1. Find captures that semantically match the user's query
2. Consider the summary, category, and tags when matching
3. Return the IDs of matching captures, ordered by relevance (most relevant first)
4. If nothing matches, return an empty array
5. Provide a brief explanation of why these captures match

Return your response in the specified JSON format.`;

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
      matchingIds: result.matchingIds || [],
      explanation: result.explanation || '',
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Search failed' });
  }
}
