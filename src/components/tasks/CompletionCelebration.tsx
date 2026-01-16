// src/components/tasks/CompletionCelebration.tsx
import React from 'react';
import { motion } from 'framer-motion';

const CompletionCelebration = () => {
  const numParticles = 50;
  const particles = Array.from({ length: numParticles });
  const colors = ['#fde047', '#f97316', '#22c55e', '#3b82f6', '#ec4899'];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((_, i) => {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = 0.6 + Math.random() * 0.8;
        const delay = Math.random() * 0.2;
        const color = colors[i % colors.length];

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: [0, -100 - Math.random() * 100],
              x: (Math.random() - 0.5) * 200,
              scale: [0, 1 + Math.random(), 0],
            }}
            transition={{ duration, delay, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: `${y}%`,
              left: `${x}%`,
              width: `${5 + Math.random() * 5}px`,
              height: `${5 + Math.random() * 5}px`,
              backgroundColor: color,
              borderRadius: '50%',
            }}
          />
        );
      })}
    </div>
  );
};

export default CompletionCelebration;