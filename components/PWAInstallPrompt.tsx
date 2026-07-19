"use client";

import { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIosInstruction, setShowIosInstruction] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    
    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Fallback for iOS or already installed/incompatible
      const isIos = /ipad|iphone|ipod/.test(navigator.userAgent.toLowerCase());
      if (isIos && !isInstalled) {
        setShowIosInstruction(true);
      } else if (!isInstalled) {
        alert("To install this app, please use the 'Add to Home Screen' option in your browser menu.");
      } else {
        alert("The app is already installed on this device!");
      }
    }
  };

  if (isInstalled) return null; // Hide button if already installed

  return (
    <>
      <button 
        onClick={handleInstallClick}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all text-xs font-bold uppercase tracking-wider"
      >
        <Download size={14} />
        Install App
      </button>

      {/* iOS Manual Install Toast */}
      {showIosInstruction && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-4 border border-neutral-200 dark:border-slate-800 z-50 animate-in slide-in-from-bottom-5">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-bold text-ink">Install on iOS</h4>
            <button onClick={() => setShowIosInstruction(false)} className="text-neutral-400 hover:text-ink">
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
            Install this application on your home screen for quick and easy access when you're on the go.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold bg-neutral-100 dark:bg-slate-800 p-3 rounded-xl text-neutral-600 dark:text-neutral-300">
            1. Tap <Share size={14} className="text-blue-500 mx-1" /> (Share) 
            <br />
            2. Select <PlusSquare size={14} className="text-neutral-500 mx-1" /> Add to Home Screen
          </div>
        </div>
      )}
    </>
  );
}
