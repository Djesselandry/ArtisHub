import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { CartItem } from '../../types';

interface CartWidgetProps {
  items: CartItem[];
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onCheckout: () => void;
  onClose: () => void;
}

export const CartWidget: React.FC<CartWidgetProps> = ({ items, onRemove, onUpdateQuantity, onCheckout, onClose }) => {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#1b1b1d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#25D366]" />
            <h2 className="text-lg font-bold text-[#e5e1e4]">Mon panier</h2>
            <span className="text-xs text-[#cfc2d6]/50 bg-white/5 px-2 py-0.5 rounded-full">{items.length}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center" aria-label="Fermer">
            <X className="w-4 h-4 text-[#cfc2d6]" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-[#cfc2d6]/20" />
              <p className="text-sm text-[#cfc2d6]/50">Votre panier est vide</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-4 bg-[#2a2a2c]/30 rounded-2xl p-4">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.title}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-[#e5e1e4] truncate">{item.product.title}</h4>
                  <p className="text-xs text-[#cfc2d6]/50">par {item.product.author}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <Minus className="w-3 h-3 text-[#cfc2d6]" />
                      </button>
                      <span className="text-sm font-bold text-[#e5e1e4] w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <Plus className="w-3 h-3 text-[#cfc2d6]" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-[#25D366]">{item.product.price * item.quantity} {item.product.currency}</p>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(item.product.id)}
                  className="self-start w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-white/10 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-[#cfc2d6]">Total</span>
              <span className="text-xl font-bold text-[#25D366]">{total} USD</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold transition-colors"
            >
              Procéder au paiement
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
