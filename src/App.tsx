import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { supabase } from '@/integrations/supabase/client';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Session } from '@supabase/supabase-js';

// --- PAGE IMPORTS ---
import Index from "@/pages/Index"; 
import NotFound from "@/pages/NotFound";
import LandingPage from '@/pages/LandingPage';
import ResetPasswordPage from '@/pages/reset-password';
import AboutUsPage from '@/pages/AboutUsPage';
import ContactUsPage from '@/pages/ContactUsPage';
import SitemapPage from '@/pages/SitemapPage';
import FeaturesPage from '@/pages/FeaturesPage';
import TestimonialsPage from '@/pages/TestimonialsPage';
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";
import BlogPage from "@/pages/BlogPage";
import HelpPage from "@/pages/HelpPage";
import AdminMessages from "@/pages/AdminMessages";
import AIPage from "@/pages/AIPage"; 
import Upgrade from "@/pages/Upgrade"; // ✅ IMPORTED UPGRADE PAGE

// --- COMPONENT IMPORTS ---
import Dashboard from "@/components/dashboard/Dashboard";
import ProgressTracker from "@/components/progress/ProgressTracker";
import Grades from "@/components/grades/Grades";
import Attendance from "@/components/attendance/Attendance";
import Tasks from "@/components/tasks/Tasks";
import Notes from "@/components/notes/Notes";
import StudyTimer from "@/components/timer/StudyTimer";
import Calculator from "@/components/calculator/Calculator";
import Calendar from "@/components/calendar/CalendarPage";
import Timetable from "@/components/timetable/Timetable";
import CourseManagement from "@/components/courses/CourseManagement";
import Syllabus from "@/components/syllabus/Syllabus";
import Resources from "@/components/resources/Resources";
import Settings from "@/components/settings/Settings";
import { Button } from '@/components/ui/button';
import AdSenseScript from '@/components/AdSenseScript';
import CookieConsent from '@/components/CookieConsent';
import { CursorProvider } from '@/lib/CursorContext';

// --- SEO HELMET COMPONENT ---
const PageHelmet = ({ title, description }: { title: string, description: string }) => {
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

const helmetData = {
  landing: { title: "MARGDARSHAK: The Ultimate Student Planner", description: "MARGDARSHAK is the all-in-one student management system for PCMB students." },
  auth: { title: "Student Login | MARGDARSHAK", description: "Access your secure student dashboard." },
  dashboard: { title: "Student Dashboard | MARGDARSHAK", description: "Your central hub for academic progress and daily briefings." },
  aiChat: { title: "Margdarshak Tutor | Personal PCMB Assistant", description: "Get 1-on-1 academic help with Physics, Chemistry, Maths, and Biology instantly." },
  calculator: { title: "Free Online Scientific Calculator | MARGDARSHAK", description: "Advanced math functions for PCMB students." },
  timer: { title: "Free Pomodoro Study Timer | MARGDARSHAK", description: "Boost focus with custom intervals." },
  contact: { title: "Contact Us | MARGDARSHAK", description: "Support and feedback." },
  help: { title: "Help Center | MARGDARSHAK", description: "FAQs and guides." },
  upgrade: { title: "Upgrade to Pro | MARGDARSHAK", description: "Unlock premium capabilities and unlimited storage." },
  admin: { title: "Admin Inbox | MARGDARSHAK", description: "Manage contact form submissions." },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: false, refetchOnWindowFocus: false },
  },
});

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const AnimatedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial" animate="in" exit="out"
        variants={pageVariants}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// --- AUTH LOGIC ---
const AuthContext = React.createContext<{ session: Session | null; loading: boolean }>({ session: null, loading: true });

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
};

const useAuth = () => React.useContext(AuthContext);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !session) navigate('/auth', { replace: true });
  }, [session, loading, navigate]);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-emerald-500 font-mono">INITIALIZING SYSTEM...</div>;
  return session ? <>{children}</> : null;
};

