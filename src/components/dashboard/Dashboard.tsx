import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUp, Lock, Sparkles, TrendingUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';
import { supabase } from '@/integrations/supabase/client';
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
import AIBriefingWidget from './AIBriefingWidget';
import UpgradeCard from '@/components/dashboard/UpgradeCard';
// UPDATED: Using the better chart component for Productivity Flow
import { TrendChart } from '@/components/ai/QuantumGraph'; 
import Footer from '@/components/footer/footer'; 

const GlassContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative overflow-hidden rounded-[2rem] bg-zinc-900/60 backdrop-blur-2xl border border-white/5 shadow-xl ${className}`}>
    {children}
  </div>
);

// --- LOCKED COMPONENTS ---

const LockedBriefingWidget = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-900 shadow-2xl p-8 flex flex-col items-center justify-center text-center group h-[220px]">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50" />
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-emerald-500/5 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none opacity-50" />
      
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="p-4 rounded-full bg-white/5 border border-white/10 shadow-inner-soft group-hover:scale-110 transition-transform duration-500">
          <Lock className="w-6 h-6 text-zinc-400" />
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
            Daily Briefing
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wide">
              Premium
            </span>
          </h3>
          <p className="text-zinc-500 text-sm mt-2 max-w-sm mx-auto">
            Unlock AI-powered daily study plans and personalized focus areas tailored to your schedule.
          </p>
        </div>

        <button 
          onClick={() => navigate('/upgrade')}
          className="mt-2 px-5 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-indigo-600 fill-indigo-600" />
          Upgrade to Unlock
        </button>
      </div>
    </div>
  );
};

const LockedTrendChart = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full bg-zinc-900/50 rounded-xl border border-white/5 p-6 relative overflow-hidden flex flex-col items-center justify-center text-center group">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
         <svg className="w-full h-full" viewBox="0 0 500 250" preserveAspectRatio="none">
             <path d="M0 200 C 150 200, 150 100, 250 150 C 350 200, 350 50, 500 50" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500" />
         </svg>
      </div>
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-[2px]" />

      <div className="relative z-10 flex flex-col items-center gap-3">
         <div className="p-3 rounded-full bg-white/5 border border-white/10 shadow-inner-soft group-hover:scale-110 transition-transform duration-500">
            <Lock className="w-5 h-5 text-zinc-400" />
         </div>
         <div>
            <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
              Performance Trends
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wide">
                Premium
              </span>
            </h3>
            <p className="text-zinc-500 text-xs mt-1.5 max-w-xs mx-auto">
              Visualize your learning velocity and task completion rates over time.
            </p>
         </div>
         <button 
           onClick={() => navigate('/upgrade')}
           className="mt-1 px-4 py-1.5 rounded-full bg-white text-black text-[10px] font-bold hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
         >
            <TrendingUp className="w-3 h-3 text-indigo-600" />
            Unlock Analytics
         </button>
      </div>
    </div>
  );
};

const getLast7Days = () => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d; // Return date object for formatting in chart
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
  
  // ADDED: State for Real DB Values (Role & Subscription)
  const [realSubscriptionTier, setRealSubscriptionTier] = useState<string | null>(null);
  const [realRole, setRealRole] = useState<string | null>(null);

  // FORCE FETCH: Get Role and Subscription Tier directly from DB on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser?.id) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier, role') // Fetch both columns
        .eq('id', currentUser.id)
        .single();
        
      if (!error && data) {
        setRealSubscriptionTier(data.subscription_tier);
        setRealRole(data.role); // Store the real role
      }
    };
    fetchProfileData();
  }, [currentUser?.id]);
  
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

  // FIX: Calculate Real Incomplete Count directly from active tasks
  const realIncompleteTasksCount = useMemo(() => {
    return activeTasks.filter(t => t.status !== 'completed').length;
  }, [activeTasks]);

  // FIX: Override analytics object with real calculations
  const realAnalytics = useMemo(() => {
    if (!analytics) return analytics;
    return {
      ...analytics,
      incompleteTasksCount: realIncompleteTasksCount,
      // FIXED: Use total_courses (from DB stats) instead of undefined totalCourses
      totalClasses: dashboardStats?.total_courses || analytics.totalClasses
    };
  }, [analytics, realIncompleteTasksCount, dashboardStats]);

  const hasPremiumAccess = useMemo(() => {
    const tierFromHook = currentUser?.profile?.subscription_tier;
    const effectiveTier = realSubscriptionTier || tierFromHook;
    return effectiveTier === 'premium' || effectiveTier === 'premium_elite';
  }, [currentUser, realSubscriptionTier]);

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

  // PREPARE REAL DATA FOR TREND CHART
  const trendChartData = useMemo(() => {
    const last7Days = getLast7Days();
    return last7Days.map(dateObj => {
      const dateStr = dateObj.toISOString().split('T')[0];
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }); 
      const count = activeTasks.filter(t => 
        t.status === 'completed' && t.updated_at?.startsWith(dateStr)
      ).length;

      return {
        label: dayName,
        value: count,
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
      };
    });
  }, [activeTasks]);

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

  const taskCompletionTrend = useMemo(() => {
      return trendChartData.map(d => ({ date: d.label, completed: d.value })); 
  }, [trendChartData]);

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
            realRole={realRole} // PASSED: The force-fetched role
            isOnline={isOnline}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onExport={() => handleExportData(activeTasks, dashboardStats, realAnalytics)}
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
              {hasPremiumAccess ? (
                <AIBriefingWidget 
                  user={currentUser} 
                  tasks={activeTasks}
                  analytics={realAnalytics} 
                  stats={{
                    studyStreak: stats?.study_streak || 0,
                    tasksCompleted: dashboardStats.completedTasks,
                    hoursStudied: Math.round((stats?.minutes_today || 0) / 60),
                  }}
                />
              ) : (
                <LockedBriefingWidget />
              )}
            </motion.div>

            <StatsGrid stats={dashboardStats} />
            
            <div className="h-[320px]">
              {hasPremiumAccess ? (
                <TrendChart data={trendChartData} />
              ) : (
                <LockedTrendChart />
              )}
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
                  analytics={realAnalytics} 
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