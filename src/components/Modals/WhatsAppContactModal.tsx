import React, { useState } from 'react';
import { X, Send, CheckCircle, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { CollaborationAd } from '../../types';
import { sendWhatsAppMessage, openWhatsApp } from '../../lib/api';

interface WhatsAppContactModalProps {
  ad: CollaborationAd;
  onClose: () => void;
}

export const WhatsAppContactModal: React.FC<WhatsAppContactModalProps> = ({ ad, onClose }) => {
  const [message, setMessage] = useState(`Bonjour ${ad.author}, je vous contacte au sujet de votre annonce « ${ad.title} » sur ArtisHub.`);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'choose' | 'api' | 'link'>('choose');

  const handleApiSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendWhatsAppMessage(message.trim(), ad.authorWhatsappNumber || undefined);
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Le message n'a pas pu être envoyé.");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkSubmit = () => {
    openWhatsApp(message.trim(), ad.authorWhatsappNumber || undefined);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="w-full max-w-lg bg-[#1b1b1d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          <button onClick={onClose} className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/5 text-[#cfc2d6] flex items-center justify-center" aria-label="Fermer"><X className="w-4 h-4" /></button>
          <div className="py-8 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
            <h2 className="text-xl font-bold text-[#e5e1e4]">{mode === 'link' ? 'WhatsApp ouvert' : 'Message envoyé'}</h2>
            <p className="text-sm text-[#cfc2d6]/70 mt-2">
              {mode === 'link' ? 'Envoyez le message depuis votre application WhatsApp.' : 'Votre message a été envoyé via WhatsApp API.'}
            </p>
            <button onClick={onClose} className="mt-6 px-5 py-2.5 rounded-xl bg-[#5de6ff] text-[#00363e] text-xs font-bold">Fermer</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#1b1b1d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/5 text-[#cfc2d6] flex items-center justify-center" aria-label="Fermer"><X className="w-4 h-4" /></button>

        <h2 className="text-xl font-bold text-[#e5e1e4] mb-1">Contacter {ad.author}</h2>
        <p className="text-xs text-[#cfc2d6]/70 mb-6">Choisissez comment envoyer votre message.</p>

        {mode === 'choose' && (
          <div className="space-y-3">
            <button
              onClick={() => setMode('api')}
              className="w-full py-3.5 rounded-xl bg-[#5de6ff] hover:bg-[#4dd4f0] text-[#00363e] text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Envoyer ici (API)
            </button>
            <button
              onClick={() => setMode('link')}
              className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Ouvrir WhatsApp
            </button>
          </div>
        )}

        {mode === 'api' && (
          <form onSubmit={handleApiSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs">{error}</div>}
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={5} maxLength={4096} required className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] focus:outline-none focus:border-[#5de6ff]" />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setMode('choose')} className="px-4 py-2 rounded-xl text-xs text-[#cfc2d6]">Retour</button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-[#5de6ff] text-[#00363e] text-xs font-bold flex items-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Envoyer via API
              </button>
            </div>
          </form>
        )}

        {mode === 'link' && (
          <div className="space-y-4">
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={5} maxLength={4096} required className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] focus:outline-none focus:border-[#5de6ff]" />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setMode('choose')} className="px-4 py-2 rounded-xl text-xs text-[#cfc2d6]">Retour</button>
              <button onClick={handleLinkSubmit} className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />Ouvrir WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
