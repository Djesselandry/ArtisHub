const apiBaseUrl = ((import.meta as any).env?.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

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
