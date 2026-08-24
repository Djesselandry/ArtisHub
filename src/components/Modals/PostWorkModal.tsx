import React, { useState } from 'react';
import { ProjectCategory, ProjectStatus, UserProfile } from '../../types';
import { addProject } from '../../lib/firebase';
import { X, Upload, Image as ImageIcon, Sparkles, Plus, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PostWorkModalProps {
  currentUser: UserProfile | null;
  onClose: () => void;
  onRequireAuth: () => void;
}

export const PostWorkModal: React.FC<PostWorkModalProps> = ({
  currentUser,
  onClose,
  onRequireAuth,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('BD & Manga');
  const [status, setStatus] = useState<ProjectStatus>('En recherche de collaborateurs');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('Cyberpunk, BD, Action');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preset sample artwork images for quick testing
  const sampleImages = [
    { label: 'BD Manga Cyber', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Ville Néon Futuriste', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Mecha 3D Armor', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Forêt Fantasy Ethereal', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Storyboard Anamorphique', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (!title.trim() || !imageUrl.trim()) {
      setError('Veuillez fournir un titre et une image pour votre œuvre.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      await addProject({
        title: title.trim(),
        description: description.trim() || 'Nouvelle publication artistique sur ArtisHub.',
        author: currentUser.displayName,
        authorUid: currentUser.uid,
        authorHandle: currentUser.handle,
        authorAvatar: currentUser.avatar,
        authorRole: currentUser.role,
        imageUrl: imageUrl.trim(),
        category,
        tags: parsedTags.length > 0 ? parsedTags : ['Artwork'],
        status,
      });

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#ddb7ff', '#5de6ff', '#ffafd3'],
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erreur lors de la publication.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#1b1b1d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#cfc2d6] hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#ddb7ff]/20 text-[#ddb7ff] flex items-center justify-center">
            <Upload className="w-4 h-4" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#e5e1e4]">
            Publier une Œuvre / Planche BD
          </h2>
        </div>
        <p className="text-xs text-[#cfc2d6]/70 mb-6 ml-10">
          Enregistré directement dans la collection Firestore <code className="font-mono text-[#5de6ff]">projects</code>
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">
              Titre de l'œuvre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Chroniques de Neo-Kyoto - Planche 12"
              required
              className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#ddb7ff]"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">
                Catégorie *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full bg-[#2a2a2c] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] focus:outline-none focus:border-[#ddb7ff]"
              >
                <option value="BD & Manga">BD & Manga</option>
                <option value="Digital Art">Digital Art</option>
                <option value="3D Modeling">3D Modeling</option>
                <option value="Storyboards">Storyboards</option>
                <option value="Concept Art">Concept Art</option>
                <option value="Illustration">Illustration</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">
                Statut du projet *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full bg-[#2a2a2c] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] focus:outline-none focus:border-[#5de6ff]"
              >
                <option value="En recherche de collaborateurs">En recherche de collaborateurs</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
              </select>
            </div>
          </div>

          {/* Image URL & Upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6]">
                Image de couverture (URL ou fichier) *
              </label>
              <label className="text-[11px] font-mono text-[#5de6ff] hover:underline cursor-pointer flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                <span>Importer un fichier</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              required
              className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#ddb7ff]"
            />

            {/* Quick Sample Image Picker */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono text-[#cfc2d6]/50">Exemples rapides :</span>
              {sampleImages.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageUrl(s.url)}
                  className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-[#ddb7ff]/20 text-[#cfc2d6] hover:text-[#ddb7ff] transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Image Preview */}
            {imageUrl && (
              <div className="mt-3 relative rounded-xl overflow-hidden h-44 bg-black/40 border border-white/10 flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <span className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-[10px] font-mono text-white">
                  Aperçu
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">
              Description / Notes d'intention
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Expliquez la genèse de l'œuvre, les logiciels utilisés, ou les profils recherchés..."
              className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#ddb7ff]"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1.5">
              Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Cyberpunk, Manga, ConceptArt, UnrealEngine"
              className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#ddb7ff]"
            />
          </div>

          {/* Actions */}
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
              className="px-6 py-3 rounded-xl bg-[#ddb7ff] hover:bg-[#f0dbff] text-[#490080] font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#ddb7ff]/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publier dans la galerie</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
