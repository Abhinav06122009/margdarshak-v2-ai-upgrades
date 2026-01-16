import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowUp, 
  Star, 
  Sparkles, 
  ChevronRight, 
  BrainCircuit, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardData } from '@/hooks/useDashboardData';
import { handleTaskStatusUpdate, handleCreateQuickTask, handleExportData } from '@/lib/dashboardUtils';
import type { DashboardProps } from '@/types/dashboard';
import InteractiveBackground from '@/lib/InteractiveBackground';

// Components
import DashboardSkeleton from './DashboardSkeleton';
import DashboardHeader from './DashboardHeader';
import WelcomeHeader from './WelcomeHeader';
import StatsGrid from './StatsGrid'; 
import TasksPanel from './TasksPanel';
import AnalyticsPanel from './AnalyticsPanel';
import QuickActions from './QuickActions';
import SecurityPanel from './SecurityPanel';
import SmartBriefingWidget from './AIBriefingWidget'; // Renamed import
import UpgradeCard from '@/components/dashboard/UpgradeCard';

// --- STYLED COMPONENTS ---
const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative overflow-hidden rounded-[2rem] bg-[#0A0A0A]/60 backdrop-blur-2xl border border-white/5 shadow-2xl ${className}`}>
    {children}
  </div>
);

const SocialButton = ({ icon: Icon, href }: { icon: any, href: string }) => (
  <a 
    href={href} 
    className="group flex-1 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 flex justify-center items-center"
  >
    <div className="w-5 h-5 fill-current text-gray-500 group-hover:text-white transition-colors">
      {Icon}
    </div>
  </a>
);

