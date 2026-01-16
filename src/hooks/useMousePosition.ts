import { useEffect } from 'react';
import { useMotionValue } from 'framer-motion';

export const useMousePosition = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      x.set(ev.clientX);
      y.set(ev.clientY);
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, [x, y]);

  return { x, y };
};