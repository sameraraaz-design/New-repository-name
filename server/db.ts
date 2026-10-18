import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  Category,
  Product,
  Supplier,
  Order,
  User,
  OrderStatus,
  CartItem,
  AdminMetrics,
} from '../src/types/index.ts';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  INITIAL_ORDERS,
  INITIAL_USERS,
} from './seedData.ts';
import { calculateEstimatedProfit, calculateOrderPricing, CouponRule } from '../src/utils/pricing.ts';

export interface DatabaseState {
  categories: Category[];
  products: Product[];
  suppliers: Supplier[];
  orders: Order[];
  users: User[];
  coupons: CouponRule[];
  carts: Record<string, CartItem[]>; // keyed by userId or guestSessionId
  settings: {
    freeShippingThreshold: number;
    standardShippingFee: number;
    paymentProcessingFeePercent: number;
    defaultMarkupPercent: number;
    codAvailable: boolean;
    codFee: number;
  };
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'skirz_db.json');

const INITIAL_COUPONS: CouponRule[] = [
  { code: 'WELCOME10', discountPercent: 10, maxDiscount: 500, minSpend: 499, isActive: true },
  { code: 'SKIRZ500', discountPercent: 15, maxDiscount: 500, minSpend: 2499, isActive: true },
  { code: 'SUPERDEAL', discountPercent: 20, maxDiscount: 800, minSpend: 3999, isActive: true },
];

