import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, CheckCircle, Loader2, AlertCircle, Phone } from 'lucide-react';
import { sendWhatsAppMessage } from '../lib/api';

interface WhatsAppChatWidgetProps {
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

export const WhatsAppChatWidget: React.FC<WhatsAppChatWidgetProps> = ({ onClose }) => {
  const [step, setStep] = useState<'phone' | 'chat'>('phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'phone') {
      phoneInputRef.current?.focus();
    } else {
      inputRef.current?.focus();
    }
  }, [step]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handlePhoneSubmit = () => {
    const cleaned = phoneInput.replace(/[^\d]/g, '');
    if (!/^\d{8,15}$/.test(cleaned)) {
      setPhoneError('Numéro invalide. Utilisez le format international sans +, ex: 243970807693');
      return;
    }
    setUserPhone(cleaned);
    setPhoneError('');
    setStep('chat');
    setMessages([
      {
        id: 'welcome',
        text: "Bonjour ! Merci de nous avoir contactés. Envoyez votre message, il sera transmis directement sur votre WhatsApp.",
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePhoneSubmit();
    }
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    let apiFailed = false;
    try {
      await sendWhatsAppMessage(text, userPhone);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
    } catch {
      apiFailed = true;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
        )
      );
    }

    setTimeout(() => {
      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        text: apiFailed
          ? "Le message n'a pas pu être envoyé. Vérifiez votre numéro et réessayez."
          : `Message envoyé sur votre WhatsApp (${userPhone}). Un membre de l'équipe ArtisHub vous recontactera bientôt.`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-[#1b1b1d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ height: '500px' }}>
        {/* Header */}
        <div className="bg-[#075e54] px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm">ArtisHub</h3>
            <p className="text-white/70 text-xs">
              {step === 'phone' ? 'Connectez-vous' : `WhatsApp: ${userPhone}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* STEP 1: Phone Number Input */}
        {step === 'phone' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0b141a]">
            <div className="w-16 h-16 rounded-full bg-[#25D366]/20 flex items-center justify-center mb-4">
              <Phone className="w-8 h-8 text-[#25D366]" />
            </div>
            <h3 className="text-lg font-bold text-[#e5e1e4] text-center mb-1">
              Votre numéro WhatsApp
            </h3>
            <p className="text-xs text-[#cfc2d6]/60 text-center mb-6">
              Entrez votre numéro pour recevoir le message sur votre WhatsApp personnel.
            </p>
            <input
              ref={phoneInputRef}
              type="tel"
              value={phoneInput}
              onChange={(e) => {
                setPhoneInput(e.target.value);
                setPhoneError('');
              }}
              onKeyDown={handlePhoneKeyDown}
              placeholder="ex: 243970807693"
              className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#25D366] text-center tracking-wider mb-2"
            />
            {phoneError && (
              <p className="text-xs text-red-400 text-center mb-2">{phoneError}</p>
            )}
            <p className="text-[10px] text-[#cfc2d6]/40 text-center mb-4">
              Format international sans +, ex: 243970807693
            </p>
            <button
              onClick={handlePhoneSubmit}
              disabled={!phoneInput.trim()}
              className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuer
            </button>
          </div>
        )}

        {/* STEP 2: Chat */}
        {step === 'chat' && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                      msg.sender === 'user'
                        ? 'bg-[#005c4b] text-white rounded-br-none'
                        : 'bg-[#2a2a2c] text-[#e5e1e4] rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-white/50">
                        {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.sender === 'user' && msg.status === 'sent' && (
                        <CheckCircle className="w-3 h-3 text-blue-400" />
                      )}
                      {msg.sender === 'user' && msg.status === 'sending' && (
                        <Loader2 className="w-3 h-3 text-white/50 animate-spin" />
                      )}
                      {msg.sender === 'user' && msg.status === 'error' && (
                        <AlertCircle className="w-3 h-3 text-red-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#2a2a2c] px-4 py-3 rounded-xl rounded-bl-none">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 bg-[#1b1b1d] p-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tapez votre message..."
                  className="flex-1 bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#25D366]"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="w-10 h-10 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Envoyer"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
