import React from 'react';
import { Home, Layers, Heart, Package, User } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  cartCount: number;
  wishlistCount: number;
  onSelectTab: (tab: 'home' | 'categories' | 'wishlist' | 'orders' | 'account') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  cartCount,
  wishlistCount,
  onSelectTab,
}) => {
  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 h-14 px-2 flex items-center justify-around"
    >
      <button
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center py-1 px-3 text-[10px] font-semibold transition-colors ${
          activeTab === 'home' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Home className="w-4 h-4 mb-0.5" />
        <span>Home</span>
      </button>

      <button
        onClick={() => onSelectTab('categories')}
        className={`flex flex-col items-center justify-center py-1 px-3 text-[10px] font-semibold transition-colors ${
          activeTab === 'categories' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Layers className="w-4 h-4 mb-0.5" />
        <span>Categories</span>
      </button>

      <button
        onClick={() => onSelectTab('wishlist')}
        className={`relative flex flex-col items-center justify-center py-1 px-3 text-[10px] font-semibold transition-colors ${
          activeTab === 'wishlist' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Heart className="w-4 h-4 mb-0.5" />
        <span>Wishlist</span>
        {wishlistCount > 0 && (
          <span className="absolute top-0 right-2 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center font-mono">
            {wishlistCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onSelectTab('orders')}
        className={`flex flex-col items-center justify-center py-1 px-3 text-[10px] font-semibold transition-colors ${
          activeTab === 'orders' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Package className="w-4 h-4 mb-0.5" />
        <span>Orders</span>
      </button>

      <button
        onClick={() => onSelectTab('account')}
        className={`flex flex-col items-center justify-center py-1 px-3 text-[10px] font-semibold transition-colors ${
          activeTab === 'account' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <User className="w-4 h-4 mb-0.5" />
        <span>Account</span>
      </button>
    </nav>
  );
};
