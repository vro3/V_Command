import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const interactionId = req.query.id as string;

  if (!interactionId) {
    return res.status(400).json({ error: 'Interaction ID is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Get the interaction status using the Interactions API
    // The get method takes the ID string directly
    const interaction = await ai.interactions.get(interactionId);

    // Type assertion for the response - the SDK types may be incomplete for this beta API
    const interactionData = interaction as {
      id?: string;
      status?: string;
      state?: string;
      output?: string;
      response?: {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
          groundingMetadata?: {
            groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
          };
        }>;
      };
      intermediateResponse?: unknown;
    };

    // Check if research is complete - handle various status field names
    const statusValue = interactionData.status || interactionData.state || '';
    const isComplete = statusValue === 'COMPLETE' || statusValue === 'COMPLETED' || statusValue === 'complete';
    const isFailed = statusValue === 'FAILED' || statusValue === 'ERROR' || statusValue === 'failed';
    const isRunning = !isComplete && !isFailed;

    // Extract the research report if complete
    let report: string | null = null;
    let sources: Array<{ title: string; url: string }> = [];

    if (isComplete) {
      // Try to get output from various possible locations
      if (interactionData.output) {
        report = interactionData.output;
      } else if (interactionData.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        report = interactionData.response.candidates[0].content.parts[0].text;
      }

      // Extract grounding metadata (sources/citations) if available
      const groundingMetadata = interactionData.response?.candidates?.[0]?.groundingMetadata;
      if (groundingMetadata?.groundingChunks) {
        sources = groundingMetadata.groundingChunks
          .filter((chunk) => chunk.web?.uri)
          .map((chunk) => ({
            title: chunk.web?.title || 'Source',
            url: chunk.web?.uri || '',
          }));
      }
    }

    return res.status(200).json({
      interactionId,
      state: statusValue,
      isComplete,
      isFailed,
      isRunning,
      report,
      sources,
      progress: interactionData.intermediateResponse ? 'Processing...' : null,
    });

  } catch (error) {
    console.error('Deep Research status error:', error);
    return res.status(500).json({
      error: 'Failed to get research status',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
