import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { dashboardService } from '@/lib/dashboardService';
import type {
  SecureUser,
  RealDashboardStats,
  RealTask,
  RealStudySession,
  RealGrade,
  RealNote,
  RealCourse,
  RealTimetableEntry,
  RealAnalytics,
} from '@/types/dashboard';
import { Plus } from 'lucide-react';

export const useDashboardData = () => {
  const [currentUser, setCurrentUser] = useState<SecureUser | null>(null);
  const [stats, setStats] = useState<RealDashboardStats>({
    totalTasks: 0, completedTasks: 0, pendingTasks: 0, inProgressTasks: 0, overdueTasks: 0,
    totalStudyTime: 0, todayStudyTime: 0, weeklyStudyTime: 0, monthlyStudyTime: 0,
    averageGrade: 0, totalGrades: 0, upcomingClasses: 0, totalNotes: 0, favoritedNotes: 0,
    totalCourses: 0, activeCourses: 0, completionRate: 0, studyStreak: 0, highPriorityTasks: 0,
    completedToday: 0, averageSessionLength: 0, bestPerformingSubject: 'None', worstPerformingSubject: 'None',
    totalStudySessions: 0, productivityScore: 0, incompleteTasksCount: 0, topGradePercentage: 0, totalClassesCount: 0
  });
  const [recentTasks, setRecentTasks] = useState<RealTask[]>([]);
  const [recentSessions, setRecentSessions] = useState<RealStudySession[]>([]);
  const [recentGrades, setRecentGrades] = useState<RealGrade[]>([]);
  const [recentNotes, setRecentNotes] = useState<RealNote[]>([]);
  const [courses, setCourses] = useState<RealCourse[]>([]);
  const [timetable, setTimetable] = useState<RealTimetableEntry[]>([]);
  const [analytics, setAnalytics] = useState<RealAnalytics>({
    dailyStudyTime: [], subjectBreakdown: [], weeklyProgress: [], monthlyTrends: [],
    gradeDistribution: [], sessionTypes: [], incompleteTasksCount: 0, topGrades: [], totalClasses: 0
  });
  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [refreshing, setRefreshing] = useState(false);

  const { toast } = useToast();
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleSecureTaskUpdate = useCallback((data: any) => {
    const { eventType, new: newData, old: oldData } = data;
    
    setRecentTasks(prev => {
      let updated = [...prev];
      const index = updated.findIndex(task => task.id === (newData?.id || oldData?.id));
      
      switch (eventType) {
        case 'INSERT':
          if (newData && index === -1) { // Prevent duplicates from optimistic updates
            updated.unshift(newData);
          }
          break;
        case 'UPDATE':
          if (index !== -1 && newData) {
            updated[index] = newData;
          }
          break;
        case 'DELETE':
          if (index !== -1) {
            updated.splice(index, 1);
          }
          break;
      }
      
      return updated.slice(0, 20);
    });

    if (eventType === 'UPDATE' && newData?.status === 'completed') {
      toast({
        title: "Task Completed! 🎉",
        description: `Great job completing "${newData.title}"`,
        className: "bg-gray-900/50 backdrop-blur-md border border-emerald-500/60 shadow-lg rounded-xl p-4 text-emerald-300 font-semibold"
      });
    }
  }, [toast]);

  const handleSecureSessionUpdate = useCallback((data: any) => {
    const { eventType, new: newData } = data;
    if (eventType === 'INSERT' && newData) {
      setRecentSessions(prev => [newData, ...prev].slice(0, 10));
      toast({
        title: "Study Session Recorded! 📚",
        description: `${Math.floor((newData.duration || 0) / 60)}h ${(newData.duration || 0) % 60}m session added`,
        className: "bg-gray-900/50 backdrop-blur-md border border-blue-500/60 shadow-lg rounded-xl p-4 text-blue-300 font-semibold",
      });
    }
  }, [toast]);

  const handleSecureGradeUpdate = useCallback((data: any) => {
    const { eventType, new: newData } = data;
    if (eventType === 'INSERT' && newData) {
      setRecentGrades(prev => [newData, ...prev].slice(0, 10));
      toast({
        title: "New Grade Added! 📊",
        description: `${newData.assignment_name}: ${(newData.percentage || 0).toFixed(1)}%`,
        className: `bg-gray-900/50 backdrop-blur-md border shadow-lg rounded-xl p-4 font-semibold ${
          (newData.percentage || 0) >= 90 ? 'border-emerald-400/50' :
          (newData.percentage || 0) >= 70 ? 'border-yellow-400/50' :
          'border-red-400/50'
        }`,
      });
    }
  }, [toast]);

  const handleSecureNoteUpdate = useCallback((data: any) => {
    const { eventType, new: newData } = data;
    if (eventType === 'INSERT' && newData) {
      setRecentNotes(prev => [newData, ...prev].slice(0, 10));
    }
  }, []);

  const initializeDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const user = await dashboardService.getCurrentUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access your dashboard.",
          className: "bg-gray-900/50 backdrop-blur-md border border-red-500/60 shadow-lg rounded-xl p-4 text-red-300 font-semibold",
        });
        setSecurityVerified(true);
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      setSecurityVerified(true);
      
      const userData = await dashboardService.fetchAllUserData(user.id);
      const analyticsData = await dashboardService.calculateSecureAnalytics(user.id);

      if (userData.errors && userData.errors.length > 0) {
        console.error('Some data failed to load:', userData.errors);
        toast({
          title: "Partial Data Load",
          description: "Some data may not be fully loaded. This is normal for new users.",
          className: "bg-gray-900/50 backdrop-blur-md border border-yellow-500/60 shadow-lg rounded-xl p-4 text-yellow-300 font-semibold"
        });
      }

      const secureStats = dashboardService.calculateSecureStats(userData);
      
      setStats(secureStats);
      setRecentTasks(Array.isArray(userData.tasks) ? userData.tasks.slice(0, 20) : []);
      setRecentSessions(Array.isArray(userData.studySessions) ? userData.studySessions.slice(0, 10) : []);
      setRecentGrades(Array.isArray(userData.grades) ? userData.grades.slice(0, 10) : []);
      setRecentNotes(Array.isArray(userData.notes) ? userData.notes.slice(0, 10) : []);
      setCourses(Array.isArray(userData.courses) ? userData.courses : []);
      setTimetable(Array.isArray(userData.timetable) ? userData.timetable : []);
      setAnalytics(analyticsData);

      if (unsubscribeRef.current) unsubscribeRef.current();
      
      unsubscribeRef.current = dashboardService.setupSecureRealTimeSubscription(
        user.id,
        {
          onTaskUpdate: handleSecureTaskUpdate,
          onSessionUpdate: handleSecureSessionUpdate,
          onGradeUpdate: handleSecureGradeUpdate,
          onNoteUpdate: handleSecureNoteUpdate
        }
      );

      toast({
        title: "Dashboard Loaded Successfully! 🔒",
        description: `Welcome back, ${user.profile?.full_name}! Your secure data is loaded.`,
        className: "bg-gray-900/50 backdrop-blur-md border border-emerald-500/60 shadow-lg rounded-xl p-4 text-emerald-300 font-semibold"
      });

    } catch (error) {
      console.error('Error initializing dashboard:', error);
      toast({
        title: "Dashboard Load Error",
        description: `Failed to load dashboard data. ${retryCountRef.current < maxRetries ? 'Retrying...' : 'Please refresh the page.'}`,
        className: "bg-gray-900/50 backdrop-blur-md border border-red-500/60 shadow-lg rounded-xl p-4 text-red-300 font-semibold"
      });
      
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setTimeout(initializeDashboard, 2000 * retryCountRef.current);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast, handleSecureTaskUpdate, handleSecureSessionUpdate, handleSecureGradeUpdate, handleSecureNoteUpdate]);

  useEffect(() => {
    let isMounted = true;

    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    const handleOfflineStatus = () => setIsOnline(false);

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);

    if (isMounted) {
      initializeDashboard();
    }

    return () => {
      isMounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, [initializeDashboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await initializeDashboard();
  };

  const handleCreateQuickTask = async () => {
    if (!currentUser) return;
    try {
      const newTask = await dashboardService.createQuickTask(currentUser.id);
      setRecentTasks(prev => [newTask, ...prev]); // Instantly update UI
      toast({
        title: "Task Created ✅",
        description: "New task has been added to your list.",
        className: "bg-gray-900/50 backdrop-blur-md border border-emerald-500/60 shadow-lg rounded-xl p-4 text-emerald-300 font-semibold flex items-center space-x-3",
        icon: React.createElement(Plus, { className: "w-5 h-5 text-emerald-400" }),
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    if (!currentUser) return;
    
    const originalTask = recentTasks.find(task => task.id === taskId);
    if (!originalTask) return;

    setRecentTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus as any } : task
      )
    );

    try {
      await dashboardService.updateTaskStatus(taskId, newStatus, currentUser.id);
      toast({
        title: "Task Updated ✅",
        description: `Task marked as ${newStatus}`,
        className: "bg-gray-900/50 backdrop-blur-md border border-emerald-500/60 shadow-lg rounded-xl p-4 text-emerald-300 font-semibold",
      });
    } catch (error) {
      setRecentTasks(prev => 
        prev.map(task => 
          task.id === taskId ? originalTask : task
        )
      );
      toast({
        title: "Update Failed",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  return {
    currentUser,
    stats,
    recentTasks,
    setRecentTasks,
    recentSessions,
    recentGrades,
    recentNotes,
    courses,
    timetable,
    analytics,
    loading,
    securityVerified,
    isOnline,
    refreshing,
    handleRefresh,
    handleCreateQuickTask,
    handleTaskStatusUpdate,
  };
};