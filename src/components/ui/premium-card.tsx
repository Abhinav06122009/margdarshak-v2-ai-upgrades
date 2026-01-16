import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'neon' | 'holographic';
  hover?: 'lift' | 'glow' | 'scale' | 'rotate' | 'perspective';
  clickable?: boolean;
  onClick?: () => void;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className,
  variant = 'default',
  hover = 'lift',
  clickable = false,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    default: 'bg-transparent/10 backdrop-blur-sm border border-white/20',
    glass: 'bg-transparent/5 backdrop-blur-2xl border border-white/10 shadow-2xl',
    gradient: 'bg-transparent from-purple-500/20 via-pink-500/20 to-red-500/20 border border-white/20',
    neon: 'bg-transparent/50 border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.3)]',
    holographic: 'transparent from-purple-400/20 via-pink-400/20 to-red-400/20 border border-white/30 shadow-[0_8px_32px_rgba(31,38,135,0.37)]'
  };

  const hoverEffects = {
    lift: 'hover:-translate-y-2 hover:shadow-2xl',
    glow: 'hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]',
    scale: 'hover:scale-105',
    rotate: 'hover:rotate-1',
    perspective: 'hover:[transform:perspective(1000px)_rotateX(5deg)]'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative rounded-2xl transition-all duration-500',
        variants[variant],
        hoverEffects[hover],
        clickable && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: hover === 'scale' ? 1.05 : 1 }}
      whileTap={clickable ? { scale: 0.98 } : {}}
    >
      {variant === 'holographic' && (
        <div className="absolute inset-0 rounded-2xl bg-transparent opacity-30 blur-xl" />
      )}
      
      {variant === 'neon' && isHovered && (
        <div className="absolute inset-0 rounded-2xl bg-transparent animate-pulse" />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};