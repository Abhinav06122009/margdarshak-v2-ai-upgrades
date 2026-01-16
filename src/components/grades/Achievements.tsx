
import React from 'react';
import { motion } from 'framer-motion';
import AchievementBadge from './AchievementBadge';
import type { Achievement } from './achievements';

interface AchievementsProps {
  achievements: Achievement[];
}

const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <div className="mt-8">
      <motion.h2 
        className="text-2xl font-bold text-white mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Achievements
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {unlockedAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AchievementBadge achievement={achievement} />
          </motion.div>
        ))}
        {lockedAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (unlockedAchievements.length + index) * 0.1 }}
          >
            <AchievementBadge achievement={achievement} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
