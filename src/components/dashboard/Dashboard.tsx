import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDashboardData } from '@/hooks/useDashboardData';
import { 
  handleTaskStatusUpdate as handleStatusUtil,
  handleCreateQuickTask as handleCreateUtil,
  handleExportData 
} from '@/lib/dashboardUtils';
import type { DashboardProps } from '@/types/dashboard';
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
import { TrendChart } from './TrendChart'; 
import Footer from '@/components/footer/footer'; 


const GlassContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative overflow-hidden rounded-[2rem] bg-zinc-900/60 backdrop-blur-2xl border border-white/5 shadow-xl ${className}`}>
    {children}
  </div>
);


const getLast7Days = () => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
};

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
    activeThreats,
    handleCreateQuickTask,
    handleTaskStatusUpdate,
    handleDeleteTask,
    handleBulkDelete
  } = useDashboardData();
  
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'name'>('date');
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
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
    
    if (taskFilter === 'pending') filtered = filtered.filter(t => t.status !== 'completed');
    if (taskFilter === 'completed') filtered = filtered.filter(t => t.status === 'completed');
    if (taskFilter === 'overdue') filtered = filtered.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed');

    if (searchTerm) {
      filtered = filtered.filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const map = { high: 3, medium: 2, low: 1 };
        return (map[b.priority as keyof typeof map] || 0) - (map[a.priority as keyof typeof map] || 0);
      }
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [activeTasks, searchTerm, taskFilter, sortBy]);

  const taskCompletionTrend = useMemo(() => {
    const days = getLast7Days();
    return days.map(date => {
      const count = activeTasks.filter(t => t.status === 'completed' && t.updated_at?.startsWith(date)).length;
      return { date, completed: count };
    });
  }, [activeTasks]);

  const trendChartData = useMemo(() => {
    if (taskCompletionTrend.every(d => d.completed === 0)) return undefined;
    return taskCompletionTrend.map((d, i) => ({ x: i + 1, y: d.completed }));
  }, [taskCompletionTrend]);

  const taskPriorityAnalytics = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0, other: 0 };
    activeTasks.forEach(t => {
      if (t.status !== 'completed') {
        const p = (t.priority?.toLowerCase() || 'other') as keyof typeof counts;
        if (counts[p] !== undefined) counts[p]++;
        else counts.other++;
      }
    });
    return counts;
  }, [activeTasks]);

  const categoryAnalytics = useMemo(() => {
    if (!analytics?.subjectBreakdown) return [];
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
    return analytics.subjectBreakdown.map((subject, index) => ({
      name: subject.subject,
      color: colors[index % colors.length],
      completionRate: Math.floor(Math.random() * 40) + 60,
      timeSpent: subject.time
    }));
  }, [analytics]);

  if (loading || !securityVerified || !dashboardStats) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      <AmbientBackground />
      
      <AnimatePresence>
        {showBackToTop && (
          <motion.button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="fixed bottom-8 right-8 z-50 p-3 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-lg border border-white/10" 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <ArrowUp className="w-5 h-5 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
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

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
          
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
            
            <div className="h-[320px]">
              <TrendChart data={trendChartData} />
            </div>

            <SmartTutorCard />
            <SecurityPanel dashboardData={ultimateSecurityData} threats={activeThreats} />
          </main>

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
                    

                    onDelete={handleDeleteTask}
                    
                    onCreateQuickTask={handleCreateQuickTask}
                    onSelectAllTasks={() => setSelectedTasks(filteredTasks.map(t => t.id))}
                    onClearSelection={() => setSelectedTasks([])}
                    
                    onBulkAction={async (action) => { 
                      if (action === 'delete') {
                        await handleBulkDelete(selectedTasks);
                        setSelectedTasks([]);
                      } else if (action === 'complete') {
                        selectedTasks.forEach(id => handleTaskStatusUpdate(id, 'completed'));
                        setSelectedTasks([]);
                      } else if (action === 'export') {
                        const selectedData = tasks.filter(t => selectedTasks.includes(t.id));
                        handleExportData(selectedData, {}, {});
                        setSelectedTasks([]);
                      }
                    }}
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

        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;