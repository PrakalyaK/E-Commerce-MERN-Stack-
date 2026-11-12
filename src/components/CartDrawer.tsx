import React from 'react';
import { CartItem } from '../types/store';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onContinueShopping,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 150;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingAmount = subtotal === 0 ? 0 : isFreeShipping ? 0 : 25;
  const estimatedTax = Math.round(subtotal * 0.08 * 100) / 100;
  const grandTotal = subtotal + shippingAmount + estimatedTax;

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          className="w-screen max-w-md bg-stone-50 border-l border-stone-200 shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-stone-800" />
              <h2 className="text-lg font-serif text-stone-900">Shopping Bag</h2>
              <span className="text-xs font-mono text-stone-500">
                ({items.reduce((acc, i) => acc + i.quantity, 0)} items)
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-900 rounded-md hover:bg-stone-100 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="px-5 py-3 bg-stone-100/70 border-b border-stone-200 text-xs">
            {isFreeShipping ? (
              <span className="text-stone-800 font-medium">
                You have qualified for complimentary insured delivery.
              </span>
            ) : (
              <span className="text-stone-600">
                Add <span className="font-mono font-semibold text-stone-900">${freeShippingThreshold - subtotal}</span> more for complimentary shipping.
              </span>
            )}
            <div className="mt-2 w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-stone-900 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                <ShoppingBag className="w-12 h-12 text-stone-300" />
                <div>
                  <p className="text-base font-serif text-stone-800">Your shopping bag is empty</p>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs">
                    Explore our curated collection of architectural pieces and slow-crafted essentials.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onContinueShopping();
                  }}
                  className="px-4 py-2 text-xs font-medium text-stone-50 bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product._id}
                  className="flex gap-4 p-3 bg-white rounded-lg border border-stone-200/80 shadow-xs"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded bg-stone-100 shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-semibold text-stone-900 line-clamp-1">
                          {item.product.name}
                        </h3>
                        <button
                          onClick={() => onRemoveItem(item.product._id)}
                          className="text-stone-400 hover:text-stone-700 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">{item.product.categoryLabel}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-stone-300 rounded bg-stone-50">
                        <button
                          onClick={() => onUpdateQuantity(item.product._id, item.quantity - 1)}
                          className="p-1 text-stone-600 hover:text-stone-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono tabular-nums font-medium text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product._id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono tabular-nums text-xs font-semibold text-stone-900">
                        ${item.product.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-white space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-stone-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-mono tabular-nums text-stone-900">
                    {shippingAmount === 0 ? 'Complimentary' : `$${shippingAmount.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Taxes (8%)</span>
                  <span className="font-mono tabular-nums text-stone-900">${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-stone-950 pt-2 border-t border-stone-200">
                  <span>Total</span>
                  <span className="font-mono tabular-nums">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-stone-400 text-center">
                Secure 256-bit encrypted checkout with live MongoDB sync.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
