import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '.env') });

import express from 'express';

const app = express();
const port = Number(process.env.PORT || 3001);
const graphApiVersion = process.env.WHATSAPP_GRAPH_API_VERSION || 'v23.0';
const graphApiBaseUrl = `https://graph.facebook.com/${graphApiVersion}`;

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
    console.log('[WhatsApp] Request body:', JSON.stringify(req.body));
    const recipientPhone = normalizePhoneNumber(req.body?.recipientPhone || process.env.WHATSAPP_RECIPIENT_PHONE);
    const message = String(req.body?.message || '').trim();

    console.log(`[WhatsApp] Sending to ${recipientPhone} via phone ID ${phoneNumberId}`);

    if (!/^\d{8,15}$/.test(recipientPhone)) {
      return res.status(400).json({ error: 'recipientPhone must use international format, for example 33612345678.' });
    }
    if (!message || message.length > 4096) {
      return res.status(400).json({ error: 'message is required and must be no longer than 4096 characters.' });
    }

    const response = await fetch(`${graphApiBaseUrl}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhone,
        type: 'text',
        text: { preview_url: false, body: message },
      }),
    });

    const payload = await response.json();
    console.log(`[WhatsApp] API response status: ${response.status}`, payload);
    if (!response.ok) return res.status(response.status).json({ error: payload.error?.message || 'WhatsApp API request failed.', details: payload });
    return res.status(202).json({ messageId: payload.messages?.[0]?.id || null });
  } catch (error) {
    console.error('[WhatsApp] ERROR:', error.message, error.statusCode || '');
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

app.listen(port, () => {
  console.log(`ArtisHub WhatsApp backend listening on http://localhost:${port}`);
});
