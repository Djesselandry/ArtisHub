import React, { useState } from 'react';
import { getFirebaseStatus, saveCustomFirebaseConfig, resetLocalDatabase } from '../../lib/firebase';
import { X, Database, Check, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

interface FirebaseConfigModalProps {
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ onClose }) => {
  const status = getFirebaseStatus();
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleJsonPaste = (text: string) => {
    setJsonInput(text);
    try {
      const parsed = JSON.parse(text);
      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
      if (parsed.appId) setAppId(parsed.appId);
      setMessage('Configuration JSON analysée avec succès !');
    } catch {
      // not valid json yet
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !projectId) {
      setMessage('Veuillez au moins fournir apiKey et projectId.');
      return;
    }

    saveCustomFirebaseConfig({
      apiKey,
      authDomain: authDomain || `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: storageBucket || `${projectId}.appspot.com`,
      messagingSenderId,
      appId,
    });
  };

  const handleResetData = () => {
    if (window.confirm('Voulez-vous réinitialiser les données locales avec les créations initiales ?')) {
      resetLocalDatabase();
      setMessage('Base de données locale réinitialisée !');
      setTimeout(() => onClose(), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#1b1b1d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#cfc2d6] hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-[#5de6ff]/20 text-[#5de6ff] flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-[#e5e1e4]">Backend & Cloud Firestore</h2>
        </div>

        <p className="text-xs text-[#cfc2d6]/70 mb-4">
          ArtisHub s'exécute nativement avec le SDK Firebase JS v9+ (Auth & Firestore) et dispose d'une réplication locale temps réel.
        </p>

        {/* Current Status pill */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-xs font-bold text-[#e5e1e4]">
                {status.isLive ? 'Connecté à Google Firebase Live' : 'Mode Réactif Local & Offline'}
              </div>
              <div className="text-[10px] font-mono text-[#5de6ff]">
                Projet : {status.projectId}
              </div>
            </div>
          </div>
          <span className={`text-[10px] font-mono px-2 py-1 rounded-full ${
            status.isLive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
          }`}>
            {status.isLive ? '● ONLINE' : '● LOCAL DB'}
          </span>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-purple-950/50 border border-purple-500/40 text-purple-200 text-xs font-mono">
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-[#cfc2d6] mb-1">
              Coller la configuration Firebase (JSON)
            </label>
            <textarea
              rows={3}
              value={jsonInput}
              onChange={(e) => handleJsonPaste(e.target.value)}
              placeholder='{ "apiKey": "AIzaSy...", "projectId": "mon-tp-bdd", ... }'
              className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl p-3 text-xs font-mono text-[#e5e1e4] placeholder-[#cfc2d6]/30 focus:outline-none focus:border-[#5de6ff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#cfc2d6] mb-1">API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-[#e5e1e4]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#cfc2d6] mb-1">Project ID</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="artishub-tp"
                className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-[#e5e1e4]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-2">
            <button
              type="button"
              onClick={handleResetData}
              className="flex items-center gap-1.5 text-xs text-[#ffafd3] hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Réinitialiser données locales</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#5de6ff] hover:bg-[#a2eeff] text-[#00363e] font-mono text-xs font-bold uppercase transition-all"
            >
              Sauvegarder & Recharger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
