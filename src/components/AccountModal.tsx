import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Package,
  Heart,
  MapPin,
  Bell,
  LogOut,
  Plus,
  Trash2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Order, Product, User, DeliveryAddress } from '../types/index.ts';
import { formatIndianRupees } from '../utils/pricing.ts';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  orders: Order[];
  products: Product[];
  onOpenTracking: (order: Order) => void;
  onAddToCart: (product: Product) => void;
  onSwitchToAdmin: () => void;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  orders,
  products,
  onOpenTracking,
  onAddToCart,
  onSwitchToAdmin,
  onLogout,
  onUpdateUser,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'settings'>('orders');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState<DeliveryAddress>({
    fullName: currentUser.name,
    phoneNumber: currentUser.phone || '',
    streetAddress: '',
    localityArea: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'Home',
  });

  const wishlistedProducts = products.filter((p) => currentUser.wishlist?.includes(p.id));

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedAddresses = [...(currentUser.savedAddresses || []), newAddr];
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          savedAddresses: updatedAddresses,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdateUser(data.user);
        setShowAddAddress(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveWishlist = async (prodId: string) => {
    const updatedWishlist = currentUser.wishlist.filter((id) => id !== prodId);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          wishlist: updatedWishlist,
        }),
      });
      const data = await res.json();
      if (res.ok) onUpdateUser(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{currentUser.name}</h2>
              <span className="text-xs text-slate-500 font-mono">{currentUser.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser.role === 'admin' ? (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-md">
                Admin Mode
              </span>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onSwitchToAdmin();
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Open Store Admin</span>
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close account view"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-200 bg-slate-50 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`py-3 px-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'addresses'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses ({currentUser.savedAddresses?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`py-3 px-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'wishlist'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Wishlist ({wishlistedProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Preferences</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No orders placed yet</p>
                  <p className="text-xs text-slate-500 mt-1">Browse our store and make your first purchase!</p>
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-colors space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
                      <div>
                        <span className="font-mono font-bold text-slate-900">{ord.orderNumber}</span>
                        <span className="text-slate-400 ml-2">
                          · {new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {ord.status}
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {formatIndianRupees(ord.pricing.finalTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="divide-y divide-slate-100">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="py-2 flex items-center gap-3 text-xs">
                          <img
                            src={it.image}
                            alt={it.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                          />
                          <div className="flex-1 truncate">
                            <h5 className="font-semibold text-slate-900 truncate">{it.name}</h5>
                            <p className="text-[11px] text-slate-500">
                              Qty: {it.quantity} {it.selectedColor && `· ${it.selectedColor}`}
                            </p>
                          </div>
                          <span className="font-mono font-semibold text-slate-800">
                            {formatIndianRupees(it.price * it.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenTracking(ord);
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Track Delivery</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Delivery Addresses
                </h4>
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddAddress ? 'Cancel' : 'Add New Address'}</span>
                </button>
              </div>

              {showAddAddress && (
                <form onSubmit={handleAddAddress} className="p-4 border border-blue-200 bg-blue-50/30 rounded-xl space-y-3 text-xs">
                  <h5 className="font-bold text-slate-900">Add New Address</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                      className="px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="10-digit Phone"
                      value={newAddr.phoneNumber}
                      onChange={(e) => setNewAddr({ ...newAddr, phoneNumber: e.target.value })}
                      className="px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="House / Street / Apartment"
                    value={newAddr.streetAddress}
                    onChange={(e) => setNewAddr({ ...newAddr, streetAddress: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Area / Locality"
                      value={newAddr.localityArea}
                      onChange={(e) => setNewAddr({ ...newAddr, localityArea: e.target.value })}
                      className="px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="6-digit PIN"
                      maxLength={6}
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      className="px-3 py-1.5 border border-slate-300 rounded-md bg-white font-mono"
                    />
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs"
                  >
                    Save Address
                  </button>
                </form>
              )}

              <div className="space-y-3">
                {currentUser.savedAddresses?.map((addr, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-white text-xs flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{addr.fullName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {addr.addressType}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">
                        {addr.streetAddress}, {addr.localityArea}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-slate-500 mt-0.5">Phone: {addr.phoneNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              {wishlistedProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Heart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Your wishlist is empty</p>
                  <p className="text-xs text-slate-500 mt-1">Click the heart icon on any product to save it for later.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistedProducts.map((prod) => (
                    <div key={prod.id} className="p-3 border border-slate-200 rounded-xl flex gap-3 text-xs bg-white">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                      />
                      <div className="flex-1 flex flex-col justify-between truncate">
                        <div>
                          <p className="font-semibold text-slate-900 truncate">{prod.name}</p>
                          <p className="font-mono font-bold text-blue-600 mt-0.5">
                            {formatIndianRupees(prod.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => onAddToCart(prod)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-[11px]"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => handleRemoveWishlist(prod.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            aria-label="Remove from wishlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SETTINGS & NOTIFICATIONS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 text-xs text-slate-700">
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                  Notification Channels
                </h4>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>SMS Delivery updates & dispatch alerts</span>
                  <input
                    type="checkbox"
                    defaultChecked={currentUser.notificationPreferences?.orderUpdatesSms}
                    className="rounded text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Order receipt & tracking emails</span>
                  <input
                    type="checkbox"
                    defaultChecked={currentUser.notificationPreferences?.orderUpdatesEmail}
                    className="rounded text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Promotional announcements & discounts</span>
                  <input
                    type="checkbox"
                    defaultChecked={currentUser.notificationPreferences?.promotionalOffers}
                    className="rounded text-blue-600"
                  />
                </label>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h5 className="font-bold text-slate-900">Sign Out</h5>
                  <p className="text-slate-500 text-[11px]">End current customer browsing session</p>
                </div>
                <button
                  onClick={onLogout}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
