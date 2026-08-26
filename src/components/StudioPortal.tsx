import React, { useState } from 'react';
import { HuskyMascot, HuskyState } from './HuskyMascot';
import { signIn, signUp, switchDemoUser, getFirebaseStatus } from '../lib/firebase';
import { DEMO_USERS } from '../lib/initialData';
import { UserProfile } from '../types';
import confetti from 'canvas-confetti';
import { X, Eye, EyeOff, ArrowRight, Loader2, Sparkles, Check, Database } from 'lucide-react';

interface StudioPortalProps {
  onSuccess?: (user: UserProfile) => void;
  onClose?: () => void;
  isModal?: boolean;
  onOpenFirebaseConfig?: () => void;
}

export const StudioPortal: React.FC<StudioPortalProps> = ({
  onSuccess,
  onClose,
  isModal = false,
  onOpenFirebaseConfig,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('creator@artishub.io');
  const [password, setPassword] = useState('pass1234');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('Créatif / Développeur');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [huskyState, setHuskyState] = useState<HuskyState>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fbStatus = getFirebaseStatus();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setHuskyState('typing');
    setError(null);
  };

  const handleEmailBlur = () => {
    setHuskyState('idle');
  };

  const handlePasswordFocus = () => {
    if (showPassword) {
      setHuskyState('peeking');
    } else {
      setHuskyState('eyes-covered');
    }
  };

  const handlePasswordBlur = () => {
    setHuskyState('idle');
  };

  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    const nextState = !showPassword;
    setShowPassword(nextState);
    if (nextState) {
      setHuskyState('peeking');
    } else {
      setHuskyState('eyes-covered');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez renseigner votre email et mot de passe.');
      return;
    }

    setLoading(true);
    setError(null);
    setHuskyState('processing');

    try {
      let user: UserProfile;
      if (mode === 'signin') {
        user = await signIn(email, password);
      } else {
        user = await signUp(email, password, displayName || email.split('@')[0], role);
      }

      setHuskyState('success');
      setSuccessMsg(`Session initialisée ! Bienvenue ${user.displayName}.`);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ddb7ff', '#5de6ff', '#ffafd3'],
      });

      setTimeout(() => {
        setLoading(false);
        if (onSuccess) onSuccess(user);
        if (onClose) onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Échec de l\'authentification. Vérifiez vos identifiants.');
      setHuskyState('idle');
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoUser: UserProfile) => {
    setEmail(demoUser.email);
    setPassword('demopass123');
    setHuskyState('success');
    switchDemoUser(demoUser);
    setSuccessMsg(`Connecté en tant que ${demoUser.displayName} (${demoUser.role})`);
    
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#ddb7ff', '#5de6ff'],
    });

    setTimeout(() => {
      if (onSuccess) onSuccess(demoUser);
      if (onClose) onClose();
    }, 800);
  };

  return (
    <div className={`w-full relative flex items-center justify-center ${isModal ? 'p-0' : 'p-4 sm:p-8 min-h-[90vh]'}`}>
      {/* Background Radial Atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#ddb7ff]/10 blur-[120px] rounded-full -z-10 pointer-events-none mix-blend-screen" />
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-[#5de6ff]/10 blur-[100px] rounded-full -z-10 pointer-events-none mix-blend-screen" />

      {/* Glassmorphism Auth Card */}
      <div className="w-full max-w-md bg-[#1b1b1d]/75 backdrop-blur-[24px] border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Inner Glass Reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/50 opacity-30 pointer-events-none rounded-[32px]" />

        {/* Close Button (if modal) */}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute right-5 top-5 z-20 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Husky Mascot SVG */}
        <HuskyMascot state={huskyState} lookX={email.length * 3} className="w-28 h-28 mx-auto mb-2" />

        {/* Header */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ddb7ff]/10 border border-[#ddb7ff]/20 text-[#ddb7ff] text-[11px] font-mono tracking-wider uppercase mb-2">
            <Sparkles className="w-3 h-3" />
            <span>ArtisHub Studio Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#e5e1e4] mb-1">
            {mode === 'signin' ? 'Studio Portal' : 'Rejoindre ArtisHub'}
          </h1>
          <p className="text-sm text-[#cfc2d6]/80">
            {mode === 'signin'
              ? 'Authenticate to access the gallery & collaborations'
              : 'Créez votre profil créateur et publiez vos projets'}
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-mono">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          {mode === 'signup' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] ml-1">
                  Nom / Pseudo
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="ex: Kuro Sensei"
                  required
                  className="w-full bg-[#39393b]/25 backdrop-blur-md rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/30 border border-white/10 focus:outline-none focus:border-[#5de6ff] focus:ring-1 focus:ring-[#5de6ff] transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] ml-1">
                  Discipline principale
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#201f21] backdrop-blur-md rounded-xl px-4 py-3 text-sm text-[#e5e1e4] border border-white/10 focus:outline-none focus:border-[#5de6ff]"
                >
                  <option value="Digital Illustrator">Digital Illustrator & BD</option>
                  <option value="Scénariste / Writer">Scénariste / Narrative Designer</option>
                  <option value="Coloriste / Lighting">Coloriste & Ambiance</option>
                  <option value="3D Modeler / Sculptor">Modélisateur 3D / Props</option>
                  <option value="Concept Artist">Concept Artist / Environnements</option>
                  <option value="Storyboarder">Storyboarder / Animateur</option>
                  <option value="Frontend Developer">Développeur Frontend</option>
                  <option value="Backend Developer">Développeur Backend</option>
                  <option value="Full-stack Developer">Développeur Full-stack</option>
                  <option value="Mobile Developer">Développeur Mobile</option>
                  <option value="Game Developer">Développeur Jeu Vidéo</option>
                  <option value="UI/UX Designer">Designer UI/UX</option>
                </select>
              </div>
            </>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] ml-1" htmlFor="email-input">
              EMAIL ADDRESS
            </label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              placeholder="creator@artishub.io"
              required
              className="w-full bg-[#39393b]/25 backdrop-blur-md rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/30 border border-white/10 focus:outline-none focus:border-[#5de6ff] focus:ring-1 focus:ring-[#5de6ff] transition-all shadow-inner"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6]" htmlFor="password-input">
                PASSWORD
              </label>
              <button
                type="button"
                onClick={() => alert('Astuce démo : Utilisez n\'importe quel mot de passe ou cliquez sur un profil ci-dessous !')}
                className="text-[11px] font-mono text-[#ddb7ff] hover:text-[#f0dbff] transition-colors"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={handlePasswordFocus}
                onBlur={handlePasswordBlur}
                placeholder="••••••••"
                required
                className="w-full bg-[#39393b]/25 backdrop-blur-md rounded-xl pl-4 pr-12 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/30 border border-white/10 focus:outline-none focus:border-[#5de6ff] focus:ring-1 focus:ring-[#5de6ff] transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg text-[#cfc2d6] hover:text-[#5de6ff] hover:bg-white/5 flex items-center justify-center transition-colors"
                title={showPassword ? 'Masquer mot de passe' : 'Afficher mot de passe'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Stay Connected */}
          <div className="flex items-center gap-2.5 ml-1 mt-1">
            <input
              id="stay-connected"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded bg-[#39393b]/40 border-white/20 text-[#ddb7ff] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#ddb7ff]"
            />
            <label htmlFor="stay-connected" className="text-xs text-[#cfc2d6] cursor-pointer select-none">
              Stay connected to Studio
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-3 w-full bg-[#ddb7ff] hover:bg-[#f0dbff] text-[#490080] font-mono text-xs uppercase tracking-[0.15em] font-bold py-4 rounded-xl shadow-[0_4px_24px_rgba(221,183,255,0.25)] hover:shadow-[0_8px_32px_rgba(221,183,255,0.45)] transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-75"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>{mode === 'signin' ? 'INITIALIZE SESSION' : 'CRÉER LE COMPTE'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="mt-5 text-center relative z-10">
          <p className="text-xs text-[#cfc2d6]/80">
            {mode === 'signin' ? 'No portfolio yet? ' : 'Already have credentials? '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
              }}
              className="text-[#5de6ff] hover:text-[#a2eeff] font-bold underline underline-offset-4 decoration-[#5de6ff]/50 transition-colors"
            >
              {mode === 'signin' ? 'Apply for Access (Sign up)' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Quick Demo Profile Switcher */}
        <div className="mt-6 pt-5 border-t border-white/10 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#cfc2d6]/60">
              Connexion Rapide Démo
            </span>
            {onOpenFirebaseConfig && (
              <button
                type="button"
                onClick={onOpenFirebaseConfig}
                className="text-[10px] font-mono text-[#ddb7ff] hover:underline flex items-center gap-1"
              >
                <Database className="w-3 h-3" />
                <span>{fbStatus.isLive ? 'Firebase Connecté' : 'Mode Local'}</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_USERS.map((u) => (
              <button
                key={u.uid}
                type="button"
                onClick={() => handleQuickDemoLogin(u)}
                className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-[#ddb7ff]/30 text-left transition-all group"
              >
                <img src={u.avatar} alt={u.displayName} className="w-7 h-7 rounded-full object-cover shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-[#e5e1e4] group-hover:text-[#ddb7ff] truncate">
                    {u.displayName}
                  </div>
                  <div className="text-[10px] text-[#cfc2d6]/60 truncate">{u.handle}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
