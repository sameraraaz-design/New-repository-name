import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  Package,
  Layers,
  Truck,
  DollarSign,
  Tag,
  Download,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Send,
  RotateCcw,
} from 'lucide-react';
import { AdminMetrics, Category, Order, OrderStatus, Product, Supplier } from '../types/index.ts';
import { formatIndianRupees, calculateEstimatedProfit } from '../utils/pricing.ts';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: AdminMetrics | null;
  orders: Order[];
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  onRefreshData: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  metrics,
  orders,
  products,
  categories,
  suppliers,
  onRefreshData,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'dropshipping' | 'products' | 'categories' | 'coupons'>('overview');

  // Edit / Add Product state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState(categories[0]?.name || 'Electronics');
  const [newProdPrice, setNewProdPrice] = useState(1999);
  const [newProdCost, setNewProdCost] = useState(1100);
  const [newProdStock, setNewProdStock] = useState(30);
  const [newProdBrand, setNewProdBrand] = useState('SKIRZ');
  const [newProdSupplierId, setNewProdSupplierId] = useState(suppliers[0]?.id || 'sup-1');
  const [newProdSupplierSku, setNewProdSupplierSku] = useState('SUP-PROD-01');
  const [newProdSupplierUrl, setNewProdSupplierUrl] = useState('https://suppliers.direct/item/01');
  const [newProdDescription, setNewProdDescription] = useState('Premium quality product with verified specifications.');

  // Order status update state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [carrierInput, setCarrierInput] = useState('Blue Dart');
  const [trackingInput, setTrackingInput] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // New Category State
  const [newCatName, setNewCatName] = useState('');

  // New Coupon State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState(15);
  const [newCouponMin, setNewCouponMin] = useState(999);

  // Auto Profit preview for new product
  const profitPreview = calculateEstimatedProfit({
    sellingPrice: Number(newProdPrice) || 0,
    supplierCost: Number(newProdCost) || 0,
    shippingCostPaidByStore: 40,
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProdName,
          category: newProdCategory,
          brand: newProdBrand,
          price: Number(newProdPrice),
          originalPrice: Math.round(Number(newProdPrice) * 1.4),
          stock: Number(newProdStock),
          supplierId: newProdSupplierId,
          supplierSku: newProdSupplierSku,
          supplierProductUrl: newProdSupplierUrl,
          supplierCost: Number(newProdCost),
          description: newProdDescription,
          images: ['/src/assets/images/skirz_product_headphones_1792340275712.jpg'],
        }),
      });
      if (res.ok) {
        setShowAddProduct(false);
        setNewProdName('');
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product from SKIRZ catalog?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setStatusUpdating(true);
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          carrier: carrierInput,
          trackingNumber: trackingInput || undefined,
        }),
      });
      setSelectedOrderId(null);
      setTrackingInput('');
      onRefreshData();
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleApproveRefund = async (orderId: string) => {
    if (!confirm('Approve customer return and process full refund?')) return;
    try {
      await fetch(`/api/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true, note: 'Approved by admin - refund credited' }),
      });
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName.trim(),
          displayOrder: categories.length + 1,
        }),
      });
      setNewCatName('');
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    window.open('/api/admin/export', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 animate-fadeIn">
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">SKIRZ Store Management & Dropshipping</h2>
                <span className="text-[10px] font-bold uppercase bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded">
                  Admin Console
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Logged in as Master Merchant · Real-Time Sales, Profit Margins & Supplier Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onRefreshData}
              aria-label="Refresh data"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close admin dashboard"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-200 bg-slate-50 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Executive KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Customer Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dropshipping')}
            className={`py-3 px-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'dropshipping'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Dropshipping & Margins</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Product Catalog ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'categories'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: EXECUTIVE KPIS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Gross Sales Revenue
                  </span>
                  <div className="flex items-baseline gap-2 mt-2 font-mono">
                    <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                      {formatIndianRupees(metrics?.grossRevenue || 0)}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
                    Verified customer payments
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 shadow-2xs">
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Estimated Dropship Profit
                  </span>
                  <div className="flex items-baseline gap-2 mt-2 font-mono">
                    <span className="text-2xl font-extrabold text-blue-900 tabular-nums">
                      {formatIndianRupees(metrics?.estimatedNetProfit || 0)}
                    </span>
                  </div>
                  <span className="text-[11px] text-blue-700 font-medium mt-1 block">
                    {metrics?.profitMarginOverall || 0}% avg net margin
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Orders Placed
                  </span>
                  <div className="flex items-baseline gap-2 mt-2 font-mono">
                    <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                      {metrics?.totalOrders || 0}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                    Avg order: {formatIndianRupees(metrics?.averageOrderValue || 0)}
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Supplier Fulfillment Pending
                  </span>
                  <div className="flex items-baseline gap-2 mt-2 font-mono">
                    <span className="text-2xl font-extrabold text-amber-700 tabular-nums">
                      {metrics?.pendingSupplierOrders || 0}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                    Needs PO or dispatch
                  </span>
                </div>
              </div>

              {/* Order Status Breakdown */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Orders by Pipeline Status
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {Object.entries(metrics?.statusCounts || {}).map(([st, cnt]) => (
                    <div key={st} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-500 truncate block">{st}</span>
                      <span className="text-lg font-bold font-mono text-slate-900 mt-1 block tabular-nums">
                        {cnt}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Suppliers */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Authorized Supplier Partnerships
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {suppliers.map((sup) => (
                    <div key={sup.id} className="p-3.5 border border-slate-200 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{sup.name}</span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                            Active
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">{sup.contactEmail}</p>
                        <p className="text-slate-500 text-[11px]">Avg fulfillment: {sup.averageFulfillmentDays} days</p>
                      </div>
                      <a
                        href={sup.website}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Visit Supplier Portal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">Customer Order Queue</h3>
                <span className="text-xs text-slate-500">
                  Click status to advance lifecycle, assign carriers, or issue refunds
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 text-xs bg-white">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {ord.orderNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {ord.status}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs mt-1">
                          Customer: <strong>{ord.customerEmail}</strong> · Phone: {ord.customerPhone}
                        </p>
                      </div>

                      <div className="text-left sm:text-right font-mono">
                        <span className="text-base font-bold text-slate-900 tabular-nums">
                          {formatIndianRupees(ord.pricing.finalTotal)}
                        </span>
                        <p className="text-[11px] text-emerald-700 font-medium">
                          Supplier cost: {formatIndianRupees(ord.supplierFulfillment.supplierCostTotal)} (Profit: {formatIndianRupees(ord.supplierFulfillment.estimatedGrossProfit)})
                        </p>
                      </div>
                    </div>

                    {/* Ordered items */}
                    <div className="flex items-center gap-3 overflow-x-auto py-1">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200/80 shrink-0">
                          <img src={it.image} alt={it.name} className="w-8 h-8 rounded object-cover" />
                          <div className="text-[11px] max-w-[200px] truncate">
                            <p className="font-semibold text-slate-800 truncate">{it.name}</p>
                            <p className="text-slate-500">Qty {it.quantity} · SKU: {it.supplierSku}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Status updater toolbar */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {ord.status === 'Order Confirmed' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'Supplier Processing')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Route to Supplier</span>
                          </button>
                        )}

                        {ord.status === 'Supplier Processing' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Carrier (e.g. Blue Dart)"
                              value={carrierInput}
                              onChange={(e) => setCarrierInput(e.target.value)}
                              className="px-2.5 py-1 border border-slate-300 rounded-md text-xs w-28"
                            />
                            <input
                              type="text"
                              placeholder="AWB Tracking #"
                              value={trackingInput}
                              onChange={(e) => setTrackingInput(e.target.value)}
                              className="px-2.5 py-1 border border-slate-300 rounded-md text-xs w-36 font-mono"
                            />
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'Shipped')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Dispatch & Mark Shipped</span>
                            </button>
                          </div>
                        )}

                        {ord.status === 'Shipped' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'Out for Delivery')}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
                          >
                            Mark Out for Delivery
                          </button>
                        )}

                        {ord.status === 'Out for Delivery' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'Delivered')}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold"
                          >
                            Confirm Delivered
                          </button>
                        )}
                      </div>

                      {/* Refund handling if return requested */}
                      {ord.returnRequest && ord.returnRequest.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <span className="text-amber-700 font-semibold">
                            Return Requested: {ord.returnRequest.reason}
                          </span>
                          <button
                            onClick={() => handleApproveRefund(ord.id)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Approve & Refund</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DROPSHIPPING & AUTOMATIC MARGINS */}
          {activeTab === 'dropshipping' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1">
                <h4 className="font-bold text-blue-900">Dropshipping Margin Formula & Cost Model</h4>
                <p className="text-blue-800">
                  Estimated Profit = Retail Selling Price - Supplier Purchase Cost - Store Shipping (~₹40) - Gateway Fee (2%) - Packaging/Ops (~₹15).
                </p>
                <p className="text-blue-700 text-[11px]">
                  All margin figures are strictly protected from customer view and visible only in this master dashboard.
                </p>
              </div>

              {/* Dropshipping Product Cost Matrix Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3">Product Name & SKU</th>
                      <th className="p-3">Supplier Partner</th>
                      <th className="p-3">Supplier Cost</th>
                      <th className="p-3">Retail Selling Price</th>
                      <th className="p-3">Est. Profit</th>
                      <th className="p-3">Margin %</th>
                      <th className="p-3">Direct URL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-sans">
                          <p className="font-semibold text-slate-900 line-clamp-1">{prod.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">SKU: {prod.supplierSku || 'N/A'}</p>
                        </td>
                        <td className="p-3 font-sans text-slate-600">
                          {prod.supplierName || 'Apex Global Sourcing'}
                        </td>
                        <td className="p-3 text-slate-700 tabular-nums">
                          {formatIndianRupees(prod.supplierCost)}
                        </td>
                        <td className="p-3 font-bold text-slate-900 tabular-nums">
                          {formatIndianRupees(prod.price)}
                        </td>
                        <td className="p-3 font-bold text-emerald-700 tabular-nums">
                          +{formatIndianRupees(prod.estimatedProfit)}
                        </td>
                        <td className="p-3 tabular-nums font-bold">
                          <span className={prod.profitMarginPercent < 15 ? 'text-amber-600' : 'text-blue-600'}>
                            {prod.profitMarginPercent}%
                          </span>
                        </td>
                        <td className="p-3 font-sans">
                          {prod.supplierProductUrl ? (
                            <a
                              href={prod.supplierProductUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <span>Supplier</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400">Manual</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PRODUCT CATALOG */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">Manage Products ({products.length})</h3>
                <button
                  onClick={() => setShowAddProduct(!showAddProduct)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddProduct ? 'Cancel' : 'Add New Product'}</span>
                </button>
              </div>

              {/* Add Product Form */}
              {showAddProduct && (
                <form onSubmit={handleCreateProduct} className="p-5 border border-blue-200 bg-blue-50/20 rounded-xl space-y-4 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">Add Dropshipped / Retail Product</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Product Title *</label>
                      <input
                        type="text"
                        required
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        placeholder="e.g. Ergonomic Mechanical Wireless Keyboard"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Department / Category *</label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Retail Selling Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Supplier Purchase Cost (₹) *</label>
                      <input
                        type="number"
                        required
                        value={newProdCost}
                        onChange={(e) => setNewProdCost(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Inventory Stock *</label>
                      <input
                        type="number"
                        required
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Brand Name</label>
                      <input
                        type="text"
                        value={newProdBrand}
                        onChange={(e) => setNewProdBrand(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                      />
                    </div>
                  </div>

                  {/* Profit Preview Widget */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between font-mono">
                    <div>
                      <span className="text-slate-500 text-[11px] font-sans">Estimated Profit:</span>
                      <strong className="text-emerald-700 ml-2 font-bold">{formatIndianRupees(profitPreview.estimatedProfit)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] font-sans">Net Margin:</span>
                      <strong className="text-blue-600 ml-2 font-bold">{profitPreview.profitMarginPercent}%</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Supplier SKU</label>
                      <input
                        type="text"
                        value={newProdSupplierSku}
                        onChange={(e) => setNewProdSupplierSku(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Supplier Authorized URL</label>
                      <input
                        type="url"
                        value={newProdSupplierUrl}
                        onChange={(e) => setNewProdSupplierUrl(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={newProdDescription}
                      onChange={(e) => setNewProdDescription(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                  >
                    Save & Publish to SKIRZ Store
                  </button>
                </form>
              )}

              {/* Product Listing Cards */}
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white text-xs">
                {products.map((prod) => (
                  <div key={prod.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <img src={prod.images[0]} alt={prod.name} className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                      <div>
                        <h5 className="font-bold text-slate-900">{prod.name}</h5>
                        <p className="text-slate-500 mt-0.5">
                          {prod.category} · Stock: <strong>{prod.stock}</strong> left
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 font-mono">
                      <div className="text-right">
                        <span className="font-bold text-slate-900">{formatIndianRupees(prod.price)}</span>
                        <p className="text-[11px] text-emerald-700">Cost: {formatIndianRupees(prod.supplierCost)}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <form onSubmit={handleCreateCategory} className="flex gap-2 text-xs">
                <input
                  type="text"
                  required
                  placeholder="New category name (e.g. Gaming Gear)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                >
                  Add Category
                </button>
              </form>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white text-xs">
                {categories.map((c, idx) => (
                  <div key={c.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-mono font-bold text-[11px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-900">{c.name}</span>
                      <span className="text-slate-400 text-[11px]">slug: {c.slug}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
