import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const SPREADSHEET_ID = '1FEI9bnW3NHpDgJiWJ1XhOH8BORSQZQqlGwCz4sIHgEs';

// Roster columns based on Show_Sync structure
const ROSTER_COLUMNS = {
  SHOW_ID: 0,
  SHOW_NAME: 1,
  PERFORMER_ID: 2,
  PERFORMER_NAME: 3,
  PERFORMER_EMAIL: 4,
  PAY: 5,
  INQUIRY_SENT_AT: 6,
  INQUIRY_OPENED_AT: 7,
  INQUIRY_RESPONSE: 8,
  INQUIRY_RESPONDED_AT: 9,
  OFFER_SENT_AT: 10,
  OFFER_OPENED_AT: 11,
  OFFER_RESPONSE: 12,
  OFFER_RESPONDED_AT: 13,
  CONFIRMATION_SENT_AT: 14,
  CONFIRMATION_OPENED_AT: 15,
  CONFIRMATION_RESPONSE: 16,
  CONFIRMATION_RESPONDED_AT: 17,
};

interface RosterEntry {
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

interface Show {
  showId: string;
  showName: string;
  showDate: string;
  venue: string;
  clientName: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get auth token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization required' });
  }

  const tokenData = authHeader.substring(7);

  let accessToken: string;
  try {
    // Decode the base64 token (V_Command format)
    const decoded = JSON.parse(Buffer.from(tokenData, 'base64').toString('utf8'));
    accessToken = decoded.tokens?.access_token;

    if (!accessToken) {
      return res.status(401).json({ error: 'Invalid token format' });
    }
  } catch {
    return res.status(401).json({ error: 'Failed to parse token' });
  }

  try {
    // Create OAuth2 client with access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // Fetch Shows and Roster sheets in parallel
    const [showsResponse, rosterResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Shows!A2:Z',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Roster!A2:R',
      }),
    ]);

    const showsData = showsResponse.data.values || [];
    const rosterData = rosterResponse.data.values || [];

    // Parse shows (assuming columns: ShowID, ShowName, ShowDate, Venue, ClientName, ...)
    const shows: Show[] = showsData.map((row: string[]) => ({
      showId: row[0] || '',
      showName: row[1] || '',
      showDate: row[2] || '',
      venue: row[3] || '',
      clientName: row[4] || '',
    }));

    // Parse roster entries
    const roster: RosterEntry[] = rosterData.map((row: string[]) => ({
      showId: row[ROSTER_COLUMNS.SHOW_ID] || '',
      showName: row[ROSTER_COLUMNS.SHOW_NAME] || '',
      performerId: row[ROSTER_COLUMNS.PERFORMER_ID] || '',
      performerName: row[ROSTER_COLUMNS.PERFORMER_NAME] || '',
      performerEmail: row[ROSTER_COLUMNS.PERFORMER_EMAIL] || '',
      pay: row[ROSTER_COLUMNS.PAY] || '',
      inquiry: {
        sentAt: row[ROSTER_COLUMNS.INQUIRY_SENT_AT] || null,
        openedAt: row[ROSTER_COLUMNS.INQUIRY_OPENED_AT] || null,
        response: row[ROSTER_COLUMNS.INQUIRY_RESPONSE] || null,
        respondedAt: row[ROSTER_COLUMNS.INQUIRY_RESPONDED_AT] || null,
      },
      offer: {
        sentAt: row[ROSTER_COLUMNS.OFFER_SENT_AT] || null,
        openedAt: row[ROSTER_COLUMNS.OFFER_OPENED_AT] || null,
        response: row[ROSTER_COLUMNS.OFFER_RESPONSE] || null,
        respondedAt: row[ROSTER_COLUMNS.OFFER_RESPONDED_AT] || null,
      },
      confirmation: {
        sentAt: row[ROSTER_COLUMNS.CONFIRMATION_SENT_AT] || null,
        openedAt: row[ROSTER_COLUMNS.CONFIRMATION_OPENED_AT] || null,
        response: row[ROSTER_COLUMNS.CONFIRMATION_RESPONSE] || null,
        respondedAt: row[ROSTER_COLUMNS.CONFIRMATION_RESPONDED_AT] || null,
      },
    }));

    // Filter to upcoming shows (date >= today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingShows = shows.filter((show) => {
      if (!show.showDate) return false;
      try {
        const showDate = new Date(show.showDate);
        return showDate >= today;
      } catch {
        return false;
      }
    });

    // Build summary for each upcoming show
    const showSummaries = upcomingShows.map((show) => {
      const showRoster = roster.filter((r) => r.showId === show.showId);

      // Count statuses
      const stats = {
        total: showRoster.length,
        inquirySent: 0,
        inquiryOpened: 0,
        inquiryPending: 0,
        available: 0,
        unavailable: 0,
        offerSent: 0,
        offerAccepted: 0,
        offerDeclined: 0,
        confirmed: 0,
      };

      showRoster.forEach((entry) => {
        // Inquiry stats
        if (entry.inquiry.sentAt) stats.inquirySent++;
        if (entry.inquiry.openedAt) stats.inquiryOpened++;
        if (entry.inquiry.sentAt && !entry.inquiry.response) stats.inquiryPending++;
        if (entry.inquiry.response === 'Available') stats.available++;
        if (entry.inquiry.response === 'Unavailable') stats.unavailable++;

        // Offer stats
        if (entry.offer.sentAt) stats.offerSent++;
        if (entry.offer.response === 'Accepted') stats.offerAccepted++;
        if (entry.offer.response === 'Declined') stats.offerDeclined++;

        // Confirmation stats
        if (entry.confirmation.response === 'Confirmed') stats.confirmed++;
      });

      return {
        ...show,
        roster: showRoster,
        stats,
      };
    });

    // Sort by date
    showSummaries.sort((a, b) => {
      const dateA = new Date(a.showDate);
      const dateB = new Date(b.showDate);
      return dateA.getTime() - dateB.getTime();
    });

    // Get performers with pending responses (sent but no response)
    const pendingResponses = roster.filter((entry) => {
      const hasPendingInquiry = entry.inquiry.sentAt && !entry.inquiry.response;
      const hasPendingOffer = entry.offer.sentAt && !entry.offer.response;
      return hasPendingInquiry || hasPendingOffer;
    });

    // Get recently opened (opened but no response in last 48 hours)
    const recentlyOpened = roster.filter((entry) => {
      if (!entry.inquiry.openedAt || entry.inquiry.response) return false;
      const openedDate = new Date(entry.inquiry.openedAt);
      const hoursSinceOpen = (Date.now() - openedDate.getTime()) / (1000 * 60 * 60);
      return hoursSinceOpen <= 48;
    });

    return res.status(200).json({
      shows: showSummaries,
      pendingResponses: pendingResponses.length,
      recentlyOpened: recentlyOpened.length,
      totalUpcoming: upcomingShows.length,
    });
  } catch (error) {
    console.error('Google Sheets API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch show data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
