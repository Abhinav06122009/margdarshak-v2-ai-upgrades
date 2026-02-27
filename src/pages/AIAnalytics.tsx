import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, BrainCircuit, TrendingUp, Target, Lightbulb, ArrowLeft, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { modelRouter } from '@/lib/ai/modelRouter';
import { useAI } from '@/contexts/AIContext';
import cacheService from '@/lib/ai/cacheService';

interface InsightCard {
  title: string;
  insight: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

interface Analytics {
  taskCompletionRate: number;
  totalTasks: number;
  completedTasks: number;
  avgGrade: number;
  totalGrades: number;
  studyStreak: number;
  coursesEnrolled: number;
}

const priorityColors = {
  high: 'border-red-500/30 bg-red-500/5',
  medium: 'border-amber-500/30 bg-amber-500/5',
  low: 'border-emerald-500/30 bg-emerald-500/5',
};

const priorityBadge = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const AIAnalytics: React.FC = () => {
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const { isPremium, isAIReady } = useAI();

  const fetchAnalytics = async (): Promise<Analytics> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { taskCompletionRate: 0, totalTasks: 0, completedTasks: 0, avgGrade: 0, totalGrades: 0, studyStreak: 0, coursesEnrolled: 0 };

    const [tasksResult, gradesResult, profileResult, coursesResult] = await Promise.allSettled([
      supabase.from('tasks').select('status').eq('user_id', user.id).eq('is_deleted', false),
      supabase.from('grades').select('grade, total_points').eq('user_id', user.id),
      supabase.from('profiles').select('study_streak').eq('id', user.id).single(),
      supabase.from('courses').select('id').eq('user_id', user.id),
    ]);

    const tasks = tasksResult.status === 'fulfilled' ? tasksResult.value.data || [] : [];
    const grades = gradesResult.status === 'fulfilled' ? gradesResult.value.data || [] : [];
    const profile = profileResult.status === 'fulfilled' ? profileResult.value.data : null;
    const courses = coursesResult.status === 'fulfilled' ? coursesResult.value.data || [] : [];

    const completed = tasks.filter((t: any) => t.status === 'completed').length;
    const avgGrade = grades.length > 0
      ? grades.reduce((sum: number, g: any) => sum + (g.grade / g.total_points) * 100, 0) / grades.length
      : 0;

    return {
      taskCompletionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
      totalTasks: tasks.length,
      completedTasks: completed,
      avgGrade: Math.round(avgGrade),
      totalGrades: grades.length,
      studyStreak: profile?.study_streak || 0,
      coursesEnrolled: courses.length,
    };
  };

  const generateInsights = async (data: Analytics, force = false) => {
    const cacheKey = cacheService.buildKey('analytics_insights', JSON.stringify(data));
    if (!force) {
      const cached = cacheService.get(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setInsights(parsed);
          return;
        } catch { /* ignore */ }
      }
    }

    if (!isAIReady) return;

    setGeneratingInsights(true);

    const prompt = `Analyze this student's academic data and generate 4 actionable insights:

Data:
- Task Completion Rate: ${data.taskCompletionRate}%
- Total Tasks: ${data.totalTasks} (${data.completedTasks} completed)
- Average Grade: ${data.avgGrade}%
- Total Grades Recorded: ${data.totalGrades}
- Study Streak: ${data.studyStreak} days
- Courses Enrolled: ${data.coursesEnrolled}

Generate 4 insights. Return ONLY valid JSON array:
[
  {
    "title": "Insight Title",
    "insight": "What this data tells us (1-2 sentences)",
    "recommendation": "Specific actionable advice (1-2 sentences)",
    "priority": "high|medium|low",
    "icon": "📊"
  }
]

Make insights specific, encouraging, and actionable. Use emojis for icons.`;

    try {
      const result = await modelRouter.generateJSON<InsightCard[]>(prompt);
      if (result && Array.isArray(result)) {
        setInsights(result);
        cacheService.set(cacheKey, JSON.stringify(result), 60 * 60 * 1000);
      }
    } catch {
      setInsights([{
        title: 'Keep Building Momentum',
        insight: 'Your academic data shows you are actively tracking your progress.',
        recommendation: 'Continue logging your grades and completing tasks consistently to see AI-powered trends.',
        priority: 'medium',
        icon: '📈',
      }]);
    } finally {
      setGeneratingInsights(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const data = await fetchAnalytics();
        setAnalytics(data);
        await generateInsights(data);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const statCards = analytics ? [
    { label: 'Task Completion', value: `${analytics.taskCompletionRate}%`, sub: `${analytics.completedTasks}/${analytics.totalTasks} tasks`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Average Grade', value: `${analytics.avgGrade}%`, sub: `${analytics.totalGrades} grades recorded`, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Study Streak', value: `${analytics.studyStreak}d`, sub: 'consecutive days', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Courses', value: analytics.coursesEnrolled, sub: 'enrolled', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ] : [];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 rounded-xl">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">AI Analytics</h1>
              <p className="text-zinc-500 text-sm">AI-powered insights about your academic performance</p>
            </div>
          </div>
          {analytics && (
            <Button
              onClick={() => generateInsights(analytics, true)}
              disabled={generatingInsights}
              variant="ghost"
              size="sm"
              className="ml-auto text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${generatingInsights ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            <p className="text-zinc-400 text-sm">Analyzing your academic data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-zinc-900/60 border border-white/10 rounded-2xl p-4"
                >
                  <div className={`inline-flex p-2 rounded-lg ${card.bg} mb-3`}>
                    <TrendingUp className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
                  <p className="text-xs font-semibold text-white mt-1">{card.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{card.sub}</p>
                </motion.div>
              ))}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">AI-Generated Insights</h2>
                {generatingInsights && <Loader2 className="w-4 h-4 text-purple-400 animate-spin ml-2" />}
              </div>

              {insights.length === 0 && !generatingInsights && (
                <div className="flex flex-col items-center justify-center py-12 bg-zinc-900/30 border border-white/5 rounded-2xl text-center">
                  <Sparkles className="w-10 h-10 text-zinc-700 mb-3" />
                  <p className="text-zinc-500 text-sm">Add more tasks and grades to unlock AI insights</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`rounded-2xl p-5 border ${priorityColors[insight.priority]}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{insight.icon}</span>
                        <h3 className="text-sm font-bold text-white">{insight.title}</h3>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${priorityBadge[insight.priority]}`}>
                        {insight.priority}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-300 leading-relaxed mb-3">{insight.insight}</p>

                    <div className="flex items-start gap-2 p-3 rounded-xl bg-white/3 border border-white/5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-zinc-400 leading-relaxed">{insight.recommendation}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {!isPremium && (
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6 text-center">
                <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Unlock Deeper Analytics</h3>
                <p className="text-zinc-400 text-sm mb-4">Upgrade to Premium for detailed study pattern analysis, performance predictions, and more.</p>
                <Link to="/upgrade">
                  <Button className="bg-purple-500 hover:bg-purple-400 text-white font-bold">
                    Upgrade to Premium
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalytics;
