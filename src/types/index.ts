export type OrderStatus =
  | 'Pending Payment'
  | 'Payment Confirmed'
  | 'Order Confirmed'
  | 'Supplier Order Pending'
  | 'Supplier Processing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancellation Requested'
  | 'Cancelled'
  | 'Return Requested'
  | 'Refund Processing'
  | 'Refunded';

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';

export interface ProductSpecification {
  group?: string;
  name: string;
  value: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  helpfulCount: number;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Space Black - 256GB" or "Navy Blue - Large"
  sku?: string;
  color?: string;
  size?: string;
  priceModifier?: number; // e.g. +500
  stock: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactEmail: string;
  website: string;
  rating: number;
  averageFulfillmentDays: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number; // Retail selling price in INR
  originalPrice: number; // MRP / Original price
  discountPercent: number;
  images: string[];
  description: string;
  highlights: string[];
  specifications: ProductSpecification[];
  stock: number;
  rating: number;
  reviewsCount: number;
  variants?: ProductVariant[];
  availableColors?: string[];
  availableSizes?: string[];
  warranty?: string;
  returnPolicy?: string;
  // Dropshipping & Internal Supplier fields (Admin Only)
  supplierId: string;
  supplierName?: string;
  supplierProductUrl?: string;
  supplierSku?: string;
  supplierCost: number; // In INR
  shippingCostPaidByStore: number;
  estimatedProfit: number;
  profitMarginPercent: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description?: string;
  itemCount?: number;
  displayOrder: number;
  isActive: boolean;
}

export interface DeliveryAddress {
  id?: string;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  localityArea: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  addressType: 'Home' | 'Work';
  isDefault?: boolean;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  selectedColor?: string;
  selectedSize?: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  stock: number;
  supplierCost?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  supplierCost: number;
  supplierSku?: string;
  supplierId: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  carrier?: string;
  trackingNumber?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: DeliveryAddress;
  items: OrderItem[];
  pricing: {
    subtotal: number;
    discount: number;
    shippingFee: number;
    codFee: number;
    finalTotal: number;
    couponCode?: string;
  };
  payment: {
    method: PaymentMethod;
    status: 'paid' | 'pending' | 'failed' | 'refunded';
    gatewayTransactionId?: string;
    paymentTimestamp?: string;
    idempotencyKey?: string;
  };
  supplierFulfillment: {
    status: 'pending' | 'ordered' | 'dispatched' | 'cancelled';
    supplierOrderReference?: string;
    supplierCostTotal: number;
    estimatedGrossProfit: number;
    assignedDate?: string;
  };
  shipping: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDeliveryDate?: string;
    actualDeliveryDate?: string;
  };
  status: OrderStatus;
  timeline: OrderTimelineEvent[];
  returnRequest?: {
    requestedAt: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'refund_issued';
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  savedAddresses: DeliveryAddress[];
  wishlist: string[]; // Product IDs
  notificationPreferences: {
    orderUpdatesEmail: boolean;
    orderUpdatesSms: boolean;
    promotionalOffers: boolean;
  };
}

export interface AdminMetrics {
  totalOrders: number;
  grossRevenue: number;
  totalSupplierCost: number;
  estimatedNetProfit: number;
  profitMarginOverall: number;
  statusCounts: Record<string, number>;
  lowStockCount: number;
  pendingSupplierOrders: number;
  averageOrderValue: number;
}
