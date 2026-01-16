import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('margdarshan-cookie-consent');
    if (!consent) {
      // Show banner after a small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('margdarshan-cookie-consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom-10 duration-500">
      <div className="max-w-6xl mx-auto bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-white font-semibold mb-1">We value your privacy</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            We use cookies to enhance your browsing experience, serve personalized ads, and analyze our traffic. 
            By clicking "Accept", you consent to our use of cookies. Read our{' '}
            <Link to="/privacy" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors">
              Privacy Policy
            </Link>.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button 
            onClick={() => setIsVisible(false)}
            variant="outline" 
            className="flex-1 md:flex-none border-white/20 text-gray-300 hover:text-white hover:bg-white/10"
          >
            Decline
          </Button>
          <Button 
            onClick={acceptCookies}
            className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-white font-medium min-w-[120px]"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
