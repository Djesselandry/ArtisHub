import React, { useState } from 'react';
import { UserProfile } from '../types';
import { signOut, switchDemoUser, getFirebaseStatus } from '../lib/firebase';
import { DEMO_USERS } from '../lib/initialData';
import { 
  Search, 
  User as UserIcon, 
  LogOut, 
  Sparkles, 
  Database, 
  Menu, 
  X, 
  Upload, 
  MessageSquarePlus, 
  PlusCircle 
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'feed' | 'recruitment' | 'forum';
  onSelectTab: (tab: 'feed' | 'recruitment' | 'forum') => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onOpenPostWork: () => void;
  onOpenPostAd: () => void;
  onOpenNewThread: () => void;
  onOpenFirebaseConfig: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenAuth,
  onOpenPostWork,
  onOpenPostAd,
  onOpenNewThread,
  onOpenFirebaseConfig,
  searchQuery,
  onSearchChange,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const fbStatus = getFirebaseStatus();

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-[#201f21]/80 backdrop-blur-xl border-b border-white/10 z-40 flex items-center justify-between px-4 sm:px-8 transition-all">
      {/* Left: Mobile Brand & Search */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="lg:hidden p-2 rounded-lg text-[#cfc2d6] hover:text-[#ddb7ff] hover:bg-white/5"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Mobile Brand Name */}
        <span 
          onClick={() => onSelectTab('feed')}
          className="text-xl font-bold tracking-tight text-[#ddb7ff] lg:hidden cursor-pointer"
        >
          ArtisHub
        </span>

        {/* Search Bar */}
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cfc2d6]/60 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher œuvres, artistes, tags..."
            className="bg-[#353437]/50 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs text-[#e5e1e4] placeholder-[#cfc2d6]/50 focus:outline-none focus:border-[#5de6ff] focus:ring-1 focus:ring-[#5de6ff] transition-all w-60 md:w-72"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/50 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Center: Main Navigation */}
      <nav className="hidden md:flex items-center gap-8">
        <button
          onClick={() => onSelectTab('feed')}
          className={`text-sm transition-all relative py-1 cursor-pointer font-medium ${
            currentTab === 'feed'
              ? 'text-[#ddb7ff] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#5de6ff] after:shadow-[0_0_8px_rgba(93,230,255,0.7)]'
              : 'text-[#cfc2d6] hover:text-[#e5e1e4]'
          }`}
        >
          Feed
        </button>
        <button
          onClick={() => onSelectTab('recruitment')}
          className={`text-sm transition-all relative py-1 cursor-pointer font-medium ${
            currentTab === 'recruitment'
              ? 'text-[#ddb7ff] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#5de6ff] after:shadow-[0_0_8px_rgba(93,230,255,0.7)]'
              : 'text-[#cfc2d6] hover:text-[#e5e1e4]'
          }`}
        >
          Recruitment
        </button>
        <button
          onClick={() => onSelectTab('forum')}
          className={`text-sm transition-all relative py-1 cursor-pointer font-medium ${
            currentTab === 'forum'
              ? 'text-[#ddb7ff] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#5de6ff] after:shadow-[0_0_8px_rgba(93,230,255,0.7)]'
              : 'text-[#cfc2d6] hover:text-[#e5e1e4]'
          }`}
        >
          Forum
        </button>
      </nav>

      {/* Right: Actions & User Profile */}
      <div className="flex items-center gap-3">
        {/* Quick context action based on active tab */}
        {currentTab === 'feed' && (
          <button
            onClick={onOpenPostWork}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ddb7ff]/10 hover:bg-[#ddb7ff] text-[#ddb7ff] hover:text-[#490080] border border-[#ddb7ff]/30 text-xs font-mono font-medium transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Post Work</span>
          </button>
        )}
        {currentTab === 'recruitment' && (
          <button
            onClick={onOpenPostAd}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#5de6ff]/10 hover:bg-[#5de6ff] text-[#5de6ff] hover:text-[#00363e] border border-[#5de6ff]/30 text-xs font-mono font-medium transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post Ad</span>
          </button>
        )}
        {currentTab === 'forum' && (
          <button
            onClick={onOpenNewThread}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ddb7ff]/10 hover:bg-[#ddb7ff] text-[#ddb7ff] hover:text-[#490080] border border-[#ddb7ff]/30 text-xs font-mono font-medium transition-all"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>New Thread</span>
          </button>
        )}

        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#ddb7ff]/50 transition-all cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.displayName}
                className="w-8 h-8 rounded-full object-cover border border-[#ddb7ff]/40"
              />
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div 
                className="absolute right-0 mt-3 w-64 bg-[#1b1b1d]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setProfileDropdownOpen(false)}
              >
                {/* User card info */}
                <div className="flex items-center gap-3 p-2 border-b border-white/10 mb-2">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.displayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#e5e1e4] truncate">{currentUser.displayName}</div>
                    <div className="text-xs text-[#5de6ff] truncate">{currentUser.role}</div>
                    <div className="text-[10px] font-mono text-[#cfc2d6]/60 truncate">{currentUser.handle}</div>
                  </div>
                </div>

                {/* Switch Demo user list */}
                <div className="py-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#cfc2d6]/50 px-2 py-1">
                    Changer de compte créateur
                  </div>
                  <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                    {DEMO_USERS.map((u) => (
                      <button
                        key={u.uid}
                        onClick={(e) => {
                          e.stopPropagation();
                          switchDemoUser(u);
                        }}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-colors ${
                          u.uid === currentUser.uid
                            ? 'bg-[#ddb7ff]/15 text-[#ddb7ff] font-medium'
                            : 'hover:bg-white/5 text-[#cfc2d6]'
                        }`}
                      >
                        <img src={u.avatar} className="w-5 h-5 rounded-full object-cover" alt="" />
                        <span className="truncate">{u.displayName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Firebase Connection details */}
                <div className="border-t border-white/10 pt-2 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileDropdownOpen(false);
                      onOpenFirebaseConfig();
                    }}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 text-xs text-[#cfc2d6]"
                  >
                    <span className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-[#5de6ff]" />
                      <span>Configuration Firebase</span>
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      fbStatus.isLive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/70'
                    }`}>
                      {fbStatus.isLive ? 'Live' : 'Local'}
                    </span>
                  </button>

                  {/* Sign Out */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      setProfileDropdownOpen(false);
                      await signOut();
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-red-500/10 text-xs text-red-400 transition-colors mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 text-xs font-medium text-[#e5e1e4] hover:text-[#ddb7ff] transition-colors"
            >
              Login
            </button>
            <button
              onClick={onOpenAuth}
              className="px-4 py-1.5 bg-[#ddb7ff] text-[#490080] text-xs font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_2px_12px_rgba(221,183,255,0.3)]"
            >
              Join
            </button>
          </div>
        )}
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileNavOpen && (
        <div className="fixed inset-x-0 top-16 bg-[#1b1b1d]/95 backdrop-blur-2xl border-b border-white/10 p-4 flex flex-col gap-3 lg:hidden z-50">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                onSelectTab('feed');
                setMobileNavOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${
                currentTab === 'feed' ? 'bg-[#ddb7ff]/10 text-[#ddb7ff]' : 'text-[#cfc2d6]'
              }`}
            >
              🎨 Feed & Galerie d'œuvres
            </button>
            <button
              onClick={() => {
                onSelectTab('recruitment');
                setMobileNavOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${
                currentTab === 'recruitment' ? 'bg-[#ddb7ff]/10 text-[#ddb7ff]' : 'text-[#cfc2d6]'
              }`}
            >
              🤝 Recherche Collaborateurs
            </button>
            <button
              onClick={() => {
                onSelectTab('forum');
                setMobileNavOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${
                currentTab === 'forum' ? 'bg-[#ddb7ff]/10 text-[#ddb7ff]' : 'text-[#cfc2d6]'
              }`}
            >
              💬 Forum Discussions & Critiques
            </button>
          </div>

          <div className="pt-2 border-t border-white/10 flex gap-2">
            <button
              onClick={() => {
                onOpenPostWork();
                setMobileNavOpen(false);
              }}
              className="flex-1 py-2 bg-[#ddb7ff]/15 text-[#ddb7ff] rounded-xl text-xs font-mono text-center font-semibold"
            >
              + Publier Œuvre
            </button>
            <button
              onClick={() => {
                onOpenPostAd();
                setMobileNavOpen(false);
              }}
              className="flex-1 py-2 bg-[#5de6ff]/15 text-[#5de6ff] rounded-xl text-xs font-mono text-center font-semibold"
            >
              + Déposer Annonce
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
