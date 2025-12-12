import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

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

  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Research query is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Start the deep research task in background mode
    // Using the Interactions API for the Deep Research agent
    const interaction = await ai.interactions.create({
      agent: 'deep-research-pro-preview-12-2025',
      input: query,
      background: true,
    });

    return res.status(200).json({
      success: true,
      interactionId: interaction.id,
      status: 'started',
      message: 'Deep Research has started. Poll /api/research/status for results.',
    });

  } catch (error) {
    console.error('Deep Research start error:', error);
    return res.status(500).json({
      error: 'Failed to start Deep Research',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
