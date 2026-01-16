import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Sun, Moon, Cloud } from 'lucide-react';
import { StaggeredText, CountUp } from '@/components/ui/animated-text';
import { quotes } from '@/lib/quotes';

interface WelcomeHeaderProps {
  fullName?: string;
  totalTasks: number;
  totalCourses: number;
  totalStudySessions: number;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", icon: <Sun className="w-8 h-8 text-yellow-400" /> };
  if (hour < 18) return { text: "Good Afternoon", icon: <Cloud className="w-8 h-8 text-blue-400" /> };
  if (hour < 21) return { text: "Good Evening", icon: <Moon className="w-8 h-8 text-purple-400" /> };
  return { text: "Good Night", icon: <Moon className="w-8 h-8 text-purple-400" /> };
};

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ fullName, totalTasks, totalCourses, totalStudySessions }) => {
  const { text: greetingText, icon: greetingIcon } = getGreeting();

  const motivationalQuote = useMemo(() => {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, type: 'spring' }}
      className="relative bg-black/20 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 mb-12 overflow-hidden"
      style={{ transformStyle: 'preserve-3d' }}
      whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 200, damping: 20 } }}
    >
      <div className="relative z-10">
        <motion.div
          className="flex items-center gap-4 mb-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          {greetingIcon}
          <h1 className="text-2xl font-bold text-white/90">
            {greetingText}, <span className="bg-gradient-to-br from-emerald-400 to-blue-500 bg-clip-text text-transparent">{fullName?.split(' ')[0] || 'User'}</span>
          </h1>
        </motion.div>
        
        <h2 className="text-8xl font-extrabold mb-6 tracking-tighter text-white">
          <StaggeredText 
            text="Your Dashboard"
            className="bg-gradient-to-br from-white via-neutral-200 to-purple-400 bg-clip-text text-white/10"
            staggerDelay={50}
          />
        </h2>
        
        <motion.p 
          className="text-white/80 text-2xl max-w-4xl font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, type: 'spring' }}
        >
          Your academic planner summary: 
          <span className="text-blue-400 font-medium"><CountUp end={totalTasks} /> tasks</span>, 
          <span className="text-purple-400 font-medium"><CountUp end={totalCourses} /> courses</span>, and <span className="text-emerald-400 font-medium"><CountUp end={totalStudySessions} /> study sessions</span>.
        </motion.p>

        <motion.p 
          className="text-white/60 text-lg italic mt-8 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-4 rounded-xl border border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, type: 'spring' }}
        >
          &ldquo;{motivationalQuote}&rdquo;
        </motion.p>
      </div>
    </motion.div>
  );
};

export default WelcomeHeader;