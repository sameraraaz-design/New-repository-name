import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Check,
  AlertCircle,
} from 'lucide-react';
import { CartItem } from '../types/index.ts';
import { formatIndianRupees, calculateOrderPricing, CouponRule } from '../utils/pricing.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
  appliedCoupon: CouponRule | null;
  onApplyCoupon: (coupon: CouponRule | null) => void;
  availableCoupons: CouponRule[];
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  appliedCoupon,
  onApplyCoupon,
  availableCoupons,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isOpen) return null;

  const pricing = calculateOrderPricing(
    items.map((i) => ({ price: i.price, quantity: i.quantity })),
    appliedCoupon,
    {
      freeShippingThreshold: 999,
      standardShippingFee: 49,
    }
  );

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    const found = availableCoupons.find((c) => c.code.toUpperCase() === code && c.isActive);
    if (!found) {
      setCouponError('Invalid coupon code. Try WELCOME10 or SKIRZ500.');
      return;
    }

    if (found.minSpend && pricing.subtotal < found.minSpend) {
      setCouponError(`Min order value of ₹${found.minSpend} required for ${found.code}`);
      return;
    }

    onApplyCoupon(found);
    setCouponSuccess(`Coupon ${found.code} applied! Saved ₹${Math.round((pricing.subtotal * found.discountPercent) / 100)}`);
  };

  const handleRemoveCoupon = () => {
    onApplyCoupon(null);
    setCouponInput('');
    setCouponSuccess('');
    setCouponError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slideLeft">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Shopping Cart ({items.length} items)
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart drawer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs">
          {pricing.freeShippingQualified ? (
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <Check className="w-4 h-4 shrink-0" />
              <span>Congratulations! You qualify for Free Express Shipping!</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Free shipping threshold</span>
                <span>
                  Add <strong className="text-blue-600">{formatIndianRupees(pricing.amountNeededForFreeShipping)}</strong> more
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (pricing.subtotal / 999) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-6 divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
              <ShoppingBag className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-semibold text-slate-700">Your cart is empty</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Explore best-selling products across our 15 departments and enjoy great deals.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={`${item.productId}-${index}`} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">
                      {item.brand}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {item.name}
                    </h4>
                    {(item.selectedColor || item.selectedSize) && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2 font-mono">
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      {formatIndianRupees(item.price * item.quantity)}
                    </span>

                    {/* Quantity Controls */}
                    <div className="flex items-center border border-slate-300 rounded-md bg-white">
                      <button
                        onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                        className="p-1 hover:bg-slate-100 text-slate-600 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-semibold font-mono text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                        className="p-1 hover:bg-slate-100 text-slate-600 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(index)}
                      aria-label="Remove item"
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout & Coupon Section */}
        {items.length > 0 && (
          <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4">
            {/* Coupon Box */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied (-{appliedCoupon.discountPercent}%)</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Promo Code (e.g. WELCOME10)"
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {couponError}
                    </p>
                  )}
                  {couponSuccess && (
                    <p className="text-[11px] text-emerald-600 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {couponSuccess}
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-3">
              <div className="flex justify-between">
                <span>Subtotal ({pricing.totalItems} items)</span>
                <span className="font-mono tabular-nums">{formatIndianRupees(pricing.subtotal)}</span>
              </div>
              {pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount</span>
                  <span className="font-mono tabular-nums">-{formatIndianRupees(pricing.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Standard Express Shipping</span>
                <span className="font-mono tabular-nums">
                  {pricing.shippingFee === 0 ? (
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  ) : (
                    formatIndianRupees(pricing.shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                <span>Total Payable</span>
                <span className="font-mono tabular-nums text-base text-blue-600">
                  {formatIndianRupees(pricing.finalTotal)}
                </span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all text-xs sm:text-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
