import React from 'react';

export const AmbientBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    {/* Noise Overlay */}
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
    
    {/* Gradient Blobs */}
    <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px]" />
    <div className="absolute -bottom-[20%] -right-[10%] w-[800px] h-[800px] bg-amber-900/10 rounded-full blur-[120px]" />
  </div>
);