import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, CheckCircle, Phone, ExternalLink, Loader2, AlertCircle, Bot, FileText } from 'lucide-react';
import { sendWhatsAppMessage, openWhatsApp, saveConversationReport } from '../lib/api';

interface WhatsAppChatWidgetProps {
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'assistant';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

interface ConversationReport {
  phone: string;
  userName: string;
  userMessage: string;
  assistantResponses: string[];
  timestamp: Date;
}

const generateReport = (report: ConversationReport): string => {
  return [
    '=== RAPPORT DE CONVERSATION ARTISHUB ===',
    `Date: ${report.timestamp.toLocaleDateString('fr-FR')} ${report.timestamp.toLocaleTimeString('fr-FR')}`,
    `Téléphone: ${report.phone}`,
    `Nom: ${report.userName}`,
    `Message: ${report.userMessage}`,
    '',
    '--- Réponses assistant ---',
    ...report.assistantResponses.map((r, i) => `${i + 1}. ${r}`),
    '',
    '=== FIN DU RAPPORT ===',
  ].join('\n');
};

export const WhatsAppChatWidget: React.FC<WhatsAppChatWidgetProps> = ({ onClose }) => {
  const [step, setStep] = useState<'phone' | 'choose' | 'chat' | 'assistant'>('phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [assistantStep, setAssistantStep] = useState<'name' | 'question' | 'done'>('name');
  const [userName, setUserName] = useState('');
  const [userQuestion, setUserQuestion] = useState('');
  const [assistantResponses, setAssistantResponses] = useState<string[]>([]);
  const [report, setReport] = useState<ConversationReport | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'phone') phoneInputRef.current?.focus();
    else if (step === 'chat' || step === 'assistant') inputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handlePhoneSubmit = () => {
    const cleaned = phoneInput.replace(/[^\d]/g, '');
    if (!/^\d{8,15}$/.test(cleaned)) {
      setPhoneError('Numéro invalide. Format international sans +, ex: 243970807693');
      return;
    }
    setUserPhone(cleaned);
    setPhoneError('');
    setStep('choose');
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handlePhoneSubmit(); }
  };

  const addBotMessage = (text: string, sender: 'bot' | 'assistant' = 'bot') => {
    setMessages((prev) => [...prev, {
      id: `${sender}-${Date.now()}`,
      text,
      sender,
      timestamp: new Date(),
    }]);
  };

  const chooseApi = () => {
    setStep('chat');
    addBotMessage("Bienvenue ! Envoyez votre message, il sera transmis via WhatsApp API.");
  };

  const chooseLink = () => {
    const msg = `Bonjour, je vous contacte depuis ArtisHub. Mon numéro: ${userPhone}`;
    openWhatsApp(msg, '243970807693');
    addBotMessage("WhatsApp s'est ouvert dans un nouvel onglet. Envoyez votre message depuis là.");
    setStep('chat');
  };

  const startAssistant = () => {
    setStep('assistant');
    setAssistantStep('name');
    addBotMessage(
      "Bonjour ! Je suis l'assistant ArtisHub. 👋\n\n" +
      "La connexion WhatsApp est temporairement indisponible, mais je peux vous aider ici-même.\n\n" +
      "Pour commencer, quel est votre nom ?",
      'assistant'
    );
  };

