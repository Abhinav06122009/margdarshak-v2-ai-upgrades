
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useScrollAnimation, useMouseParallax } from '@/hooks/useScrollAnimation';

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'neo' | 'gradient';
  animation?: 'fade-up' | 'slide-up' | 'zoom-in' | 'rotate-in' | 'flip-in';
  delay?: number;
  hover?: 'lift' | 'scale' | 'glow' | 'rotate' | 'none';
  parallax?: boolean;
  children: React.ReactNode;
}

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ 
    className, 
    variant = 'default', 
    animation = 'fade-up', 
    delay = 0,
    hover = 'lift',
    parallax = false,
    children, 
    ...props 
  }, ref) => {
    const { ref: scrollRef, isVisible } = useScrollAnimation();
    const { ref: parallaxRef, position } = useMouseParallax(0.1);

    const variants = {
      default: 'bg-card text-card-foreground border border-border',
      glass: 'glass-morphism text-white border-white/20',
      neo: 'neo-morphism',
      gradient: 'bg-transparent text-white border-transparent'
    };

    const animations = {
      'fade-up': 'animate-fade-in-up',
      'slide-up': 'animate-slide-up',
      'zoom-in': 'animate-zoom-in',
      'rotate-in': 'animate-rotate-in',
      'flip-in': 'animate-flip-in'
    };

    const hoverEffects = {
      lift: 'hover-lift',
      scale: 'hover-scale',
      glow: 'hover-glow',
      rotate: 'hover-rotate',
      none: ''
    };

    const combinedRef = (element: HTMLDivElement) => {
      if (scrollRef) scrollRef.current = element;
      if (parallaxRef) parallaxRef.current = element;
      if (ref) {
        if (typeof ref === 'function') ref(element);
        else ref.current = element;
      }
    };

    return (
      <div
        ref={combinedRef}
        className={cn(
          'rounded-lg shadow-lg transition-all duration-500',
          variants[variant],
          isVisible ? animations[animation] : 'opacity-0',
          hoverEffects[hover],
          className
        )}
        style={{
          animationDelay: `${delay}ms`,
          transform: parallax ? `translate3d(${position.x}px, ${position.y}px, 0)` : undefined,
          transition: parallax ? 'transform 0.1s ease-out' : undefined
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

export { AnimatedCard };
