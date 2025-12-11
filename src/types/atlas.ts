export type Category =
  | 'ideas'
  | 'tasks'
  | 'contacts'
  | 'notes'
  | 'reference'
  | 'quotes'
  | 'bookmarks'
  | 'meetings'
  | 'projects';

export type ContentType = 'text' | 'url' | 'image' | 'voice';

export interface Entity {
  type: 'person' | 'company' | 'date' | 'location' | 'project';
  value: string;
  confidence: number;
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

  // Metadata
  createdAt: string;
  updatedAt: string;
  source?: string;

  // Relationships
  relatedIds?: string[];
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
  ideas: { label: 'Ideas', color: 'text-purple-400', icon: 'Lightbulb' },
  tasks: { label: 'Tasks', color: 'text-blue-400', icon: 'CheckSquare' },
  contacts: { label: 'Contacts', color: 'text-green-400', icon: 'Users' },
  notes: { label: 'Notes', color: 'text-slate-400', icon: 'FileText' },
  reference: { label: 'Reference', color: 'text-cyan-400', icon: 'BookOpen' },
  quotes: { label: 'Quotes', color: 'text-amber-400', icon: 'Quote' },
  bookmarks: { label: 'Bookmarks', color: 'text-indigo-400', icon: 'Bookmark' },
  meetings: { label: 'Meetings', color: 'text-rose-400', icon: 'Calendar' },
  projects: { label: 'Projects', color: 'text-emerald-400', icon: 'Folder' },
};
