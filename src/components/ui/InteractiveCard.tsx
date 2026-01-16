import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({ children, className, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setMouseX(e.clientX - rect.left);
        setMouseY(e.clientY - rect.top);
      }
    };

    const currentRef = cardRef.current;
    currentRef?.addEventListener('mousemove', handleMouseMove);

    return () => {
      currentRef?.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const rotateX = isHovering ? (mouseY / (cardRef.current?.offsetHeight || 1) - 0.5) * -20 : 0;
  const rotateY = isHovering ? (mouseX / (cardRef.current?.offsetWidth || 1) - 0.5) * 20 : 0;

  return (
    <motion.div
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative p-6 rounded-3xl overflow-hidden transition-all duration-300 ease-out shadow-lg ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-lg border border-white/10 rounded-3xl"
        style={{
          background: `
            radial-gradient(
              circle at ${mouseX}px ${mouseY}px,
              rgba(255, 255, 255, 0.1),
              rgba(0, 0, 0, 0.4)
            )
          `,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default InteractiveCard;