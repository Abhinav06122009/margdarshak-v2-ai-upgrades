import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Check, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const UpgradeCard = () => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="relative overflow-hidden rounded-[2rem] border border-amber-500/20 bg-gradient-to-br from-[#1a1500] to-black group"
    >
      {/* Animated Background Effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[60px] group-hover:bg-amber-500/20 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-600/10 rounded-full blur-[40px]" />
      
      <div className="relative z-10 p-6 flex flex-col h-full">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Crown className="w-6 h-6 text-black fill-black" />
          </div>
          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
            Pro Plan
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2 mb-6">
          <h3 className="text-2xl font-black text-white leading-tight">
            Unlock Sovereign <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">Intelligence</span>
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            Get unlimited Cloudflare inference, access the full Knowledge Vault, and enable detailed visual generation.
          </p>
        </div>

        {/* Feature List */}
        <div className="space-y-3 mb-8">
          {[
            "Unlimited Flux-1 Image Gen", 
            "Full PCMB Vault Access", 
            "Priority Neural Processing"
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
              <div className="p-0.5 rounded-full bg-amber-500/20 text-amber-500">
                <Check size={10} strokeWidth={4} />
              </div>
              <span className="text-xs font-semibold">{feature}</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <Link 
            to="/upgrade"
            className="group/btn relative flex items-center justify-center w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl font-black text-black text-sm tracking-wide overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              UPGRADE NOW <ArrowRight size={16} />
            </span>
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
          </Link>
          <p className="text-center text-[10px] text-gray-500 mt-3 font-medium">
            30-day money-back guarantee
          </p>
        </div>

      </div>

      {/* Decorative Sparkles */}
      <Sparkles className="absolute top-4 right-4 text-amber-500/20 w-12 h-12 rotate-12" />
    </motion.div>
  );
};

export default UpgradeCard;