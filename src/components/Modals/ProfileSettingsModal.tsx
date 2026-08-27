import React, { useState } from 'react';
import { X, Check, Loader2, Sparkles, ImagePlus, User as UserIcon, Users } from 'lucide-react';
import { UserProfile } from '../../types';
import { updateUserProfile } from '../../lib/firebase';

interface ProfileSettingsModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onSaved: (profile: UserProfile) => void;
}

// Avatars filles (visages de filles)
export const GIRL_AVATARS: string[] = [
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/women/65.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
  'https://randomuser.me/api/portraits/women/26.jpg',
  'https://randomuser.me/api/portraits/women/79.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
];

// Avatars garçons (visages de garçons)
export const BOY_AVATARS: string[] = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/men/11.jpg',
  'https://randomuser.me/api/portraits/men/22.jpg',
  'https://randomuser.me/api/portraits/men/86.jpg',
  'https://randomuser.me/api/portraits/men/45.jpg',
  'https://randomuser.me/api/portraits/men/75.jpg',
];

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ currentUser, onClose, onSaved }) => {
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [role, setRole] = useState(currentUser.role || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [handle, setHandle] = useState((currentUser.handle || '').replace(/^@/, ''));
  const [whatsappNumber, setWhatsappNumber] = useState(currentUser.whatsappNumber || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [customPhoto, setCustomPhoto] = useState('');
  const [photoMode, setPhotoMode] = useState<'avatars' | 'custom'>('avatars');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePickAvatar = (url: string) => {
    setAvatar(url);
    setPhotoMode('avatars');
    setCustomPhoto('');
  };

  const handleCustomPhoto = (url: string) => {
    setCustomPhoto(url);
    setAvatar(url);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!displayName.trim()) {
      setError('Le nom d’affichage ne peut pas être vide.');
      return;
    }
    const finalAvatar = photoMode === 'custom' ? customPhoto.trim() : avatar;
    if (!finalAvatar) {
      setError('Veuillez choisir un avatar ou ajouter une photo.');
      return;
    }
    const normalizedHandle = `@${handle.replace(/\s+/g, '_').replace(/^@/, '')}`;
    const normalizedPhone = whatsappNumber.trim() ? whatsappNumber.replace(/[^\d]/g, '') : undefined;

    setLoading(true);
    setError(null);
    try {
      const updatedProfile = await updateUserProfile(currentUser.uid, {
        displayName: displayName.trim(),
        role: role.trim(),
        bio: bio.trim(),
        handle: normalizedHandle,
        avatar: finalAvatar,
        whatsappNumber: normalizedPhone,
      });
      onSaved(updatedProfile);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Impossible d’enregistrer votre profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#1b1b1d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/5 text-[#cfc2d6] flex items-center justify-center hover:bg-white/10" aria-label="Fermer">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#ddb7ff]/15 text-[#ddb7ff] flex items-center justify-center"><Sparkles className="w-5 h-5" /></div>
          <h2 className="text-xl font-bold text-[#e5e1e4]">Modifier mon profil</h2>
        </div>
        <p className="text-xs text-[#cfc2d6]/70 mb-6">Personnalisez vos informations. Choisissez un avatar (fille ou garçon) ou ajoutez votre propre photo.</p>

        {error && <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ============================================= */}
          {/* PHOTO / AVATAR SELECTION */}
          {/* ============================================= */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-2.5">Ma photo de profil</label>

            {/* Mode toggle */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setPhotoMode('avatars')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${photoMode === 'avatars' ? 'bg-[#ddb7ff]/15 text-[#ddb7ff] border border-[#ddb7ff]/40' : 'bg-white/5 text-[#cfc2d6] border border-white/10'}`}
              >
                <Users className="w-3.5 h-3.5" />
                Choisir un avatar
              </button>
              <button
                type="button"
                onClick={() => setPhotoMode('custom')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${photoMode === 'custom' ? 'bg-[#ddb7ff]/15 text-[#ddb7ff] border border-[#ddb7ff]/40' : 'bg-white/5 text-[#cfc2d6] border border-white/10'}`}
              >
                <ImagePlus className="w-3.5 h-3.5" />
                Ajouter ma photo
              </button>
            </div>

            {/* Current chosen avatar preview */}
            {avatar && (
              <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-white/[0.04] border border-white/10">
                <img src={avatar} alt="Avatar sélectionné" className="w-12 h-12 rounded-full object-cover border border-[#ddb7ff]/50" />
                <div className="text-xs text-[#cfc2d6]/80">Aperçu de votre photo</div>
              </div>
            )}

            {/* Avatar picker mode */}
            {photoMode === 'avatars' && (
              <div className="space-y-4">
                {/* Filles */}
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#ddb7ff] mb-2">
                    <UserIcon className="w-3.5 h-3.5" />
                    Avatars filles
                  </span>
                  <div className="grid grid-cols-6 gap-2.5">
                    {GIRL_AVATARS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => handlePickAvatar(a)}
                        className={`aspect-square rounded-full overflow-hidden border-2 transition-all ${avatar === a ? 'border-[#ddb7ff] ring-2 ring-[#ddb7ff]/40 scale-105' : 'border-white/10 hover:border-white/40'}`}
                      >
                        <img src={a} alt="Avatar fille" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Garçons */}
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#5de6ff] mb-2">
                    <UserIcon className="w-3.5 h-3.5" />
                    Avatars garçons
                  </span>
                  <div className="grid grid-cols-6 gap-2.5">
                    {BOY_AVATARS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => handlePickAvatar(a)}
                        className={`aspect-square rounded-full overflow-hidden border-2 transition-all ${avatar === a ? 'border-[#ddb7ff] ring-2 ring-[#ddb7ff]/40 scale-105' : 'border-white/10 hover:border-white/40'}`}
                      >
                        <img src={a} alt="Avatar garçon" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Custom photo mode */}
            {photoMode === 'custom' && (
              <div>
                <label htmlFor="custom-photo-url" className="block text-xs text-[#cfc2d6] mb-2">Collez l'URL de votre photo</label>
                <input
                  id="custom-photo-url"
                  type="text"
                  value={customPhoto}
                  onChange={(e) => handleCustomPhoto(e.target.value)}
                  placeholder="https://exemple.com/ma-photo.jpg"
                  className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] focus:outline-none focus:border-[#ddb7ff]"
                />
                <p className="text-[10px] text-[#cfc2d6]/50 mt-1">Idéalement une image carrée (ex: votre photo personnelle).</p>
              </div>
            )}
          </div>

          {/* =============================================
              FORM FIELDS
              ============================================= */}

          {/* Name */}
          <div>
            <label htmlFor="profile-name" className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">Nom d'affichage</label>
            <input id="profile-name" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Votre nom" className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] focus:outline-none focus:border-[#ddb7ff]" />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="profile-role" className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">Rôle / Profession</label>
            <input id="profile-role" type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex: Digital Illustrator & Comic Creator" className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] focus:outline-none focus:border-[#ddb7ff]" />
          </div>

          {/* Handle */}
          <div>
            <label htmlFor="profile-handle" className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">Identifiant</label>
            <div className="flex items-center bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 focus-within:border-[#ddb7ff]">
              <span className="text-[#5de6ff] text-sm">@</span>
              <input id="profile-handle" type="text" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="pseudo" className="w-full bg-transparent px-2 py-3 text-sm text-[#e5e1e4] focus:outline-none" />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="profile-bio" className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">Bio</label>
            <textarea id="profile-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Présentez-vous en quelques mots..." className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] focus:outline-none focus:border-[#ddb7ff] resize-none" />
          </div>

          {/* WhatsApp number */}
          <div>
            <label htmlFor="profile-phone" className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">Numéro WhatsApp (optionnel)</label>
            <input id="profile-phone" type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="33612345678" className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] focus:outline-none focus:border-[#ddb7ff]" />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-[#cfc2d6] hover:bg-white/5">Annuler</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-[#ddb7ff] text-[#490080] text-xs font-bold flex items-center gap-2 disabled:opacity-50">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
};
