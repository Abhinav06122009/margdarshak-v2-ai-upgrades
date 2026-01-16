import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const MagneticButton = ({ children, className = '', ...props }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current && isHovering) {
        const button = ref.current.getBoundingClientRect();
        const centerX = button.left + button.width / 2;
        const centerY = button.top + button.height / 2;
        const deltaX = e.pageX - centerX;
        const deltaY = e.pageY - centerY;
        
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        const maxDistance = 100;
        const strength = 0.4;

        if (distance < maxDistance) {
          const factor = 1 - distance / maxDistance;
          x.set(deltaX * factor * strength);
          y.set(deltaY * factor * strength);
        } else {
          x.set(0);
          y.set(0);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovering, x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => { setIsHovering(false); x.set(0); y.set(0); }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default MagneticButton;