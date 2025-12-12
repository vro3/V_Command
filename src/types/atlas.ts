export type Category =
  | 'ideas'
  | 'tasks'
  | 'contacts'
  | 'leads'
  | 'shows'
  | 'notes'
  | 'reference'
  | 'quotes'
  | 'bookmarks'
  | 'meetings'
  | 'projects';

export type ContentType = 'text' | 'url' | 'image' | 'voice';

export type CaptureContext = 'business' | 'personal';

// NEW: Action-focused routing
export type Destination = 'leadtrack' | 'showsync' | 'both' | 'archive' | 'none';

export type Urgency = 'immediate' | 'today' | 'this_week' | 'when_available' | 'fyi';

export type IntentType =
  | 'new_lead'
  | 'lead_followup'
  | 'show_inquiry'
  | 'show_confirmation'
  | 'show_logistics'
  | 'contract'
  | 'invoice_payment'
  | 'performer_offer'
  | 'task'
  | 'reference'
  | 'idea'
  | 'general';

export type AlertType = 'conflict' | 'opportunity' | 'risk' | 'reminder';

export interface Alert {
  type: AlertType;
  message: string;
}

export interface PrimaryAction {
  type: 'add_to_leadtrack' | 'add_to_showsync' | 'send_email' | 'send_quote' | 'confirm_show' | 'follow_up' | 'call' | 'research' | 'create_task' | 'archive' | 'none';
  label: string;
  description?: string;
}

export interface ExtractedData {
  contactName?: string;
  company?: string;
  email?: string;
  phone?: string;
  eventType?: string;
  eventDate?: string;
  venue?: string;
  budget?: string;
  fee?: string;
  status?: 'inquiry' | 'quoted' | 'pending' | 'confirmed' | 'completed';
}

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

// Suggested action from AI
export interface SuggestedAction {
  type: 'add_to_leadtrack' | 'add_to_showsync' | 'send_email' | 'schedule_followup' | 'create_task' | 'add_to_calendar' | 'research' | 'call' | 'none';
  label: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  data?: Record<string, string>; // Pre-filled data for the action
}

// Simple type for the new conversational Brain
export type SimpleType = 'task' | 'reminder' | 'idea' | 'note' | 'contact' | 'show' | 'lead' | 'reference';

export interface Capture {
  id: string;
  userId: string;

  // Content
  rawContent: string;
  contentType: ContentType;

  // NEW: Conversational Brain fields
  response?: string;           // Brain's conversational acknowledgment
  simpleType?: SimpleType;     // Simple type (task, idea, note, etc.)
  dueDate?: string | null;     // ISO date if there's a deadline
  reminderDate?: string | null; // ISO date when to remind
  timeContext?: string | null;  // Human-readable time ("by Tuesday", "next week")
  mentions?: string[];          // People, companies, topics mentioned
  needsAction?: boolean;        // Does this require action?
  suggestedAction?: string | null; // What to do ("Call Sarah", "Send quote")

  // AI-Generated (legacy - kept for backward compat)
  summary: string;
  category: Category;
  tags: string[];
  entities: Entity[];
  context: CaptureContext;

  // Legacy action-focused fields (backward compat)
  urgency?: Urgency;
  destination?: Destination;
  destinationReason?: string;
  intentType?: IntentType;
  extractedData?: ExtractedData;
  primaryAction?: PrimaryAction;
  secondaryActions?: Array<{ type: string; label: string }>;
  alerts?: Alert[];

  // Legacy AI-Suggested actions (for backward compat)
  suggestedActions?: SuggestedAction[];

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
