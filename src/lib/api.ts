const apiBaseUrl = ((import.meta as any).env?.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
const appsScriptUrl = (((import.meta as any).env?.VITE_APPS_SCRIPT_URL || '') as string).replace(/\/$/, '');

const ARTISHUB_WHATSAPP = '243970807693';

export const sendWhatsAppMessage = async (message: string, recipientPhone?: string) => {
  const response = await fetch(`${apiBaseUrl}/api/whatsapp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipientPhone: recipientPhone || undefined, message }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Impossible d'envoyer le message WhatsApp.");
  return payload as { messageId: string | null };
};

export const buildWhatsAppLink = (message: string, recipientPhone?: string): string => {
  const phone = recipientPhone?.replace(/[^\d]/g, '') || ARTISHUB_WHATSAPP;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
};

export const openWhatsApp = (message: string, recipientPhone?: string): void => {
  window.open(buildWhatsAppLink(message, recipientPhone), '_blank');
};

export const saveConversationReport = async (data: { phone: string; userName: string; message: string; assistantResponses: string[] }) => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch {
    return null;
  }
};

// ========================================================================
// STORE & PAYMENT API STUBS
// TODO: Remplacer les stubs par de vrais appels API quand le backend sera prêt
// ========================================================================

export const fetchProducts = async () => {
  // TODO: GET /api/products
  return { products: [] };
};

export const fetchProductById = async (id: string) => {
  // TODO: GET /api/products/:id
  return { product: null };
};

export const toggleProductLike = async (productId: string, uid: string) => {
  // TODO: POST /api/products/:id/like
  return { liked: true };
};

export const createOrder = async (items: { productId: string; quantity: number }[]) => {
  // TODO: POST /api/orders
  return { orderId: `ord_${Date.now().toString(36)}`, status: 'pending' };
};

export const processPayment = async (payload: { orderId: string; amount: number; currency: string; method: string; phone?: string; cardToken?: string }) => {
  // TODO: POST /api/payments/process
  return { success: true, transactionId: `txn_${Date.now().toString(36)}` };
};

export const fetchUserOrders = async (uid: string) => {
  // TODO: GET /api/orders?uid=:uid
  return { orders: [] };
};

// ========================================================================
// GOOGLE SHEETS LOGGING
// Envoie une ligne de log vers le serveur qui l'écrit dans une Google Sheet.
// ========================================================================

export const logToSheets = async (entity: string, data: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> => {
  const payload = { entity, ...data };
  if (!appsScriptUrl) return { ok: false, error: 'VITE_APPS_SCRIPT_URL non configuré' };
  try {
    await fetch(appsScriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    return { ok: true };
  } catch {
    return { ok: false, error: 'Envoi Apps Script échoué' };
  }
};
