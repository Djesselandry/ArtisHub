import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { google } from 'googleapis';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '.env') });

const isConfigured = () => {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.GOOGLE_SHEET_ID
  );
};

let sheetsClient = null;

const getClient = () => {
  if (sheetsClient) return sheetsClient;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: 'service_account',
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
};

export const isSheetsConfigured = isConfigured;

/**
 * Append a row to the configured Google Sheet.
 * @param {string} entity  e.g. "profile", "project", "collaboration", "forum"
 * @param {object} data    Key/value fields to log in the row
 * @returns {{ ok: boolean, row?: number, error?: string }}
 */
export const appendRow = async (entity, data = {}) => {
  if (!isConfigured()) return { ok: false, error: 'Google Sheets not configured on the server.' };

  try {
    const sheets = getClient();
    const values = [[
      new Date().toISOString(),
      entity,
      data.email || '',
      data.uid || '',
      data.displayName || data.name || '',
      data.detail || '',
    ]];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:F',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });

    const row = response.data?.updates?.updatedRange;
    return { ok: true, row };
  } catch (error) {
    return { ok: false, error: error.message || 'Google Sheets append failed.' };
  }
};
