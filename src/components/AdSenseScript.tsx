import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AdSenseScript = () => {
  const location = useLocation();

  // Define strictly public paths where ads are allowed
  const allowedPaths = [
    '/calculator',
    '/timer',
    '/features',
    '/testimonials',
    '/about',
    '/privacy',
    '/terms',
    '/blog'
  ];

  // Logic: Allow if it matches a public path OR if it is exactly the homepage ('/')
  const isAllowed = 
    location.pathname === '/' || 
    allowedPaths.some(path => location.pathname.startsWith(path));

  useEffect(() => {
    if (!isAllowed) return;

    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      try {
        const script = document.createElement('script');
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3982840732098678";
        script.async = true;
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
      } catch (e) {
        console.error("AdSense failed to load", e);
      }
    }
  }, [location, isAllowed]);

  return null;
};

export default AdSenseScript;