export class Database {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadInitial();
  }

  private loadInitial(): DatabaseState {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fall through to initial seed
    }

    const defaultState: DatabaseState = {
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      suppliers: INITIAL_SUPPLIERS,
      orders: INITIAL_ORDERS,
      users: INITIAL_USERS,
      coupons: INITIAL_COUPONS,
      carts: {},
      settings: {
        freeShippingThreshold: 999,
        standardShippingFee: 49,
        paymentProcessingFeePercent: 2.0,
        defaultMarkupPercent: 35.0,
        codAvailable: true,
        codFee: 30,
      },
    };

    this.saveStateSync(defaultState);
    return defaultState;
  }

  private saveStateSync(stateToSave: DatabaseState = this.state) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(stateToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database state:', err);
    }
  }

  // =================== CATEGORIES ===================
  public getCategories(): Category[] {
    return [...this.state.categories].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getCategoryBySlug(slug: string): Category | undefined {
    return this.state.categories.find((c) => c.slug === slug);
  }

  public createCategory(category: Omit<Category, 'id'>): Category {
    const id = `cat-${Date.now()}`;
    const newCategory: Category = { ...category, id };
    this.state.categories.push(newCategory);
    this.saveStateSync();
    return newCategory;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const index = this.state.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.state.categories[index] = { ...this.state.categories[index], ...updates };
    this.saveStateSync();
    return this.state.categories[index];
  }

  public deleteCategory(id: string): boolean {
    const prev = this.state.categories.length;
    this.state.categories = this.state.categories.filter((c) => c.id !== id);
    if (this.state.categories.length !== prev) {
      this.saveStateSync();
      return true;
    }
    return false;
  }

  // =================== PRODUCTS ===================
  public getProducts(params?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popular';
    inStockOnly?: boolean;
    featured?: boolean;
    bestSeller?: boolean;
    newArrival?: boolean;
    limit?: number;
    offset?: number;
  }): { items: Product[]; total: number } {
    let result = [...this.state.products];

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.supplierSku && p.supplierSku.toLowerCase().includes(q))
      );
    }

    if (params?.category && params.category !== 'all') {
      const catSlug = params.category.toLowerCase();
      result = result.filter(
        (p) =>
          p.category.toLowerCase() === catSlug ||
          p.category.toLowerCase().replace(/\s+/g, '-') === catSlug
      );
    }

    if (params?.brand) {
      result = result.filter((p) => p.brand.toLowerCase() === params.brand!.toLowerCase());
    }

    if (params?.minPrice !== undefined) {
      result = result.filter((p) => p.price >= params.minPrice!);
    }

    if (params?.maxPrice !== undefined) {
      result = result.filter((p) => p.price <= params.maxPrice!);
    }

    if (params?.inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    if (params?.featured) {
      result = result.filter((p) => p.isFeatured);
    }

    if (params?.bestSeller) {
      result = result.filter((p) => p.isBestSeller);
    }

    if (params?.newArrival) {
      result = result.filter((p) => p.isNewArrival);
    }

    // Sort
    switch (params?.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
      default:
        result.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
    }

    const total = result.length;
    const offset = params?.offset ?? 0;
    const limit = params?.limit ?? 50;
    const items = result.slice(offset, offset + limit);

    return { items, total };
  }

  public getProductById(id: string): Product | undefined {
    return this.state.products.find((p) => p.id === id || p.slug === id);
  }

  public createProduct(data: Omit<Product, 'id' | 'createdAt'>): Product {
    const id = `prod-${Date.now()}`;
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const profitData = calculateEstimatedProfit({
      sellingPrice: data.price,
      supplierCost: data.supplierCost,
      shippingCostPaidByStore: data.shippingCostPaidByStore || 40,
    });

    const newProduct: Product = {
      ...data,
      id,
      slug: data.slug || `${slug}-${id.slice(-4)}`,
      discountPercent: data.originalPrice > data.price
        ? Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100)
        : 0,
      estimatedProfit: profitData.estimatedProfit,
      profitMarginPercent: profitData.profitMarginPercent,
      createdAt: new Date().toISOString(),
    };

    this.state.products.unshift(newProduct);
    this.saveStateSync();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.state.products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const current = this.state.products[index];
    const merged = { ...current, ...updates };

    if (updates.price !== undefined || updates.supplierCost !== undefined || updates.shippingCostPaidByStore !== undefined) {
      const profitData = calculateEstimatedProfit({
        sellingPrice: merged.price,
        supplierCost: merged.supplierCost,
        shippingCostPaidByStore: merged.shippingCostPaidByStore,
      });
      merged.estimatedProfit = profitData.estimatedProfit;
      merged.profitMarginPercent = profitData.profitMarginPercent;
    }

    if (updates.price !== undefined || updates.originalPrice !== undefined) {
      merged.discountPercent = merged.originalPrice > merged.price
        ? Math.round(((merged.originalPrice - merged.price) / merged.originalPrice) * 100)
        : 0;
    }

    this.state.products[index] = merged;
    this.saveStateSync();
    return merged;
  }

  public deleteProduct(id: string): boolean {
    const prev = this.state.products.length;
    this.state.products = this.state.products.filter((p) => p.id !== id);
    if (this.state.products.length !== prev) {
      this.saveStateSync();
      return true;
    }
    return false;
  }

  // =================== SUPPLIERS ===================
  public getSuppliers(): Supplier[] {
    return this.state.suppliers;
  }

  public createSupplier(supplier: Omit<Supplier, 'id'>): Supplier {
    const newSupplier: Supplier = {
      ...supplier,
      id: `sup-${Date.now()}`,
    };
    this.state.suppliers.push(newSupplier);
    this.saveStateSync();
    return newSupplier;
  }

  public updateSupplier(id: string, updates: Partial<Supplier>): Supplier | null {
    const index = this.state.suppliers.findIndex((s) => s.id === id);
    if (index === -1) return null;
    this.state.suppliers[index] = { ...this.state.suppliers[index], ...updates };
    this.saveStateSync();
    return this.state.suppliers[index];
  }

  // =================== CART ===================
  public getCart(sessionOrUserId: string): CartItem[] {
    return this.state.carts[sessionOrUserId] || [];
  }

  public saveCart(sessionOrUserId: string, items: CartItem[]): CartItem[] {
    this.state.carts[sessionOrUserId] = items;
    this.saveStateSync();
    return items;
  }

  // =================== ORDERS ===================
  public getOrders(params?: { userId?: string; status?: string }): Order[] {
    let result = [...this.state.orders];
    if (params?.userId) {
      result = result.filter((o) => o.userId === params.userId || o.customerEmail === params.userId);
    }
    if (params?.status) {
      result = result.filter((o) => o.status === params.status);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(id: string): Order | undefined {
    return this.state.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  public createOrder(payload: {
    userId?: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: any;
    items: CartItem[];
    paymentMethod: 'upi' | 'card' | 'netbanking' | 'cod';
    couponCode?: string;
    idempotencyKey?: string;
  }): { order: Order; alreadyProcessed?: boolean } {
    // Idempotency check
    if (payload.idempotencyKey) {
      const existing = this.state.orders.find(
        (o) => o.payment.idempotencyKey === payload.idempotencyKey
      );
      if (existing) {
        return { order: existing, alreadyProcessed: true };
      }
    }

    const coupon = payload.couponCode
      ? this.state.coupons.find((c) => c.code.toUpperCase() === payload.couponCode!.toUpperCase())
      : null;

    const pricing = calculateOrderPricing(
      payload.items.map((i) => ({ price: i.price, quantity: i.quantity })),
      coupon,
      {
        freeShippingThreshold: this.state.settings.freeShippingThreshold,
        standardShippingFee: this.state.settings.standardShippingFee,
        isCod: payload.paymentMethod === 'cod',
        codCharge: this.state.settings.codFee,
      }
    );

    const orderId = `ord-${Date.now()}`;
    const orderNumber = `SKZ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let totalSupplierCost = 0;
    const orderItems = payload.items.map((cartItem) => {
      const product = this.state.products.find((p) => p.id === cartItem.productId);
      const supplierCost = product?.supplierCost || cartItem.supplierCost || Math.round(cartItem.price * 0.55);
      totalSupplierCost += supplierCost * cartItem.quantity;

      // Decrement inventory stock
      if (product) {
        product.stock = Math.max(0, product.stock - cartItem.quantity);
      }

      return {
        productId: cartItem.productId,
        name: cartItem.name,
        brand: cartItem.brand,
        image: cartItem.image,
        price: cartItem.price,
        quantity: cartItem.quantity,
        selectedColor: cartItem.selectedColor,
        selectedSize: cartItem.selectedSize,
        supplierCost,
        supplierSku: product?.supplierSku || `SKU-${cartItem.productId.slice(-4)}`,
        supplierId: product?.supplierId || 'sup-1',
      };
    });

    const isCod = payload.paymentMethod === 'cod';
    const initialStatus: OrderStatus = isCod ? 'Order Confirmed' : 'Order Confirmed';
    const nowIso = new Date().toISOString();

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      userId: payload.userId,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone,
      shippingAddress: payload.shippingAddress,
      items: orderItems,
      pricing: {
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        shippingFee: pricing.shippingFee,
        codFee: pricing.codFee,
        finalTotal: pricing.finalTotal,
        couponCode: coupon?.code,
      },
      payment: {
        method: payload.paymentMethod,
        status: isCod ? 'pending' : 'paid',
        gatewayTransactionId: isCod ? undefined : `txn_${crypto.randomBytes(6).toString('hex')}`,
        paymentTimestamp: isCod ? undefined : nowIso,
        idempotencyKey: payload.idempotencyKey,
      },
      supplierFulfillment: {
        status: 'pending',
        supplierCostTotal: totalSupplierCost,
        estimatedGrossProfit: pricing.finalTotal - totalSupplierCost - pricing.shippingFee,
      },
      shipping: {
        estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      status: initialStatus,
      timeline: [
        {
          status: 'Order Confirmed',
          timestamp: nowIso,
          note: isCod
            ? `Order confirmed with Cash on Delivery (₹${pricing.finalTotal})`
            : `Payment received & verified via ${payload.paymentMethod.toUpperCase()} (₹${pricing.finalTotal})`,
        },
        {
          status: 'Supplier Order Pending',
          timestamp: nowIso,
          note: `Fulfillment batch queued for ${orderItems.length} items. Total supplier cost: ₹${totalSupplierCost}`,
        },
      ],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    this.state.orders.unshift(newOrder);
    this.saveStateSync();
    return { order: newOrder };
  }

  public updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    shippingDetails?: { carrier?: string; trackingNumber?: string; trackingUrl?: string }
  ): Order | null {
    const order = this.state.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    if (shippingDetails?.carrier) order.shipping.carrier = shippingDetails.carrier;
    if (shippingDetails?.trackingNumber) order.shipping.trackingNumber = shippingDetails.trackingNumber;
    if (shippingDetails?.trackingUrl) order.shipping.trackingUrl = shippingDetails.trackingUrl;

    if (newStatus === 'Shipped') {
      order.supplierFulfillment.status = 'dispatched';
    } else if (newStatus === 'Supplier Processing') {
      order.supplierFulfillment.status = 'ordered';
      if (!order.supplierFulfillment.supplierOrderReference) {
        order.supplierFulfillment.supplierOrderReference = `PO-${Math.floor(10000 + Math.random() * 90000)}`;
      }
    }

    order.timeline.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Order status updated to ${newStatus}`,
      carrier: shippingDetails?.carrier,
      trackingNumber: shippingDetails?.trackingNumber,
    });

    this.saveStateSync();
    return order;
  }

  public updateSupplierOrder(
    orderId: string,
    details: { supplierOrderReference?: string; status?: 'pending' | 'ordered' | 'dispatched' | 'cancelled' }
  ): Order | null {
    const order = this.state.orders.find((o) => o.id === orderId);
    if (!order) return null;

    if (details.supplierOrderReference) {
      order.supplierFulfillment.supplierOrderReference = details.supplierOrderReference;
    }
    if (details.status) {
      order.supplierFulfillment.status = details.status;
      if (details.status === 'ordered' && order.status === 'Supplier Order Pending') {
        this.updateOrderStatus(orderId, 'Supplier Processing', `Supplier confirmed PO ${details.supplierOrderReference || ''}`);
      }
    }

    order.updatedAt = new Date().toISOString();
    this.saveStateSync();
    return order;
  }

  public requestOrderReturn(orderId: string, reason: string): Order | null {
    const order = this.state.orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.returnRequest = {
      requestedAt: new Date().toISOString(),
      reason,
      status: 'pending',
    };
    return this.updateOrderStatus(orderId, 'Return Requested', `Customer requested return: ${reason}`);
  }

  public processOrderRefund(orderId: string, approved: boolean, note?: string): Order | null {
    const order = this.state.orders.find((o) => o.id === orderId);
    if (!order) return null;

    if (approved) {
      if (order.returnRequest) {
        order.returnRequest.status = 'refund_issued';
      }
      order.payment.status = 'refunded';
      return this.updateOrderStatus(orderId, 'Refunded', note || `Full refund processed to original payment method.`);
    } else {
      if (order.returnRequest) {
        order.returnRequest.status = 'rejected';
        order.returnRequest.notes = note || 'Return request criteria not met';
      }
      this.saveStateSync();
      return order;
    }
  }

  // =================== METRICS ===================
  public getAdminMetrics(): AdminMetrics {
    const orders = this.state.orders;
    const totalOrders = orders.length;

    let grossRevenue = 0;
    let totalSupplierCost = 0;
    const statusCounts: Record<string, number> = {};
    let pendingSupplierOrders = 0;

    for (const ord of orders) {
      if (ord.status !== 'Cancelled' && ord.status !== 'Refunded') {
        grossRevenue += ord.pricing.finalTotal;
        totalSupplierCost += ord.supplierFulfillment.supplierCostTotal;
      }
      statusCounts[ord.status] = (statusCounts[ord.status] || 0) + 1;
      if (ord.supplierFulfillment.status === 'pending') {
        pendingSupplierOrders++;
      }
    }

    const estimatedNetProfit = Math.max(0, grossRevenue - totalSupplierCost);
    const profitMarginOverall = grossRevenue > 0
      ? Math.round((estimatedNetProfit / grossRevenue) * 1000) / 10
      : 0;
    const lowStockCount = this.state.products.filter((p) => p.stock < 10).length;
    const averageOrderValue = totalOrders > 0 ? Math.round(grossRevenue / totalOrders) : 0;

    return {
      totalOrders,
      grossRevenue,
      totalSupplierCost,
      estimatedNetProfit,
      profitMarginOverall,
      statusCounts,
      lowStockCount,
      pendingSupplierOrders,
      averageOrderValue,
    };
  }

  // =================== COUPONS ===================
  public getCoupons(): CouponRule[] {
    return this.state.coupons;
  }

  public validateCoupon(code: string, subtotal: number): { valid: boolean; coupon?: CouponRule; message?: string } {
    const coupon = this.state.coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
    );
    if (!coupon) {
      return { valid: false, message: 'Invalid or expired coupon code' };
    }
    if (coupon.minSpend && subtotal < coupon.minSpend) {
      return {
        valid: false,
        message: `Cart total must be at least ₹${coupon.minSpend} to apply ${coupon.code}`,
      };
    }
    return { valid: true, coupon };
  }

  public createCoupon(coupon: CouponRule): CouponRule {
    this.state.coupons.push(coupon);
    this.saveStateSync();
    return coupon;
  }

  public deleteCoupon(code: string): boolean {
    const prev = this.state.coupons.length;
    this.state.coupons = this.state.coupons.filter((c) => c.code !== code);
    if (this.state.coupons.length !== prev) {
      this.saveStateSync();
      return true;
    }
    return false;
  }

  // =================== USERS & AUTH ===================
  public getUser(idOrEmail: string): User | undefined {
    return this.state.users.find((u) => u.id === idOrEmail || u.email.toLowerCase() === idOrEmail.toLowerCase());
  }

  public createUser(user: Omit<User, 'id'>): User {
    const id = `user-${Date.now()}`;
    const newUser: User = { ...user, id };
    this.state.users.push(newUser);
    this.saveStateSync();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.state.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    this.state.users[index] = { ...this.state.users[index], ...updates };
    this.saveStateSync();
    return this.state.users[index];
  }

  // =================== SETTINGS ===================
  public getSettings() {
    return this.state.settings;
  }

  public updateSettings(settings: Partial<DatabaseState['settings']>) {
    this.state.settings = { ...this.state.settings, ...settings };
    this.saveStateSync();
    return this.state.settings;
  }
}

export const db = new Database();
