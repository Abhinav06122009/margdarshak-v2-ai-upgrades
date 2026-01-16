import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Maximize2, Minimize2, RefreshCw, Loader2, Zap } from 'lucide-react';
import aiService, { type AIBriefing, type UserStats } from '../../lib/aiService';

interface BriefingWidgetProps {
  user: any;
  tasks: any[];
  stats?: UserStats; 
}

const AIBriefingWidget: React.FC<BriefingWidgetProps> = ({ 
  user, 
  tasks, 
  stats = { studyStreak: 0, tasksCompleted: 0, hoursStudied: 0 } 
}) => {
  const [briefing, setBriefing] = useState<AIBriefing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const hasFetchedRef = useRef(false);

  // ... (Keep existing fetchBriefing logic exactly as it was)
  const fetchBriefing = useCallback(async (force = false) => {
    if (!user?.id) return;
    if (hasFetchedRef.current && !force) return;
    setIsLoading(true);
    hasFetchedRef.current = true; 
    try {
      const userName = user.user_metadata?.full_name || user.profile?.full_name || "Student";
      const pendingTasks = (tasks || []).filter(t => t.status !== 'completed').map(t => ({ title: t.title, priority: t.priority }));
      const data = await aiService.generateDailyBriefing(user.id, userName, pendingTasks, stats);
      setBriefing(data);
    } catch (error) { console.warn("Briefing error", error); } 
    finally { setIsLoading(false); }
  }, [user, tasks, stats]);

  useEffect(() => { if (user?.id) fetchBriefing(); }, [user?.id, fetchBriefing]);

  return (
    <motion.div
      layout
      className={`relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl transition-all duration-700 group
        ${isExpanded ? 'bg-zinc-900' : 'bg-zinc-900/60 backdrop-blur-xl'}`}
    >
      {/* Decorative Background Mesh */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-emerald-500/5 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative p-8 flex flex-col h-full z-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Daily Briefing</h3>
              <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">AI Powered</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => fetchBriefing(true)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loader" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex-1 flex flex-col items-center justify-center py-6"
            >
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
              <span className="text-xs text-zinc-500 font-mono">Synthesizing plan...</span>
            </motion.div>
          ) : (
            <motion.div 
              key="content" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="flex-1"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                {briefing?.greeting || "Ready to start?"}
              </h2>
              
              <div className="flex flex-wrap items-center gap-3 mb-5">
                {briefing?.focus_area && (
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-sm">
                    {briefing.focus_area}
                  </span>
                )}
                
                {stats && stats.studyStreak > 0 && (
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-2 shadow-sm">
                    <Zap className="w-3 h-3 fill-current" />
                    {stats.studyStreak} Day Streak
                  </span>
                )}
              </div>

              <div className={`text-zinc-300 font-medium leading-relaxed ${isExpanded ? 'text-lg' : 'text-sm line-clamp-3'}`}>
                {briefing?.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AIBriefingWidget;