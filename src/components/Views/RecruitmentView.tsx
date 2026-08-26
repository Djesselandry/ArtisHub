import React, { useState } from 'react';
import { CollaborationAd, RoleNeeded, UserProfile } from '../../types';
import { 
  Briefcase, 
  PlusCircle, 
  Send, 
  Clock, 
  User, 
  CheckCircle, 
  Filter, 
  Sparkles, 
  DollarSign, 
  Mail 
} from 'lucide-react';

interface RecruitmentViewProps {
  ads: CollaborationAd[];
  currentUser: UserProfile | null;
  onOpenPostAd: () => void;
  onApplyAd: (ad: CollaborationAd) => void;
  onRequireAuth: () => void;
  filterAuthor?: string | null;
}

export const RecruitmentView: React.FC<RecruitmentViewProps> = ({
  ads,
  currentUser,
  onOpenPostAd,
  onApplyAd,
  onRequireAuth,
  filterAuthor,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'HIRING' | 'AVAILABLE'>('ALL');

  const roles = [
    'All',
    'Writer / Scénariste',
    'Illustrator',
    'Colorist',
    '3D Modeler',
    'Storyboarder',
    'Sound Designer',
    'Frontend Developer',
    'Backend Developer',
    'Full-stack Developer',
    'Mobile Developer',
    'Game Developer',
    'UI/UX Designer',
  ];

  const filteredAds = ads.filter((ad) => {
    if (filterAuthor && !ad.authorHandle.toLowerCase().includes(filterAuthor.toLowerCase()) && !ad.author.toLowerCase().includes(filterAuthor.toLowerCase())) {
      return false;
    }
    if (selectedRole !== 'All' && ad.roleNeeded !== selectedRole) {
      return false;
    }
    if (selectedStatus !== 'ALL' && ad.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1b1b1d] via-[#201f21] to-[#1b1b1d] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#5de6ff]/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5de6ff]/15 text-[#5de6ff] text-xs font-mono mb-2 border border-[#5de6ff]/20">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Collab & Co-création</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#e5e1e4] mb-2">
            Recherche de Collaborateurs & Offres
          </h1>
          <p className="text-xs sm:text-sm text-[#cfc2d6]/80 max-w-xl">
            Trouvez les talents idéaux pour vos projets créatifs, jeux, sites et applications. Rémunéré ou RevShare.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={onOpenPostAd}
            className="px-6 py-3 rounded-2xl bg-[#5de6ff] hover:bg-[#a2eeff] text-[#00363e] font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#5de6ff]/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Déposer une Annonce</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Roles */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                selectedRole === role
                  ? 'bg-[#5de6ff] text-[#00363e] font-bold shadow-md shadow-[#5de6ff]/20'
                  : 'bg-white/5 text-[#cfc2d6] hover:bg-white/10'
              }`}
            >
              {role === 'All' ? 'Tous les rôles' : role}
            </button>
          ))}
        </div>

        {/* Status Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
              selectedStatus === 'ALL' ? 'bg-[#ddb7ff] text-[#490080] font-bold' : 'text-[#cfc2d6]'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setSelectedStatus('HIRING')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
              selectedStatus === 'HIRING' ? 'bg-[#ddb7ff] text-[#490080] font-bold' : 'text-[#cfc2d6]'
            }`}
          >
            Recrutement
          </button>
          <button
            onClick={() => setSelectedStatus('AVAILABLE')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
              selectedStatus === 'AVAILABLE' ? 'bg-[#5de6ff] text-[#00363e] font-bold' : 'text-[#cfc2d6]'
            }`}
          >
            Disponibles
          </button>
        </div>
      </div>

      {/* Active Filter Author Banner if clicked from profile/artwork */}
      {filterAuthor && (
        <div className="p-3 rounded-2xl bg-[#ddb7ff]/10 border border-[#ddb7ff]/30 text-xs flex items-center justify-between">
          <span className="text-[#ddb7ff]">
            Filtre actif : Annonces publiées par <strong>{filterAuthor}</strong>
          </span>
          <button
            onClick={() => window.location.reload()}
            className="text-white hover:underline font-mono text-[11px]"
          >
            Effacer
          </button>
        </div>
      )}

      {/* Ads Cards Grid */}
      {filteredAds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAds.map((ad) => (
            <div
              key={ad.id}
              className="bg-[#1b1b1d]/85 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-[#5de6ff]/40 transition-all duration-300 group"
            >
              <div>
                {/* Author & Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={ad.authorAvatar}
                      alt={ad.author}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <div className="text-sm font-bold text-[#e5e1e4] flex items-center gap-1.5">
                        <span>{ad.author}</span>
                        <span className="text-xs font-mono text-[#5de6ff]">{ad.authorHandle}</span>
                      </div>
                      <div className="text-[11px] font-mono text-[#cfc2d6]/60 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{ad.postedAgo}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                      ad.status === 'HIRING'
                        ? 'bg-[#ddb7ff]/20 text-[#ddb7ff] border-[#ddb7ff]/40'
                        : 'bg-[#5de6ff]/20 text-[#5de6ff] border-[#5de6ff]/40'
                    }`}
                  >
                    {ad.status === 'HIRING' ? '● HIRING' : '⚡ AVAILABLE'}
                  </span>
                </div>

                {/* Role and Project Type Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#5de6ff]/15 text-[#5de6ff] text-xs font-mono font-medium">
                    Role: {ad.roleNeeded}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-white/80 text-xs font-mono">
                    {ad.projectType}
                  </span>
                  {ad.compensation && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs font-mono flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span>{ad.compensation}</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-[#e5e1e4] group-hover:text-[#5de6ff] transition-colors mb-2">
                  {ad.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#cfc2d6]/90 leading-relaxed mb-4 whitespace-pre-line line-clamp-4">
                  {ad.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {ad.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-md bg-white/[0.04] text-[10px] font-mono text-[#cfc2d6]/70 border border-white/5"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button & Applications count */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs text-[#cfc2d6]/60 font-mono flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#ddb7ff]" />
                  <span>{ad.applications?.length || 0} candidature(s)</span>
                </div>

                <button
                  onClick={() => onApplyAd(ad)}
                  className={`px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                    ad.status === 'HIRING'
                      ? 'bg-[#ddb7ff] hover:bg-[#f0dbff] text-[#490080] shadow-md shadow-[#ddb7ff]/20'
                      : 'bg-[#5de6ff] hover:bg-[#a2eeff] text-[#00363e] shadow-md shadow-[#5de6ff]/20'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{ad.status === 'HIRING' ? 'Postuler (Apply)' : 'Contacter'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl bg-white/[0.02] border border-white/5">
          <Briefcase className="w-10 h-10 mx-auto text-[#cfc2d6]/40 mb-3" />
          <h3 className="text-lg font-bold text-[#e5e1e4] mb-1">Aucune annonce trouvée</h3>
          <p className="text-xs text-[#cfc2d6]/60 mb-4">
            Ajustez vos filtres ou soyez le premier à publier une offre de collaboration !
          </p>
          <button
            onClick={onOpenPostAd}
            className="px-5 py-2.5 rounded-xl bg-[#5de6ff] text-[#00363e] font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Déposer une annonce</span>
          </button>
        </div>
      )}
    </div>
  );
};
