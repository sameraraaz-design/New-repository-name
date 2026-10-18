import React from 'react';
import { Logo } from './Logo.tsx';
import { ShieldCheck, Truck, RotateCcw, Headphones, Heart } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (category: string) => void;
  onOpenAccount: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenAccount }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16 border-t border-slate-800">
      {/* Trust Markers Bar */}
      <div className="border-b border-slate-800 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-blue-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">Free Express Shipping</p>
              <p className="text-slate-400 mt-0.5">On all orders above ₹999</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-blue-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">7-Day Replacement</p>
              <p className="text-slate-400 mt-0.5">Hassle-free verified returns</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-blue-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">100% Secure Payments</p>
              <p className="text-slate-400 mt-0.5">UPI, Cards, NetBanking, COD</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-blue-400 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">Dedicated Support</p>
              <p className="text-slate-400 mt-0.5">support@skirz.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
        {/* Brand Column (2 cols on md) */}
        <div className="col-span-2 space-y-4">
          <Logo size="lg" inverted showTagline />
          <p className="text-slate-400 leading-relaxed max-w-sm mt-3">
            SKIRZ is an all-in-one modern e-commerce marketplace and dropshipping platform designed to deliver premium electronics, apparel, lifestyle, and home essentials with verified quality and direct manufacturer dispatch.
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2">
            <span>Operating Currency: <strong>Indian Rupee (₹)</strong></span>
            <span aria-hidden="true">·</span>
            <span>All India Courier Logistics</span>
          </div>
        </div>

        {/* Popular Categories */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
            Departments
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <button onClick={() => onSelectCategory('electronics')} className="hover:text-white transition-colors">
                Electronics & Audio
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('watches')} className="hover:text-white transition-colors">
                Smartwatches & Chronos
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('shoes')} className="hover:text-white transition-colors">
                Athletics & Footwear
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('fashion')} className="hover:text-white transition-colors">
                Streetwear & Apparel
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('home-kitchen')} className="hover:text-white transition-colors">
                Home & Kitchen
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
            Customer Care
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <button onClick={onOpenAccount} className="hover:text-white transition-colors">
                Track Your Order
              </button>
            </li>
            <li>
              <button onClick={onOpenAccount} className="hover:text-white transition-colors">
                Return & Refund Policy
              </button>
            </li>
            <li>
              <span className="text-slate-400">Shipping & Delivery Times</span>
            </li>
            <li>
              <span className="text-slate-400">Cash on Delivery Terms</span>
            </li>
            <li>
              <span className="text-slate-400">Grievance Officer: support@skirz.com</span>
            </li>
          </ul>
        </div>

        {/* Dropshipping & Partners */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
            Partner Network
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li><span>Authorized Sourcing Partners</span></li>
            <li><span>Dropship Fulfillment Logistics</span></li>
            <li><span>Manufacturer Quality Standards</span></li>
            <li><span>Supplier Onboarding Guide</span></li>
            <li><span>Merchant Transparency Model</span></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 py-6 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 SKIRZ Inc. All rights reserved. Shop Smart. Live Better.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy Policy</span>
            <span aria-hidden="true">·</span>
            <span>Terms of Service</span>
            <span aria-hidden="true">·</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
