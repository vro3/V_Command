import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

// LeadTrack CRM Spreadsheet ID
const SPREADSHEET_ID = '16zVv27wNPiO2XwNkMkJpSTMX8iSiJdPn10vY5Ab1DD8';
const SHEET_NAME = 'CRM';

interface LeadData {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  eventType?: string;
  eventDate?: string;
  venue?: string;
  budget?: string;
  notes?: string;
  source?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get auth token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const token = authHeader.slice(7);
  const leadData: LeadData = req.body;

  if (!leadData) {
    return res.status(400).json({ error: 'Lead data is required' });
  }

  try {
    // Decode token (base64 JSON with access_token)
    let accessToken: string;
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      accessToken = decoded.access_token || decoded.accessToken;
    } catch {
      accessToken = token; // Maybe it's already the access token
    }

    // Set up OAuth client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // First, get the headers to understand the column structure
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!1:1`,
    });

    const headers = headerResponse.data.values?.[0] || [];

    // Map our lead data to the spreadsheet columns
    // Common CRM columns: Name, Company, Email, Phone, Event Type, Event Date, Venue, Budget, Notes, Source, Date Added, Status
    const columnMap: Record<string, string[]> = {
      name: ['Name', 'Contact Name', 'Contact', 'Lead Name'],
      company: ['Company', 'Organization', 'Company Name', 'Org'],
      email: ['Email', 'Email Address', 'E-mail'],
      phone: ['Phone', 'Phone Number', 'Tel', 'Telephone'],
      eventType: ['Event Type', 'Type', 'Event', 'Event Category'],
      eventDate: ['Event Date', 'Date', 'Show Date', 'Performance Date'],
      venue: ['Venue', 'Location', 'Place', 'Event Location'],
      budget: ['Budget', 'Amount', 'Fee', 'Price'],
      notes: ['Notes', 'Comments', 'Description', 'Details'],
      source: ['Source', 'Lead Source', 'Origin', 'How Found'],
    };

    // Find column indices
    const findColumnIndex = (field: string): number => {
      const possibleNames = columnMap[field] || [field];
      for (const name of possibleNames) {
        const idx = headers.findIndex((h: string) =>
          h.toLowerCase().trim() === name.toLowerCase()
        );
        if (idx !== -1) return idx;
      }
      return -1;
    };

    // Build the row data
    const row: string[] = new Array(headers.length).fill('');

    // Map each field to its column
    if (leadData.name) {
      const idx = findColumnIndex('name');
      if (idx !== -1) row[idx] = leadData.name;
    }
    if (leadData.company) {
      const idx = findColumnIndex('company');
      if (idx !== -1) row[idx] = leadData.company;
    }
    if (leadData.email) {
      const idx = findColumnIndex('email');
      if (idx !== -1) row[idx] = leadData.email;
    }
    if (leadData.phone) {
      const idx = findColumnIndex('phone');
      if (idx !== -1) row[idx] = leadData.phone;
    }
    if (leadData.eventType) {
      const idx = findColumnIndex('eventType');
      if (idx !== -1) row[idx] = leadData.eventType;
    }
    if (leadData.eventDate) {
      const idx = findColumnIndex('eventDate');
      if (idx !== -1) row[idx] = leadData.eventDate;
    }
    if (leadData.venue) {
      const idx = findColumnIndex('venue');
      if (idx !== -1) row[idx] = leadData.venue;
    }
    if (leadData.budget) {
      const idx = findColumnIndex('budget');
      if (idx !== -1) row[idx] = leadData.budget;
    }
    if (leadData.notes) {
      const idx = findColumnIndex('notes');
      if (idx !== -1) row[idx] = leadData.notes;
    }
    if (leadData.source) {
      const idx = findColumnIndex('source');
      if (idx !== -1) row[idx] = leadData.source;
    }

    // Also try to find and fill Date Added column
    const dateAddedIdx = headers.findIndex((h: string) =>
      ['Date Added', 'Created', 'Added', 'Date Created'].includes(h)
    );
    if (dateAddedIdx !== -1) {
      row[dateAddedIdx] = new Date().toLocaleDateString('en-US');
    }

    // Set default status if there's a Status column
    const statusIdx = headers.findIndex((h: string) =>
      ['Status', 'Lead Status', 'Stage'].includes(h)
    );
    if (statusIdx !== -1) {
      row[statusIdx] = 'New';
    }

    // Append the row
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Lead added to CRM',
      lead: leadData,
    });

  } catch (error) {
    console.error('Add lead API error:', error);
    return res.status(500).json({
      error: 'Failed to add lead to CRM',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
