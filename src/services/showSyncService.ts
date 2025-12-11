import { getStoredAuth } from './authService';

export interface ShowStats {
  total: number;
  inquirySent: number;
  inquiryOpened: number;
  inquiryPending: number;
  available: number;
  unavailable: number;
  offerSent: number;
  offerAccepted: number;
  offerDeclined: number;
  confirmed: number;
}

export interface RosterEntry {
  showId: string;
  showName: string;
  performerId: string;
  performerName: string;
  performerEmail: string;
  pay: string;
  inquiry: {
    sentAt: string | null;
    openedAt: string | null;
    response: string | null;
    respondedAt: string | null;
  };
  offer: {
    sentAt: string | null;
    openedAt: string | null;
    response: string | null;
    respondedAt: string | null;
  };
  confirmation: {
    sentAt: string | null;
    openedAt: string | null;
    response: string | null;
    respondedAt: string | null;
  };
}

export interface ShowSummary {
  showId: string;
  showName: string;
  showDate: string;
  venue: string;
  clientName: string;
  roster: RosterEntry[];
  stats: ShowStats;
}

export interface ShowSyncData {
  shows: ShowSummary[];
  pendingResponses: number;
  recentlyOpened: number;
  totalUpcoming: number;
}

export async function fetchShowSyncData(): Promise<ShowSyncData | null> {
  const auth = getStoredAuth();
  if (!auth) {
    console.error('No auth data found');
    return null;
  }

  try {
    // Re-encode the auth data as base64 for the API
    const tokenData = btoa(JSON.stringify(auth));

    const response = await fetch('/api/showsync/roster', {
      headers: {
        'Authorization': `Bearer ${tokenData}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('ShowSync API error:', error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch ShowSync data:', error);
    return null;
  }
}

// Format date for display
export function formatShowDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Get status color based on response
export function getStatusColor(status: string | null): string {
  switch (status) {
    case 'Available':
    case 'Accepted':
    case 'Confirmed':
      return 'bg-emerald-500';
    case 'Unavailable':
    case 'Declined':
      return 'bg-red-500';
    default:
      return 'bg-slate-600';
  }
}
