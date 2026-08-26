import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '.env') });

import express from 'express';
import https from 'https';

const app = express();
const port = Number(process.env.PORT || 3001);
const graphApiVersion = process.env.WHATSAPP_GRAPH_API_VERSION || 'v23.0';
const graphApiBaseUrl = `https://graph.facebook.com/${graphApiVersion}`;

const REPORTS_FILE = join(__dirname, 'reports.json');

const loadReports = () => {
  if (!existsSync(REPORTS_FILE)) return [];
  try { return JSON.parse(readFileSync(REPORTS_FILE, 'utf-8')); } catch { return []; }
};

const saveReport = (report) => {
  const reports = loadReports();
  reports.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ...report, createdAt: new Date().toISOString() });
  writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2), 'utf-8');
  return reports[reports.length - 1];
};

app.use(express.json({ limit: '100kb' }));
app.use((req, res, next) => {
  const allowedOrigin = process.env.APP_URL || 'http://localhost:3000';
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const requireWhatsAppConfig = () => {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!accessToken || !phoneNumberId) {
    const error = new Error('WhatsApp Cloud API is not configured on the server.');
    error.statusCode = 503;
    throw error;
  }
  return { accessToken, phoneNumberId };
};

const normalizePhoneNumber = (value) => String(value || '').replace(/[^\d]/g, '');

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, whatsappConfigured: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) });
});

app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { accessToken, phoneNumberId } = requireWhatsAppConfig();
    const recipientPhone = '243970807693';
    const message = String(req.body?.message || '').trim();

    console.log(`[WhatsApp] Numéro forcé vers le destinataire de test: ${recipientPhone}`);
    console.log(`[WhatsApp] Sending to ${recipientPhone} via phone ID ${phoneNumberId}`);

    if (!/^\d{8,15}$/.test(recipientPhone)) {
      return res.status(400).json({ error: 'recipientPhone must use international format, for example 33612345678.' });
    }
    if (!message || message.length > 4096) {
      return res.status(400).json({ error: 'message is required and must be no longer than 4096 characters.' });
    }

    const url = `${graphApiBaseUrl}/${phoneNumberId}/messages`;
    console.log(`[WhatsApp] URL cible: ${url}`);

    const bodyStr = JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'text',
      text: { preview_url: false, body: message },
    });

    const payload = await new Promise((resolve, reject) => {
      const req = https.request(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr),
        },
        timeout: 30000,
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: { raw: data } });
          }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
      req.write(bodyStr);
      req.end();
    });

    console.log(`[WhatsApp] API response status: ${payload.status}`, JSON.stringify(payload.body));
    if (payload.status < 200 || payload.status >= 300) {
      return res.status(payload.status).json({ error: payload.body.error?.message || 'WhatsApp API request failed.', details: payload.body });
    }
    return res.status(202).json({ messageId: payload.body.messages?.[0]?.id || null });
  } catch (error) {
    console.error('[WhatsApp] ERROR:', error.message);
    console.error('[WhatsApp] ERROR stack:', error.stack);
    return res.status(error.statusCode || 500).json({ error: error.message || 'Unable to send WhatsApp message.' });
  }
});

app.get('/api/whatsapp/webhook', (req, res) => {
  if (req.query['hub.verify_token'] !== process.env.WHATSAPP_VERIFY_TOKEN) return res.sendStatus(403);
  return res.status(200).send(req.query['hub.challenge']);
});

app.post('/api/whatsapp/webhook', (req, res) => {
  console.log('WhatsApp webhook event received:', JSON.stringify(req.body));
  return res.sendStatus(200);
});

app.post('/api/reports', (req, res) => {
  const { phone, userName, message, assistantResponses } = req.body || {};
  if (!phone || !userName) return res.status(400).json({ error: 'phone and userName are required.' });
  const saved = saveReport({ phone, userName, message: message || '', assistantResponses: assistantResponses || [] });
  console.log(`[Reports] Sauvegardé: ${saved.id} - ${userName} (${phone})`);
  return res.status(201).json(saved);
});

app.get('/api/reports', (_req, res) => {
  return res.json(loadReports());
});

app.listen(port, () => {
  console.log(`ArtisHub WhatsApp backend listening on http://localhost:${port}`);
});
