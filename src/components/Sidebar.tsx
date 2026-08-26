import React from 'react';
import { ProjectCategory } from '../types';
import { 
  Palette, 
  Box, 
  BookOpen, 
  Film, 
  Code2,
  Smartphone,
  Gamepad2,
  Compass, 
  Sparkles, 
  Tag, 
  TrendingUp, 
  Layers 
} from 'lucide-react';

interface SidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  onSelectTab: (tab: 'feed' | 'recruitment' | 'forum') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedTag,
  onSelectTag,
  onSelectTab,
}) => {
  const categories: { name: ProjectCategory | 'All'; label: string; icon: React.ReactNode }[] = [
    { name: 'All', label: 'Toutes les créations', icon: <Compass className="w-4 h-4" /> },
    { name: 'Digital Art', label: 'Digital Art', icon: <Palette className="w-4 h-4" /> },
    { name: '3D Modeling', label: '3D Modeling', icon: <Box className="w-4 h-4" /> },
    { name: 'BD & Manga', label: 'BD & Manga', icon: <BookOpen className="w-4 h-4" /> },
    { name: 'Storyboards', label: 'Storyboards', icon: <Film className="w-4 h-4" /> },
    { name: 'Web Development', label: 'Développement web', icon: <Code2 className="w-4 h-4" /> },
    { name: 'Mobile App', label: 'Applications mobiles', icon: <Smartphone className="w-4 h-4" /> },
    { name: 'Game Development', label: 'Développement jeu', icon: <Gamepad2 className="w-4 h-4" /> },
  ];

  const trendingTags = [
    { name: 'cyberpunk', count: '1.4k', color: 'primary' },
    { name: 'sketch', count: '890', color: 'secondary' },
    { name: 'blender3d', count: '640', color: 'tertiary' },
    { name: 'DarkFantasy', count: '520', color: 'primary' },
    { name: 'Webtoon', count: '410', color: 'secondary' },
    { name: 'Mecha', count: '380', color: 'tertiary' },
    { name: 'react', count: '320', color: 'secondary' },
    { name: 'gamedev', count: '270', color: 'primary' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-[#0e0e10]/80 backdrop-blur-2xl z-50 flex flex-col pt-6 border-r border-white/10 hidden lg:flex select-none">
      {/* Brand Header */}
      <div 
        onClick={() => {
          onSelectCategory(null);
          onSelectTag(null);
          onSelectTab('feed');
        }}
        className="px-6 mb-8 cursor-pointer group flex items-center gap-2.5"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#842bd2] to-[#5de6ff] flex items-center justify-center shadow-[0_0_15px_rgba(221,183,255,0.4)] group-hover:scale-105 transition-transform">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-[#ddb7ff] group-hover:text-white transition-colors">
            ArtisHub
          </span>
          <span className="block text-[9px] font-mono text-[#5de6ff] uppercase tracking-widest">
            Creative Sanctuary
          </span>
        </div>
      </div>

      {/* Categories Navigation */}
      <div className="px-6 mb-3">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#ddb7ff] opacity-75 flex items-center gap-1.5">
          <Layers className="w-3 h-3" />
          <span>Categories</span>
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {categories.map((cat) => {
          const isSelected = (cat.name === 'All' && !selectedCategory) || selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => {
                onSelectCategory(cat.name === 'All' ? null : cat.name);
                onSelectTab('feed');
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer text-sm font-medium ${
                isSelected
                  ? 'bg-[#ddb7ff]/15 text-[#ddb7ff] border-l-2 border-[#5de6ff] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                  : 'text-[#cfc2d6] hover:bg-[#2a2a2c]/50 hover:text-[#e5e1e4]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isSelected ? 'text-[#5de6ff]' : 'text-[#cfc2d6]/70'}>
                  {cat.icon}
                </span>
                <span>{cat.label}</span>
              </div>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#5de6ff] shadow-[0_0_6px_#5de6ff]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Trending Tags */}
      <div className="px-6 py-6 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#5de6ff] opacity-80 flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" />
            <span>Trending Tags</span>
          </span>
          {selectedTag && (
            <button
              onClick={() => onSelectTag(null)}
              className="text-[10px] font-mono text-[#ffafd3] hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {trendingTags.map((tag) => {
            const isTagActive = selectedTag?.toLowerCase() === tag.name.toLowerCase();
            return (
              <button
                key={tag.name}
                onClick={() => {
                  onSelectTag(isTagActive ? null : tag.name);
                  onSelectTab('feed');
                }}
                className={`px-3 py-1 text-xs font-mono rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                  isTagActive
                    ? 'bg-[#ddb7ff] text-[#490080] font-bold shadow-[0_0_12px_rgba(221,183,255,0.6)]'
                    : tag.color === 'secondary'
                    ? 'bg-[#5de6ff]/10 text-[#5de6ff] hover:bg-[#5de6ff] hover:text-[#00363e]'
                    : tag.color === 'tertiary'
                    ? 'bg-[#ffafd3]/10 text-[#ffafd3] hover:bg-[#ffafd3] hover:text-[#620040]'
                    : 'bg-[#ddb7ff]/10 text-[#ddb7ff] hover:bg-[#ddb7ff] hover:text-[#490080]'
                }`}
              >
                <span>#{tag.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-[#cfc2d6]/60">
        <div className="flex items-center gap-1.5 text-[#e5e1e4] font-medium mb-1">
          <Tag className="w-3 h-3 text-[#ddb7ff]" />
          <span>Hub créatif & tech</span>
        </div>
        <p className="line-clamp-2">
          Partagez vos projets, recrutez des talents et rejoignez les discussions.
        </p>
      </div>
    </aside>
  );
};
