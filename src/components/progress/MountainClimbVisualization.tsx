// src/components/progress/MountainClimbVisualization.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Mountain, Flag } from 'lucide-react';

interface MountainClimbVisualizationProps {
  progress: number; // 0-100
}

const MountainClimbVisualization: React.FC<MountainClimbVisualizationProps> = ({ progress }) => {
  const path = "M0,100 C40,100 60,30 100,30 C140,30 160,80 200,80 C240,80 260,20 300,20";
  const pathLength = 350; // Approximate length of the path

  return (
    <div className="w-full h-24 relative overflow-hidden rounded-lg bg-gradient-to-b from-blue-900/30 to-purple-900/50">
      {/* Sun */}
      <motion.div
        className="absolute w-8 h-8 bg-yellow-300 rounded-full"
        style={{ top: '15%', left: '75%' }}
        animate={{
          scale: [1, 1.1, 1],
          boxShadow: ['0 0 10px #fde047', '0 0 20px #fde047', '0 0 10px #fde047'],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Mountain Path SVG */}
      <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none" className="absolute bottom-0 left-0">
        <motion.path
          d={path}
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeOpacity="0.3"
          strokeDasharray="5 5"
        />
        <motion.path
          d={path}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          initial={{ strokeDashoffset: pathLength }}
          animate={{ strokeDashoffset: pathLength - (progress / 100) * pathLength }}
          transition={{ duration: 1.5, ease: 'circOut' }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38ef7d" />
            <stop offset="100%" stopColor="#11998e" />
          </linearGradient>
        </defs>

        {/* Climber Icon */}
        <motion.g
          style={{ offsetPath: `path('${path}')` }}
          initial={{ offsetDistance: '0%' }}
          animate={{ offsetDistance: `${progress}%` }}
          transition={{ duration: 1.5, ease: 'circOut' }}
        >
          <Mountain className="text-white" width="16" height="16" />
        </motion.g>

        {/* Flag at the end */}
        <Flag className="text-green-400" width="14" height="14" x="290" y="5" />
      </svg>
    </div>
  );
};

export default MountainClimbVisualization;