'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, Check } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-6xl mx-auto">
        <div className="bg-black/95 backdrop-blur-md border border-purple-500/30 rounded-lg shadow-2xl shadow-purple-500/30 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Cookie className="w-8 h-8 text-purple-400" aria-hidden="true" />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  We Value Your Privacy
                </span>
              </h3>
              
              <p className="text-gray-300 text-sm mb-3">
                We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                By clicking "Accept All", you consent to our use of cookies.
              </p>

              {showDetails && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-4 text-sm text-gray-300 space-y-2">
                  <p><strong className="text-purple-400">Essential Cookies:</strong> Required for basic site functionality (always active)</p>
                  <p><strong className="text-cyan-400">Analytics Cookies:</strong> Help us understand how you use our site</p>
                  <p><strong className="text-purple-400">Marketing Cookies:</strong> Used to show relevant content and ads</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 items-center">
                <button
                  onClick={handleAccept}
                  className="btn-neon-purple inline-flex items-center gap-2"
                  aria-label="Accept all cookies"
                >
                  <Check className="w-4 h-4" aria-hidden="true" />
                  Accept All
                </button>
                
                <button
                  onClick={handleDecline}
                  className="px-6 py-2 rounded-lg border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white transition-all duration-300"
                  aria-label="Decline optional cookies"
                >
                  Essential Only
                </button>
                
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  aria-label="Show cookie details"
                >
                  {showDetails ? 'Hide Details' : 'Learn More'}
                </button>

                <Link 
                  href="/cookies" 
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  aria-label="Read full cookie policy"
                >
                  Cookie Policy
                </Link>
                
                <Link 
                  href="/privacy" 
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  aria-label="Read privacy policy"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>

            <button
              onClick={handleDecline}
              className="flex-shrink-0 p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Close cookie banner"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
