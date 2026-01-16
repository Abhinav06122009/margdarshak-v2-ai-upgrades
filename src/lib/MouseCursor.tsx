import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useMousePosition } from '@/hooks/useMousePosition';
import { CursorContext } from '@/contexts/CursorContext';

const MouseCursor = () => {
  const { x, y } = useMousePosition();
  const { cursorVariant } = useContext(CursorContext);

  const variants = {
    default: {
      height: 32,
      width: 32,
      border: '2px solid #9ca3af',
      backgroundColor: 'transparent',
      mixBlendMode: 'difference',
    },
    text: {
      height: 128,
      width: 128,
      backgroundColor: '#fff',
      mixBlendMode: 'difference',
    },
    link: {
      height: 64,
      width: 64,
      border: '2px solid #34d399',
      backgroundColor: 'rgba(52, 211, 153, 0.1)',
      mixBlendMode: 'normal',
    },
  };

  const spring = {
    type: 'spring',
    stiffness: 500,
    damping: 28,
  };

  return (
    <motion.div
      variants={variants}
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999]"
      animate={cursorVariant}
      transition={spring}
      style={{
        x: x - (variants[cursorVariant]?.width || 32) / 2,
        y: y - (variants[cursorVariant]?.height || 32) / 2,
      }}
    />
  );
};

export default MouseCursor;