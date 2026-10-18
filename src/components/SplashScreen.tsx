import React, { useEffect, useState } from 'react';
import { Logo } from './Logo.tsx';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface SplashScreenProps {
  onDismiss: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss }) => {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Check if URL has ?autostart=1
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      onDismiss();
      return;
    }

    // Auto-dismiss after 2.8 seconds
    const timer = setTimeout(() => {
      setFadingOut(true);
      setTimeout(onDismiss, 400);
    }, 2800);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleEnterNow = () => {
    setFadingOut(true);
    setTimeout(onDismiss, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-6 transition-opacity duration-300 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="max-w-md w-full flex flex-col items-center text-center">
        {/* Animated Monogram */}
        <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
          <Logo size="xl" />
        </div>

        {/* Tagline */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Shop Smart. Live Better.
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-xs">
          Premium multi-category marketplace with verified supplier fulfillment and fast national delivery.
        </p>

        {/* Value pills / features */}
        <div className="flex items-center gap-3 mt-6 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Verified Quality
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-blue-600" />
            Direct Dropship
          </span>
          <span aria-hidden="true">·</span>
          <span>100% Secure</span>
        </div>

        {/* Enter CTA */}
        <button
          onClick={handleEnterNow}
          className="mt-8 flex items-center justify-center gap-2 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span>Enter Store</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleEnterNow}
          className="mt-3 text-xs text-slate-400 hover:text-slate-600"
        >
          Skip intro
        </button>
      </div>
    </div>
  );
};
