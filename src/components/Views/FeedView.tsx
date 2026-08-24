import React, { useState } from 'react';
import { Project, UserProfile } from '../../types';
import { toggleProjectLike } from '../../lib/firebase';
import { 
  Heart, 
  MessageSquare, 
  Sparkles, 
  Upload, 
  Eye, 
  Filter, 
  ArrowRight, 
  UserCheck, 
  Layers 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FeedViewProps {
  projects: Project[];
  currentUser: UserProfile | null;
  selectedCategory: string | null;
  selectedTag: string | null;
  searchQuery: string;
  onSelectProject: (project: Project) => void;
  onOpenPostWork: () => void;
  onRequireAuth: () => void;
  onSelectCollaborator: (author: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  projects,
  currentUser,
  selectedCategory,
  selectedTag,
  searchQuery,
  onSelectProject,
  onOpenPostWork,
  onRequireAuth,
  onSelectCollaborator,
}) => {
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'recruiting' | 'in_progress' | 'completed'>('all');

  // Filter projects based on category, tag, search query, and status tab
  const filteredProjects = projects.filter((proj) => {
    if (selectedCategory && proj.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (selectedTag && !proj.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = proj.title.toLowerCase().includes(q);
      const matchAuthor = proj.author.toLowerCase().includes(q);
      const matchTags = proj.tags.some((t) => t.toLowerCase().includes(q));
      const matchDesc = proj.description.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchTags && !matchDesc) return false;
    }
    if (activeTabFilter === 'recruiting' && proj.status !== 'En recherche de collaborateurs') return false;
    if (activeTabFilter === 'in_progress' && proj.status !== 'En cours') return false;
    if (activeTabFilter === 'completed' && proj.status !== 'Terminé') return false;
    return true;
  });

  // Featured Project (Neon District or first marked featured or first in list)
  const featuredProject = projects.find((p) => p.featured) || projects[0];

  const handleLike = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    if (!currentUser) {
      onRequireAuth();
      return;
    }

    const res = await toggleProjectLike(project.id, currentUser.uid);
    if (res.liked) {
      confetti({
        particleCount: 25,
        spread: 40,
        origin: {
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        },
        colors: ['#ffafd3', '#ddb7ff'],
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. HERO FEATURED SHOWCASE (Screen 3 Top) */}
      {featuredProject && !selectedCategory && !selectedTag && !searchQuery && (
        <section 
          onClick={() => onSelectProject(featuredProject)}
          className="relative w-full rounded-[32px] overflow-hidden bg-[#1b1b1d] border border-white/10 shadow-2xl group cursor-pointer"
        >
          {/* Hero Image with Cinematic Gradient */}
          <div className="relative h-80 sm:h-[420px] w-full overflow-hidden">
            <img
              src={featuredProject.imageUrl}
              alt={featuredProject.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Multi-layer Gradient Darkeners */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#131315] via-[#131315]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#131315]/90 via-[#131315]/40 to-transparent" />
          </div>

          {/* Hero Overlay Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 flex flex-col justify-end">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ddb7ff]/20 backdrop-blur-md border border-[#ddb7ff]/40 text-[#ddb7ff] text-[11px] font-mono font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(221,183,255,0.3)]">
                <Sparkles className="w-3 h-3" />
                Featured Showcase
              </span>
              <span className="px-3 py-1 rounded-full bg-[#5de6ff]/20 backdrop-blur-md border border-[#5de6ff]/30 text-[#5de6ff] text-[11px] font-mono font-semibold uppercase">
                {featuredProject.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-[11px] font-mono">
                {featuredProject.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#e5e1e4] mb-3 group-hover:text-white transition-colors">
              {featuredProject.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#cfc2d6]/90 max-w-2xl line-clamp-2 mb-6 hidden sm:block">
              {featuredProject.description}
            </p>

            {/* Author & Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={featuredProject.authorAvatar}
                  alt={featuredProject.author}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#ddb7ff]"
                />
                <div>
                  <div className="text-sm font-bold text-[#e5e1e4] flex items-center gap-1.5">
                    <span>{featuredProject.author}</span>
                    <span className="text-[11px] font-mono text-[#5de6ff]">{featuredProject.authorHandle}</span>
                  </div>
                  <div className="text-xs text-[#cfc2d6]/70">{featuredProject.authorRole}</div>
                </div>
              </div>

              {/* Likes, Comments & Action */}
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => handleLike(e, featuredProject)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md text-xs font-mono transition-all ${
                    currentUser && featuredProject.likedBy.includes(currentUser.uid)
                      ? 'bg-[#ffafd3]/25 text-[#ffafd3] border-[#ffafd3]/60 shadow-[0_0_12px_rgba(255,175,211,0.4)]'
                      : 'bg-white/10 text-white border-white/20 hover:border-[#ffafd3]/60 hover:text-[#ffafd3]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${currentUser && featuredProject.likedBy.includes(currentUser.uid) ? 'fill-current animate-pop' : ''}`} />
                  <span className="font-bold">{featuredProject.likes}</span>
                </button>

                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 backdrop-blur-md text-white/80 text-xs font-mono border border-white/10">
                  <MessageSquare className="w-4 h-4" />
                  <span>{featuredProject.commentsCount || featuredProject.comments?.length || 0}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCollaborator(featuredProject.authorHandle || featuredProject.author);
                  }}
                  className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full bg-[#ddb7ff] hover:bg-[#f0dbff] text-[#490080] text-xs font-mono font-bold uppercase tracking-wider shadow-lg shadow-[#ddb7ff]/25 transition-all"
                >
                  <span>Collaborer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. FEED TOOLBAR & FILTERS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold tracking-tight text-[#e5e1e4]">
            {selectedCategory ? `${selectedCategory}` : selectedTag ? `#${selectedTag}` : 'Explore Showcase'}
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-mono text-[#cfc2d6]">
            {filteredProjects.length} créations
          </span>
        </div>

        {/* Status Tab Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTabFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
              activeTabFilter === 'all'
                ? 'bg-[#ddb7ff]/20 text-[#ddb7ff] border border-[#ddb7ff]/30 font-bold'
                : 'text-[#cfc2d6] hover:bg-white/5'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setActiveTabFilter('recruiting')}
            className={`px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
              activeTabFilter === 'recruiting'
                ? 'bg-[#5de6ff]/20 text-[#5de6ff] border border-[#5de6ff]/30 font-bold'
                : 'text-[#cfc2d6] hover:bg-white/5'
            }`}
          >
            En recherche de collaborateurs
          </button>
          <button
            onClick={() => setActiveTabFilter('in_progress')}
            className={`px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
              activeTabFilter === 'in_progress'
                ? 'bg-[#ddb7ff]/20 text-[#ddb7ff] border border-[#ddb7ff]/30 font-bold'
                : 'text-[#cfc2d6] hover:bg-white/5'
            }`}
          >
            En cours
          </button>
          <button
            onClick={() => setActiveTabFilter('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
              activeTabFilter === 'completed'
                ? 'bg-white/20 text-white font-bold'
                : 'text-[#cfc2d6] hover:bg-white/5'
            }`}
          >
            Terminés
          </button>
        </div>
      </div>

      {/* 3. SHOWCASE GRID (Screen 3 Masonry Cards) */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const isLiked = currentUser ? project.likedBy.includes(currentUser.uid) : false;
            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="group relative bg-[#1b1b1d]/80 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 hover:border-[#ddb7ff]/40 shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                {/* Artwork Thumbnail */}
                <div className="relative h-56 w-full overflow-hidden bg-[#0e0e10]">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Top Status & Category Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#ddb7ff] uppercase">
                      {project.category}
                    </span>

                    {project.status === 'En recherche de collaborateurs' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#5de6ff]/25 backdrop-blur-md border border-[#5de6ff]/40 text-[10px] font-mono text-[#5de6ff] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5de6ff] animate-ping" />
                        Recherche Collab
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#e5e1e4] group-hover:text-[#ddb7ff] transition-colors line-clamp-1 mb-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-[#cfc2d6]/70 line-clamp-2 mb-3">
                      {project.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] font-mono text-[#cfc2d6]/50">
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Footer: Author & Social Metrics */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <img
                        src={project.authorAvatar}
                        alt={project.author}
                        className="w-6 h-6 rounded-full object-cover border border-white/10"
                      />
                      <span className="text-xs text-[#cfc2d6] font-medium truncate max-w-[110px]">
                        {project.author}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Like Button */}
                      <button
                        onClick={(e) => handleLike(e, project)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono transition-colors ${
                          isLiked
                            ? 'text-[#ffafd3] bg-[#ffafd3]/15'
                            : 'text-[#cfc2d6] hover:text-[#ffafd3] hover:bg-white/5'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current animate-pop' : ''}`} />
                        <span>{project.likes}</span>
                      </button>

                      {/* Comments */}
                      <div className="flex items-center gap-1 text-xs font-mono text-[#cfc2d6]/70">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{project.commentsCount || (project.comments?.length || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl bg-white/[0.02] border border-white/5">
          <Layers className="w-10 h-10 mx-auto text-[#cfc2d6]/40 mb-3" />
          <h3 className="text-lg font-bold text-[#e5e1e4] mb-1">Aucune œuvre trouvée</h3>
          <p className="text-xs text-[#cfc2d6]/60 mb-4 max-w-sm mx-auto">
            Aucun projet ne correspond à vos filtres actuels. Soyez le premier à publier dans cette catégorie !
          </p>
          <button
            onClick={onOpenPostWork}
            className="px-5 py-2.5 rounded-xl bg-[#ddb7ff] text-[#490080] font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Publier une création</span>
          </button>
        </div>
      )}

      {/* Floating Action Button on Mobile */}
      <button
        onClick={onOpenPostWork}
        className="fixed bottom-6 right-6 sm:hidden z-30 w-14 h-14 rounded-full bg-[#ddb7ff] text-[#490080] shadow-2xl flex items-center justify-center font-bold"
        title="Publier une œuvre"
      >
        <Upload className="w-6 h-6" />
      </button>
    </div>
  );
};
