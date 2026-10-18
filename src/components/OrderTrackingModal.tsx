import React, { useState } from 'react';
import {
  X,
  Package,
  Truck,
  CheckCircle,
  Clock,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Send,
} from 'lucide-react';
import { Order, OrderStatus } from '../types/index.ts';
import { formatIndianRupees } from '../utils/pricing.ts';

interface OrderTrackingModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateOrder: (updatedOrder: Order) => void;
}

const ORDER_STATUS_STEPS: OrderStatus[] = [
  'Order Confirmed',
  'Supplier Order Pending',
  'Supplier Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  onClose,
  onUpdateOrder,
}) => {
  if (!order) return null;

  const [returnReason, setReturnReason] = useState('');
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const currentStepIndex = ORDER_STATUS_STEPS.indexOf(order.status);
  const isDelivered = order.status === 'Delivered';
  const isCancelled = order.status === 'Cancelled';
  const isRefunded = order.status === 'Refunded';

  const handleRequestReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnReason.trim()) return;

    setIsSubmitting(true);
    setStatusMsg('');

    try {
      const res = await fetch(`/api/orders/${order.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: returnReason }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdateOrder(data.order);
        setStatusMsg('Return request submitted to the merchant.');
        setShowReturnForm(false);
      } else {
        setStatusMsg(data.error || 'Failed to submit return request');
      }
    } catch {
      setStatusMsg('Network error submitting request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Cancelled',
          note: 'Cancelled by customer request prior to shipment',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdateOrder(data.order);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Track Shipment: {order.orderNumber}
              </h2>
              <span className="text-[11px] text-slate-500 font-mono">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close tracking view"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Badge banner */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
                Current Status
              </span>
              <h3 className="text-base font-extrabold text-blue-900 mt-0.5">
                {order.status}
              </h3>
              {order.shipping.carrier && (
                <p className="text-slate-600 mt-1">
                  Carrier: <strong>{order.shipping.carrier}</strong>
                  {order.shipping.trackingNumber && (
                    <span> · Tracking AWB: <strong className="font-mono">{order.shipping.trackingNumber}</strong></span>
                  )}
                </p>
              )}
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-slate-500">Estimated Delivery</span>
              <p className="font-bold text-slate-900 text-sm">
                {order.shipping.estimatedDeliveryDate || 'Within 2-3 business days'}
              </p>
            </div>
          </div>

          {/* Stepper Timeline */}
          {!isCancelled && !isRefunded && (
            <div className="p-4 border border-slate-200 rounded-xl bg-white">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                Delivery Progress
              </h4>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {ORDER_STATUS_STEPS.map((stepName, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = order.status === stepName;

                  return (
                    <div key={stepName} className="relative flex items-start gap-3 text-xs">
                      <div
                        className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                            : 'bg-white border-2 border-slate-300 text-transparent'
                        }`}
                      >
                        {isDone && <CheckCircle className="w-3.5 h-3.5" />}
                      </div>

                      <div className="flex-1">
                        <p
                          className={`font-semibold ${
                            isCurrent
                              ? 'text-blue-600 font-bold'
                              : isDone
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {stepName}
                        </p>
                        {isCurrent && (
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {stepName === 'Order Confirmed' && 'Your payment was confirmed and order queued.'}
                            {stepName === 'Supplier Order Pending' && 'Allocating inventory from verified supplier partner.'}
                            {stepName === 'Supplier Processing' && 'Order packed and prepared for courier dispatch.'}
                            {stepName === 'Shipped' && `In transit via ${order.shipping.carrier || 'Express courier'}.`}
                            {stepName === 'Out for Delivery' && 'Our delivery executive is out for delivery in your area.'}
                            {stepName === 'Delivered' && 'Shipment handed over to recipient.'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Event Log Timeline */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Shipment Activity Log
            </h4>
            <div className="space-y-3">
              {order.timeline.map((event, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-slate-800">{event.status}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(event.timestamp).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {event.note && <p className="text-slate-600 text-[11px] mt-0.5">{event.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Destination Address */}
          <div className="border border-slate-200 rounded-xl p-4 text-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Shipping Destination
            </h4>
            <p className="font-semibold text-slate-900">{order.shippingAddress.fullName}</p>
            <p className="text-slate-600 mt-0.5">
              {order.shippingAddress.streetAddress}, {order.shippingAddress.localityArea}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
            <p className="text-slate-500 mt-0.5">Contact: {order.shippingAddress.phoneNumber}</p>
          </div>

          {/* Customer Actions: Cancel or Return */}
          <div className="pt-2 border-t border-slate-200 flex flex-col gap-3">
            {statusMsg && (
              <p className="text-xs font-medium text-blue-600 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                {statusMsg}
              </p>
            )}

            {!isCancelled && !isRefunded && currentStepIndex < 3 && (
              <button
                onClick={handleCancelOrder}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors text-center"
              >
                Cancel Order
              </button>
            )}

            {isDelivered && !order.returnRequest && (
              <div>
                {!showReturnForm ? (
                  <button
                    onClick={() => setShowReturnForm(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-blue-600" />
                    <span>Request Return / Replacement</span>
                  </button>
                ) : (
                  <form onSubmit={handleRequestReturn} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Reason for Return / Refund
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder="Please specify issue (e.g. Size mismatch, defective unit, etc.)"
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowReturnForm(false)}
                        className="px-3 py-1.5 text-xs text-slate-600"
                      >
                        Dismiss
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Submit Return Request
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {order.returnRequest && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <span className="font-bold">Return Request ({order.returnRequest.status.toUpperCase()}):</span>
                <p className="mt-0.5">{order.returnRequest.reason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
