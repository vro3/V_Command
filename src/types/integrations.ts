// Show Sync types
export interface Show {
  id: string;
  name: string;
  date: string;
  venue: string;
  status: 'inquiry' | 'offer' | 'pending' | 'confirmed';
  performerCount: number;
}

export interface ShowSyncStats {
  upcomingShows: number;
  confirmedShows: number;
  pendingOffers: number;
  totalPerformers: number;
}

// Outreach/LeadTrack types
export interface Lead {
  id: string;
  agencyName: string;
  contactName: string;
  email: string;
  status: LeadStatus;
  lastContactDate?: string;
}

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'replied'
  | 'meeting_set'
  | 'closed_won'
  | 'closed_lost'
  | 'dead';

export interface OutreachStats {
  totalLeads: number;
  activeLeads: number;
  needsFollowUp: number;
  closedWon: number;
  responseRate: number;
}

// The Overlap types
export interface OverlapSession {
  id: string;
  name: string;
  questionsCompleted: number;
  totalQuestions: number;
}

export interface OverlapStats {
  sessionsStarted: number;
  sessionsCompleted: number;
  responsesRecorded: number;
}

// App card configuration
export interface AppConfig {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  color: string;
  stats?: {
    label: string;
    value: string | number;
  };
}