// --- NAVIGATION & LAYOUT ---
const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/auth'); };

  return (
    <nav className="bg-[#080808] border-b border-white/5 text-white p-4 sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-lg font-black cursor-pointer bg-gradient-to-r from-emerald-400 to-indigo-500 bg-clip-text text-transparent" onClick={() => navigate('/dashboard')}>
          MARGDARSHAK
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-xs font-bold text-slate-400 hover:text-white">Dashboard</Button>
          <Button variant="ghost" onClick={() => navigate('/ai-chat')} className="text-xs font-bold text-emerald-400 hover:bg-emerald-500/10">Tutor</Button>
          <Button variant="destructive" onClick={handleLogout} className="text-xs bg-red-600/10 text-red-500 hover:bg-red-600/20 border-none">Logout</Button>
        </div>
      </div>
    </nav>
  );
};

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[#050505] text-white">
    <Navbar />
    <main className="container mx-auto py-6 px-4">{children}</main>
  </div>
);

// --- APP CONTENT ---
const AppContent = () => {
  const navigate = useNavigate();
  const handleNavigate = (page: string) => navigate(`/${page}`);

  return (
    <>
      <AdSenseScript />
      <AnimatedRoute>
        <Routes>
          {/* Public */}
          <Route path="/" element={<><PageHelmet title={helmetData.landing.title} description={helmetData.landing.description} /><LandingPage /></>} />
          <Route path="/auth" element={<><PageHelmet title={helmetData.auth.title} description={helmetData.auth.description} /><Index /></>} />
          <Route path="/calculator" element={<><PageHelmet title={helmetData.calculator.title} description={helmetData.calculator.description} /><Calculator /></>} />
          <Route path="/timer" element={<><PageHelmet title={helmetData.timer.title} description={helmetData.timer.description} /><StudyTimer /></>} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/blog/*" element={<BlogPage />} />

          {/* Protected AI & Dashboard */}
          <Route path="/dashboard" element={<ProtectedRoute><ProtectedLayout><PageHelmet title={helmetData.dashboard.title} description={helmetData.dashboard.description} /><Dashboard onNavigate={handleNavigate} /></ProtectedLayout></ProtectedRoute>} />
          
          <Route path="/ai-chat" element={<ProtectedRoute><ProtectedLayout><PageHelmet title={helmetData.aiChat.title} description={helmetData.aiChat.description} /><AIPage /></ProtectedLayout></ProtectedRoute>} />

          {/* ✅ UPGRADE PAGE (Protected, No Layout for Full Screen Design) */}
          <Route path="/upgrade" element={<ProtectedRoute><PageHelmet title={helmetData.upgrade.title} description={helmetData.upgrade.description} /><Upgrade /></ProtectedRoute>} />

          {/* Protected Tools */}
          <Route path="/tasks" element={<ProtectedRoute><ProtectedLayout><Tasks /></ProtectedLayout></ProtectedRoute>} />
          <Route path="/grades" element={<ProtectedRoute><ProtectedLayout><Grades /></ProtectedLayout></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><ProtectedLayout><Attendance /></ProtectedLayout></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><ProtectedLayout><Notes /></ProtectedLayout></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><ProtectedLayout><Calendar /></ProtectedLayout></ProtectedRoute>} />
          <Route path="/timetable" element={<ProtectedRoute><ProtectedLayout><Timetable /></ProtectedLayout></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><ProtectedLayout><CourseManagement /></ProtectedLayout></ProtectedRoute>} />
          <Route path="/syllabus" element={<ProtectedRoute><ProtectedLayout><Syllabus /></ProtectedLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><ProtectedLayout><Settings /></ProtectedLayout></ProtectedRoute>} />
          <Route path="/admin/messages" element={<ProtectedRoute><ProtectedLayout><AdminMessages /></ProtectedLayout></ProtectedRoute>} />

          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatedRoute>
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