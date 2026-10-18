import React from 'react';
import { CheckCircle, Package, ArrowRight, Truck, ExternalLink } from 'lucide-react';
import { Order } from '../types/index.ts';
import { formatIndianRupees } from '../utils/pricing.ts';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (order: Order) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onTrackOrder,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 text-center flex flex-col items-center">
        {/* Animated Check Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
          <CheckCircle className="w-9 h-9" />
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Order Placed Successfully!
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Thank you for shopping with SKIRZ. Your order has been registered in our system.
        </p>

        {/* Order Reference Badge */}
        <div className="mt-5 w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
            <span className="text-slate-500">Order Number</span>
            <span className="font-mono font-bold text-blue-600 text-sm">
              {order.orderNumber}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Estimated Delivery</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              {order.shipping.estimatedDeliveryDate || 'Within 2-3 business days'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Amount Paid</span>
            <span className="font-mono font-bold text-slate-900">
              {formatIndianRupees(order.pricing.finalTotal)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Payment Status</span>
            <span className="font-semibold text-emerald-700 capitalize">
              {order.payment.status === 'paid' ? 'Paid Online' : 'Cash on Delivery'}
            </span>
          </div>
        </div>

        {/* Ordered Items summary */}
        <div className="mt-4 w-full text-left">
          <h4 className="text-xs font-bold text-slate-700 mb-2">Package Items ({order.items.length})</h4>
          <div className="divide-y divide-slate-100 max-h-36 overflow-y-auto">
            {order.items.map((it, idx) => (
              <div key={idx} className="py-2 flex items-center gap-3 text-xs">
                <img
                  src={it.image}
                  alt={it.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 object-cover rounded-md border border-slate-200"
                />
                <div className="flex-1 truncate">
                  <p className="font-medium text-slate-800 truncate">{it.name}</p>
                  <p className="text-[11px] text-slate-500">Qty: {it.quantity}</p>
                </div>
                <span className="font-mono font-semibold text-slate-900">
                  {formatIndianRupees(it.price * it.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 w-full flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onTrackOrder(order);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-all"
          >
            <Package className="w-4 h-4" />
            <span>Track Order Status</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
