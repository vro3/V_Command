import { Capture, Category, ContentType, LeadData, ShowData, TaskData } from '../types/atlas';
import { getStoredAuth } from './authService';

const STORAGE_KEY = 'v_command_captures';
const SYNC_DEBOUNCE_MS = 2000; // Wait 2 seconds before syncing to cloud

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

// Local storage helpers (used as cache)
export function loadCaptures(): Capture[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCaptures(captures: Capture[]): void {
  // Save to localStorage immediately (cache)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(captures));

  // Debounce cloud sync
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(() => {
    syncCapturesToCloud(captures);
  }, SYNC_DEBOUNCE_MS);
}

// Cloud sync functions
async function getAuthToken(): Promise<string | null> {
  const auth = getStoredAuth();
  if (!auth?.tokens) return null;

  // Encode tokens as base64 for API
  return btoa(JSON.stringify(auth.tokens));
}

export async function loadCapturesFromCloud(): Promise<Capture[]> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.log('No auth token, using local storage only');
      return loadCaptures();
    }

    const response = await fetch('/api/brain/captures', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to load from cloud, using local cache');
      return loadCaptures();
    }

    const data = await response.json();
    const cloudCaptures = data.captures || [];

    // Update local cache
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudCaptures));

    return cloudCaptures;
  } catch (error) {
    console.error('Error loading from cloud:', error);
    return loadCaptures();
  }
}

async function syncCapturesToCloud(captures: Capture[]): Promise<void> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.log('No auth token, skipping cloud sync');
      return;
    }

    const response = await fetch('/api/brain/captures', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ captures }),
    });

    if (!response.ok) {
      console.error('Failed to sync to cloud');
    } else {
      console.log('Captures synced to cloud');
    }
  } catch (error) {
    console.error('Error syncing to cloud:', error);
  }
}

export async function deleteFromCloud(captureId: string): Promise<void> {
  try {
    const token = await getAuthToken();
    if (!token) return;

    await fetch('/api/brain/captures', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id: captureId }),
    });
  } catch (error) {
    console.error('Error deleting from cloud:', error);
  }
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
      context: result.context || 'personal',
      leadData: result.leadData,
      showData: result.showData,
      taskData: result.taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: contentType === 'url' ? content : undefined,
    };

    return capture;
  } catch (error) {
    console.error('Error processing capture:', error);
    // Fallback to local processing if API fails
    return createSmartFallbackCapture(content, contentType, userId);
  }
}

