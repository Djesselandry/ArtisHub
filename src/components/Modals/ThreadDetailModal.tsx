import React, { useState } from 'react';
import { ForumTopic, UserProfile } from '../../types';
import { addForumReply } from '../../lib/firebase';
import { X, MessageSquare, Send, Heart, Sparkles, User } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ThreadDetailModalProps {
  topic: ForumTopic;
  currentUser: UserProfile | null;
  onClose: () => void;
  onRequireAuth: () => void;
}

export const ThreadDetailModal: React.FC<ThreadDetailModalProps> = ({
  topic,
  currentUser,
  onClose,
  onRequireAuth,
}) => {
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (!replyText.trim()) return;

    setSubmitting(true);
    try {
      await addForumReply(topic.id, {
        author: currentUser.displayName,
        authorUid: currentUser.uid,
        authorHandle: currentUser.handle,
        authorAvatar: currentUser.avatar,
        authorRole: currentUser.role,
        content: replyText.trim(),
      });
      setReplyText('');
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#ddb7ff', '#5de6ff'],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#1b1b1d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-20 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#cfc2d6] hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Thread Header */}
        <div className="p-6 sm:p-8 border-b border-white/10 bg-[#201f21]">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#ddb7ff]/20 text-[#ddb7ff] font-bold">
              {topic.categoryLabel || topic.category}
            </span>
            {topic.subCategoryTag && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#5de6ff]/10 text-[#5de6ff]">
                {topic.subCategoryTag}
              </span>
            )}
            {topic.tags.map((t) => (
              <span key={t} className="text-[11px] font-mono text-[#cfc2d6]/60">
                #{t}
              </span>
            ))}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[#e5e1e4] mb-3">{topic.title}</h1>

          {/* Author info */}
          <div className="flex items-center gap-3">
            <img src={topic.authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" />
            <div className="text-xs">
              <span className="font-semibold text-[#e5e1e4]">{topic.author}</span>
              <span className="text-[#cfc2d6]/60 ml-2">Posté le {topic.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Thread Body & Replies */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Main Post Content */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4 text-sm text-[#e5e1e4]/90 leading-relaxed whitespace-pre-line">
            {topic.content}

            {topic.imagePreview && (
              <div className="mt-4 rounded-xl overflow-hidden max-h-96 border border-white/10 bg-black/40">
                <img src={topic.imagePreview} alt="Illustration WIP" className="w-full h-full object-contain" />
              </div>
            )}
          </div>

          {/* Replies Section */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#5de6ff] mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>Réponses de la communauté ({topic.replies?.length || 0})</span>
            </h3>

            <div className="space-y-3">
              {topic.replies && topic.replies.length > 0 ? (
                topic.replies.map((reply) => (
                  <div key={reply.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <img src={reply.authorAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                        <span className="font-bold text-[#e5e1e4]">{reply.author}</span>
                        {reply.authorRole && (
                          <span className="text-[10px] text-[#5de6ff] font-mono">({reply.authorRole})</span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#cfc2d6]/50 font-mono">{reply.createdAt}</span>
                    </div>
                    <p className="text-[#cfc2d6]/90 pl-8 leading-relaxed whitespace-pre-line">{reply.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#cfc2d6]/50 italic py-4 text-center">
                  Aucune réponse pour le moment. Partagez votre avis !
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reply Composer Bar */}
        <form onSubmit={handleAddReply} className="p-4 bg-[#201f21] border-t border-white/10 flex items-center gap-3">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={currentUser ? "Rédiger une réponse constructive ou un conseil..." : "Connectez-vous pour répondre"}
            disabled={!currentUser || submitting}
            className="flex-1 bg-[#2a2a2c]/80 border border-white/10 rounded-xl px-4 py-3 text-xs text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#ddb7ff]"
          />
          <button
            type="submit"
            disabled={!currentUser || submitting || !replyText.trim()}
            className="px-5 py-3 rounded-xl bg-[#ddb7ff] text-[#490080] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#f0dbff] disabled:opacity-40 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Répondre</span>
          </button>
        </form>
      </div>
    </div>
  );
};
