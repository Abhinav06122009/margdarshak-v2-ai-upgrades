
import React, { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const animatedButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg hover:-translate-y-0.5",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:shadow-lg hover:-translate-y-0.5",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-lg hover:-translate-y-0.5",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:-translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-rainbow text-white hover:shadow-glow hover:-translate-y-1 hover:scale-105",
        glow: "bg-primary text-primary-foreground hover:shadow-glow hover:shadow-primary/50 hover:-translate-y-1",
        shimmer: "bg-gradient-to-r from-primary via-primary/80 to-primary bg-size-200 hover:bg-pos-0 animate-shimmer",
        neo: "neo-morphism hover:shadow-neo hover:-translate-y-1"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        bounce: "hover:animate-bounce-in",
        pulse: "hover:animate-pulse",
        wave: "hover:animate-wave",
        glow: "animate-pulse-glow"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none"
    },
  }
)

export interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof animatedButtonVariants> {
  asChild?: boolean
  ripple?: boolean
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant, size, animation, asChild = false, ripple = false, children, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
        `;
        
        button.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      }
      
      if (onClick) onClick(e);
    };

    return (
      <Comp
        className={cn(animatedButtonVariants({ variant, size, animation, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {variant === 'shimmer' && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        )}
        {children}
      </Comp>
    )
  }
)
AnimatedButton.displayName = "AnimatedButton"

export { AnimatedButton, animatedButtonVariants }

// Add ripple keyframe to global styles
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
