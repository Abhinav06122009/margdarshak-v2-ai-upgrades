import React, { ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const GlareEffect = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl pointer-events-none"
    style={{ transform: "translateZ(50px)" }}
  >
    <div className="absolute w-96 h-96 bg-white/10 -top-1/2 -left-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        transform: 'rotate(45deg)',
        filter: 'blur(50px)',
      }}
    />
  </motion.div>
);

export const TiltCard = ({ children, className, ...props }: { children: ReactNode, className?: string } & React.ComponentProps<typeof motion.div>) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      transition={{ type: 'spring' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};