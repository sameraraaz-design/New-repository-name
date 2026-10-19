import React from 'react';
import { Search, ShoppingBag, Heart, User as UserIcon, Shield, Sparkles, Download } from 'lucide-react';
import { Logo } from './Logo.tsx';
import { User } from '../types/index.ts';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  currentUser: User | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCart: () => void;
  onOpenAccount: () => void;
  onOpenAdmin: () => void;
  onOpenInstallModal: () => void;
  onSelectCategory: (slug: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  currentUser,
  searchQuery,
  onSearchChange,
  onOpenCart,
  onOpenAccount,
  onOpenAdmin,
  onOpenInstallModal,
  onSelectCategory,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top Bar Contract: 3 Zones with gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6 sm:gap-8">
        {/* Zone 1: Brand Wordmark (Single element) */}
        <button
          onClick={() => onSelectCategory('all')}
          className="flex items-center gap-2 text-left shrink-0 cursor-pointer focus:outline-none"
        >
          <Logo size="md" />
        </button>

        {/* Zone 2: Navigation Links (Single-line, clean text with subtle underlines) */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600">
          <button
            onClick={() => onSelectCategory('electronics')}
            className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4"
          >
            Electronics
          </button>
          <button
            onClick={() => onSelectCategory('fashion')}
            className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4"
          >
            Fashion
          </button>
          <button
            onClick={() => onSelectCategory('shoes')}
            className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4"
          >
            Shoes
          </button>
          <button
            onClick={() => onSelectCategory('watches')}
            className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4"
          >
            Watches
          </button>
          <button
            onClick={() => onSelectCategory('home-kitchen')}
            className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4"
          >
            Home & Kitchen
          </button>
        </nav>

        {/* Zone 3: Primary Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Install Mobile App / APK Button */}
          <button
            onClick={onOpenInstallModal}
            title="Install SKIRZ App / Download APK"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Get App (APK)</span>
            <span className="sm:hidden">App</span>
          </button>

          {/* Admin Switcher Shortcut */}
          <button
            onClick={onOpenAdmin}
            title="Open Dropshipping & Store Admin Dashboard"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Store Admin</span>
          </button>

          {/* Account Button */}
          <button
            onClick={onOpenAccount}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <UserIcon className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline truncate max-w-[90px]">
              {currentUser?.name ? currentUser.name.split(' ')[0] : 'Sign In'}
            </span>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={onOpenAccount}
            title="My Wishlist"
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="w-4 h-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Shopping Cart Primary Action Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
            aria-label="Open Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            <span className="w-5 h-5 bg-white text-blue-700 rounded-full flex items-center justify-center text-[11px] font-extrabold font-mono ml-0.5">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Sub-bar: Search Bar with instant query */}
      <div className="bg-slate-50/70 border-t border-slate-200/80 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="relative flex-1 max-w-2xl">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search across 15 departments by product, brand, keyword or SKU..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs text-slate-500 ml-auto">
            <span>Free Express Shipping ₹999+</span>
            <span aria-hidden="true">·</span>
            <span>7-Day Easy Returns</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-emerald-700">Cash on Delivery Available</span>
          </div>
        </div>
      </div>
    </header>
  );
};
