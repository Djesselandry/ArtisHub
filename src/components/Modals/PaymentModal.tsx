import React, { useState } from 'react';
import { X, CreditCard, Smartphone, CheckCircle, Loader2, ShieldCheck, Lock } from 'lucide-react';
import { CartItem, PaymentMethod } from '../../types';

interface PaymentModalProps {
  items: CartItem[];
  total: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ items, total, onClose, onSuccess }) => {
  const [method, setMethod] = useState<PaymentMethod>('mobile_money');
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simule un appel API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setLoading(false);
    setError('Le paiement n\'est pas encore disponible. Cette fonctionnalité sera bientôt activée.');
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="w-full max-w-md bg-[#1b1b1d] border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-[#25D366]/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-[#25D366]" />
          </div>
          <h2 className="text-xl font-bold text-[#e5e1e4] mb-2">Paiement réussi !</h2>
          <p className="text-sm text-[#cfc2d6]/70">Votre commande a été confirmée. Vous recevrez un lien de téléchargement par email.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#1b1b1d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#25D366]" />
            <h2 className="text-lg font-bold text-[#e5e1e4]">Paiement sécurisé</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center" aria-label="Fermer">
            <X className="w-4 h-4 text-[#cfc2d6]" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Order Summary */}
          <div className="bg-[#2a2a2c]/40 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#cfc2d6]/60">Récapitulatif</h3>
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3">
                <img src={item.product.imageUrl} alt={item.product.title} className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#e5e1e4] truncate">{item.product.title}</p>
                  <p className="text-xs text-[#cfc2d6]/50">par {item.product.author}</p>
                </div>
                <p className="text-sm font-bold text-[#e5e1e4]">{item.product.price} {item.product.currency}</p>
              </div>
            ))}
            <div className="border-t border-white/10 pt-3 flex justify-between">
              <span className="text-sm font-bold text-[#cfc2d6]">Total</span>
              <span className="text-lg font-bold text-[#25D366]">{total} USD</span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#cfc2d6]/60 mb-3">Mode de paiement</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('mobile_money')}
                className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  method === 'mobile_money'
                    ? 'bg-[#25D366] text-white'
                    : 'bg-[#2a2a2c]/60 border border-white/10 text-[#cfc2d6] hover:border-[#25D366]/50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Mobile Money
              </button>
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  method === 'card'
                    ? 'bg-[#25D366] text-white'
                    : 'bg-[#2a2a2c]/60 border border-white/10 text-[#cfc2d6] hover:border-[#25D366]/50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Carte bancaire
              </button>
            </div>
          </div>

          {/* Mobile Money Fields */}
          {method === 'mobile_money' && (
            <div>
              <label className="block text-xs font-bold text-[#cfc2d6]/60 mb-1.5">Numéro Mobile Money</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="ex: 243970807693"
                required
                className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#25D366]"
              />
              <p className="text-[10px] text-[#cfc2d6]/40 mt-1">Orange Money, M-Pesa, Airtel Money</p>
            </div>
          )}

          {/* Card Fields */}
          {method === 'card' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#cfc2d6]/60 mb-1.5">Numéro de carte</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  required
                  maxLength={19}
                  className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#25D366]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#cfc2d6]/60 mb-1.5">Expiration</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/AA"
                    required
                    maxLength={5}
                    className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#25D366]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#cfc2d6]/60 mb-1.5">CVC</label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                    required
                    maxLength={4}
                    className="w-full bg-[#2a2a2c]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e5e1e4] placeholder-[#cfc2d6]/40 focus:outline-none focus:border-[#25D366]"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-300 text-xs text-center">
              {error}
            </div>
          )}

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-[#cfc2d6]/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            Paiement sécurisé et chiffré
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Payer {total} USD
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
