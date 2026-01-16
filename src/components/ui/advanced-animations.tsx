import React from 'react';
import { motion } from 'framer-motion';

// Staggered container for animating children
export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}> = ({ children, staggerDelay = 0.1, className }) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

// Individual stagger item
export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}> = ({ children, className, direction = 'up' }) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: 60, opacity: 0 };
      case 'down': return { y: -60, opacity: 0 };
      case 'left': return { x: 60, opacity: 0 };
      case 'right': return { x: -60, opacity: 0 };
    }
  };

  return (
    <motion.div
      className={className}
      variants={{
        hidden: getInitialPosition(),
        visible: {
          x: 0,
          y: 0,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

// Magnetic button effect
export const MagneticButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className, onClick }) => {
  return (
    <motion.button
      className={className}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
};

// Parallax scroll element
export const ParallaxElement: React.FC<{
  children: React.ReactNode;
  className?: string;
  speed?: number;
}> = ({ children, className, speed = 0.5 }) => {
  return (
    <motion.div
      className={className}
      style={{ y: 0 }}
      animate={{ y: -window.scrollY * speed }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};

// Morphing background
export const MorphingBackground: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="fixed inset-0 -z-10 overflow-hidden"
    >
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20"
        animate={{
          background: [
            "radial-gradient(circle, #667eea 0%, #764ba2 100%)",
            "radial-gradient(circle, #f093fb 0%, #f5576c 100%)",
            "radial-gradient(circle, #4facfe 0%, #00f2fe 100%)",
            "radial-gradient(circle, #667eea 0%, #764ba2 100%)"
          ],
          scale: [1, 1.2, 1.1, 1],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20"
        animate={{
          background: [
            "radial-gradient(circle, #4facfe 0%, #00f2fe 100%)",
            "radial-gradient(circle, #667eea 0%, #764ba2 100%)",
            "radial-gradient(circle, #f093fb 0%, #f5576c 100%)",
            "radial-gradient(circle, #4facfe 0%, #00f2fe 100%)"
          ],
          scale: [1.1, 1, 1.2, 1.1],
          rotate: [360, 180, 0]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};