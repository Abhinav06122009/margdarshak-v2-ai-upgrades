
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface AnimatedTextProps {
  text: string;
  className?: string;
  animation?: 'typing' | 'fade-in' | 'slide-up' | 'bounce' | 'wave' | 'gradient';
  delay?: number;
  speed?: number;
  gradient?: boolean;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className,
  animation = 'fade-in',
  delay = 0,
  speed = 50,
  gradient = false
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const { ref, isVisible } = useScrollAnimation();

  useEffect(() => {
    if (animation === 'typing' && isVisible) {
      const timeout = setTimeout(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        }
      }, speed);

      return () => clearTimeout(timeout);
    } else if (isVisible) {
      setDisplayText(text);
    }
  }, [currentIndex, text, speed, animation, isVisible]);

  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0';
    
    switch (animation) {
      case 'typing':
        return 'animate-typing';
      case 'fade-in':
        return 'animate-fade-in-up';
      case 'slide-up':
        return 'animate-slide-up';
      case 'bounce':
        return 'animate-bounce-in';
      case 'wave':
        return 'animate-wave';
      case 'gradient':
        return 'text-gradient animate-shimmer';
      default:
        return 'animate-fade-in-up';
    }
  };

  return (
    <span
      ref={ref}
      className={cn(
        'inline-block transition-all duration-500',
        getAnimationClass(),
        gradient && 'text-gradient',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {animation === 'typing' ? displayText : text}
      {animation === 'typing' && currentIndex < text.length && (
        <span className="animate-blink">|</span>
      )}
    </span>
  );
};

interface StaggeredTextProps {
  text: string;
  className?: string;
  staggerDelay?: number;
  animation?: 'fade-in' | 'slide-up' | 'bounce' | 'rotate';
}

export const StaggeredText: React.FC<StaggeredTextProps> = ({
  text,
  className,
  staggerDelay = 100,
  animation = 'fade-in'
}) => {
  const { ref, isVisible } = useScrollAnimation();
  const words = text.split(' ');

  const getAnimationClass = () => {
    switch (animation) {
      case 'fade-in':
        return 'animate-fade-in-up';
      case 'slide-up':
        return 'animate-slide-up';
      case 'bounce':
        return 'animate-bounce-in';
      case 'rotate':
        return 'animate-rotate-in';
      default:
        return 'animate-fade-in-up';
    }
  };

  return (
    <span ref={ref} className={cn('inline-block', className)}>
      {words.map((word, index) => (
        <span
          key={index}
          className={cn(
            'inline-block mr-2',
            isVisible ? getAnimationClass() : 'opacity-0'
          )}
          style={{
            animationDelay: `${index * staggerDelay}ms`,
            animationFillMode: 'both'
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
};

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  end,
  start = 0,
  duration = 2000,
  className,
  prefix = '',
  suffix = ''
}) => {
  const [count, setCount] = useState(start);
  const { ref, isVisible } = useScrollAnimation();

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const difference = end - start;

    const updateCount = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      setCount(Math.round(start + difference * easeOutCubic));

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [isVisible, start, end, duration]);

  return (
    <span ref={ref} className={cn('inline-block', className)}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};
