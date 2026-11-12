import React, { useEffect, useState } from 'react';
import { Order } from '../types/store';
import { fetchOrders } from '../services/api';
import { X, Package, Clock, CheckCircle2, Truck, RefreshCw } from 'lucide-react';

interface OrderHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderHistoryDrawer: React.FC<OrderHistoryDrawerProps> = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders from MongoDB', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          className="w-screen max-w-lg bg-stone-50 border-l border-stone-200 shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-stone-800" />
              <h2 className="text-lg font-serif text-stone-900">Order Management & Tracking</h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={loadOrders}
                className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100"
                title="Refresh MongoDB orders"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subheader */}
          <div className="px-5 py-2.5 bg-stone-100/70 border-b border-stone-200 text-xs text-stone-600 flex items-center justify-between">
            <span>Query: <code className="font-mono text-[11px] bg-stone-200 px-1 py-0.5 rounded">db.orders.find().sort({"{"}createdAt: -1{"}"})</code></span>
            <span className="font-mono tabular-nums">{orders.length} Records</span>
          </div>

          {/* Orders List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {loading ? (
              <div className="py-12 text-center text-xs text-stone-500">
                Retrieving live orders from MongoDB...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Clock className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-sm font-serif text-stone-800">No orders recorded yet</p>
                <p className="text-xs text-stone-500">Orders placed on the storefront will appear here instantly.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-lg border border-stone-200 p-4 shadow-xs space-y-3"
                >
                  {/* Top order bar */}
                  <div className="flex items-start justify-between border-b border-stone-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-stone-900">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[11px] font-mono text-stone-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5">{order.customer.name} · {order.customer.city}</p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      {order.status === 'Delivered' ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                          Delivered
                        </span>
                      ) : order.status === 'Shipped' ? (
                        <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px] flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          <span>In Transit</span>
                        </span>
                      ) : (
                        <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                          Preparing Shipment
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tracking info strip */}
                  <div className="bg-stone-50 p-2.5 rounded border border-stone-200/70 text-[11px] space-y-1 text-stone-600">
                    <div className="flex justify-between">
                      <span>Carrier & Route:</span>
                      <span className="font-medium text-stone-800">{order.carrier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tracking Code:</span>
                      <span className="font-mono text-stone-900 font-semibold">{order.trackingNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Delivery:</span>
                      <span className="font-medium text-stone-800">{order.estimatedDelivery}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 pt-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-stone-700">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-stone-400 text-[11px]">{item.quantity}×</span>
                          <span className="font-medium text-stone-900 line-clamp-1">{item.name}</span>
                        </div>
                        <span className="font-mono tabular-nums text-stone-800">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-900">
                    <span className="text-stone-500 font-normal">Method: {order.paymentMethod}</span>
                    <span className="font-mono tabular-nums text-sm">Total: ${order.total.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
