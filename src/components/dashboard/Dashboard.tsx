import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Hooks & Utils
import { useDashboardData } from '@/hooks/useDashboardData';
import { 
  handleTaskStatusUpdate, 
  handleCreateQuickTask, 
  handleExportData 
} from '@/lib/dashboardUtils';
import type { DashboardProps } from '@/types/dashboard';

// Layout & UI Components
import { AmbientBackground } from '@/components/ui/AmbientBackground'; 
import { SmartTutorCard } from './SmartTutorCard'; 
import DashboardSkeleton from './DashboardSkeleton';
import DashboardHeader from './DashboardHeader';
import WelcomeHeader from './WelcomeHeader';
import StatsGrid from './StatsGrid'; 
import TasksPanel from './TasksPanel';
import AnalyticsPanel from './AnalyticsPanel';
import QuickActions from './QuickActions';
import SecurityPanel from './SecurityPanel';
import SmartBriefingWidget from './AIBriefingWidget';
import UpgradeCard from '@/components/dashboard/UpgradeCard';

// --- CORRECT FOOTER IMPORT ---
import Footer from '@/components/footer/footer'; 

// Local UI Helper
const GlassContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative overflow-hidden rounded-[2rem] bg-zinc-900/60 backdrop-blur-2xl border border-white/5 shadow-xl ${className}`}>
    {children}
  </div>
);

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
    ultimateSecurityData,
    activeThreats 
  } = useDashboardData();
  
  // Local State
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'name'>('date');
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // Scroll Listener for "Back to Top" button
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Derived State (Memoized) ---
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

  // Placeholders for future analytics implementation
  const taskPriorityAnalytics = useMemo(() => ({ high: 0, medium: 0, low: 0, other: 0 }), []);
  const taskCompletionTrend = useMemo(() => [], []);
  const categoryAnalytics = useMemo(() => [], []);

  if (loading || !securityVerified || !dashboardStats) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      
      {/* 1. Global Background Layer */}
      <AmbientBackground />

      {/* 2. Floating Action Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="fixed bottom-8 right-8 z-50 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg border border-white/10" 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ y: -3 }}
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 3. Main Dashboard Layout */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Region */}
        <header className="flex flex-col gap-6">
          <DashboardHeader
            currentUser={currentUser}
            isOnline={isOnline}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onExport={() => handleExportData(activeTasks, dashboardStats, analytics)}
            onOpenFeatureSpotlight={() => {}}
          />
          <WelcomeHeader 
            fullName={currentUser.profile?.full_name} 
            totalTasks={dashboardStats.totalTasks} 
            totalCourses={dashboardStats.totalCourses} 
            totalStudySessions={dashboardStats.totalStudySessions} 
          />
        </header>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Content Column */}
          <main className="xl:col-span-8 flex flex-col gap-8 min-w-0">
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
            <SmartTutorCard />
            <SecurityPanel dashboardData={ultimateSecurityData} threats={activeThreats} />
          </main>

          {/* Sidebar Column (Sticky on Desktop) */}
          <aside className="xl:col-span-4 flex flex-col gap-8 h-full xl:sticky xl:top-6">
            <div className="w-full">
               <QuickActions stats={dashboardStats} onNavigate={onNavigate} />
            </div>

            <div className="flex-1 min-h-[500px] flex flex-col">
                <GlassContainer className="flex-1 flex flex-col p-1 h-full">
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
                    onDelete={async (id) => { /* implementation pending */ }}
                    onCreateQuickTask={handleCreateQuickTask}
                    onSelectAllTasks={() => setSelectedTasks(filteredTasks.map(t => t.id))}
                    onClearSelection={() => setSelectedTasks([])}
                    onBulkAction={async (action) => { /* implementation pending */ }}
                    onNavigateToTasks={() => onNavigate('tasks')}
                  />
                </GlassContainer>
            </div>

            <div className="w-full">
              <GlassContainer className="bg-gradient-to-br from-white/[0.03] to-transparent">
                <AnalyticsPanel 
                  analytics={analytics} 
                  tasks={activeTasks} 
                  taskPriorityAnalytics={taskPriorityAnalytics} 
                  taskCompletionTrend={taskCompletionTrend} 
                  categoryAnalytics={categoryAnalytics} 
                />
              </GlassContainer>
            </div>
            
            <UpgradeCard />
          </aside>
        </div>

        {/* Footer Section */}
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;