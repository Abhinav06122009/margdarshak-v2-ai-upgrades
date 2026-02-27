import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, TrendingUp, TrendingDown, Lightbulb, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { modelRouter } from '@/lib/ai/modelRouter';
import { useAI } from '@/contexts/AIContext';
import cacheService from '@/lib/ai/cacheService';

interface GradeData {
  subject: string;
  grade: number;
  total_points: number;
  assignment_name: string;
  semester?: string;
}

interface GradeInsightsProps {
  grades: GradeData[];
}

interface InsightResult {
  topSubject: string;
  weakestSubject: string;
  trend: 'improving' | 'declining' | 'stable';
  gpaForecast: string;
  recommendations: string[];
}

const GradeInsights: React.FC<GradeInsightsProps> = ({ grades }) => {
  const [insights, setInsights] = useState<InsightResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isAIReady } = useAI();

  const hasEnoughData = grades.length >= 3;

  const subjectAverages = grades.reduce((acc, g) => {
    const pct = (g.grade / g.total_points) * 100;
    if (!acc[g.subject]) acc[g.subject] = { total: 0, count: 0 };
    acc[g.subject].total += pct;
    acc[g.subject].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const subjectSummary = Object.entries(subjectAverages).map(([subject, data]) => ({
    subject,
    avg: Math.round(data.total / data.count),
  }));

  const generate = async () => {
    if (!isAIReady || !hasEnoughData) return;

    const cacheKey = cacheService.buildKey('grade_insights', JSON.stringify(subjectSummary));
    const cached = cacheService.get(cacheKey);
    if (cached) {
      try {
        setInsights(JSON.parse(cached));
        return;
      } catch { /* ignore */ }
    }

    setLoading(true);

    const subjectData = subjectSummary.map(s => `${s.subject}: ${s.avg}%`).join(', ');
    const overallAvg = Math.round(subjectSummary.reduce((s, c) => s + c.avg, 0) / subjectSummary.length);

    const prompt = `A student has these grade averages: ${subjectData}. Overall average: ${overallAvg}%.

Analyze and return ONLY valid JSON:
{
  "topSubject": "best performing subject",
  "weakestSubject": "subject needing most improvement",
  "trend": "improving|declining|stable",
  "gpaForecast": "Brief forecast (1 sentence)",
  "recommendations": ["specific tip 1", "specific tip 2", "specific tip 3"]
}`;

    try {
      const result = await modelRouter.generateJSON<InsightResult>(prompt, {
        systemPrompt: 'You are an academic advisor analyzing student grade data. Be specific and encouraging.',
      });

      if (result) {
        setInsights(result);
        cacheService.set(cacheKey, JSON.stringify(result), 30 * 60 * 1000);
      }
    } catch { /* silent fail */ }
    finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isExpanded && !insights) generate();
    setIsExpanded(prev => !prev);
  };

  if (!hasEnoughData) return null;

  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/20 backdrop-blur">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-amber-500/20 rounded-lg">
            <BrainCircuit className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-sm font-bold text-white">AI Grade Insights</span>
          {loading && <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/5 space-y-4">
              {loading && (
                <div className="flex items-center gap-2 py-4 text-zinc-400 text-sm justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  Analyzing your grades...
                </div>
              )}

              {!loading && insights && (
                <>
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs text-emerald-400 font-bold">Top Subject</span>
                      </div>
                      <p className="text-sm text-white font-semibold">{insights.topSubject}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center gap-1.5 mb-1">
                        <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-xs text-red-400 font-bold">Needs Focus</span>
                      </div>
                      <p className="text-sm text-white font-semibold">{insights.weakestSubject}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <p className="text-xs text-blue-400 font-bold mb-1">GPA Forecast</p>
                    <p className="text-sm text-zinc-300">{insights.gpaForecast}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />Recommendations
                    </p>
                    <ul className="space-y-1.5">
                      {insights.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                          <span className="text-amber-400 font-bold flex-shrink-0">{i + 1}.</span>{rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setInsights(null); generate(); }}
                    className="text-xs text-zinc-500 hover:text-white h-7"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />Refresh
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GradeInsights;
