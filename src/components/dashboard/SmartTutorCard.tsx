import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ChevronRight, BrainCircuit, GraduationCap, FileText, BarChart3 } from 'lucide-react';

const AI_FEATURES = [
  { icon: BrainCircuit, label: 'Smart Tutor', href: '/ai-chat', color: 'text-amber-400' },
  { icon: GraduationCap, label: 'Quiz Generator', href: '/quiz', color: 'text-purple-400' },
  { icon: FileText, label: 'Essay Helper', href: '/essay-helper', color: 'text-blue-400' },
  { icon: BarChart3, label: 'AI Analytics', href: '/ai-analytics', color: 'text-emerald-400' },
];

export const SmartTutorCard = () => {
  return (
    <motion.div whileHover={{ scale: 1.005 }} transition={{ duration: 0.3 }} className="flex-1">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-zinc-900 to-black border border-white/5 shadow-2xl group">
        
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div className="space-y-4 max-w-xl flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                <Zap size={12} className="fill-current" /> 
                AI-Powered Platform
              </div>
              
              <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">
                MARGDARSHAK <span className="text-amber-500">AI Suite</span>
              </h3>
              
              <p className="text-zinc-400 text-base leading-relaxed">
                Your complete AI learning assistant. Get homework help, generate practice quizzes, plan your studies, and analyze your performance.
              </p>
              
              <div className="pt-2">
                <Link 
                  to="/ai-chat" 
                  className="inline-flex items-center gap-3 bg-amber-500 text-black px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-amber-400 transition-colors shadow-lg"
                >
                  Open AI Tutor <ChevronRight size={16} />
                </Link>
              </div>
            </div>
            
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-amber-500 blur-[80px] opacity-10 animate-pulse" />
              <BrainCircuit className="relative w-32 h-32 text-amber-500/20 group-hover:text-amber-400/30 transition-all duration-700 rotate-12 group-hover:rotate-0" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/5">
            {AI_FEATURES.map((feature) => (
              <Link
                key={feature.href}
                to={feature.href}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/8 hover:border-white/10 transition-all group/feat"
              >
                <feature.icon className={`w-4 h-4 ${feature.color} flex-shrink-0`} />
                <span className="text-xs font-semibold text-zinc-300 group-hover/feat:text-white transition-colors truncate">
                  {feature.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
