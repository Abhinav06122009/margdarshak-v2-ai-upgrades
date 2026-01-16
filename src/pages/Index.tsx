import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthPageWrapper from '@/components/auth/AuthPage';
import Dashboard from '@/components/dashboard/Dashboard';
import Settings from '@/components/settings/Settings';
import Timetable from '@/components/timetable/Timetable';
import Tasks from '@/components/tasks/Tasks';
import StudyTimer from '@/components/timer/StudyTimer';
import Calculator from '@/components/calculator/Calculator';
import Notes from '@/components/notes/Notes';
import Grades from '@/components/grades/Grades';
import Syllabus from '@/components/syllabus/Syllabus';
import Resources from '@/components/resources/Resources';
import Attendance from '@/components/attendance/Attendance';
import CourseManagement from '@/components/courses/CourseManagement';
import ProgressTracker from '@/components/progress/ProgressTracker'; // ✅ Add Progress Tracker import
import { FloatingNav } from '@/components/ui/floating-nav';
import { NotificationSystem, useNotifications } from '@/components/ui/notification-system';
import { motion, AnimatePresence } from 'framer-motion';

// Import Legal Pages
import PrivacyPolicy from '@/components/legal/PrivacyPolicy';
import TermsAndConditions from '@/components/legal/TermsAndConditions';
import UpgradePage from './UpgradePage';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const { notifications, addNotification, removeNotification } = useNotifications();

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Starting auth initialization...');

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (!isMounted) return;

          console.log('Auth state changed:', event, !!session);
          setIsAuthenticated(!!session);

          if (session && event === 'SIGNED_IN') {
            addNotification({
              type: 'success',
              title: 'Welcome!',
              message: 'Successfully logged in',
              duration: 3000
            });
          }
        });

        // Check current session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth timeout')), 5000)
        );

        try {
          const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;

          if (!isMounted) return;

          if (error) {
            console.error('Session error:', error);
          } else {
            console.log('Initial session check:', !!session);
            setIsAuthenticated(!!session);
          }
        } catch (timeoutError) {
          console.warn('Auth check timed out, proceeding without auth');
          setIsAuthenticated(false);
        }

        setAuthChecked(true);
        setLoading(false);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setAuthChecked(true);
          setLoading(false);
          setIsAuthenticated(false);
        }
      }
    };

    const cleanup = initializeAuth();

    // Fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      if (!authChecked && isMounted) {
        console.warn('Auth check fallback triggered');
        setAuthChecked(true);
        setLoading(false);
        setIsAuthenticated(false);
      }
    }, 8000);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeout);
      cleanup?.then(cleanupFn => cleanupFn?.());
    };
  }, [addNotification]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    addNotification({
      type: 'success',
      title: 'Login Successful!',
      message: 'Welcome to MARGDARSHAK Student Planner',
      duration: 4000
    });
  };

  const handleNavigation = (page: string) => {
    if (page === currentPage) return;
    console.log('Navigating to:', page);
    setCurrentPage(page);
    
    // ✅ Add notification for Progress Tracker navigation
    if (page === 'progress') {
      addNotification({
        type: 'info',
        title: 'Progress Tracker',
        message: 'Track your goals and achievements',
        duration: 2000
      });
    }
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  // Loading state with timeout protection
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Loading MARGDARSHAK</h2>
            <p className="text-sm text-white/80">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  // Auth page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <AuthPageWrapper onLogin={handleLogin} />
        <NotificationSystem
          notifications={notifications}
          onRemove={removeNotification}
        />
      </div>
    );
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransitions = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3
  };

  const renderPage = () => {
    try {
      switch (currentPage) {
        case 'courses':
          return <CourseManagement />;
        case 'timetable':
          return <Timetable onBack={handleBackToDashboard} />;
        case 'tasks':
          return <Tasks onBack={handleBackToDashboard} />;
        case 'timer':
          return <StudyTimer onBack={handleBackToDashboard} />;
        case 'calculator':
          return <Calculator onBack={handleBackToDashboard} />;
        case 'notes':
          return <Notes onBack={handleBackToDashboard} />;
        case 'grades':
          return <Grades onBack={handleBackToDashboard} />;
        case 'attendance':
          return <Attendance onBack={handleBackToDashboard} />;
        case 'progress': // ✅ Add Progress Tracker case
          return <ProgressTracker onBack={handleBackToDashboard} />;
        case 'syllabus':
          return <Syllabus onBack={handleBackToDashboard} />;
        case 'resources':
          return <Resources onBack={handleBackToDashboard} />;
        case 'privacy':
          return <PrivacyPolicy onBack={handleBackToDashboard} />;
        case 'terms':
          return <TermsAndConditions onBack={handleBackToDashboard} />;
        case 'settings':
          return <Settings onBack={handleBackToDashboard} />;
        case 'upgrade':
          return <UpgradePage onBack={handleBackToDashboard} />;
        default:
          return <Dashboard onNavigate={handleNavigation} />;
      }
    } catch (error) {
      console.error('Page render error:', error);
      return (
        <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center p-6">
          <div className="glass-morphism rounded-lg p-8 shadow-lg max-w-md w-full text-center">
            <div className="text-red-400 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">Page Error</h1>
            <p className="text-white/80 mb-6">Something went wrong loading this page</p>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="bg-gradient-button-primary text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-cosmic"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransitions}
          className="relative z-10"
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      <FloatingNav
        onNavigate={handleNavigation}
        currentPage={currentPage}
      />

      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />
    </motion.div>
  );
};

export default Index;