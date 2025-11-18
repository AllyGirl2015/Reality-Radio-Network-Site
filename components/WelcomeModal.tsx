'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

export default function WelcomeModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('welcomeModalDismissed');
    if (!dismissed) {
      // Pequeno delay para carregar a página primeiro
      setTimeout(() => {
        setIsVisible(true);
      }, 500);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('welcomeModalDismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] animate-fade-in"
        onClick={handleDismiss}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-3 sm:p-4 pointer-events-none">
        <div 
          className="bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 border-2 border-purple-500/50 rounded-xl sm:rounded-2xl shadow-2xl shadow-purple-500/20 max-w-md w-full p-6 sm:p-8 pointer-events-auto animate-scale-in relative overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-purple-500/20 rounded-full blur-3xl -z-10" />
          
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close welcome message"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white" />
          </button>

          {/* Content */}
          <div className="text-center">
            <div className="mb-4 sm:mb-6 flex justify-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
              Welcome to Reality Radio Network!
            </h2>

            <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-5 sm:mb-6 leading-relaxed">
              We've completely redesigned our website to bring you a better experience. 
              Discover new music, explore our artists, and enjoy the future of sound.
            </p>

            <button
              onClick={handleDismiss}
              className="w-full btn-neon-purple py-2.5 sm:py-3 text-base sm:text-lg font-semibold"
            >
              Let's Explore!
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
