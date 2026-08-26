import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppFloatProps {
  onClick: () => void;
  isOpen: boolean;
}

export const WhatsAppFloat: React.FC<WhatsAppFloatProps> = ({ onClick, isOpen }) => {
  if (isOpen) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] flex items-center justify-center shadow-lg shadow-[#25D366]/30 transition-all duration-300 hover:scale-110 group"
      aria-label="Ouvrir le chat WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#131315] animate-pulse" />
    </button>
  );
};
