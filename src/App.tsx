import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { startBioTracker } from '@/security/biometrics';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CursorProvider } from '@/lib/CursorContext';
import CookieConsent from '@/components/CookieConsent';
import AdSenseScript from '@/components/AdSenseScript';
import { Button } from '@/components/ui/button';


import LandingPage from '@/pages/LandingPage';
import Index from "@/pages/Index";
import Dashboard from "@/components/dashboard/Dashboard";
import AIPage from "@/pages/AIPage";
import Upgrade from "@/pages/Upgrade";
import NotFound from "@/pages/NotFound";
import ResetPasswordPage from '@/pages/reset-password';
import AboutUsPage from '@/pages/AboutUsPage';
import ContactUsPage from '@/pages/ContactUsPage';
import HelpPage from '@/pages/HelpPage';
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";
import BlogPage from "@/pages/BlogPage";
import AdminMessages from "@/pages/AdminMessages";

// Feature Components
import Tasks from "@/components/tasks/Tasks";
import Grades from "@/components/grades/Grades";
import Attendance from "@/components/attendance/Attendance";
import Notes from "@/components/notes/Notes";
import StudyTimer from "@/components/timer/StudyTimer";
import Calculator from "@/components/calculator/Calculator";
import Calendar from "@/components/calendar/CalendarPage";
import Timetable from "@/components/timetable/Timetable";
import CourseManagement from "@/components/courses/CourseManagement";
import Syllabus from "@/components/syllabus/Syllabus";
import Settings from "@/components/settings/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// --- SEO Configuration ---
const SEO = ({ title, description }: { title: string, description: string }) => {
  const location = useLocation();
  const canonicalUrl = `https://margdarshan.tech${location.pathname === '/' ? '' : location.pathname}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
};

const metaData = {
  landing: { title: "MARGDARSHAK | Student Planner", description: "The ultimate student management system for PCMB students." },
  auth: { title: "Login | MARGDARSHAK", description: "Secure access to your student dashboard." },
  dashboard: { title: "Dashboard | MARGDARSHAK", description: "Your academic command center." },
  ai: { title: "AI Tutor | MARGDARSHAK", description: "24/7 Academic assistance." },
  upgrade: { title: "Upgrade to Pro", description: "Unlock unlimited storage and AI features." },
};

// --- Authentication Context ---
const AuthContext = createContext<{ session: Session | null; loading: boolean }>({ session: null, loading: true });

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
};

// --- Route Components ---

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate('/auth', { replace: true });
  }, [session, loading, navigate]);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white/50">Loading...</div>;
  return session ? <>{children}</> : null;
};

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="bg-black/50 border-b border-white/10 text-white p-4 sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto flex justify-between items-center">
        <div 
          className="text-lg font-bold cursor-pointer tracking-tight" 
          onClick={() => navigate('/dashboard')}
        >
          MARGDARSHAK
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/ai-chat')} className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            AI Tutor
          </button>
          <button onClick={() => supabase.auth.signOut().then(() => navigate('/auth'))} className="text-sm text-red-400 hover:text-red-300 transition-colors">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[#050505] text-white">
    <Navbar />
    <main className="container mx-auto py-8 px-4 fade-in">{children}</main>
  </div>
);

const AnimatedPage = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};


const AppContent = () => {
  const navigate = useNavigate();
  useEffect(() => {
    startBioTracker();
  }, []);
  
  return (
    <>
      <AdSenseScript />
      <AnimatedPage>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<><SEO {...metaData.landing} /><LandingPage /></>} />
          <Route path="/auth" element={<><SEO {...metaData.auth} /><Index /></>} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/blog/*" element={<BlogPage />} />
          
          {/* Public Tools */}
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/timer" element={<StudyTimer />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Layout><SEO {...metaData.dashboard} /><Dashboard onNavigate={(path) => navigate(`/${path}`)} /></Layout></ProtectedRoute>} />
          <Route path="/ai-chat" element={<ProtectedRoute><Layout><SEO {...metaData.ai} /><AIPage /></Layout></ProtectedRoute>} />
          <Route path="/upgrade" element={<ProtectedRoute><SEO {...metaData.upgrade} /><Upgrade /></ProtectedRoute>} />
          
          {/* Feature Routes */}
          <Route path="/tasks" element={<ProtectedRoute><Layout><Tasks /></Layout></ProtectedRoute>} />
          <Route path="/grades" element={<ProtectedRoute><Layout><Grades /></Layout></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><Layout><Attendance /></Layout></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><Layout><Notes /></Layout></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Layout><Calendar /></Layout></ProtectedRoute>} />
          <Route path="/timetable" element={<ProtectedRoute><Layout><Timetable /></Layout></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Layout><CourseManagement /></Layout></ProtectedRoute>} />
          <Route path="/syllabus" element={<ProtectedRoute><Layout><Syllabus /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
          <Route path="/admin/messages" element={<ProtectedRoute><Layout><AdminMessages /></Layout></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatedPage>
    </>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CursorProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
              <AppContent />
              <Toaster />
              <Sonner />
              <CookieConsent />
            </AuthProvider>
          </BrowserRouter>
        </CursorProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;