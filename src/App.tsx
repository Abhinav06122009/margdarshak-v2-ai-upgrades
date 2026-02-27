import React, { createContext, useContext, useEffect, useState, lazy, Suspense } from 'react';
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
import { AIProvider } from '@/contexts/AIContext';
import { AdminProvider, AdminContext } from '@/contexts/AdminContext';
import { SecurityProvider } from '@/contexts/SecurityContext';
import GlobalAIAssistant from '@/components/ai/GlobalAIAssistant';
import ShortcutsOverlay from '@/components/ui/ShortcutsOverlay';

// Pages - eagerly loaded (critical path)
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
import AdminAuthPage from '@/components/auth/AdminAuthPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import SecurityCenter from '@/pages/admin/SecurityCenter';
import ReportsInvestigation from '@/pages/admin/ReportsInvestigation';
import ContentModeration from '@/pages/admin/ContentModeration';
import Analytics from '@/pages/admin/Analytics';
import SupportCenter from '@/pages/admin/SupportCenter';
import AdminSettings from '@/pages/admin/AdminSettings';

// Features - eagerly loaded
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

// New AI Features - lazy loaded
const QuizGenerator = lazy(() => import('@/pages/QuizGenerator'));
const EssayHelper = lazy(() => import('@/pages/EssayHelper'));
const StudyPlanner = lazy(() => import('@/pages/StudyPlanner'));
const AIAnalytics = lazy(() => import('@/pages/AIAnalytics'));

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

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isAdmin, loading } = useContext(AdminContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && (!session || !isAdmin)) {
      navigate('/admin/login', { replace: true });
    }
  }, [session, isAdmin, loading, navigate]);

  if (loading) return <div className="h-screen bg-[#050505] flex items-center justify-center text-white/50">Verifying admin access...</div>;
  return session && isAdmin ? <>{children}</> : null;
};

const PageLoader = () => (
  <div className="h-screen bg-[#050505] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
      <span className="text-white/30 text-sm">Loading...</span>
    </div>
  </div>
);

const AIWidgetWrapper = () => {
  const { session } = useContext(AuthContext);
  if (!session) return null;
  return <GlobalAIAssistant />;
};

// Main App Structure
const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CursorProvider>
          <BrowserRouter>
            <AuthProvider>
              <AdminProvider>
                <SecurityProvider>
                  <AIProvider>
                    <div className="bg-[#050505] min-h-screen text-white">
                      <AnimatePresence mode="wait">
                        <Routes>
                      {/* --- PUBLIC ROUTES (AdSense & SEO Optimized) --- */}
                      <Route path="/" element={<><SEO title="MARGDARSHAK | AI Student Platform" description="The ultimate AI-powered student management platform with smart tutoring, quiz generator, study planner, and more." /><LandingPage /></>} />
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
                      <Route path="/dashboard" element={<ProtectedRoute><SEO title="Dashboard | MARGDARSHAK" description="Your AI-powered command center." /><Dashboard onNavigate={() => {}} /></ProtectedRoute>} />
                      <Route path="/ai-chat" element={<ProtectedRoute><SEO title="AI Tutor | MARGDARSHAK" description="24/7 AI-powered academic assistance." /><AIPage /></ProtectedRoute>} />
                      <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
                      
                      {/* Core Features */}
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
                      <Route path="/admin/login" element={<AdminAuthPage />} />
                      <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                      <Route path="/admin/users" element={<AdminProtectedRoute><UserManagement /></AdminProtectedRoute>} />
                      <Route path="/admin/security" element={<AdminProtectedRoute><SecurityCenter /></AdminProtectedRoute>} />
                      <Route path="/admin/reports" element={<AdminProtectedRoute><ReportsInvestigation /></AdminProtectedRoute>} />
                      <Route path="/admin/content" element={<AdminProtectedRoute><ContentModeration /></AdminProtectedRoute>} />
                      <Route path="/admin/analytics" element={<AdminProtectedRoute><Analytics /></AdminProtectedRoute>} />
                      <Route path="/admin/support" element={<AdminProtectedRoute><SupportCenter /></AdminProtectedRoute>} />
                      <Route path="/admin/settings" element={<AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>} />

                      {/* --- NEW AI FEATURES --- */}
                      <Route path="/quiz" element={
                        <ProtectedRoute>
                          <SEO title="Quiz Generator | MARGDARSHAK" description="AI-powered quiz generator for any subject." />
                          <Suspense fallback={<PageLoader />}>
                            <QuizGenerator />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="/essay-helper" element={
                        <ProtectedRoute>
                          <SEO title="Essay Helper | MARGDARSHAK" description="AI writing assistant for essays and academic papers." />
                          <Suspense fallback={<PageLoader />}>
                            <EssayHelper />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="/study-planner" element={
                        <ProtectedRoute>
                          <SEO title="Smart Study Planner | MARGDARSHAK" description="AI-generated personalized study schedules." />
                          <Suspense fallback={<PageLoader />}>
                            <StudyPlanner />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="/ai-analytics" element={
                        <ProtectedRoute>
                          <SEO title="AI Analytics | MARGDARSHAK" description="AI-powered insights into your academic performance." />
                          <Suspense fallback={<PageLoader />}>
                            <AIAnalytics />
                          </Suspense>
                        </ProtectedRoute>
                      } />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AnimatePresence>
                  <AIWidgetWrapper />
                  <ShortcutsOverlay />
                  <Toaster />
                  <Sonner />
                  <CookieConsent />
                </div>
              </AIProvider>
            </SecurityProvider>
          </AdminProvider>
        </AuthProvider>
      </BrowserRouter>
    </CursorProvider>
  </TooltipProvider>
</QueryClientProvider>
</HelmetProvider>
);

export default App;
