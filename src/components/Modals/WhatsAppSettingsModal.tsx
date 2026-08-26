import React, { useState } from 'react';
import { X, Phone, ShieldCheck, Loader2, Check } from 'lucide-react';
import { UserProfile } from '../../types';
import { updateUserProfile } from '../../lib/firebase';

interface WhatsAppSettingsModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onSaved: (profile: UserProfile) => void;
}

export const WhatsAppSettingsModal: React.FC<WhatsAppSettingsModalProps> = ({ currentUser, onClose, onSaved }) => {
  const [phone, setPhone] = useState(currentUser.whatsappNumber || '');
  const [enabled, setEnabled] = useState(currentUser.whatsappEnabled ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedPhone = phone.replace(/[^\d]/g, '');
    if (enabled && !/^\d{8,15}$/.test(normalizedPhone)) {
      setError('Utilisez le format international, par exemple 33612345678.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updatedProfile = await updateUserProfile(currentUser.uid, {
        whatsappNumber: normalizedPhone,
        whatsappEnabled: enabled,
      });
      onSaved(updatedProfile);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Impossible d’enregistrer vos préférences.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#1b1b1d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/5 text-[#cfc2d6] flex items-center justify-center hover:bg-white/10" aria-label="Fermer">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#5de6ff]/15 text-[#5de6ff] flex items-center justify-center"><Phone className="w-5 h-5" /></div>
          <h2 className="text-xl font-bold text-[#e5e1e4]">Contact WhatsApp</h2>
        </div>
        <p className="text-xs text-[#cfc2d6]/70 mb-6">Choisissez si les membres peuvent vous contacter via le compte WhatsApp Business d’ArtisHub.</p>
        {error && <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10 cursor-pointer">
            <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="mt-1 accent-[#5de6ff]" />
            <span><span className="block text-sm font-bold text-[#e5e1e4]">Je souhaite être contacté sur WhatsApp</span><span className="block text-xs text-[#cfc2d6]/60 mt-1">Votre numéro ne sera utilisé qu’avec votre accord.</span></span>
          </label>
          <div>
            <label htmlFor="whatsapp-phone" className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">Numéro international</label>
            <input id="whatsapp-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="33612345678" disabled={!enabled} className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] disabled:opacity-40 focus:outline-none focus:border-[#5de6ff]" />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#cfc2d6]/60"><ShieldCheck className="w-4 h-4 text-emerald-400" />Le token Meta reste sur le serveur.</div>
          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-[#cfc2d6] hover:bg-white/5">Annuler</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-[#5de6ff] text-[#00363e] text-xs font-bold flex items-center gap-2 disabled:opacity-50">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
};
