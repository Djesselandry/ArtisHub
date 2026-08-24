import React, { useState } from 'react';
import { ForumCategory, UserProfile } from '../../types';
import { addForumTopic } from '../../lib/firebase';
import { X, Sparkles, MessageSquare, Loader2, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreateThreadModalProps {
  currentUser: UserProfile | null;
  onClose: () => void;
  onRequireAuth: () => void;
}

export const CreateThreadModal: React.FC<CreateThreadModalProps> = ({
  currentUser,
  onClose,
  onRequireAuth,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ForumCategory>('tips');
  const [subCategoryTag, setSubCategoryTag] = useState('Digital Art');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('Tutorial, Workflow, Tips');
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (!title.trim() || !content.trim()) {
      setError('Veuillez renseigner le titre et le contenu de la discussion.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const categoryLabels: Record<ForumCategory, string> = {
        tips: 'Tips & Tutorials',
        critiques: 'Constructive Critiques',
        news: 'Industry News',
        general: 'Général',
      };

      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      await addForumTopic({
        title: title.trim(),
        author: currentUser.displayName,
        authorUid: currentUser.uid,
        authorHandle: currentUser.handle,
        authorAvatar: currentUser.avatar,
        category,
        categoryLabel: categoryLabels[category],
        subCategoryTag,
        tags: parsedTags.length > 0 ? parsedTags : ['Discussion'],
        previewText: content.slice(0, 140) + '...',
        content: content.trim(),
        imagePreview: imagePreview.trim() || undefined,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ddb7ff', '#ffafd3'],
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erreur lors de la création du sujet.');
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
          <div className="w-8 h-8 rounded-xl bg-[#ddb7ff]/20 text-[#ddb7ff] flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#e5e1e4]">
            Ouvrir une Nouvelle Discussion Forum
          </h2>
        </div>
        <p className="text-xs text-[#cfc2d6]/70 mb-6 ml-10">
          Enregistré directement dans la collection Firestore <code className="font-mono text-[#5de6ff]">forum_posts</code>
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">
              Section / Catégorie du Forum *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setCategory('tips');
                  setSubCategoryTag('Tutorial');
                }}
                className={`p-3 rounded-xl border text-xs font-mono text-left transition-all ${
                  category === 'tips'
                    ? 'bg-[#ddb7ff]/20 border-[#ddb7ff] text-[#ddb7ff]'
                    : 'bg-white/5 border-white/10 text-[#cfc2d6]'
                }`}
              >
                <div className="font-bold">💡 Tips & Tutorials</div>
                <div className="text-[10px] opacity-70">Guides, astuces logiciels</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('critiques');
                  setSubCategoryTag('Feedback');
                }}
                className={`p-3 rounded-xl border text-xs font-mono text-left transition-all ${
                  category === 'critiques'
                    ? 'bg-[#5de6ff]/20 border-[#5de6ff] text-[#5de6ff]'
                    : 'bg-white/5 border-white/10 text-[#cfc2d6]'
                }`}
              >
                <div className="font-bold">🎯 Critiques & WIP</div>
                <div className="text-[10px] opacity-70">Demander des retours</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('news');
                  setSubCategoryTag('News');
                }}
                className={`p-3 rounded-xl border text-xs font-mono text-left transition-all ${
                  category === 'news'
                    ? 'bg-[#ffafd3]/20 border-[#ffafd3] text-[#ffafd3]'
                    : 'bg-white/5 border-white/10 text-[#cfc2d6]'
                }`}
              >
                <div className="font-bold">📰 Industry News</div>
                <div className="text-[10px] opacity-70">Actus, salons, sorties</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">
              Titre du sujet *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Workflow d'ombrage cellulaire sous Clip Studio Paint"
              required
              className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#ddb7ff]"
            />
          </div>

          {category === 'critiques' && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">
                Image du WIP / Dessin à critiquer (URL)
              </label>
              <input
                type="url"
                value={imagePreview}
                onChange={(e) => setImagePreview(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#5de6ff]"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">
              Corps du message / Explications *
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Partagez votre démarche, vos réglages, ou posez vos questions précises à la communauté..."
              required
              className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#ddb7ff]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">
              Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Tutorial, Procreate, Brushes, Workflow"
              className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#ddb7ff]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-mono text-[#cfc2d6] hover:bg-white/5"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-[#ddb7ff] hover:bg-[#f0dbff] text-[#490080] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publication...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publier dans le forum</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
