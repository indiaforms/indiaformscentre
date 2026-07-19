"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function PwaManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registered:", reg))
        .catch((err) => console.error("SW registration failed:", err));
    }

    // Check if device is iOS (iPhone, iPad, iPod)
    const isIosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    
    // Check if already in standalone mode (already installed)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;

    setIsIOS(isIosDevice);

    if (!isStandalone) {
      if (isIosDevice) {
        // iOS Safari doesn't fire beforeinstallprompt, so we just show the manual button
        setIsInstallable(true);
      } else {
        // Listen for standard native prompt
        window.addEventListener("beforeinstallprompt", (e) => {
          e.preventDefault();
          setDeferredPrompt(e);
          setIsInstallable(true);
        });
      }
    }

    window.addEventListener("appinstalled", () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 8000);
    }
  };

  if (!isInstallable) return null;

  return (
    <>
      {/* Floating Install Button */}
      <button
        onClick={handleInstallClick}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-semibold text-sm tracking-wide"
      >
        <Download size={18} className="animate-bounce" />
        Install App
      </button>

      {/* iOS Manual Install Toast */}
      {showToast && (
        <div className="fixed bottom-24 left-6 z-50 max-w-xs bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-start gap-4 animate-in slide-in-from-bottom-5">
          <div className="flex-1 text-sm leading-relaxed">
            <span className="font-bold block mb-1">Install on iOS</span>
            To install this app, tap the <strong className="bg-slate-700 px-1 rounded">Share</strong> icon at the bottom of Safari and select <strong className="text-emerald-400">Add to Home Screen</strong>.
          </div>
          <button onClick={() => setShowToast(false)} className="text-slate-400 hover:text-white mt-0.5">
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
