import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Maximize2, Minimize2, RefreshCw, BrainCircuit, Zap } from 'lucide-react';
import aiService, { type AIBriefing, type UserStats } from '../../lib/aiService';

interface SmartBriefingWidgetProps {
  user: any;
  tasks: any[];
  stats?: UserStats; 
}

const SmartBriefingWidget: React.FC<SmartBriefingWidgetProps> = ({ 
  user, 
  tasks, 
  stats = { studyStreak: 0, tasksCompleted: 0, hoursStudied: 0 } 
}) => {
  const [briefing, setBriefing] = useState<AIBriefing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasFetchedRef = useRef(false);

  const fetchBriefing = useCallback(async (force = false) => {
    if (!user?.id || !user?.user_metadata?.full_name && !user?.profile?.full_name) {
      return; 
    }
    
    if (hasFetchedRef.current && !force) return;

    setIsLoading(true);
    hasFetchedRef.current = true; 

    try {
      const userName = user.user_metadata?.full_name || user.profile?.full_name || "Student";

      const pendingTasks = (tasks || [])
        .filter(t => t.status !== 'completed')
        .map(t => ({ title: t.title, priority: t.priority }));

      const data = await aiService.generateDailyBriefing(
        user.id,
        userName,
        pendingTasks,
        stats 
      );
      
      setBriefing(data);
    } catch (error) {
      console.error("Service Error:", error);
      setBriefing({
        greeting: "System Offline",
        focus_area: "MANUAL MODE",
        message: "Unable to sync with central server.",
        color: "text-gray-400"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, tasks, stats]);

  useEffect(() => {
    if (user?.id && !hasFetchedRef.current) {
      fetchBriefing();
    }
  }, [user?.id, fetchBriefing]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl transition-all duration-700
        ${isExpanded 
          ? 'min-h-[400px] bg-gradient-to-br from-indigo-950 via-purple-900 to-black' 
          : 'min-h-[220px] bg-white/5 backdrop-blur-3xl'
        }`}
    >
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-30" />

      <div className="relative p-8 h-full flex flex-col z-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Smart Assistant</h3>
              <span className="text-[9px] text-emerald-500/60 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => fetchBriefing(true)} 
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-white/60 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4 text-white/60" /> : <Maximize2 className="w-4 h-4 text-white/60" />}
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center">
              <BrainCircuit className="w-12 h-12 text-white/10 animate-pulse" />
              <p className="text-[10px] text-white/20 mt-2 uppercase tracking-widest">Loading Data...</p>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
              <h2 className={`font-black text-white leading-tight mb-3 ${isExpanded ? 'text-4xl' : 'text-2xl'}`}>
                {briefing?.greeting}
              </h2>
              
              <div className="flex gap-2 mb-6">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 ${briefing?.color}`}>
                  {briefing?.focus_area}
                </div>
                {/* Safe Access to Stats */}
                {stats && stats.studyStreak > 0 && (
                  <div className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center gap-2">
                    <Zap className="w-3 h-3 fill-current" />
                    {stats.studyStreak} DAY STREAK
                  </div>
                )}
              </div>

              <p className={`text-slate-400 font-medium leading-relaxed italic ${isExpanded ? 'text-xl' : 'text-sm line-clamp-2'}`}>
                "{briefing?.message}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SmartBriefingWidget;