  const handleAssistantReply = (text: string) => {
    if (assistantStep === 'name') {
      setUserName(text);
      addBotMessage(`Enchanté ${text} ! 😊\n\nQue puis-je faire pour vous ? Décrivez votre demande ou posez votre question.`, 'assistant');
      setAssistantStep('question');
    } else if (assistantStep === 'question') {
      setUserQuestion(text);
      const responses = [
        "Merci pour votre message. Voici ce que je peux vous dire :",
        "ArtisHub est une plateforme de mise en relation entre artistes et professionnels du secteur culturel.",
        "Vous pouvez explorer les annonces, publier vos propres annonces, et contacter directement les artistes via WhatsApp.",
        "Un membre de notre équipe prendra contact avec vous très bientôt.",
      ];
      setAssistantResponses(responses);

      addBotMessage(responses.join('\n\n'), 'assistant');

      setTimeout(() => {
        addBotMessage(
          "Souhaitez-vous autre chose ou puis-je finaliser votre demande ?",
          'assistant'
        );
      }, 1000);

      const reportData: ConversationReport = {
        phone: userPhone,
        userName: text,
        userMessage: text,
        assistantResponses: responses,
        timestamp: new Date(),
      };
      setReport(reportData);
      setAssistantStep('done');

      saveConversationReport({
        phone: userPhone,
        userName: text,
        message: text,
        assistantResponses: responses,
      });
    } else {
      addBotMessage("Merci ! Votre demande a bien été enregistrée. Un membre de l'équipe ArtisHub vous recontactera très bientôt. 🙏", 'assistant');
    }
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;

    if (step === 'assistant') {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        text,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');
      handleAssistantReply(text);
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    try {
      await sendWhatsAppMessage(text, userPhone);
      setMessages((prev) =>
        prev.map((msg) => msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg)
      );
      addBotMessage("Message envoyé ! Un membre de l'équipe ArtisHub vous recontactera bientôt.");
    } catch {
      setMessages((prev) =>
        prev.map((msg) => msg.id === userMessage.id ? { ...msg, status: 'error' } : msg)
      );
      setTimeout(() => {
        addBotMessage(
          "⚠️ La connexion WhatsApp API est temporairement indisponible.\n\n" +
          "Mais pas de souci ! Je suis ici pour vous aider. Discutons directement dans ce chat.\n\n" +
          "Comment vous appelez-vous ?",
          'assistant'
        );
        setStep('assistant');
        setAssistantStep('name');
      }, 1000);
    }
  };

  const handleDownloadReport = () => {
    if (!report) return;
    const text = generateReport(report);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-artishub-${report.userName.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-[#1b1b1d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ height: '500px' }}>
        {/* Header */}
        <div className="bg-[#075e54] px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            {step === 'assistant' ? <Bot className="w-5 h-5 text-white" /> : <MessageCircle className="w-5 h-5 text-white" />}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm">ArtisHub</h3>
            <p className="text-white/70 text-xs">
              {step === 'phone' && 'Connectez-vous'}
              {step === 'choose' && `Numéro: ${userPhone}`}
              {step === 'chat' && 'Chat avec ArtisHub'}
              {step === 'assistant' && 'Assistant ArtisHub'}
            </p>
          </div>
          {step === 'assistant' && report && (
            <button onClick={handleDownloadReport} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors" aria-label="Télécharger rapport" title="Télécharger le rapport">
              <FileText className="w-4 h-4 text-white" />
            </button>
          )}
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors" aria-label="Fermer">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* STEP 1: Phone Number Input */}
        {step === 'phone' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0b141a]">
            <div className="w-16 h-16 rounded-full bg-[#25D366]/20 flex items-center justify-center mb-4">
              <Phone className="w-8 h-8 text-[#25D366]" />
            </div>
            <h3 className="text-lg font-bold text-[#e5e1e4] text-center mb-1">Votre numéro WhatsApp</h3>
            <p className="text-xs text-[#cfc2d6]/60 text-center mb-6">
              Entrez votre numéro pour commencer.
            </p>
            <input
              ref={phoneInputRef}
              type="tel"
              value={phoneInput}
              onChange={(e) => { setPhoneInput(e.target.value); setPhoneError(''); }}
              onKeyDown={handlePhoneKeyDown}
              placeholder="ex: 243970807693"
              className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#25D366] text-center tracking-wider mb-2"
            />
            {phoneError && <p className="text-xs text-red-400 text-center mb-2">{phoneError}</p>}
            <p className="text-[10px] text-[#cfc2d6]/40 text-center mb-4">Format international sans +, ex: 243970807693</p>
            <button
              onClick={handlePhoneSubmit}
              disabled={!phoneInput.trim()}
              className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuer
            </button>
          </div>
        )}

        {/* STEP 2: Choose mode */}
        {step === 'choose' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0b141a]">
            <h3 className="text-lg font-bold text-[#e5e1e4] text-center mb-2">Comment contacter ?</h3>
            <p className="text-xs text-[#cfc2d6]/60 text-center mb-8">
              Choisissez comment envoyer votre message.
            </p>
            <button
              onClick={chooseApi}
              className="w-full py-3.5 rounded-xl bg-[#5de6ff] hover:bg-[#4dd4f0] text-[#00363e] text-sm font-bold transition-colors flex items-center justify-center gap-2 mb-3"
            >
              <Send className="w-4 h-4" />
              Discuter ici (API)
            </button>
            <button
              onClick={chooseLink}
              className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Ouvrir WhatsApp
            </button>
          </div>
        )}

        {/* STEP 3 & 4: Chat or Assistant */}
        {(step === 'chat' || step === 'assistant') && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a]">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#005c4b] text-white rounded-br-none'
                      : msg.sender === 'assistant'
                        ? 'bg-[#1a3a2a] text-[#e5e1e4] rounded-bl-none border border-[#25D366]/30'
                        : 'bg-[#2a2a2c] text-[#e5e1e4] rounded-bl-none'
                  }`}>
                    {msg.sender === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Bot className="w-3 h-3 text-[#25D366]" />
                        <span className="text-[10px] font-bold text-[#25D366] uppercase tracking-wider">Assistant</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-white/50">
                        {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.sender === 'user' && msg.status === 'sent' && <CheckCircle className="w-3 h-3 text-blue-400" />}
                      {msg.sender === 'user' && msg.status === 'sending' && <Loader2 className="w-3 h-3 text-white/50 animate-spin" />}
                      {msg.sender === 'user' && msg.status === 'error' && <AlertCircle className="w-3 h-3 text-red-400" />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-white/10 bg-[#1b1b1d] p-3">
              {step === 'assistant' && report && (
                <button
                  onClick={handleDownloadReport}
                  className="w-full mb-2 py-2 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#25D366]/30 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Télécharger le rapport de conversation
                </button>
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={step === 'assistant' ? 'Répondez ici...' : 'Tapez votre message...'}
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
