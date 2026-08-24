import React, { useState } from 'react';
import { Project, UserProfile } from '../../types';
import { toggleProjectLike, addProjectComment } from '../../lib/firebase';
import { 
  X, 
  Heart, 
  MessageSquare, 
  Share2, 
  Eye, 
  Sparkles, 
  Send, 
  Check, 
  ExternalLink,
  BookOpen,
  UserPlus
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ArtworkDetailModalProps {
  project: Project;
  currentUser: UserProfile | null;
  onClose: () => void;
  onRequireAuth: () => void;
  onSelectCollaborator?: (authorHandle: string) => void;
}

export const ArtworkDetailModal: React.FC<ArtworkDetailModalProps> = ({
  project,
  currentUser,
  onClose,
  onRequireAuth,
  onSelectCollaborator,
}) => {
  const isLiked = currentUser ? project.likedBy.includes(currentUser.uid) : false;
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const allImages = [project.imageUrl, ...(project.additionalImages || [])];

  const handleLike = async () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    const res = await toggleProjectLike(project.id, currentUser.uid);
    if (res.liked) {
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#ffafd3', '#ddb7ff'],
      });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await addProjectComment(project.id, {
        authorUid: currentUser.uid,
        authorName: currentUser.displayName,
        authorAvatar: currentUser.avatar,
        authorRole: currentUser.role,
        content: commentText.trim(),
      });
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-[#1b1b1d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col md:flex-row relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white flex items-center justify-center border border-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Main Artwork Stage */}
        <div className="w-full md:w-3/5 bg-[#0e0e10] flex flex-col justify-between p-4 sm:p-6 border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden">
          {/* Main Artwork Frame */}
          <div className="flex-1 flex items-center justify-center min-h-[320px] md:min-h-[480px] relative rounded-2xl overflow-hidden bg-black/40 border border-white/5 group">
            <img
              src={allImages[activeImageIndex]}
              alt={project.title}
              className="max-h-[70vh] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
            />

            {/* Status Badge overlay */}
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium backdrop-blur-md border ${
                project.status === 'En recherche de collaborateurs'
                  ? 'bg-[#5de6ff]/20 text-[#5de6ff] border-[#5de6ff]/30 shadow-[0_0_12px_rgba(93,230,255,0.3)]'
                  : project.status === 'En cours'
                  ? 'bg-[#ddb7ff]/20 text-[#ddb7ff] border-[#ddb7ff]/30'
                  : 'bg-white/10 text-white/80 border-white/20'
              }`}>
                {project.status === 'En recherche de collaborateurs' && (
                  <span className="inline-block w-2 h-2 rounded-full bg-[#5de6ff] animate-pulse mr-1.5" />
                )}
                {project.status}
              </span>
            </div>
          </div>

          {/* Multiple Image / Comic Page Thumbs */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
              <span className="text-[11px] font-mono text-[#cfc2d6]/60 mr-2 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Planches ({allImages.length}):</span>
              </span>
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx ? 'border-[#5de6ff] scale-105 shadow-md' : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Artwork Quick Bar */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-mono transition-all ${
                  isLiked
                    ? 'bg-[#ffafd3]/20 text-[#ffafd3] border-[#ffafd3]/50 shadow-[0_0_12px_rgba(255,175,211,0.3)]'
                    : 'bg-white/5 text-[#e5e1e4] border-white/10 hover:text-[#ffafd3] hover:border-[#ffafd3]/40'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-bold">{project.likes}</span>
              </button>

              <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 text-[#cfc2d6] text-xs font-mono border border-white/5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{project.commentsCount || (project.comments?.length || 0)}</span>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-mono text-[#cfc2d6] transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Lien copié !</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Partager</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Info, Author, Comments */}
        <div className="w-full md:w-2/5 flex flex-col justify-between p-6 overflow-y-auto max-h-[60vh] md:max-h-full">
          <div>
            {/* Category & Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#ddb7ff]/15 text-[#ddb7ff] font-semibold uppercase">
                {project.category}
              </span>
              {project.tags.map((t) => (
                <span key={t} className="text-[11px] font-mono text-[#cfc2d6]/70">
                  #{t}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-[#e5e1e4] mb-3">{project.title}</h1>

            {/* Author Bar */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/5 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={project.authorAvatar}
                  alt={project.author}
                  className="w-10 h-10 rounded-full object-cover border border-[#ddb7ff]/30"
                />
                <div>
                  <div className="text-sm font-bold text-[#e5e1e4]">{project.author}</div>
                  <div className="text-xs text-[#5de6ff]">{project.authorRole}</div>
                </div>
              </div>

              {project.status === 'En recherche de collaborateurs' && (
                <button
                  onClick={() => {
                    onClose();
                    if (onSelectCollaborator) onSelectCollaborator(project.authorHandle || project.author);
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#5de6ff]/15 text-[#5de6ff] hover:bg-[#5de6ff] hover:text-[#00363e] text-xs font-mono transition-all font-semibold"
                >
                  Contacter
                </button>
              )}
            </div>

            {/* Description */}
            <div className="text-sm text-[#cfc2d6]/90 leading-relaxed mb-6 space-y-2">
              <p>{project.description}</p>
            </div>

            {/* Comments List */}
            <div className="border-t border-white/10 pt-4 mb-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#ddb7ff] mb-3 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Commentaires & Retours ({project.comments?.length || 0})</span>
              </h3>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {project.comments && project.comments.length > 0 ? (
                  project.comments.map((comm) => (
                    <div key={comm.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <img src={comm.authorAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                          <span className="font-semibold text-[#e5e1e4]">{comm.authorName}</span>
                          <span className="text-[10px] text-[#5de6ff] font-mono">({comm.authorRole})</span>
                        </div>
                        <span className="text-[10px] text-[#cfc2d6]/50 font-mono">{comm.createdAt}</span>
                      </div>
                      <p className="text-[#cfc2d6]/90 pl-7">{comm.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-[#cfc2d6]/50 italic py-4 text-center">
                    Soyez le premier à commenter cette œuvre !
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add Comment Input Form */}
          <form onSubmit={handleAddComment} className="pt-3 border-t border-white/10 mt-auto">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={currentUser ? "Laisser un commentaire technique ou artistique..." : "Connectez-vous pour commenter"}
                disabled={!currentUser || submittingComment}
                className="flex-1 bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#ddb7ff]"
              />
              <button
                type="submit"
                disabled={!currentUser || submittingComment || !commentText.trim()}
                className="p-2.5 rounded-xl bg-[#ddb7ff] text-[#490080] hover:bg-[#f0dbff] disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
