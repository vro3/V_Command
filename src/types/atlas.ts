export type Category =
  | 'ideas'
  | 'tasks'
  | 'contacts'
  | 'leads'      // New: potential business leads
  | 'shows'      // New: show/booking related
  | 'notes'
  | 'reference'
  | 'quotes'
  | 'bookmarks'
  | 'meetings'
  | 'projects';

export type ContentType = 'text' | 'url' | 'image' | 'voice';

export type CaptureContext = 'business' | 'personal';

export interface Entity {
  type: 'person' | 'company' | 'date' | 'location' | 'project' | 'email' | 'phone' | 'money';
  value: string;
  confidence: number;
}

// Structured data for leads
export interface LeadData {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  source?: string;
  eventDate?: string;
  eventType?: string;
  budget?: string;
  notes?: string;
}

// Structured data for shows
export interface ShowData {
  client?: string;
  showType?: string;
  date?: string;
  venue?: string;
  fee?: string;
  status?: 'inquiry' | 'quoted' | 'confirmed' | 'completed';
}

// Structured data for tasks
export interface TaskData {
  title?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  relatedTo?: string;
}

export interface Capture {
  id: string;
  userId: string;

  // Content
  rawContent: string;
  contentType: ContentType;

  // AI-Generated
  summary: string;
  category: Category;
  tags: string[];
  entities: Entity[];
  context: CaptureContext;

  // Structured data (populated based on category)
  leadData?: LeadData;
  showData?: ShowData;
  taskData?: TaskData;

  // Metadata
  createdAt: string;
  updatedAt: string;
  source?: string;

  // Relationships
  relatedIds?: string[];

  // Actions
  actionTaken?: 'added_to_leadtrack' | 'added_to_showsync' | 'added_to_tasks';
}

export interface CaptureInput {
  content: string;
  contentType: ContentType;
  source?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  captures?: Capture[];
}

export const CATEGORY_INFO: Record<Category, { label: string; color: string; icon: string }> = {
  leads: { label: 'Leads', color: 'text-accent', icon: 'Target' },
  shows: { label: 'Shows', color: 'text-emerald-400', icon: 'Calendar' },
  tasks: { label: 'Tasks', color: 'text-blue-400', icon: 'CheckSquare' },
  ideas: { label: 'Ideas', color: 'text-purple-400', icon: 'Lightbulb' },
  contacts: { label: 'Contacts', color: 'text-green-400', icon: 'Users' },
  notes: { label: 'Notes', color: 'text-slate-400', icon: 'FileText' },
  reference: { label: 'Reference', color: 'text-cyan-400', icon: 'BookOpen' },
  quotes: { label: 'Quotes', color: 'text-amber-400', icon: 'Quote' },
  bookmarks: { label: 'Bookmarks', color: 'text-indigo-400', icon: 'Bookmark' },
  meetings: { label: 'Meetings', color: 'text-rose-400', icon: 'Calendar' },
  projects: { label: 'Projects', color: 'text-teal-400', icon: 'Folder' },
};