// Smart fallback with lead/show/task detection
function createSmartFallbackCapture(
  content: string,
  contentType: ContentType,
  userId: string
): Capture {
  let category: Category = 'notes';
  let context: 'business' | 'personal' = 'personal';
  let leadData: LeadData | undefined;
  let showData: ShowData | undefined;
  let taskData: TaskData | undefined;

  // Extract patterns
  const emailMatch = content.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = content.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/);
  const websiteMatch = content.match(/(?:https?:\/\/)?(?:www\.)?[\w-]+\.\w{2,}(?:\/\S*)?/i);
  const moneyMatch = content.match(/\$[\d,]+(?:k)?|\d+k|\d{4,}(?:\s*dollars)?/i);
  const dateMatch = content.match(/(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:,?\s+\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/i);

  // Lead detection - potential business contact/client
  const leadKeywords = /\b(lead|prospect|client|contact|reach out|follow up|inquiry|interested|event planner|conference|corporate|booking|book|dmcs?|agency|production)\b/i;
  const companyIndicators = /\b(inc|llc|corp|company|group|enterprises|international|hotels?|marriott|hilton|hyatt|sheraton|conference|convention|event)\b/i;

  if (leadKeywords.test(content) || (emailMatch && companyIndicators.test(content)) ||
      (websiteMatch && companyIndicators.test(content))) {
    category = 'leads';
    context = 'business';

    // Extract lead data
    const nameMatch = content.match(/(?:contact|name|person|with|from)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
    const companyMatch = content.match(/(?:company|at|from|for)[\s:]+([A-Z][A-Za-z\s&]+?)(?:\s+(?:inc|llc|corp|,|\.|$))/i);

    leadData = {
      name: nameMatch?.[1],
      company: companyMatch?.[1]?.trim(),
      email: emailMatch?.[0],
      phone: phoneMatch?.[0],
      website: websiteMatch?.[0],
      eventDate: dateMatch?.[0],
      budget: moneyMatch?.[0],
      notes: content.slice(0, 200),
    };
  }
  // Show detection - booking/performance related
  else if (/\b(show|gig|performance|booking|confirmed|luminadrums|dj drums|drumline|aurora corps|ai amplification|event|venue)\b/i.test(content) &&
           (dateMatch || moneyMatch)) {
    category = 'shows';
    context = 'business';

    // Determine status
    let status: ShowData['status'] = 'inquiry';
    if (/confirmed|booked|signed/i.test(content)) status = 'confirmed';
    else if (/quote|proposal|sent/i.test(content)) status = 'quoted';
    else if (/complete|done|finished/i.test(content)) status = 'completed';

    showData = {
      client: content.match(/(?:for|at|with)\s+([A-Z][A-Za-z\s&]+?)(?:\s+(?:on|in|$))/i)?.[1]?.trim(),
      showType: content.match(/\b(luminadrums|dj drums|hot stickin|drumline|aurora corps|ai amplification|karaoke|vince the dj)\b/i)?.[0],
      date: dateMatch?.[0],
      fee: moneyMatch?.[0],
      status,
    };
  }
  // Task detection
  else if (/\b(todo|task|need to|must|should|reminder|follow up|don't forget|remember to|call|email|send|schedule)\b/i.test(content)) {
    category = 'tasks';
    context = companyIndicators.test(content) ? 'business' : 'personal';

    let priority: TaskData['priority'] = 'medium';
    if (/\b(urgent|asap|immediately|critical|important)\b/i.test(content)) priority = 'high';
    else if (/\b(whenever|eventually|someday|low priority)\b/i.test(content)) priority = 'low';

    taskData = {
      title: content.split(/[.!?\n]/)[0].slice(0, 100),
      dueDate: dateMatch?.[0],
      priority,
    };
  }
  // URL/Bookmark
  else if (contentType === 'url') {
    category = 'bookmarks';
    context = companyIndicators.test(content) ? 'business' : 'personal';
  }
  // Meeting
  else if (/\b(meeting|call|schedule|agenda|zoom|teams)\b/i.test(content)) {
    category = 'meetings';
    context = companyIndicators.test(content) ? 'business' : 'personal';
  }
  // Idea
  else if (/\b(idea|thought|what if|maybe|could|concept|brainstorm)\b/i.test(content)) {
    category = 'ideas';
  }
  // Contact
  else if (emailMatch || phoneMatch) {
    category = 'contacts';
    context = companyIndicators.test(content) ? 'business' : 'personal';
  }
  // Quote
  else if (/["'].*["']|said|quote/i.test(content)) {
    category = 'quotes';
  }

  // Extract hashtags as tags
  const tags: string[] = [];
  const hashtagMatches = content.match(/#[\w]+/g);
  if (hashtagMatches) {
    hashtagMatches.forEach((tag) => tags.push(tag.slice(1).toLowerCase()));
  }

  // Auto-add business tags
  if (context === 'business') {
    if (category === 'leads') tags.push('lead');
    if (category === 'shows') tags.push('show');
  }

  // Extract entities
  const entities = [];
  if (emailMatch) entities.push({ type: 'email' as const, value: emailMatch[0], confidence: 1 });
  if (phoneMatch) entities.push({ type: 'phone' as const, value: phoneMatch[0], confidence: 1 });
  if (moneyMatch) entities.push({ type: 'money' as const, value: moneyMatch[0], confidence: 0.8 });
  if (dateMatch) entities.push({ type: 'date' as const, value: dateMatch[0], confidence: 0.8 });

  return {
    id: generateId(),
    userId,
    rawContent: content,
    contentType,
    summary: content.length > 200 ? content.slice(0, 197) + '...' : content,
    category,
    tags: tags.slice(0, 5),
    entities,
    context,
    leadData,
    showData,
    taskData,
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

      // Check structured data
      if (capture.leadData) {
        const leadStr = JSON.stringify(capture.leadData).toLowerCase();
        if (leadStr.includes(lowerQuery)) score += 8;
      }
      if (capture.showData) {
        const showStr = JSON.stringify(capture.showData).toLowerCase();
        if (showStr.includes(lowerQuery)) score += 8;
      }

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
