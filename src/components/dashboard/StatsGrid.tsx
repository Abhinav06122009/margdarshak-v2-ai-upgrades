import React from 'react';
import { 
  CheckCircle2, 
  Flame, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  GraduationCap 
} from 'lucide-react';

interface StatsGridProps {
  stats: {
    completedTasks: number;
    totalTasks: number;
    studyStreak: number;
    minutesToday: number;
    productivityScore: number;
    totalCourses: number;
    activeCourses?: number;
    averageGrade?: string | number;
  } | null;
}

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  subValue, 
  colorClass, 
  bgClass 
}: { 
  icon: any, 
  label: string, 
  value: string | number, 
  subValue: string, 
  colorClass: string, 
  bgClass: string 
}) => (
  <div className={`relative overflow-hidden p-6 rounded-[1.5rem] border border-white/5 bg-[#0F0F0F] hover:bg-[#141414] transition-all duration-300 group`}>
    {/* Glow Effect */}
    <div className={`absolute top-0 right-0 w-24 h-24 ${bgClass} opacity-10 blur-[40px] group-hover:opacity-20 transition-opacity`} />
    
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${bgClass} bg-opacity-10 border border-white/5`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        {/* Optional decorative indicator */}
        <div className={`w-1.5 h-1.5 rounded-full ${bgClass}`} />
      </div>
      
      <div>
        <h3 className="text-3xl font-black text-white tracking-tight mb-1">
          {value}
        </h3>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className={`text-[10px] font-medium ${colorClass} opacity-80`}>
          {subValue}
        </p>
      </div>
    </div>
  </div>
);

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      
      {/* 1. Tasks */}
      <StatCard 
        icon={CheckCircle2}
        label="Tasks Done"
        value={stats.completedTasks}
        subValue={`${stats.completedTasks} completed today`}
        colorClass="text-emerald-400"
        bgClass="bg-emerald-500"
      />

      {/* 2. Study Streak */}
      <StatCard 
        icon={Flame}
        label="Study Streak"
        value={stats.studyStreak}
        subValue="Consecutive days"
        colorClass="text-orange-400"
        bgClass="bg-orange-500"
      />

      {/* 3. Today's Study */}
      <StatCard 
        icon={Clock}
        label="Today's Study"
        value={`${Math.round(stats.minutesToday || 0)}m`}
        subValue="Focus minutes today"
        colorClass="text-blue-400"
        bgClass="bg-blue-500"
      />

      {/* 4. Productivity */}
      <StatCard 
        icon={TrendingUp}
        label="Productivity"
        value={`${Math.round(stats.productivityScore)}%`}
        subValue="Completion rate"
        colorClass="text-purple-400"
        bgClass="bg-purple-500"
      />

      {/* 5. Active Courses */}
      <StatCard 
        icon={BookOpen}
        label="Active Courses"
        value={stats.activeCourses || stats.totalCourses || 2}
        subValue={`of ${stats.totalCourses} total courses`}
        colorClass="text-pink-400"
        bgClass="bg-pink-500"
      />

      {/* 6. Average Grade */}
      <StatCard 
        icon={GraduationCap}
        label="Average Grade"
        value={stats.averageGrade || "99.0%"}
        subValue="Across 4 subjects"
        colorClass="text-yellow-400"
        bgClass="bg-yellow-500"
      />

    </div>
  );
};

export default StatsGrid;