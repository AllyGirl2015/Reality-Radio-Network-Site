'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Radio, X } from 'lucide-react';

export default function ListenNowBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner in this session
    const dismissed = sessionStorage.getItem('listenBannerDismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show banner after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('listenBannerDismissed', 'true');
  };

  if (isDismissed || !isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-500">
      <div className="bg-gradient-to-r from-purple-600 to-cyan-500 p-[2px] rounded-lg shadow-2xl shadow-purple-500/50">
        <div className="bg-black rounded-lg p-4 flex items-center gap-4">
          <div className="relative">
            <Radio className="w-10 h-10 text-purple-400" aria-hidden="true" />
            <div className="absolute inset-0 blur-lg bg-purple-400 opacity-50 animate-pulse" aria-hidden="true" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-white mb-1">🎵 Tune In Live!</h3>
            <p className="text-sm text-gray-300">Listen to 201.5 Reality Central Radio</p>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              href="/radio" 
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 whitespace-nowrap"
              aria-label="Listen to 201.5 Reality Central Radio"
            >
              Listen to 201.5 RCR
            </Link>
            
            <button
              onClick={handleDismiss}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
