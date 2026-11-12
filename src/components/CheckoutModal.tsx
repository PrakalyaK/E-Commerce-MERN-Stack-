import React, { useState } from 'react';
import { CartItem, CustomerInfo, Order } from '../types/store';
import { X, CreditCard, Banknote, ShieldCheck, CheckCircle2, ArrowRight, Package } from 'lucide-react';
import { createOrder } from '../services/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 150 ? 0 : 25;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shipping + tax;

  const [step, setStep] = useState<'details' | 'payment' | 'confirmed'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Form Fields
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: 'Julian Sterling',
    email: 'julian.sterling@atelier.co',
    phone: '+1 (555) 382-9014',
    address: '742 Evergreen Terrace, Suite 4B',
    city: 'Portland',
    state: 'OR',
    postalCode: '97201',
    country: 'United States',
  });

  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Cash on Delivery (COD)'>('Credit Card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('841');
  const [notes, setNotes] = useState('Ring bell 4B or leave with doorman.');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const order = await createOrder({
        customer,
        items: items.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
        paymentMethod,
        notes,
      });

      setConfirmedOrder(order);
      setStep('confirmed');
      onOrderSuccess(order);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order in MongoDB');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-2xl bg-stone-50 rounded-xl shadow-2xl border border-stone-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-100/50">
          <div>
            <h2 className="text-lg font-serif text-stone-900">
              {step === 'confirmed' ? 'Order Confirmed' : 'Checkout & Fulfillment'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {step === 'confirmed'
                ? 'Thank you for supporting artisanal craftsmanship.'
                : 'Direct connection to MongoDB order processing and inventory.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border-b border-red-200 text-xs text-red-800">
            {errorMsg}
          </div>
        )}

        {/* Step: Confirmed Screen */}
        {step === 'confirmed' && confirmedOrder ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-stone-500">
                Receipt #{confirmedOrder.orderNumber}
              </span>
              <h3 className="text-2xl font-serif text-stone-900 mt-1">
                Your Order is Confirmed
              </h3>
              <p className="text-xs text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
                We have recorded your order in MongoDB and allocated inventory. A dispatch notification will be issued upon courier handover.
              </p>
            </div>

            <div className="bg-stone-100/70 p-4 rounded-lg text-left text-xs space-y-2 border border-stone-200">
              <div className="flex justify-between">
                <span className="text-stone-500">Carrier:</span>
                <span className="font-medium text-stone-900">{confirmedOrder.carrier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Tracking Code:</span>
                <span className="font-mono text-stone-900 font-semibold">{confirmedOrder.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Estimated Delivery:</span>
                <span className="font-medium text-stone-900">{confirmedOrder.estimatedDelivery}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Payment Status:</span>
                <span className="font-medium text-stone-900">{confirmedOrder.paymentMethod} (Authorized)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-200 font-semibold text-stone-950 text-sm">
                <span>Total Paid:</span>
                <span className="font-mono tabular-nums">${confirmedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-stone-900 text-stone-50 font-medium rounded-lg hover:bg-stone-800 transition-colors text-sm"
            >
              Back to Storefront
            </button>
          </div>
        ) : (
          /* Step 1 & 2: Form */
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-5">
            {step === 'details' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-medium text-stone-700 pb-2 border-b border-stone-200">
                  <span>1. Delivery Destination & Contact</span>
                  <span className="text-stone-400">Step 1 of 2</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-600 mb-1">Full Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md focus:outline-none focus:border-stone-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">Email (for tracking notifications)</label>
                    <input
                      type="email"
                      required
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md focus:outline-none focus:border-stone-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-stone-600 mb-1">Street Address & Suite</label>
                    <input
                      type="text"
                      required
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md focus:outline-none focus:border-stone-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md focus:outline-none focus:border-stone-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">Postal / ZIP Code</label>
                    <input
                      type="text"
                      required
                      value={customer.postalCode}
                      onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md focus:outline-none focus:border-stone-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">Country</label>
                    <input
                      type="text"
                      required
                      value={customer.country}
                      onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md focus:outline-none focus:border-stone-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">Telephone Contact</label>
                    <input
                      type="text"
                      required
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md focus:outline-none focus:border-stone-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-stone-600 mb-1">Delivery Instructions (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Ring bell 4B or leave with doorman"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-md focus:outline-none focus:border-stone-500"
                  />
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep('payment')}
                    className="px-5 py-2.5 bg-stone-900 text-stone-50 text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Payment */
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-medium text-stone-700 pb-2 border-b border-stone-200">
                  <span>2. Payment Terms & Settlement</span>
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="text-stone-500 hover:text-stone-900 underline"
                  >
                    Edit Shipping Details
                  </button>
                </div>

                {/* Payment Selection Options */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Credit Card')}
                    className={`p-3 text-left rounded-lg border text-xs transition-colors ${
                      paymentMethod === 'Credit Card'
                        ? 'border-stone-900 bg-stone-100 font-medium'
                        : 'border-stone-200 bg-white hover:border-stone-400'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mb-1.5 text-stone-800" />
                    <div className="font-semibold text-stone-900">Card Payment</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">Visa, Mastercard, Amex</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash on Delivery (COD)')}
                    className={`p-3 text-left rounded-lg border text-xs transition-colors ${
                      paymentMethod === 'Cash on Delivery (COD)'
                        ? 'border-stone-900 bg-stone-100 font-medium'
                        : 'border-stone-200 bg-white hover:border-stone-400'
                    }`}
                  >
                    <Banknote className="w-4 h-4 mb-1.5 text-stone-800" />
                    <div className="font-semibold text-stone-900">Cash on Delivery</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">Pay upon safe courier handover</div>
                  </button>
                </div>

                {paymentMethod === 'Credit Card' ? (
                  <div className="p-4 bg-white rounded-lg border border-stone-200 space-y-3 text-xs">
                    <div>
                      <label className="block text-stone-600 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded font-mono text-xs focus:outline-none focus:border-stone-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-stone-600 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded font-mono text-xs focus:outline-none focus:border-stone-500"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-600 mb-1">Security CVV</label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded font-mono text-xs focus:outline-none focus:border-stone-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/80 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
                    <p className="font-medium">Cash on Delivery Policy</p>
                    <p className="text-amber-800 text-[11px] leading-relaxed">
                      Please have the exact sum of <span className="font-mono font-semibold">${total.toFixed(2)}</span> prepared at the time of delivery. Our courier will furnish an authorized receipt and inspect package seals before payment collection.
                    </p>
                  </div>
                )}

                {/* Summary Strip */}
                <div className="p-4 bg-stone-100 rounded-lg text-xs space-y-1.5 border border-stone-200">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Subtotal ({items.length} unique items)</span>
                    <span className="font-mono tabular-nums text-stone-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Insured Delivery</span>
                    <span className="font-mono tabular-nums text-stone-900">
                      {shipping === 0 ? 'Complimentary' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Applicable Tax (8%)</span>
                    <span className="font-mono tabular-nums text-stone-900">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-stone-950 text-sm pt-2 border-t border-stone-300">
                    <span>Total Amount Due</span>
                    <span className="font-mono tabular-nums">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>MongoDB Atomic Transaction</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Recording Order in MongoDB...' : `Place Order · $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
