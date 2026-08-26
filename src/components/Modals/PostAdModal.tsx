import React, { useState } from 'react';
import { AdStatus, ProjectType, RoleNeeded, UserProfile } from '../../types';
import { addCollaborationAd } from '../../lib/firebase';
import { X, Sparkles, Briefcase, Plus, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PostAdModalProps {
  currentUser: UserProfile | null;
  onClose: () => void;
  onRequireAuth: () => void;
}

export const PostAdModal: React.FC<PostAdModalProps> = ({
  currentUser,
  onClose,
  onRequireAuth,
}) => {
  const [title, setTitle] = useState('');
  const [roleNeeded, setRoleNeeded] = useState<RoleNeeded>('Writer / Scénariste');
  const [projectType, setProjectType] = useState<ProjectType>('Comic / Manga');
  const [status, setStatus] = useState<AdStatus>('HIRING');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('Fantasy, Manga, RevShare');
  const [compensation, setCompensation] = useState('RevShare + Financement Participatif');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError('Veuillez remplir le titre et la description du projet.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      await addCollaborationAd({
        title: title.trim(),
        author: currentUser.displayName,
        authorUid: currentUser.uid,
        authorHandle: currentUser.handle,
        authorAvatar: currentUser.avatar,
        roleNeeded,
        projectType,
        status,
        description: description.trim(),
        tags: parsedTags.length > 0 ? parsedTags : ['Collaboration'],
        compensation: compensation.trim(),
        contactEmail: contactEmail.trim() || currentUser.email,
        authorWhatsappNumber: currentUser.whatsappEnabled ? currentUser.whatsappNumber : undefined,
      });

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#5de6ff', '#ddb7ff'],
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erreur lors de la publication de l\'annonce.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#1b1b1d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#cfc2d6] hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#5de6ff]/20 text-[#5de6ff] flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#e5e1e4]">
            Déposer une Annonce de Recrutement / Dispo
          </h2>
        </div>
        <p className="text-xs text-[#cfc2d6]/70 mb-6 ml-10">
          Enregistré directement dans la collection Firestore <code className="font-mono text-[#5de6ff]">collaborations</code>
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Status Mode: Hiring vs Available */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-2">
              Type d'annonce *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('HIRING')}
                className={`py-3 px-4 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                  status === 'HIRING'
                    ? 'bg-[#ddb7ff]/20 border-[#ddb7ff] text-[#ddb7ff] shadow-sm'
                    : 'bg-white/5 border-white/10 text-[#cfc2d6]'
                }`}
              >
                <span>🔍 RECHERCHE DE TALENT (HIRING)</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus('AVAILABLE')}
                className={`py-3 px-4 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                  status === 'AVAILABLE'
                    ? 'bg-[#5de6ff]/20 border-[#5de6ff] text-[#5de6ff] shadow-sm'
                    : 'bg-white/5 border-white/10 text-[#cfc2d6]'
                }`}
              >
                <span>⚡ TALENT DISPONIBLE (AVAILABLE)</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">
              Titre de l'annonce *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Cherche Scénariste pour BD Dark Fantasy (12 tomes)"
              required
              className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#5de6ff]"
            />
          </div>

          {/* Role & Project Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">
                Rôle ciblé *
              </label>
              <select
                value={roleNeeded}
                onChange={(e) => setRoleNeeded(e.target.value as RoleNeeded)}
                className="w-full bg-[#2a2a2c] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] focus:outline-none focus:border-[#5de6ff]"
              >
                <option value="Illustrator">Illustrateur / Dessinateur</option>
                <option value="Writer / Scénariste">Scénariste / Narrative Designer</option>
                <option value="Colorist">Coloriste</option>
                <option value="3D Modeler">Modélisateur 3D / Props</option>
                <option value="Storyboarder">Storyboarder</option>
                <option value="Sound Designer">Sound Designer / Compositeur</option>
                <option value="Frontend Developer">Développeur Frontend</option>
                <option value="Backend Developer">Développeur Backend</option>
                <option value="Full-stack Developer">Développeur Full-stack</option>
                <option value="Mobile Developer">Développeur Mobile</option>
                <option value="Game Developer">Développeur Jeu Vidéo</option>
                <option value="UI/UX Designer">Designer UI/UX</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">
                Type de projet *
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                className="w-full bg-[#2a2a2c] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] focus:outline-none focus:border-[#5de6ff]"
              >
                <option value="Comic / Manga">BD / Manga / Webtoon</option>
                <option value="Video Game">Jeu Vidéo Indé</option>
                <option value="Animation">Série / Court-métrage Animé</option>
                <option value="Web App">Site web / Application web</option>
                <option value="Mobile App">Application mobile</option>
                <option value="Software / SaaS">Logiciel / SaaS</option>
                <option value="Commission">Commission / Freelance</option>
                <option value="Other">Autre projet créatif</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">
              Description complète du besoin & synopsis *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez l'univers, vos attentes, le calendrier prévisionnel et les compétences requises..."
              required
              className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#5de6ff]"
            />
          </div>

          {/* Compensation & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">
                Rémunération / Modèle
              </label>
              <input
                type="text"
                value={compensation}
                onChange={(e) => setCompensation(e.target.value)}
                placeholder="ex: RevShare, Rémunéré, Bénévolat passion"
                className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#5de6ff]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">
                Email de contact
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="votre-email@domaine.com"
                className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#5de6ff]"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">
              Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="DarkFantasy, RevShare, Kickstarter, Webtoon"
              className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#5de6ff]"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-mono text-[#cfc2d6] hover:bg-white/5 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-[#5de6ff] hover:bg-[#a2eeff] text-[#00363e] font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#5de6ff]/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publication...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publier l'Annonce</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