const LinkedinLogo = () => <svg viewBox="0 0 16 16" className="fill-current"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H3.042v7.225h1.901zm-1.012-8.122c.675 0 1.092-.447 1.092-1.006-.011-.573-.417-1.006-1.08-1.006-.662 0-1.091.433-1.091 1.006 0 .559.417 1.006 1.079 1.006h.001zM13.11 13.414V9.401c0-2.15-1.146-3.15-2.678-3.15-1.235 0-1.787.683-2.096 1.166V6.169H6.435c.025.536 0 7.245 0 7.245h1.901V9.375c0-.216.015-.432.079-.586.173-.432.568-.879 1.233-.879.869 0 1.216.662 1.216 1.634v3.87h1.901z"/></svg>;
const TwitterLogo = () => <svg viewBox="0 0 24 24" className="fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
const FacebookLogo = () => <svg viewBox="0 0 24 24" className="fill-current"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z"/></svg>;

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    stats,
    recentTasks,
    analytics,
    loading,
    securityVerified,
    isOnline,
    refreshing,
    handleRefresh,
    handleCreateQuickTask,
    handleTaskStatusUpdate,
    ultimateSecurityData,
    activeThreats 
  } = useDashboardData();
  
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'name'>('date');
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeTasks = useMemo(() => recentTasks?.filter(task => !task.is_deleted) || [], [recentTasks]);

  const dashboardStats = useMemo(() => {
    if (!stats) return null;
    const completedTasks = activeTasks.filter(t => t.status === 'completed').length;
    const totalTasks = activeTasks.length;
    const productivityScore = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    return { ...stats, totalTasks, completedTasks, productivityScore };
  }, [stats, activeTasks]);

  const filteredTasks = useMemo(() => {
    if (!activeTasks) return [];
    let filtered = [...activeTasks];
    if (searchTerm) {
      filtered = filtered.filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return filtered;
  }, [activeTasks, searchTerm]);

  const taskPriorityAnalytics = useMemo(() => ({ high: 0, medium: 0, low: 0, other: 0 }), []);
  const taskCompletionTrend = useMemo(() => [], []);
  const categoryAnalytics = useMemo(() => [], []);

  if (loading || !securityVerified || !dashboardStats) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-[#030303] text-gray-300 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      <InteractiveBackground />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0 mix-blend-overlay" />
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-amber-900/10 rounded-full blur-[120px] pointer-events-none" />

      <AnimatePresence>
        {showBackToTop && (
          <motion.button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="fixed bottom-8 right-8 z-50 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-900/50 backdrop-blur-md border border-white/10" 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ y: -3 }}
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col gap-6">
          <DashboardHeader
            currentUser={currentUser}
            isOnline={isOnline}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onExport={() => handleExportData(activeTasks, dashboardStats, analytics)}
            onOpenFeatureSpotlight={() => {}}
            extraActions={null} 
          />
          <WelcomeHeader 
            fullName={currentUser.profile?.full_name} 
            totalTasks={dashboardStats.totalTasks} 
            totalCourses={dashboardStats.totalCourses} 
            totalStudySessions={dashboardStats.totalStudySessions} 
          />
        </div>

        {/* --- MAIN GRID --- */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
          
          {/* === LEFT COLUMN === */}
          <div className="xl:col-span-8 flex flex-col gap-8 min-w-0">
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <SmartBriefingWidget 
                user={currentUser} 
                tasks={activeTasks} 
                stats={{
                  studyStreak: stats?.study_streak || 0,
                  tasksCompleted: dashboardStats.completedTasks,
                  hoursStudied: Math.round((stats?.minutes_today || 0) / 60),
                }}
              />
            </motion.div>

            <StatsGrid stats={dashboardStats} />
            
            <motion.div whileHover={{ scale: 1.005 }} transition={{ duration: 0.3 }} className="flex-1">
              <GlassCard className="h-full group border-indigo-500/20 bg-gradient-to-r from-[#0F0F1A] to-[#0A0A0A] flex flex-col justify-center">
                 <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 
                 <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 max-w-xl flex-1">
                       <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                          <Zap size={12} className="fill-current" /> Advanced Learning
                       </div>
                       <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">
                          Margdarshak Smart Tutor
                       </h3>
                       <p className="text-indigo-200/60 text-base leading-relaxed">
                          Your personal intelligence hub. Ask complex PCMB doubts, generate diagrams, and get instant study plans.
                       </p>
                       <div className="pt-2">
                          <Link 
                            to="/ai-chat" 
                            className="inline-flex items-center gap-3 bg-white text-black px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                          >
                            Start Learning <ChevronRight size={16} />
                          </Link>
                       </div>
                    </div>
                    
                    <div className="relative hidden md:block">
                        <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-20 animate-pulse" />
                        <BrainCircuit className="relative w-40 h-40 text-indigo-500/30 group-hover:text-indigo-400/50 transition-all duration-700 rotate-12 group-hover:rotate-0" />
                    </div>
                 </div>
              </GlassCard>
            </motion.div>
            
            <SecurityPanel dashboardData={ultimateSecurityData} threats={activeThreats} />
          </div>

          {/* === RIGHT COLUMN (Sticky Sidebar) === */}
          <div className="xl:col-span-4 flex flex-col gap-8 h-full xl:sticky xl:top-6">
            
            <div className="w-full">
               <QuickActions stats={dashboardStats} onNavigate={onNavigate} />
            </div>

            <div className="flex-1 min-h-[500px] flex flex-col">
                <GlassCard className="flex-1 flex flex-col p-1 h-full">
                  <TasksPanel
                    tasks={activeTasks}
                    filteredTasks={filteredTasks}
                    selectedTasks={selectedTasks}
                    taskFilter={taskFilter}
                    searchTerm={searchTerm}
                    sortBy={sortBy}
                    onTaskFilterChange={setTaskFilter}
                    onSearchTermChange={setSearchTerm}
                    onSortByChange={setSortBy}
                    onSelectTask={(id) => setSelectedTasks(prev => (prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]))}
                    onStatusUpdate={handleTaskStatusUpdate}
                    onDelete={async (id) => { /* handle delete */ }}
                    onCreateQuickTask={handleCreateQuickTask}
                    onSelectAllTasks={() => setSelectedTasks(filteredTasks.map(t => t.id))}
                    onClearSelection={() => setSelectedTasks([])}
                    onBulkAction={async (action) => { /* handle bulk */ }}
                    onNavigateToTasks={() => onNavigate('tasks')}
                  />
                </GlassCard>
            </div>

            <div className="w-full">
              <GlassCard className="bg-gradient-to-br from-white/[0.03] to-transparent">
                <AnalyticsPanel 
                  analytics={analytics} 
                  tasks={activeTasks} 
                  taskPriorityAnalytics={taskPriorityAnalytics} 
                  taskCompletionTrend={taskCompletionTrend} 
                  categoryAnalytics={categoryAnalytics} 
                />
              </GlassCard>
            </div>
            
            <div className="w-full">
              <UpgradeCard />
            </div>

          </div>
        </div>

        {/* --- FOOTER --- */}
        <footer className="mt-20 pt-10 border-t border-white/5 text-center pb-8">
          <div className="flex justify-center items-center gap-6 mb-8 max-w-md mx-auto">
             <SocialButton href="#" icon={<TwitterLogo />} />
             <SocialButton href="#" icon={<FacebookLogo />} />
             <SocialButton href="#" icon={<LinkedinLogo />} />
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-[0.2em] uppercase">Margdarshak Pro</h4>
            <p className="text-xs text-gray-500 font-medium">
              Advanced Student Platform • © 2025
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-500/70 text-[10px] mt-4 font-mono">
               <ShieldCheck size={12} />
               <span>End-to-End Encrypted Environment</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Dashboard;