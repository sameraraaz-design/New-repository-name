import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEstimatedProfit,
  calculateOrderPricing,
  calculateDiscountPercent,
  lookupPincode,
} from './pricing.ts';

test('calculateEstimatedProfit computes accurate dropship margins', () => {
  // Test scenario from specification:
  // Supplier cost: ₹500, Selling price: ₹699, Shipping: ₹40, Payment fee (2% = 13.98), Other: ₹20
  // Profit: 699 - (500 + 40 + 13.98 + 20) = 125.02
  const result = calculateEstimatedProfit({
    sellingPrice: 699,
    supplierCost: 500,
    shippingCostPaidByStore: 40,
    paymentFeePercent: 2.0,
    otherCosts: 20,
  });

  assert.equal(result.isProfitable, true);
  assert.equal(result.sellingPrice, 699);
  assert.equal(result.supplierCost, 500);
  assert.equal(result.shippingCost, 40);
  assert.equal(result.totalCost, 573.98);
  assert.equal(result.estimatedProfit, 125.02);
  assert.equal(result.profitMarginPercent, 17.9);
  assert.equal(result.lowMarginAlert, false);
});

test('calculateEstimatedProfit detects low margin warning when below 10%', () => {
  const result = calculateEstimatedProfit({
    sellingPrice: 1000,
    supplierCost: 900,
    shippingCostPaidByStore: 40,
    paymentFeePercent: 2.0,
    otherCosts: 10,
  });

  assert.equal(result.isProfitable, true);
  assert.equal(result.profitMarginPercent, 3);
  assert.equal(result.lowMarginAlert, true);
});

test('calculateOrderPricing handles subtotal, coupons, and free shipping threshold', () => {
  const items = [
    { price: 499, quantity: 1 },
    { price: 200, quantity: 2 },
  ]; // subtotal = 899 (< 999 threshold)

  const uncouponed = calculateOrderPricing(items, null, {
    freeShippingThreshold: 999,
    standardShippingFee: 49,
    isCod: false,
  });

  assert.equal(uncouponed.subtotal, 899);
  assert.equal(uncouponed.shippingFee, 49);
  assert.equal(uncouponed.freeShippingQualified, false);
  assert.equal(uncouponed.amountNeededForFreeShipping, 100);
  assert.equal(uncouponed.finalTotal, 948);

  // Apply 10% coupon
  const coupon = {
    code: 'WELCOME10',
    discountPercent: 10,
    maxDiscount: 200,
    minSpend: 500,
    isActive: true,
  };

  const couponed = calculateOrderPricing(items, coupon, {
    freeShippingThreshold: 999,
    standardShippingFee: 49,
    isCod: true,
    codCharge: 30,
  });

  assert.equal(couponed.discount, 90); // 10% of 899 rounded
  assert.equal(couponed.codFee, 30);
  assert.equal(couponed.finalTotal, 899 - 90 + 49 + 30);
});

test('calculateDiscountPercent works correctly', () => {
  assert.equal(calculateDiscountPercent(1000, 750), 25);
  assert.equal(calculateDiscountPercent(500, 500), 0);
  assert.equal(calculateDiscountPercent(0, 100), 0);
});

test('lookupPincode validates 6 digit Indian pincodes', () => {
  const validResult = lookupPincode('560001');
  assert.equal(validResult.valid, true);
  assert.equal(validResult.city, 'Bengaluru');

  const invalidResult = lookupPincode('1234');
  assert.equal(invalidResult.valid, false);
});
