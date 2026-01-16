import React from 'react';

const AnimatedGradientText = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
  return (
    <span 
      className={`bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-[length:200%_auto] bg-clip-text text-transparent ${className}`}
      style={{ animation: 'gradient 5s linear infinite' }}
    >
      {children}
    </span>
  );
};

export default AnimatedGradientText;