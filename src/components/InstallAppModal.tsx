import React from 'react';
import {
  X,
  Download,
  Smartphone,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { Logo } from './Logo.tsx';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  onInstall: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  onInstall,
}) => {
  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const pwaBuilderUrl = `https://www.pwabuilder.com/?url=${encodeURIComponent(currentUrl)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Install SKIRZ on Mobile (Android & iOS)
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          {/* Monogram preview */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
            <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md shrink-0">
              <svg viewBox="0 0 100 100" fill="none" className="w-9 h-9">
                <path d="M20 22 H32 L40 50 H75 L84 26 H38" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M68 32 C58 24 42 26 40 38 C38 50 66 48 64 62 C62 74 46 76 34 68" stroke="#93C5FD" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="44" cy="74" r="6" fill="#BFDBFE" />
                <circle cx="72" cy="74" r="6" fill="#BFDBFE" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">SKIRZ Mobile Application</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Version 1.0 · PWA & Android WebAPK Compatible
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Clean & Lightweight (~1.2 MB)</span>
              </div>
            </div>
          </div>

          {/* Option 1: Direct Android 1-Tap Install */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                Option 1: Direct Android Install (WebAPK)
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Recommended
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              When opening SKIRZ in Google Chrome or any browser on your Android phone, Android automatically builds and installs the native <strong>WebAPK</strong> package directly into your app drawer.
            </p>

            {isInstallable ? (
              <button
                onClick={() => {
                  onInstall();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Install SKIRZ App on Device</span>
              </button>
            ) : (
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-1">
                <p className="font-semibold text-slate-800">How to install on your phone:</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-slate-600">
                  <li>Open this store link on your Android smartphone in <strong>Chrome</strong>.</li>
                  <li>Tap the <strong>3 dots (Menu)</strong> in the top right corner.</li>
                  <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>The app will install as an APK with a native home icon!</li>
                </ol>
              </div>
            )}
          </div>

          {/* Option 2: Generate Standalone .APK File */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-blue-600" />
              Option 2: Download Standalone .APK Package
            </span>
            <p className="text-slate-600 text-[11px]">
              If you require a raw standalone <code>.apk</code> package for distribution, sideloading, or testing, you can package this PWA in 1 click using Google-approved PWABuilder:
            </p>

            <a
              href={pwaBuilderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-900">Build & Download APK Package</span>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-600" />
            </a>
          </div>

          {/* Option 3: iOS iPhone / iPad instructions */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-1.5">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-slate-600" />
              iOS (iPhone / iPad) Installation
            </span>
            <p className="text-slate-600 text-[11px]">
              In Safari, tap the <strong>Share</strong> icon (box with up arrow), scroll down and tap <strong>"Add to Home Screen"</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
