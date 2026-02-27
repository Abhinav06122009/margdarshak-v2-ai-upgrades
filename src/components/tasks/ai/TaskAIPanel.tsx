import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Wand2, ListTodo, ChevronDown, ChevronUp, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { modelRouter } from '@/lib/ai/modelRouter';
import { useAI } from '@/contexts/AIContext';

interface Task {
  title: string;
  description?: string;
  due_date?: string | null;
  priority: string;
  status: string;
}

interface TaskAIPanelProps {
  tasks: Task[];
  onAddSubtasks?: (parentTitle: string, subtasks: string[]) => void;
}

interface TaskAnalysis {
  priorityAdvice: string;
  riskTasks: string[];
  estimatedCompletion: string;
  focusRecommendation: string;
}

const TaskAIPanel: React.FC<TaskAIPanelProps> = ({ tasks, onAddSubtasks }) => {
  const [analysis, setAnalysis] = useState<TaskAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isAIReady } = useAI();
  const { toast } = useToast();

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const overdueTasks = tasks.filter(t =>
    t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
  );

  const analyze = async () => {
    if (!isAIReady || pendingTasks.length === 0) return;

    setLoading(true);

    const taskSummary = pendingTasks.slice(0, 10).map(t => {
      const dueStr = t.due_date ? `due ${new Date(t.due_date).toLocaleDateString()}` : 'no deadline';
      return `"${t.title}" (${t.priority} priority, ${dueStr})`;
    }).join('; ');

    const prompt = `Analyze this student's pending tasks and provide advice:

Tasks: ${taskSummary}
Overdue: ${overdueTasks.length} tasks
Total pending: ${pendingTasks.length} tasks

Return ONLY valid JSON:
{
  "priorityAdvice": "1 sentence on what to tackle first",
  "riskTasks": ["task title 1", "task title 2"],
  "estimatedCompletion": "Realistic estimate (e.g., 3-4 days)",
  "focusRecommendation": "1-2 sentence actionable recommendation"
}`;

    try {
      const result = await modelRouter.generateJSON<TaskAnalysis>(prompt, {
        useCache: true,
        cacheKey: `task_analysis_${pendingTasks.length}_${overdueTasks.length}`,
        cacheTtl: 15 * 60 * 1000,
      });
      if (result) setAnalysis(result);
    } catch {
      toast({ title: 'Analysis failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isExpanded && !analysis) analyze();
    setIsExpanded(prev => !prev);
  };

  if (pendingTasks.length === 0) return null;

  return (
    <div className="border border-purple-500/20 rounded-2xl overflow-hidden bg-purple-500/5 backdrop-blur">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-purple-500/20 rounded-lg">
            <Wand2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-left">
            <span className="text-sm font-bold text-white block">AI Task Assistant</span>
            <span className="text-xs text-zinc-500">{pendingTasks.length} pending • {overdueTasks.length} overdue</span>
          </div>
          {loading && <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />}
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
                <div className="flex items-center gap-2 py-4 justify-center text-zinc-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  Analyzing your tasks...
                </div>
              )}

              {!loading && analysis && (
                <>
                  <div className="pt-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-zinc-300">{analysis.focusRecommendation}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs text-blue-400 font-bold">Est. Completion</span>
                      </div>
                      <p className="text-sm text-white font-semibold">{analysis.estimatedCompletion}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs text-amber-400 font-bold">Focus First</span>
                      </div>
                      <p className="text-sm text-white font-semibold line-clamp-2">{analysis.priorityAdvice}</p>
                    </div>
                  </div>

                  {analysis.riskTasks && analysis.riskTasks.length > 0 && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-xs text-red-400 font-bold">At-Risk Tasks</span>
                      </div>
                      <ul className="space-y-1">
                        {analysis.riskTasks.map((task, i) => (
                          <li key={i} className="text-xs text-zinc-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskAIPanel;
