import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Zap, 
  TrendingUp, 
  ArrowUpRight,
  Target
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  productivityScore: number;
  totalCourses: number;
  totalStudySessions: number;
  study_streak?: number;
  minutes_today?: number;
}

interface StatsGridProps {
  stats: DashboardStats | null;
}

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  colorClass, 
  bgClass,
  delay 
}: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="relative overflow-hidden bg-zinc-900/40 hover:bg-zinc-900/60 backdrop-blur-md rounded-[1.5rem] border border-white/5 p-5 group transition-all duration-300 hover:-translate-y-1 hover:border-white/10 shadow-lg"
  >
    {/* Background Glow Effect */}
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl ${bgClass}`} />
    
    <div className="relative z-10 flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${bgClass} ${colorClass} bg-opacity-10 border border-white/5`}>
        <Icon size={22} />
      </div>
      {subtitle && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
           <ArrowUpRight size={12} className="text-zinc-400" />
           <span className="text-[10px] font-medium text-zinc-400">{subtitle}</span>
        </div>
      )}
    </div>

    <div>
      <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
      </div>
    </div>
  </motion.div>
);

const ProductivityCard = ({ score }: { score: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.3 }}
    className="col-span-1 sm:col-span-2 lg:col-span-1 relative overflow-hidden bg-gradient-to-br from-indigo-600/20 to-indigo-900/20 backdrop-blur-md rounded-[1.5rem] border border-indigo-500/20 p-5 group"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
        <Target size={22} />
      </div>
      <div className="px-2 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/20">
        <span className="text-[10px] font-bold text-indigo-300 uppercase">Daily Goal</span>
      </div>
    </div>

    <div className="space-y-3">
      <div>
        <h3 className="text-indigo-200/60 text-xs font-semibold uppercase tracking-wider mb-1">Productivity Score</h3>
        <span className="text-3xl font-bold text-white">{Math.round(score)}%</span>
      </div>
      
      <div className="space-y-1.5">
        <Progress value={score} className="h-2 bg-indigo-950/50" />
        <p className="text-[10px] text-indigo-300/60 text-right">
          {score >= 80 ? 'Excellent focus!' : score >= 50 ? 'Good momentum' : 'Keep pushing'}
        </p>
      </div>
    </div>
  </motion.div>
);

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  if (!stats) return null;

  const hoursStudied = stats.minutes_today ? Math.round(stats.minutes_today / 60 * 10) / 10 : 0;
  const taskRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Tasks Card */}
      <StatCard 
        title="Tasks Completed"
        value={`${stats.completedTasks}/${stats.totalTasks}`}
        subtitle={`${taskRate}% Done`}
        icon={CheckCircle2}
        colorClass="text-emerald-400"
        bgClass="bg-emerald-500"
        delay={0}
      />

      {/* 2. Study Time Card */}
      <StatCard 
        title="Hours Studied"
        value={`${hoursStudied}h`}
        subtitle="Today"
        icon={Clock}
        colorClass="text-amber-400"
        bgClass="bg-amber-500"
        delay={0.1}
      />

      {/* 3. Streak/Courses Card */}
      <StatCard 
        title="Active Streak"
        value={`${stats.study_streak || 0} Days`}
        subtitle="Consistency"
        icon={Zap}
        colorClass="text-rose-400"
        bgClass="bg-rose-500"
        delay={0.2}
      />

      <ProductivityCard score={stats.productivityScore || 0} />

    </div>
  );
};

export default StatsGrid;