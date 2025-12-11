import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const SHEET_NAME = 'Captures';

interface Capture {
  id: string;
  userId: string;
  rawContent: string;
  contentType: string;
  summary: string;
  category: string;
  tags: string[];
  entities: Array<{ type: string; value: string; confidence: number }>;
  context: string;
  leadData?: Record<string, unknown>;
  showData?: Record<string, unknown>;
  taskData?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  source?: string;
  actionTaken?: string;
}

async function getOrCreateSpreadsheet(auth: InstanceType<typeof google.auth.OAuth2>) {
  const sheets = google.sheets({ version: 'v4', auth });
  const drive = google.drive({ version: 'v3', auth });

  // Search for existing Brain spreadsheet
  const searchResponse = await drive.files.list({
    q: "name='V_Command Brain Captures' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
    fields: 'files(id, name)',
  });

  if (searchResponse.data.files && searchResponse.data.files.length > 0) {
    return searchResponse.data.files[0].id!;
  }

  // Create new spreadsheet
  const createResponse = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: 'V_Command Brain Captures',
      },
      sheets: [
        {
          properties: {
            title: SHEET_NAME,
          },
        },
      ],
    },
  });

  const spreadsheetId = createResponse.data.spreadsheetId!;

  // Add headers
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!A1:P1`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        'ID', 'UserID', 'RawContent', 'ContentType', 'Summary', 'Category',
        'Tags', 'Entities', 'Context', 'LeadData', 'ShowData', 'TaskData',
        'CreatedAt', 'UpdatedAt', 'Source', 'ActionTaken'
      ]],
    },
  });

  return spreadsheetId;
}

function captureToRow(capture: Capture): string[] {
  return [
    capture.id,
    capture.userId,
    capture.rawContent,
    capture.contentType,
    capture.summary,
    capture.category,
    JSON.stringify(capture.tags),
    JSON.stringify(capture.entities),
    capture.context,
    capture.leadData ? JSON.stringify(capture.leadData) : '',
    capture.showData ? JSON.stringify(capture.showData) : '',
    capture.taskData ? JSON.stringify(capture.taskData) : '',
    capture.createdAt,
    capture.updatedAt,
    capture.source || '',
    capture.actionTaken || '',
  ];
}

function rowToCapture(row: string[]): Capture {
  return {
    id: row[0],
    userId: row[1],
    rawContent: row[2],
    contentType: row[3] as 'text' | 'url' | 'voice',
    summary: row[4],
    category: row[5] as any,
    tags: row[6] ? JSON.parse(row[6]) : [],
    entities: row[7] ? JSON.parse(row[7]) : [],
    context: row[8] as 'business' | 'personal',
    leadData: row[9] ? JSON.parse(row[9]) : undefined,
    showData: row[10] ? JSON.parse(row[10]) : undefined,
    taskData: row[11] ? JSON.parse(row[11]) : undefined,
    createdAt: row[12],
    updatedAt: row[13],
    source: row[14] || undefined,
    actionTaken: row[15] as any || undefined,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get auth token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const token = authHeader.slice(7);

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

    // Get or create spreadsheet
    const spreadsheetId = await getOrCreateSpreadsheet(oauth2Client);

    if (req.method === 'GET') {
      // Load all captures
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}!A2:P`,
      });

      const rows = response.data.values || [];
      const captures = rows.map(rowToCapture);

      return res.status(200).json({ captures });
    }

    if (req.method === 'POST') {
      const { capture, captures: bulkCaptures } = req.body;

      if (bulkCaptures && Array.isArray(bulkCaptures)) {
        // Bulk save - replace all data
        // First clear existing data
        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: `${SHEET_NAME}!A2:P`,
        });

        // Then add all captures
        if (bulkCaptures.length > 0) {
          const rows = bulkCaptures.map(captureToRow);
          await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${SHEET_NAME}!A2:P`,
            valueInputOption: 'RAW',
            requestBody: { values: rows },
          });
        }

        return res.status(200).json({ success: true, count: bulkCaptures.length });
      }

      if (capture) {
        // Single capture save - append
        const row = captureToRow(capture);
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${SHEET_NAME}!A2:P`,
          valueInputOption: 'RAW',
          requestBody: { values: [row] },
        });

        return res.status(200).json({ success: true, id: capture.id });
      }

      return res.status(400).json({ error: 'Missing capture data' });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Missing capture ID' });
      }

      // Get all data to find row index
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}!A:A`,
      });

      const ids = response.data.values || [];
      const rowIndex = ids.findIndex((row) => row[0] === id);

      if (rowIndex > 0) { // > 0 because row 0 is header
        // Delete the row
        const sheetResponse = await sheets.spreadsheets.get({
          spreadsheetId,
          ranges: [SHEET_NAME],
        });

        const sheetId = sheetResponse.data.sheets?.[0]?.properties?.sheetId;

        if (sheetId !== undefined) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [{
                deleteDimension: {
                  range: {
                    sheetId,
                    dimension: 'ROWS',
                    startIndex: rowIndex,
                    endIndex: rowIndex + 1,
                  },
                },
              }],
            },
          });
        }
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Brain captures API error:', error);
    return res.status(500).json({
      error: 'Failed to access captures',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
