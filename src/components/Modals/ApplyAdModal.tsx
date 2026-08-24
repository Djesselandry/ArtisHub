import React, { useState } from 'react';
import { CollaborationAd, UserProfile } from '../../types';
import { applyToCollaboration } from '../../lib/firebase';
import { X, Send, Sparkles, Check, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ApplyAdModalProps {
  ad: CollaborationAd;
  currentUser: UserProfile | null;
  onClose: () => void;
  onRequireAuth: () => void;
}

export const ApplyAdModal: React.FC<ApplyAdModalProps> = ({
  ad,
  currentUser,
  onClose,
  onRequireAuth,
}) => {
  const [applicantName, setApplicantName] = useState(currentUser?.displayName || '');
  const [applicantEmail, setApplicantEmail] = useState(currentUser?.email || '');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (!message.trim()) {
      setError('Veuillez rédiger un message de présentation.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await applyToCollaboration(ad.id, {
        applicantName: applicantName || currentUser.displayName,
        applicantHandle: currentUser.handle,
        applicantEmail: applicantEmail || currentUser.email,
        applicantAvatar: currentUser.avatar,
        portfolioUrl: portfolioUrl.trim(),
        message: message.trim(),
      });

      setSuccess(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#5de6ff', '#ddb7ff'],
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erreur lors de l\'envoi de la candidature.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#1b1b1d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#cfc2d6] hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#5de6ff] bg-[#5de6ff]/10 px-2.5 py-1 rounded-full border border-[#5de6ff]/20">
            Postuler à l'annonce
          </span>
          <h2 className="text-xl font-bold text-[#e5e1e4] mt-2 line-clamp-1">{ad.title}</h2>
          <p className="text-xs text-[#cfc2d6]/70">Par {ad.author} ({ad.authorHandle})</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-mono">
            {error}
          </div>
        )}

        {success ? (
          <div className="py-8 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Candidature transmise !</h3>
            <p className="text-xs text-[#cfc2d6]">L'auteur a reçu votre message et vos coordonnées.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1">
                Votre Nom / Pseudo
              </label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                required
                className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#e5e1e4] focus:outline-none focus:border-[#5de6ff]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1">
                Lien Portfolio / ArtStation / Behance
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://artstation.com/votreprofil"
                className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#5de6ff]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1">
                Message de motivation / Disponibilités *
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Expliquez pourquoi ce projet vous intéresse et comment vous pouvez y contribuer..."
                required
                className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#5de6ff]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-mono text-[#cfc2d6] hover:bg-white/5"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#5de6ff] text-[#00363e] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#a2eeff] transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Envoyer la candidature</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
