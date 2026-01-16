// src/components/ui/MagneticButton.tsx
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const MagneticButton: React.FC<MagneticButtonProps> = ({ children, className, ...rest }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x, y });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} animate={{ x: position.x * 0.1, y: position.y * 0.1 }} transition={{ type: 'spring', stiffness: 350, damping: 15, mass: 0.5 }} className={className} {...rest}>
      {children}
    </motion.button>
  );
};

export default MagneticButton;