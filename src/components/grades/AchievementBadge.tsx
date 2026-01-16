
import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';
import type { Achievement } from './achievements';

interface AchievementBadgeProps {
  achievement: Achievement;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement }) => {
  return (
    <motion.div
      className={`relative p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all duration-300 ${achievement.unlocked ? 'border-yellow-400 bg-yellow-400/10' : 'border-white/20 bg-black/20'}`}
      whileHover={{ scale: 1.05 }}
    >
      {achievement.unlocked ? (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="text-5xl mb-2"
        >
          {achievement.icon}
        </motion.div>
      ) : (
        <div className="text-5xl mb-2 text-white/30">{achievement.icon}</div>
      )}
      <h3 className={`font-bold text-lg ${achievement.unlocked ? 'text-yellow-300' : 'text-white/70'}`}>
        {achievement.name}
      </h3>
      <p className="text-sm text-white/60">{achievement.description}</p>
      {achievement.unlocked ? (
        <div className="absolute top-2 right-2 text-yellow-400">
          <Unlock className="w-4 h-4" />
        </div>
      ) : (
        <div className="absolute top-2 right-2 text-white/30">
          <Lock className="w-4 h-4" />
        </div>
      )}
    </motion.div>
  );
};

export default AchievementBadge;
