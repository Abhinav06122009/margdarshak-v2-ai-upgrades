import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CursorProvider } from '@/lib/CursorContext';
import CookieConsent from '@/components/CookieConsent';

// Pages
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

// Features
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
import Resources from "@/components/resources/Resources";
import ProgressTracker from "@/components/progress/ProgressTracker";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: false } },
});

const SEO = ({ title, description }: { title: string, description: string }) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
  </Helmet>
);

const AuthContext = createContext<{ session: Session | null; loading: boolean }>({ session: null, loading: true });

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !session) navigate('/auth', { replace: true }); }, [session, loading, navigate]);
  if (loading) return <div className="h-screen bg-[#050505] flex items-center justify-center text-white/50">Loading Secure Environment...</div>;
  return session ? <>{children}</> : null;
};

// Main App Structure
const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CursorProvider>
          <BrowserRouter>
            <AuthProvider>
              <div className="bg-[#050505] min-h-screen text-white">
                <AnimatePresence mode="wait">
                  <Routes>
                    {/* --- PUBLIC ROUTES (AdSense & SEO Optimized) --- */}
                    <Route path="/" element={<><SEO title="MARGDARSHAK | Student Planner" description="The ultimate student management system." /><LandingPage /></>} />
                    <Route path="/auth" element={<Index />} />
                    
                    {/* Free Tools (Public Access for AdSense) */}
                    <Route path="/calculator" element={<Calculator onBack={() => window.history.back()} />} />
                    <Route path="/timer" element={<StudyTimer />} />
                    <Route path="/blog/*" element={<BlogPage />} />
                    
                    {/* Legal & Info */}
                    <Route path="/about" element={<AboutUsPage />} />
                    <Route path="/contact" element={<ContactUsPage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsAndConditions />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* --- PROTECTED ROUTES (Dashboard) --- */}
                    <Route path="/dashboard" element={<ProtectedRoute><SEO title="Dashboard" description="Your command center." /><Dashboard onNavigate={() => {}} /></ProtectedRoute>} />
                    <Route path="/ai-chat" element={<ProtectedRoute><SEO title="AI Tutor" description="24/7 Assistance." /><AIPage /></ProtectedRoute>} />
                    <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
                    
                    {/* Features wrapped in Layout internally */}
                    <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                    <Route path="/grades" element={<ProtectedRoute><Grades /></ProtectedRoute>} />
                    <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
                    <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
                    <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                    <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
                    <Route path="/courses" element={<ProtectedRoute><CourseManagement /></ProtectedRoute>} />
                    <Route path="/syllabus" element={<ProtectedRoute><Syllabus /></ProtectedRoute>} />
                    <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
                    <Route path="/progress" element={<ProtectedRoute><ProgressTracker /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AnimatePresence>
                <Toaster />
                <Sonner />
                <CookieConsent />
              </div>
            </AuthProvider>
          </BrowserRouter>
        </CursorProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
