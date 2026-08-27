import React from 'react';
import { MessageCircle, Cloud } from 'lucide-react';

interface WhatsAppFloatProps {
  onClick: () => void;
  isOpen: boolean;
  onOpenWeather?: () => void;
}

export const WhatsAppFloat: React.FC<WhatsAppFloatProps> = ({ onClick, isOpen, onOpenWeather }) => {
  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
      {/* Météo : visible uniquement sur mobile, au-dessus de l'icône chat */}
      {onOpenWeather && (
        <button
          onClick={onOpenWeather}
          className="sm:hidden w-12 h-12 rounded-full bg-[#5de6ff] hover:bg-[#4dd4f0] flex items-center justify-center shadow-lg shadow-[#5de6ff]/30 transition-all duration-300 hover:scale-110 group"
          aria-label="Voir la météo"
          title="Météo"
        >
          <Cloud className="w-6 h-6 text-[#00363e] group-hover:scale-110 transition-transform" />
        </button>
      )}

      <button
        onClick={onClick}
        className="relative w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] flex items-center justify-center shadow-lg shadow-[#25D366]/30 transition-all duration-300 hover:scale-110 group"
        aria-label="Ouvrir le chat WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#131315] animate-pulse" />
      </button>
    </div>
  );
};
