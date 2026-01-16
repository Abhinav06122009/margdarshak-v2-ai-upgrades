import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ChevronRight, BrainCircuit } from 'lucide-react';

export const SmartTutorCard = () => {
  return (
    <motion.div whileHover={{ scale: 1.005 }} transition={{ duration: 0.3 }} className="flex-1">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-zinc-900 to-black border border-white/5 shadow-2xl group">
        
        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
              <Zap size={12} className="fill-current" /> 
              Advanced Learning
            </div>
            
            <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">
              Margdarshak Smart Tutor
            </h3>
            
            <p className="text-zinc-400 text-base leading-relaxed">
              Your personal intelligence hub. Ask complex PCMB doubts, generate diagrams, and get instant study plans.
            </p>
            
            <div className="pt-2">
              <Link 
                to="/ai-chat" 
                className="inline-flex items-center gap-3 bg-white text-black px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg"
              >
                Start Learning <ChevronRight size={16} />
              </Link>
            </div>
          </div>
          
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-20 animate-pulse" />
            <BrainCircuit className="relative w-40 h-40 text-indigo-500/30 group-hover:text-indigo-400/50 transition-all duration-700 rotate-12 group-hover:rotate-0" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};