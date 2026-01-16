import React from 'react';
import { motion, useTransform } from 'framer-motion';
import { useMousePosition } from '@/hooks/useMousePosition';
import AuroraBackground from './AuroraBackground';

const ParallaxBackground = () => {
  const { x, y } = useMousePosition();
  const xOffset = useTransform(x, value => (value - window.innerWidth / 2) / 40);
  const yOffset = useTransform(y, value => (value - window.innerHeight / 2) / 40);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 -z-20"
      style={{ x: xOffset, y: yOffset }}
    >
      <AuroraBackground />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2032%22%20width%3D%2232%22%20height%3D%2232%22%20fill%3D%22none%22%20stroke%3D%22rgb(255%20255%20255%20%2F%200.05)%22%3E%3Cpath%20d%3D%22M0%20.5H31.5V32%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
    </motion.div>
  );
};

export default ParallaxBackground;