/**
 * Pure pricing, profit calculation, and coupon discount logic for SKIRZ E-Commerce
 */

export interface ProfitCalculationInput {
  sellingPrice: number;
  supplierCost: number;
  shippingCostPaidByStore?: number;
  paymentFeePercent?: number; // e.g. 2.0% for gateway fee
  fixedPaymentFee?: number;
  otherCosts?: number;
}

export interface EstimatedProfitResult {
  sellingPrice: number;
  supplierCost: number;
  shippingCost: number;
  paymentFee: number;
  otherCosts: number;
  totalCost: number;
  estimatedProfit: number;
  profitMarginPercent: number;
  isProfitable: boolean;
  lowMarginAlert: boolean; // if profit margin < 10%
}

export function calculateEstimatedProfit(input: ProfitCalculationInput): EstimatedProfitResult {
  const sellingPrice = Math.max(0, input.sellingPrice);
  const supplierCost = Math.max(0, input.supplierCost);
  const shippingCost = Math.max(0, input.shippingCostPaidByStore ?? 40);
  const paymentFeePercent = input.paymentFeePercent ?? 2.0;
  const fixedPaymentFee = input.fixedPaymentFee ?? 0;
  const paymentFee = Math.round(((sellingPrice * paymentFeePercent) / 100 + fixedPaymentFee) * 100) / 100;
  const otherCosts = Math.max(0, input.otherCosts ?? 15);

  const totalCost = Math.round((supplierCost + shippingCost + paymentFee + otherCosts) * 100) / 100;
  const estimatedProfit = Math.round((sellingPrice - totalCost) * 100) / 100;
  const profitMarginPercent = sellingPrice > 0 
    ? Math.round((estimatedProfit / sellingPrice) * 1000) / 10 
    : 0;

  return {
    sellingPrice,
    supplierCost,
    shippingCost,
    paymentFee,
    otherCosts,
    totalCost,
    estimatedProfit,
    profitMarginPercent,
    isProfitable: estimatedProfit > 0,
    lowMarginAlert: profitMarginPercent < 10 && estimatedProfit > 0,
  };
}

export interface CartItemPricing {
  price: number;
  quantity: number;
}

export interface CouponRule {
  code: string;
  discountPercent: number; // e.g. 10 for 10%
  maxDiscount?: number;
  minSpend?: number;
  isActive: boolean;
}

export interface OrderPricingSummary {
  subtotal: number;
  totalItems: number;
  discount: number;
  shippingFee: number;
  paymentProcessingFee: number;
  codFee: number;
  finalTotal: number;
  couponApplied?: string;
  freeShippingQualified: boolean;
  amountNeededForFreeShipping: number;
}

export function calculateOrderPricing(
  items: CartItemPricing[],
  coupon?: CouponRule | null,
  options?: {
    freeShippingThreshold?: number;
    standardShippingFee?: number;
    isCod?: boolean;
    codCharge?: number;
  }
): OrderPricingSummary {
  const threshold = options?.freeShippingThreshold ?? 999;
  const standardShipping = options?.standardShippingFee ?? 49;
  const isCod = options?.isCod ?? false;
  const codCharge = isCod ? (options?.codCharge ?? 30) : 0;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  let discount = 0;
  let couponApplied: string | undefined = undefined;

  if (coupon && coupon.isActive) {
    const minSpend = coupon.minSpend ?? 0;
    if (subtotal >= minSpend) {
      const rawDiscount = (subtotal * coupon.discountPercent) / 100;
      discount = coupon.maxDiscount ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;
      discount = Math.round(discount);
      couponApplied = coupon.code;
    }
  }

  const freeShippingQualified = subtotal >= threshold || items.length === 0;
  const shippingFee = items.length === 0 ? 0 : freeShippingQualified ? 0 : standardShipping;
  const amountNeededForFreeShipping = Math.max(0, threshold - subtotal);

  const finalTotal = Math.max(0, subtotal - discount + shippingFee + codCharge);

  return {
    subtotal: Math.round(subtotal),
    totalItems,
    discount,
    shippingFee,
    paymentProcessingFee: 0, // Absorbed by store for customer
    codFee: codCharge,
    finalTotal: Math.round(finalTotal),
    couponApplied,
    freeShippingQualified,
    amountNeededForFreeShipping,
  };
}

export function formatIndianRupees(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateDiscountPercent(originalPrice: number, sellingPrice: number): number {
  if (!originalPrice || originalPrice <= sellingPrice) return 0;
  return Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
}

export interface PincodeDeliveryInfo {
  valid: boolean;
  city?: string;
  state?: string;
  estimatedDays?: number;
  deliveryDate?: string;
  isCodAvailable?: boolean;
}

export function lookupPincode(pincode: string): PincodeDeliveryInfo {
  const cleanPin = pincode.trim();
  if (!/^\d{6}$/.test(cleanPin)) {
    return { valid: false };
  }

  const prefix2 = cleanPin.substring(0, 2);
  let city = 'Metro Express Hub';
  let state = 'India';
  let days = 3;

  if (prefix2.startsWith('11')) {
    city = 'New Delhi';
    state = 'Delhi NCR';
    days = 2;
  } else if (prefix2 === '12' || prefix2 === '13') {
    city = 'Gurugram / Faridabad';
    state = 'Haryana';
    days = 2;
  } else if (prefix2 >= '20' && prefix2 <= '28') {
    city = 'Noida / Lucknow';
    state = 'Uttar Pradesh';
    days = 3;
  } else if (prefix2 >= '30' && prefix2 <= '34') {
    city = 'Jaipur / Jodhpur';
    state = 'Rajasthan';
    days = 3;
  } else if (prefix2 >= '36' && prefix2 <= '39') {
    city = 'Ahmedabad / Surat';
    state = 'Gujarat';
    days = 3;
  } else if (prefix2 === '40') {
    city = 'Mumbai City';
    state = 'Maharashtra';
    days = 2;
  } else if (prefix2 === '41') {
    city = 'Pune';
    state = 'Maharashtra';
    days = 2;
  } else if (prefix2 === '50') {
    city = 'Hyderabad';
    state = 'Telangana';
    days = 2;
  } else if (prefix2 === '56' || prefix2 === '57') {
    city = 'Bengaluru';
    state = 'Karnataka';
    days = 2;
  } else if (prefix2 === '60') {
    city = 'Chennai';
    state = 'Tamil Nadu';
    days = 2;
  } else if (prefix2 === '68' || prefix2 === '69') {
    city = 'Kochi / Trivandrum';
    state = 'Kerala';
    days = 3;
  } else if (prefix2 === '70') {
    city = 'Kolkata';
    state = 'West Bengal';
    days = 3;
  } else {
    city = 'Regional Hub';
    state = 'India';
    days = 4;
  }

  const delivery = new Date();
  delivery.setDate(delivery.getDate() + days);
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  const deliveryDate = delivery.toLocaleDateString('en-IN', options);

  return {
    valid: true,
    city,
    state,
    estimatedDays: days,
    deliveryDate,
    isCodAvailable: true,
  };
}
