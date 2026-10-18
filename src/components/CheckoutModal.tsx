import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Building2,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Info,
} from 'lucide-react';
import { CartItem, DeliveryAddress, Order, PaymentMethod, User } from '../types/index.ts';
import { formatIndianRupees, calculateOrderPricing, CouponRule, lookupPincode } from '../utils/pricing.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currentUser: User | null;
  appliedCoupon: CouponRule | null;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currentUser,
  appliedCoupon,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2>(1); // 1: Delivery Address, 2: Payment & Review
  const [address, setAddress] = useState<DeliveryAddress>(() => {
    if (currentUser?.savedAddresses && currentUser.savedAddresses.length > 0) {
      return { ...currentUser.savedAddresses[0] };
    }
    return {
      fullName: currentUser?.name || 'Aarav Patel',
      phoneNumber: currentUser?.phone || '9876543210',
      streetAddress: 'Flat 402, Royal Residency, 12th Cross',
      localityArea: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      addressType: 'Home',
    };
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('aarav@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8891');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('928');
  const [netBank, setNetBank] = useState('HDFC Bank');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Calculate pricing based on payment method (e.g. COD charge if applicable)
  const pricing = calculateOrderPricing(
    items.map((i) => ({ price: i.price, quantity: i.quantity })),
    appliedCoupon,
    {
      freeShippingThreshold: 999,
      standardShippingFee: 49,
      isCod: paymentMethod === 'cod',
      codCharge: 30,
    }
  );

  const handlePincodeChange = (pin: string) => {
    const clean = pin.replace(/\D/g, '').slice(0, 6);
    setAddress((prev) => ({ ...prev, pincode: clean }));
    if (clean.length === 6) {
      const info = lookupPincode(clean);
      if (info.valid && info.city && info.state) {
        setAddress((prev) => ({
          ...prev,
          city: info.city || prev.city,
          state: info.state || prev.state,
        }));
      }
    }
  };

  const handleFillDemoCard = () => {
    setCardNumber('4111 •••• •••• 1111');
    setCardExpiry('12/28');
    setCardCvv('784');
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.fullName || !address.phoneNumber || !address.streetAddress || !address.pincode) {
      setErrorMessage('Please fill in all mandatory delivery address fields.');
      return;
    }
    if (address.pincode.length !== 6) {
      setErrorMessage('PIN code must be exactly 6 digits.');
      return;
    }
    setErrorMessage('');
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    // Unique idempotency key to prevent double submits
    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          customerEmail: currentUser?.email || 'customer@example.com',
          customerPhone: address.phoneNumber,
          shippingAddress: address,
          items,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          idempotencyKey,
          simulatePaymentFailure: simulateFailure,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process order. Please try again.');
      }

      onOrderSuccess(data.order);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment simulation failed. Please try an alternate method.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Secure Checkout</h2>
              <span className="text-[11px] text-slate-500 font-medium">
                256-Bit SSL Encrypted Payment
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close checkout"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicators */}
        <div className="grid grid-cols-2 text-center text-xs font-semibold border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setStep(1)}
            className={`py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${
              step === 1
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[11px]">
              1
            </span>
            <span>Delivery Address</span>
          </button>

          <button
            onClick={() => setStep(2)}
            disabled={step === 1 && (!address.fullName || !address.pincode)}
            className={`py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${
              step === 2
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 disabled:opacity-50'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px]">
              2
            </span>
            <span>Payment & Review</span>
          </button>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            /* STEP 1: DELIVERY ADDRESS */
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Enter Shipping Address</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Aarav Patel"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={address.phoneNumber}
                    onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Flat, House No., Building, Apartment *
                </label>
                <input
                  type="text"
                  required
                  value={address.streetAddress}
                  onChange={(e) => setAddress({ ...address, streetAddress: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Street / Building details"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Area / Locality *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.localityArea}
                    onChange={(e) => setAddress({ ...address, localityArea: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Locality"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    6-Digit PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={address.pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="560001"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Address Type
                  </label>
                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="addrType"
                        checked={address.addressType === 'Home'}
                        onChange={() => setAddress({ ...address, addressType: 'Home' })}
                        className="text-blue-600"
                      />
                      <span>Home (All day)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="addrType"
                        checked={address.addressType === 'Work'}
                        onChange={() => setAddress({ ...address, addressType: 'Work' })}
                        className="text-blue-600"
                      />
                      <span>Work (9 AM - 6 PM)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-all"
                >
                  <span>Continue to Payment</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: PAYMENT & ORDER REVIEW */
            <div className="space-y-6">
              {/* Delivery Destination Summary */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">Delivering to: {address.fullName}</span>
                  <p className="text-slate-600 mt-0.5">
                    {address.streetAddress}, {address.localityArea}, {address.city}, {address.state} - {address.pincode}
                  </p>
                  <p className="text-slate-500 mt-0.5">Phone: {address.phoneNumber}</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Edit
                </button>
              </div>

              {/* Payment Method Selector */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Select Payment Method</h3>

                <div className="space-y-2.5">
                  {/* UPI Option */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="mt-1 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                          <QrCode className="w-4 h-4 text-blue-600" />
                          <span>UPI / QR (Google Pay, PhonePe, Paytm, BHIM)</span>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-medium">Instant & Free</span>
                      </div>

                      {paymentMethod === 'upi' && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                          <label className="block text-[11px] font-semibold text-slate-600">
                            Enter UPI ID / VPA
                          </label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="yourname@okhdfcbank"
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-[10px] text-slate-500">
                            Simulation Mode: A real UPI intent request will be authorized instantly on the server.
                          </p>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Card Option */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="mt-1 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                          <span>Credit or Debit Card</span>
                        </div>
                        <span className="text-[11px] text-slate-500">Visa / Mastercard / RuPay</span>
                      </div>

                      {paymentMethod === 'card' && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-semibold text-slate-700">Card Details</span>
                            <button
                              type="button"
                              onClick={handleFillDemoCard}
                              className="text-[11px] text-blue-600 font-semibold hover:underline"
                            >
                              Fill Test Card
                            </button>
                          </div>

                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="Card Number"
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md font-mono"
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              className="px-3 py-1.5 text-xs border border-slate-300 rounded-md font-mono"
                            />
                            <input
                              type="password"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="CVV"
                              className="px-3 py-1.5 text-xs border border-slate-300 rounded-md font-mono"
                            />
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>PCI-DSS compliant simulated checkout sandbox</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Net Banking Option */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'netbanking'
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="netbanking"
                      checked={paymentMethod === 'netbanking'}
                      onChange={() => setPaymentMethod('netbanking')}
                      className="mt-1 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <span>Net Banking</span>
                        </div>
                      </div>

                      {paymentMethod === 'netbanking' && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                          <select
                            value={netBank}
                            onChange={(e) => setNetBank(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                          >
                            <option>HDFC Bank</option>
                            <option>State Bank of India (SBI)</option>
                            <option>ICICI Bank</option>
                            <option>Axis Bank</option>
                            <option>Kotak Mahindra Bank</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Cash on Delivery Option */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                          <Banknote className="w-4 h-4 text-blue-600" />
                          <span>Cash on Delivery (COD)</span>
                        </div>
                        <span className="text-[11px] text-slate-500">+₹30 handling</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Pay with cash or UPI at your doorstep upon physical delivery.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Developer Test Mode Options */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    Payment Gateway Sandbox Mode
                  </span>
                  <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simulateFailure}
                      onChange={(e) => setSimulateFailure(e.target.checked)}
                      className="rounded text-rose-600"
                    />
                    <span>Simulate payment decline</span>
                  </label>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 text-xs mb-2">Order Summary</h4>
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-mono tabular-nums">{formatIndianRupees(pricing.subtotal)}</span>
                </div>
                {pricing.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Discount</span>
                    <span className="font-mono tabular-nums">-{formatIndianRupees(pricing.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Charges</span>
                  <span className="font-mono tabular-nums">
                    {pricing.shippingFee === 0 ? (
                      <span className="text-emerald-700 font-semibold">FREE</span>
                    ) : (
                      formatIndianRupees(pricing.shippingFee)
                    )}
                  </span>
                </div>
                {pricing.codFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Cash on Delivery Handling Fee</span>
                    <span className="font-mono tabular-nums">{formatIndianRupees(pricing.codFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                  <span>Final Payable</span>
                  <span className="font-mono tabular-nums text-base text-blue-600">
                    {formatIndianRupees(pricing.finalTotal)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Back to Address
                </button>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-all disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying & Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Place Order ({formatIndianRupees(pricing.finalTotal)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
