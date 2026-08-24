import React, { useState } from 'react';
import { ForumCategory, ForumTopic, UserProfile } from '../../types';
import { 
  MessageSquare, 
  MessageSquarePlus, 
  Eye, 
  Clock, 
  Pin, 
  Sparkles, 
  Lightbulb, 
  Target, 
  Newspaper, 
  ChevronRight,
  Flame
} from 'lucide-react';

interface ForumViewProps {
  topics: ForumTopic[];
  currentUser: UserProfile | null;
  onSelectTopic: (topic: ForumTopic) => void;
  onOpenNewThread: () => void;
  onRequireAuth: () => void;
}

export const ForumView: React.FC<ForumViewProps> = ({
  topics,
  currentUser,
  onSelectTopic,
  onOpenNewThread,
  onRequireAuth,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | 'all'>('all');

  const filteredTopics = topics.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1b1b1d] via-[#201f21] to-[#1b1b1d] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#ddb7ff]/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ddb7ff]/15 text-[#ddb7ff] text-xs font-mono mb-2 border border-[#ddb7ff]/20">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Forum de Discussions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#e5e1e4] mb-2">
            Creative Sanctuary Forum
          </h1>
          <p className="text-xs sm:text-sm text-[#cfc2d6]/80 max-w-xl">
            Tutoriels, retours critiques bienveillants (WIP) et actualités de l'industrie du dessin et de l'animation.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={onOpenNewThread}
            className="px-6 py-3 rounded-2xl bg-[#ddb7ff] hover:bg-[#f0dbff] text-[#490080] font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#ddb7ff]/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>New Thread</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#ddb7ff]/15 border-[#ddb7ff] text-[#ddb7ff] shadow-sm'
              : 'bg-white/[0.02] border-white/5 text-[#cfc2d6] hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Flame className="w-4 h-4 text-[#ddb7ff]" />
            <span className="text-[10px] font-mono opacity-60">{topics.length} topics</span>
          </div>
          <div className="text-sm font-bold">Tous les sujets</div>
          <div className="text-[11px] opacity-70">Toutes les discussions</div>
        </button>

        <button
          onClick={() => setSelectedCategory('tips')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedCategory === 'tips'
              ? 'bg-[#ddb7ff]/15 border-[#ddb7ff] text-[#ddb7ff] shadow-sm'
              : 'bg-white/[0.02] border-white/5 text-[#cfc2d6] hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Lightbulb className="w-4 h-4 text-[#ddb7ff]" />
            <span className="text-[10px] font-mono opacity-60">
              {topics.filter((t) => t.category === 'tips').length}
            </span>
          </div>
          <div className="text-sm font-bold">Tips & Tutorials</div>
          <div className="text-[11px] opacity-70">Guides logiciels, brosses</div>
        </button>

        <button
          onClick={() => setSelectedCategory('critiques')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedCategory === 'critiques'
              ? 'bg-[#5de6ff]/15 border-[#5de6ff] text-[#5de6ff] shadow-sm'
              : 'bg-white/[0.02] border-white/5 text-[#cfc2d6] hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Target className="w-4 h-4 text-[#5de6ff]" />
            <span className="text-[10px] font-mono opacity-60">
              {topics.filter((t) => t.category === 'critiques').length}
            </span>
          </div>
          <div className="text-sm font-bold">Constructive Critiques</div>
          <div className="text-[11px] opacity-70">Retours WIP & anatomie</div>
        </button>

        <button
          onClick={() => setSelectedCategory('news')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedCategory === 'news'
              ? 'bg-[#ffafd3]/15 border-[#ffafd3] text-[#ffafd3] shadow-sm'
              : 'bg-white/[0.02] border-white/5 text-[#cfc2d6] hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Newspaper className="w-4 h-4 text-[#ffafd3]" />
            <span className="text-[10px] font-mono opacity-60">
              {topics.filter((t) => t.category === 'news').length}
            </span>
          </div>
          <div className="text-sm font-bold">Industry News</div>
          <div className="text-[11px] opacity-70">Sorties, Salons & Tech</div>
        </button>
      </div>

      {/* Topics List Table / Cards */}
      <div className="space-y-4">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            onClick={() => onSelectTopic(topic)}
            className="p-5 sm:p-6 rounded-3xl bg-[#1b1b1d]/80 backdrop-blur-md border border-white/10 hover:border-[#ddb7ff]/40 shadow-xl transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
          >
            {/* Left: Info, Title, Preview */}
            <div className="flex items-start gap-4 flex-1">
              <img
                src={topic.authorAvatar}
                alt={topic.author}
                className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10"
              />

              <div className="flex-1 min-w-0">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold ${
                      topic.category === 'tips'
                        ? 'bg-[#ddb7ff]/20 text-[#ddb7ff]'
                        : topic.category === 'critiques'
                        ? 'bg-[#5de6ff]/20 text-[#5de6ff]'
                        : 'bg-[#ffafd3]/20 text-[#ffafd3]'
                    }`}
                  >
                    {topic.categoryLabel || topic.category}
                  </span>

                  {topic.subCategoryTag && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-[#cfc2d6]">
                      {topic.subCategoryTag}
                    </span>
                  )}

                  {topic.pinned && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-[#e5e1e4] group-hover:text-[#ddb7ff] transition-colors mb-1">
                  {topic.title}
                </h3>

                {/* Preview text */}
                <p className="text-xs text-[#cfc2d6]/70 line-clamp-2 mb-2">{topic.previewText}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {topic.tags.map((t) => (
                    <span key={t} className="text-[10px] font-mono text-[#cfc2d6]/50">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Metrics & Last Activity */}
            <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-white/5 shrink-0">
              <div className="flex items-center gap-4 text-xs font-mono text-[#cfc2d6]/70">
                <div className="flex items-center gap-1.5" title="Réponses">
                  <MessageSquare className="w-4 h-4 text-[#ddb7ff]" />
                  <span className="font-bold text-[#e5e1e4]">{topic.repliesCount || topic.replies?.length || 0}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Vues">
                  <Eye className="w-4 h-4 text-[#5de6ff]" />
                  <span>{topic.viewsCount}</span>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <div className="text-[11px] text-[#cfc2d6]/50 font-mono">Dernière activité</div>
                <div className="text-xs text-[#e5e1e4] font-medium">{topic.lastActivity}</div>
              </div>

              <ChevronRight className="w-5 h-5 text-[#cfc2d6]/40 group-hover:text-[#ddb7ff] group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
