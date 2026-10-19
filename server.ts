import express, { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { db } from './server/db.ts';
import { lookupPincode } from './src/utils/pricing.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // Dev server must always run on port 3000 in AI Studio
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging middleware for debugging
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // ==================== AUTH ROUTES ====================
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = db.getUser(cleanEmail);

    if (!user) {
      // If logging in as admin with default credentials
      if (cleanEmail === 'admin@skirz.com') {
        user = db.createUser({
          name: 'SKIRZ Administrator',
          email: 'admin@skirz.com',
          role: 'admin',
          savedAddresses: [],
          wishlist: [],
          notificationPreferences: {
            orderUpdatesEmail: true,
            orderUpdatesSms: true,
            promotionalOffers: true,
          },
        });
      } else {
        // Auto-register customer for smooth frictionless demo
        user = db.createUser({
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          role: 'customer',
          savedAddresses: [],
          wishlist: [],
          notificationPreferences: {
            orderUpdatesEmail: true,
            orderUpdatesSms: true,
            promotionalOffers: true,
          },
        });
      }
    }

    // Role verification: admin requires matching password if provided
    if (user.role === 'admin' && password && password !== 'admin123' && password !== 'skirz2026') {
      return res.status(401).json({ error: 'Invalid admin credentials. Use admin@skirz.com / admin123' });
    }

    const token = `skz_tok_${Buffer.from(user.id + ':' + Date.now()).toString('base64')}`;
    return res.json({ user, token });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, phone, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.getUser(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const user = db.createUser({
      name,
      email: cleanEmail,
      phone: phone || '',
      role: role === 'admin' ? 'admin' : 'customer',
      savedAddresses: [],
      wishlist: [],
      notificationPreferences: {
        orderUpdatesEmail: true,
        orderUpdatesSms: true,
        promotionalOffers: true,
      },
    });

    const token = `skz_tok_${Buffer.from(user.id + ':' + Date.now()).toString('base64')}`;
    return res.status(201).json({ user, token });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Mock token decoding: base64(userId:timestamp)
    try {
      const rawToken = authHeader.replace(/^Bearer\s+/i, '').replace('skz_tok_', '');
      const decoded = Buffer.from(rawToken, 'base64').toString('utf-8');
      const userId = decoded.split(':')[0];
      const user = db.getUser(userId);
      if (user) {
        return res.json({ user });
      }
    } catch {
      // Ignore token parse error
    }

    // Default fallback to demo customer
    const fallbackUser = db.getUser('customer@example.com') || db.getUser('admin@skirz.com');
    return res.json({ user: fallbackUser });
  });

  app.put('/api/auth/profile', (req: Request, res: Response) => {
    const { userId, name, phone, savedAddresses, wishlist, notificationPreferences } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const updated = db.updateUser(userId, {
      ...(name ? { name } : {}),
      ...(phone ? { phone } : {}),
      ...(savedAddresses ? { savedAddresses } : {}),
      ...(wishlist ? { wishlist } : {}),
      ...(notificationPreferences ? { notificationPreferences } : {}),
    });

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user: updated });
  });

  // ==================== CATEGORIES ROUTES ====================
  app.get('/api/categories', (_req: Request, res: Response) => {
    const categories = db.getCategories();
    return res.json({ categories });
  });

  app.post('/api/categories', (req: Request, res: Response) => {
    const { name, slug, iconName, displayOrder } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const newCat = db.createCategory({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      iconName: iconName || 'ShoppingBag',
      displayOrder: displayOrder || 99,
      isActive: true,
    });
    return res.status(201).json({ category: newCat });
  });

  app.put('/api/categories/:id', (req: Request, res: Response) => {
    const updated = db.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    return res.json({ category: updated });
  });

  app.delete('/api/categories/:id', (req: Request, res: Response) => {
    const deleted = db.deleteCategory(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Category not found' });
    return res.json({ success: true });
  });

  // ==================== PRODUCTS ROUTES ====================
  app.get('/api/products', (req: Request, res: Response) => {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      brand,
      sortBy,
      inStockOnly,
      featured,
      bestSeller,
      newArrival,
      limit,
      offset,
    } = req.query;

    const result = db.getProducts({
      search: typeof search === 'string' ? search : undefined,
      category: typeof category === 'string' ? category : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      brand: typeof brand === 'string' ? brand : undefined,
      sortBy: sortBy as any,
      inStockOnly: inStockOnly === 'true',
      featured: featured === 'true',
      bestSeller: bestSeller === 'true',
      newArrival: newArrival === 'true',
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });

    return res.json(result);
  });

  app.get('/api/products/:id', (req: Request, res: Response) => {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ product });
  });

  app.post('/api/products', (req: Request, res: Response) => {
    const data = req.body;
    if (!data.name || !data.price || !data.category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    const created = db.createProduct({
      name: data.name,
      slug: data.slug || '',
      brand: data.brand || 'SKIRZ',
      category: data.category,
      price: Number(data.price),
      originalPrice: Number(data.originalPrice || data.price),
      discountPercent: 0,
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images : ['/src/assets/images/skirz_product_headphones_1792340275712.jpg'],
      description: data.description || '',
      highlights: data.highlights || [],
      specifications: data.specifications || [],
      stock: Number(data.stock ?? 25),
      rating: Number(data.rating ?? 4.8),
      reviewsCount: Number(data.reviewsCount ?? 1),
      availableColors: data.availableColors || [],
      availableSizes: data.availableSizes || [],
      warranty: data.warranty || '1 Year Brand Warranty',
      returnPolicy: data.returnPolicy || '7 Days Returnable',
      supplierId: data.supplierId || 'sup-1',
      supplierName: data.supplierName || 'Apex Global Sourcing',
      supplierProductUrl: data.supplierProductUrl || '',
      supplierSku: data.supplierSku || `SKU-${Date.now().toString().slice(-4)}`,
      supplierCost: Number(data.supplierCost || Math.round(data.price * 0.55)),
      shippingCostPaidByStore: Number(data.shippingCostPaidByStore || 40),
      estimatedProfit: 0,
      profitMarginPercent: 0,
      isFeatured: Boolean(data.isFeatured),
      isBestSeller: Boolean(data.isBestSeller),
      isNewArrival: Boolean(data.isNewArrival),
    });

    return res.status(201).json({ product: created });
  });

  app.put('/api/products/:id', (req: Request, res: Response) => {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ product: updated });
  });

  app.delete('/api/products/:id', (req: Request, res: Response) => {
    const deleted = db.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ success: true });
  });

  // ==================== SUPPLIERS & DROPSHIPPING ====================
  app.get('/api/suppliers', (_req: Request, res: Response) => {
    const suppliers = db.getSuppliers();
    return res.json({ suppliers });
  });

  app.post('/api/suppliers', (req: Request, res: Response) => {
    const { name, contactEmail, website, rating, averageFulfillmentDays } = req.body;
    if (!name) return res.status(400).json({ error: 'Supplier name is required' });

    const newSupplier = db.createSupplier({
      name,
      contactEmail: contactEmail || '',
      website: website || '',
      rating: Number(rating || 4.5),
      averageFulfillmentDays: Number(averageFulfillmentDays || 2),
      isActive: true,
    });
    return res.status(201).json({ supplier: newSupplier });
  });

  // ==================== CART ROUTES ====================
  app.get('/api/cart/:sessionId', (req: Request, res: Response) => {
    const items = db.getCart(req.params.sessionId);
    return res.json({ items });
  });

  app.post('/api/cart/:sessionId', (req: Request, res: Response) => {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array required' });
    }
    const saved = db.saveCart(req.params.sessionId, items);
    return res.json({ items: saved });
  });

  // ==================== ORDERS & CHECKOUT ====================
  app.get('/api/orders', (req: Request, res: Response) => {
    const { userId, status } = req.query;
    const orders = db.getOrders({
      userId: typeof userId === 'string' ? userId : undefined,
      status: typeof status === 'string' ? status : undefined,
    });
    return res.json({ orders });
  });

  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const order = db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.json({ order });
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    const {
      userId,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      paymentMethod,
      couponCode,
      idempotencyKey,
      simulatePaymentFailure,
    } = req.body;

    if (!customerEmail || !shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing required order details or empty cart items' });
    }

    if (simulatePaymentFailure) {
      return res.status(402).json({
        error: 'Payment failed at gateway simulation. Please verify card details or try UPI.',
      });
    }

    const { order, alreadyProcessed } = db.createOrder({
      userId,
      customerEmail,
      customerPhone: customerPhone || shippingAddress.phoneNumber || '',
      shippingAddress,
      items,
      paymentMethod: paymentMethod || 'upi',
      couponCode,
      idempotencyKey,
    });

    return res.status(alreadyProcessed ? 200 : 201).json({ order, alreadyProcessed });
  });

  app.post('/api/orders/:id/status', (req: Request, res: Response) => {
    const { status, note, carrier, trackingNumber, trackingUrl } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const updated = db.updateOrderStatus(req.params.id, status, note, {
      carrier,
      trackingNumber,
      trackingUrl,
    });

    if (!updated) return res.status(404).json({ error: 'Order not found' });
    return res.json({ order: updated });
  });

  app.post('/api/orders/:id/supplier-fulfillment', (req: Request, res: Response) => {
    const { supplierOrderReference, status } = req.body;
    const updated = db.updateSupplierOrder(req.params.id, {
      supplierOrderReference,
      status,
    });
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    return res.json({ order: updated });
  });

  app.post('/api/orders/:id/return', (req: Request, res: Response) => {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Reason for return is required' });

    const updated = db.requestOrderReturn(req.params.id, reason);
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    return res.json({ order: updated });
  });

  app.post('/api/orders/:id/refund', (req: Request, res: Response) => {
    const { approved, note } = req.body;
    const updated = db.processOrderRefund(req.params.id, Boolean(approved), note);
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    return res.json({ order: updated });
  });

  // ==================== COUPONS ====================
  app.get('/api/coupons', (_req: Request, res: Response) => {
    const coupons = db.getCoupons();
    return res.json({ coupons });
  });

  app.post('/api/coupons/validate', (req: Request, res: Response) => {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ valid: false, message: 'Coupon code required' });

    const result = db.validateCoupon(code, Number(subtotal || 0));
    return res.json(result);
  });

  // ==================== PINCODE DELIVERY ====================
  app.get('/api/pincode/:pincode', (req: Request, res: Response) => {
    const info = lookupPincode(req.params.pincode);
    return res.json(info);
  });

  // ==================== ADMIN METRICS & CSV EXPORT ====================
  app.get('/api/admin/metrics', (_req: Request, res: Response) => {
    const metrics = db.getAdminMetrics();
    return res.json({ metrics });
  });

  app.get('/api/admin/export', (_req: Request, res: Response) => {
    const orders = db.getOrders();
    const csvRows = [
      ['Order ID', 'Date', 'Customer Email', 'Items Count', 'Status', 'Revenue (INR)', 'Supplier Cost (INR)', 'Estimated Profit (INR)', 'Payment Method', 'Carrier', 'Tracking No'].join(','),
      ...orders.map((o) =>
        [
          o.orderNumber,
          o.createdAt.split('T')[0],
          `"${o.customerEmail}"`,
          o.items.length,
          `"${o.status}"`,
          o.pricing.finalTotal,
          o.supplierFulfillment.supplierCostTotal,
          o.supplierFulfillment.estimatedGrossProfit,
          o.payment.method.toUpperCase(),
          `"${o.shipping.carrier || 'Pending'}"`,
          `"${o.shipping.trackingNumber || 'Pending'}"`,
        ].join(',')
      ),
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="skirz_business_report.csv"');
    return res.send(csvRows.join('\n'));
  });

  // ==================== FRONTEND CLIENT INTEGRATION ====================
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SKIRZ Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SKIRZ Server] Fatal Startup Error:', err);
  process.exit(1);
});
