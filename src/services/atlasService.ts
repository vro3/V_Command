import { Capture, Category, ContentType } from '../types/atlas';

const STORAGE_KEY = 'v_command_captures';

// Local storage helpers
export function loadCaptures(): Capture[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCaptures(captures: Capture[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(captures));
}

// Generate unique ID
function generateId(): string {
  return `cap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Process content with Gemini API
export async function processCapture(
  content: string,
  contentType: ContentType,
  userId: string = 'default'
): Promise<Capture> {
  try {
    const response = await fetch('/api/atlas/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, contentType }),
    });

    if (!response.ok) {
      throw new Error('Failed to process capture');
    }

    const result = await response.json();

    const capture: Capture = {
      id: generateId(),
      userId,
      rawContent: content,
      contentType,
      summary: result.summary,
      category: result.category,
      tags: result.tags,
      entities: result.entities || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: contentType === 'url' ? content : undefined,
    };

    return capture;
  } catch (error) {
    console.error('Error processing capture:', error);
    // Fallback to local processing if API fails
    return createFallbackCapture(content, contentType, userId);
  }
}

// Fallback when API is unavailable
function createFallbackCapture(
  content: string,
  contentType: ContentType,
  userId: string
): Capture {
  // Simple heuristics for category detection
  let category: Category = 'notes';

  if (contentType === 'url') {
    category = 'bookmarks';
  } else if (/\b(todo|task|need to|must|should|reminder)\b/i.test(content)) {
    category = 'tasks';
  } else if (/\b(idea|thought|what if|maybe|could)\b/i.test(content)) {
    category = 'ideas';
  } else if (/\b(meeting|call|schedule|agenda)\b/i.test(content)) {
    category = 'meetings';
  } else if (/@|email|phone|\d{3}[-.]?\d{3}[-.]?\d{4}/.test(content)) {
    category = 'contacts';
  } else if (/["'].*["']|said|quote/i.test(content)) {
    category = 'quotes';
  }

  // Extract simple tags from content
  const tags: string[] = [];
  const words = content.split(/\s+/);
  words.forEach((word) => {
    if (word.startsWith('#') && word.length > 1) {
      tags.push(word.slice(1).toLowerCase());
    }
  });

  return {
    id: generateId(),
    userId,
    rawContent: content,
    contentType,
    summary: content.length > 200 ? content.slice(0, 197) + '...' : content,
    category,
    tags: tags.slice(0, 5),
    entities: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: contentType === 'url' ? content : undefined,
  };
}

// Search captures
export function searchCaptures(captures: Capture[], query: string): Capture[] {
  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/).filter((w) => w.length > 2);

  return captures
    .map((capture) => {
      let score = 0;

      // Check summary
      if (capture.summary.toLowerCase().includes(lowerQuery)) {
        score += 10;
      }

      // Check raw content
      if (capture.rawContent.toLowerCase().includes(lowerQuery)) {
        score += 5;
      }

      // Check tags
      capture.tags.forEach((tag) => {
        if (tag.toLowerCase().includes(lowerQuery)) {
          score += 8;
        }
      });

      // Check individual words
      queryWords.forEach((word) => {
        if (capture.summary.toLowerCase().includes(word)) score += 2;
        if (capture.rawContent.toLowerCase().includes(word)) score += 1;
        capture.tags.forEach((tag) => {
          if (tag.toLowerCase().includes(word)) score += 3;
        });
      });

      // Check entities
      capture.entities.forEach((entity) => {
        if (entity.value.toLowerCase().includes(lowerQuery)) {
          score += 7;
        }
      });

      return { capture, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.capture);
}

// Chat with Atlas about captures
export async function chatWithAtlas(
  query: string,
  captures: Capture[]
): Promise<string> {
  try {
    const response = await fetch('/api/atlas/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, captures: captures.slice(0, 20) }),
    });

    if (!response.ok) {
      throw new Error('Failed to chat with Atlas');
    }

    const result = await response.json();
    return result.response;
  } catch (error) {
    console.error('Error chatting with Atlas:', error);
    return "I'm having trouble connecting right now. Try searching your captures instead.";
  }
}
