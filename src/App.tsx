import React, { useEffect, useState, useMemo } from 'react';
import {
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Award,
  ShieldCheck,
  Package,
  Layers,
  CheckCircle,
} from 'lucide-react';

import { Navbar } from './components/Navbar.tsx';
import { SplashScreen } from './components/SplashScreen.tsx';
import { CategoryBar } from './components/CategoryBar.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderSuccessModal } from './components/OrderSuccessModal.tsx';
import { OrderTrackingModal } from './components/OrderTrackingModal.tsx';
import { AccountModal } from './components/AccountModal.tsx';
import { AdminDashboardModal } from './components/AdminDashboardModal.tsx';
import { Footer } from './components/Footer.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { InstallAppModal } from './components/InstallAppModal.tsx';
import { usePWAInstall } from './utils/usePWAInstall.ts';

import {
  Category,
  Product,
  CartItem,
  Order,
  User,
  Supplier,
  AdminMetrics,
} from './types/index.ts';
import { CouponRule, formatIndianRupees } from './utils/pricing.ts';

export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('autostart') !== '1';
    }
    return true;
  });

  // Core Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<CouponRule[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // User & Session
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user-cust',
    name: 'Aarav Patel',
    email: 'customer@example.com',
    phone: '+91 98765 43210',
    role: 'customer',
    savedAddresses: [
      {
        fullName: 'Aarav Patel',
        phoneNumber: '+91 98765 43210',
        streetAddress: 'Flat 402, Royal Residency, 12th Cross',
        localityArea: 'Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        addressType: 'Home',
        isDefault: true,
      },
    ],
    wishlist: ['prod-2', 'prod-3'],
    notificationPreferences: {
      orderUpdatesEmail: true,
      orderUpdatesSms: true,
      promotionalOffers: true,
    },
  });

  // Shopping Cart & Promo
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('skirz_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState<CouponRule | null>(null);

  // Modals & Active Views
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [recentOrderSuccess, setRecentOrderSuccess] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'home' | 'categories' | 'wishlist' | 'orders' | 'account'>('home');

  const { isInstallable, install: handlePWAInstall } = usePWAInstall();

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('popular');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'featured' | 'bestsellers' | 'new'>('all');

  // Fetch store data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, supRes, ordRes, coupRes, metRes] = await Promise.all([
        fetch('/api/products').then((r) => r.json()).catch(() => ({ items: [] })),
        fetch('/api/categories').then((r) => r.json()).catch(() => ({ categories: [] })),
        fetch('/api/suppliers').then((r) => r.json()).catch(() => ({ suppliers: [] })),
        fetch('/api/orders').then((r) => r.json()).catch(() => ({ orders: [] })),
        fetch('/api/coupons').then((r) => r.json()).catch(() => ({ coupons: [] })),
        fetch('/api/admin/metrics').then((r) => r.json()).catch(() => ({ metrics: null })),
      ]);

      if (prodRes?.items?.length) setProducts(prodRes.items);
      if (catRes?.categories?.length) setCategories(catRes.categories);
      if (supRes?.suppliers?.length) setSuppliers(supRes.suppliers);
      if (ordRes?.orders?.length) setOrders(ordRes.orders);
      if (coupRes?.coupons?.length) setCoupons(coupRes.coupons);
      if (metRes?.metrics) setMetrics(metRes.metrics);
    } catch (err) {
      console.error('Failed to load initial SKIRZ data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync Cart with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('skirz_cart', JSON.stringify(cartItems));
    } catch {
      // Ignore storage errors
    }
  }, [cartItems]);

  // Cart actions
  const handleAddToCart = (
    product: Product,
    options?: { color?: string; size?: string; quantity?: number }
  ) => {
    const qty = options?.quantity || 1;
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.productId === product.id &&
          i.selectedColor === options?.color &&
          i.selectedSize === options?.size
      );

      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += qty;
        return copy;
      }

      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        brand: product.brand,
        image: product.images[0] || '/src/assets/images/skirz_product_headphones_1792340275712.jpg',
        price: product.price,
        originalPrice: product.originalPrice,
        quantity: qty,
        stock: product.stock,
        selectedColor: options?.color,
        selectedSize: options?.size,
        supplierCost: product.supplierCost,
      };
      return [...prev, newItem];
    });
  };

  const handleBuyNow = (
    product: Product,
    options?: { color?: string; size?: string; quantity?: number }
  ) => {
    handleAddToCart(product, options);
    setIsCheckoutOpen(true);
  };

  const handleUpdateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    setCartItems((prev) => {
      const copy = [...prev];
      copy[index].quantity = quantity;
      return copy;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleToggleWishlist = (productId: string) => {
    setCurrentUser((prev) => {
      const exists = prev.wishlist?.includes(productId);
      const nextWishlist = exists
        ? prev.wishlist.filter((id) => id !== productId)
        : [...(prev.wishlist || []), productId];
      return { ...prev, wishlist: nextWishlist };
    });
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setAppliedCoupon(null);
    setRecentOrderSuccess(newOrder);
    fetchData(); // Refresh admin metrics & stock
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const matchesCategory =
          p.category.toLowerCase() === selectedCategory.toLowerCase() ||
          p.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory.toLowerCase();
        if (!matchesCategory) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.supplierSku && p.supplierSku.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      // In Stock filter
      if (inStockOnly && p.stock <= 0) {
        return false;
      }

      // Collections tab filter
      if (activeFilterTab === 'featured' && !p.isFeatured) return false;
      if (activeFilterTab === 'bestsellers' && !p.isBestSeller) return false;
      if (activeFilterTab === 'new' && !p.isNewArrival) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return b.reviewsCount - a.reviewsCount; // popular
    });
  }, [products, selectedCategory, searchQuery, inStockOnly, activeFilterTab, sortBy]);

  // Mobile Bottom Navigation Handler
  const handleMobileTabSelect = (tab: 'home' | 'categories' | 'wishlist' | 'orders' | 'account') => {
    setMobileTab(tab);
    if (tab === 'home') {
      setSelectedCategory('all');
      setSearchQuery('');
    } else if (tab === 'categories') {
      window.scrollTo({ top: 380, behavior: 'smooth' });
    } else if (tab === 'wishlist' || tab === 'orders' || tab === 'account') {
      setIsAccountOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 pb-16 md:pb-0">
      {/* Splash Screen */}
      {showSplash && <SplashScreen onDismiss={() => setShowSplash(false)} />}

      {/* Top Promotional Bar */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <span className="text-blue-400 font-bold uppercase tracking-wider">SKIRZ Advantage</span>
        <span aria-hidden="true">·</span>
        <span>Free Express Delivery across India on orders over ₹999</span>
        <span aria-hidden="true">·</span>
        <span className="hidden sm:inline">Use code <strong className="text-amber-400 font-mono">WELCOME10</strong> for 10% instant off</span>
      </div>

      {/* Main Top Bar & Search */}
      <Navbar
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={currentUser.wishlist?.length || 0}
        currentUser={currentUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          setSearchQuery('');
        }}
      />

      {/* 15 Departments / Category Strip */}
      <CategoryBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          setSearchQuery('');
        }}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-6">
        {/* Campaign Hero Banner (16:9 high fidelity asset) */}
        {selectedCategory === 'all' && !searchQuery && (
          <section className="mb-10 rounded-2xl overflow-hidden bg-slate-900 text-white shadow-md relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[380px]">
              {/* Left Column Copy (7 cols) */}
              <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center space-y-4 z-10">
                <div className="flex items-center gap-2 text-xs text-blue-300 font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Curated Marketplace & Dropship Store</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white max-w-xl text-balance">
                  Shop Smart. Live Better.
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
                  Discover verified electronic innovations, athletic performance gear, and premium home lifestyle essentials with direct supplier pricing in Indian Rupees.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveFilterTab('featured')}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
                  >
                    Shop Featured Deals
                  </button>

                  <button
                    onClick={() => setActiveFilterTab('bestsellers')}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 transition-all"
                  >
                    View Best Sellers
                  </button>
                </div>

                {/* Proof strip */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>Verified Suppliers</span>
                  </div>
                  <span aria-hidden="true">·</span>
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-blue-400" />
                    <span>National Express Delivery</span>
                  </div>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-emerald-400">All India COD</span>
                </div>
              </div>

              {/* Right Column Visual (5 cols) */}
              <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full">
                <img
                  src="/src/assets/images/skirz_hero_campaign_1792340275884.jpg"
                  alt="SKIRZ Marketplace Featured Products"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 via-transparent to-transparent" />
              </div>
            </div>
          </section>
        )}

        {/* Filter, Sort & Collection Tabs Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          {/* Segmented Filter Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl overflow-x-auto w-full sm:w-auto text-xs font-semibold">
            <button
              onClick={() => setActiveFilterTab('all')}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeFilterTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setActiveFilterTab('featured')}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeFilterTab === 'featured'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => setActiveFilterTab('bestsellers')}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeFilterTab === 'bestsellers'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Best Sellers
            </button>
            <button
              onClick={() => setActiveFilterTab('new')}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeFilterTab === 'new'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New Arrivals
            </button>
          </div>

          {/* Right Toolbar: Stock toggle & Sorting */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end text-xs">
            <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="whitespace-nowrap">In Stock Only</span>
            </label>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-1.5 pl-2.5 pr-7 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="popular">Popularity</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="pt-6 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 capitalize">
              {searchQuery
                ? `Search results for "${searchQuery}"`
                : selectedCategory === 'all'
                ? `${activeFilterTab.toUpperCase()} Products`
                : selectedCategory.replace(/-/g, ' ')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredProducts.length} verified products with direct dispatch
            </p>
          </div>

          {(selectedCategory !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="my-16 text-center py-16 px-4 bg-white rounded-2xl border border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No matching products found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't find any products matching your current filters or search terms.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setActiveFilterTab('all');
                setInStockOnly(false);
              }}
              className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={(p) => setSelectedProduct(p)}
                onAddToCart={(p) => handleAddToCart(p)}
                onBuyNow={(p) => handleBuyNow(p)}
                isWishlisted={currentUser.wishlist?.includes(product.id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        )}

        {/* Verified Sourcing & Dropshipping Guarantee Rest Section */}
        <section className="mt-16 p-8 rounded-2xl bg-white border border-slate-200">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Quality & Transparency
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Direct-to-Consumer Manufacturer Logistics
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Every item sold on SKIRZ is fulfilled through our verified supplier network with pre-vetted quality control, factory-sealed warranties, and end-to-end milestone tracking across India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-100 text-xs">
            <div>
              <h4 className="font-bold text-slate-900">Pre-Inspected Inventory</h4>
              <p className="text-slate-500 mt-1">Items undergo standard electrical and mechanical inspections prior to shipment.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Live Indian Postal Delivery</h4>
              <p className="text-slate-500 mt-1">Dynamic PIN code routing for express surface and air parcel delivery.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Instant Automated Invoicing</h4>
              <p className="text-slate-500 mt-1">Every order includes an official digital tax receipt and warranty documentation.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          window.scrollTo({ top: 380, behavior: 'smooth' });
        }}
        onOpenAccount={() => setIsAccountOpen(true)}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={mobileTab}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={currentUser.wishlist?.length || 0}
        onSelectTab={handleMobileTabSelect}
      />

      {/* MODALS */}
      {/* 1. Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, opts) => handleAddToCart(p, opts)}
        onBuyNow={(p, opts) => handleBuyNow(p, opts)}
      />

      {/* 2. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={setAppliedCoupon}
        availableCoupons={coupons}
      />

      {/* 3. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        currentUser={currentUser}
        appliedCoupon={appliedCoupon}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* 4. Order Confirmation Modal */}
      <OrderSuccessModal
        order={recentOrderSuccess}
        onClose={() => setRecentOrderSuccess(null)}
        onTrackOrder={(ord) => setTrackingOrder(ord)}
      />

      {/* 5. Order Tracking & Return Modal */}
      <OrderTrackingModal
        order={trackingOrder}
        onClose={() => setTrackingOrder(null)}
        onUpdateOrder={(updated) => {
          setTrackingOrder(updated);
          setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        }}
      />

      {/* 6. Customer Account Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        currentUser={currentUser}
        orders={orders}
        products={products}
        onOpenTracking={(ord) => {
          setIsAccountOpen(false);
          setTrackingOrder(ord);
        }}
        onAddToCart={(p) => handleAddToCart(p)}
        onSwitchToAdmin={() => {
          setIsAccountOpen(false);
          setIsAdminOpen(true);
        }}
        onLogout={() => {
          alert('Logged out of customer session');
          setIsAccountOpen(false);
        }}
        onUpdateUser={(updated) => setCurrentUser(updated)}
      />

      {/* 7. Store Owner & Dropshipping Admin Dashboard */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        metrics={metrics}
        orders={orders}
        products={products}
        categories={categories}
        suppliers={suppliers}
        onRefreshData={fetchData}
      />

      {/* 8. Install Mobile App / APK Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        isInstallable={isInstallable}
        onInstall={handlePWAInstall}
      />
    </div>
  );
}
