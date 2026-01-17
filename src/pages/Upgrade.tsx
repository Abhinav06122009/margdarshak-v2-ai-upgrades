import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Check, 
  X, 
  ArrowLeft, 
  Crown,
  Sparkles,
  Zap,
  Shield,
  BrainCircuit
} from 'lucide-react';
import InteractiveBackground from '@/lib/InteractiveBackground';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

const Upgrade = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { toast } = useToast();
  const navigate = useNavigate();

  // --- 1. HANDLE SUBSCRIPTION UPDATE ---
  const updateSubscription = async (tier: 'premium' | 'premium_elite') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // Update Profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_tier: tier,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Upgrade Successful! 🎉",
        description: `Welcome to ${tier === 'premium_elite' ? 'Premium + Elite' : 'Premium'}.`,
        className: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      });

      // Optional: Refresh page or redirect
      setTimeout(() => navigate('/ai-chat'), 1500);

    } catch (error: any) {
      console.error("Upgrade Error:", error);
      toast({
        title: "Activation Failed",
        description: "Payment received but account update failed. Contact support.",
        variant: "destructive",
      });
    }
  };

  // --- 2. LISTEN FOR PAYMENT SUCCESS ---
  useEffect(() => {
    // Inject Uropay Script
    if (!document.querySelector('script[src="https://cdn.uropay.me/uropay-embed.min.js"]')) {
      const script = document.createElement('script');
      script.src = "https://cdn.uropay.me/uropay-embed.min.js";
      script.async = true;
      document.body.appendChild(script);
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'payment_success' || event.data?.status === 'success') {
        console.log("Payment detected:", event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-gray-300 font-sans selection:bg-amber-500/30 overflow-x-hidden">
      
      <InteractiveBackground />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0 mix-blend-overlay" />
      <div className="fixed top-[-10%] left-[20%] w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[20%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-16">
        
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-12 group">
          <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
            <ArrowLeft size={16} />
          </div>
          <span>Back to Dashboard</span>
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black uppercase tracking-widest mb-4">
            <Crown size={14} /> Advanced Intelligence
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">
            Upgrade your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
              Learning Capacity
            </span>
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Unlock the full potential of Margdarshak Pro. Generate complex scientific visuals, store unlimited knowledge, and access the most powerful models.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start"
        >
          
          {/* STARTER */}
          <motion.div variants={itemVariants} className="relative p-8 rounded-[2.5rem] bg-[#0A0A0A] border border-white/5">
            <h3 className="text-xl font-bold text-gray-400 mb-2 flex items-center gap-2">
              Starter <Shield size={16} />
            </h3>
            <div className="text-3xl font-black text-white mb-6">Free</div>
            <p className="text-sm text-gray-500 mb-8 h-10">Essential tools for task tracking and basic study organization.</p>
            <button className="w-full py-6 rounded-xl border border-white/10 text-white font-bold text-lg hover:bg-white/5 transition-colors cursor-default">
              Current Plan
            </button>
            <div className="mt-8 space-y-4">
               {['Daily Task Management', 'Basic Study Stats', '100MB Vault Storage'].map((feat, i) => (
                 <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                   <Check size={16} className="text-emerald-500 shrink-0" />
                   {feat}
                 </div>
               ))}
               <div className="flex items-center gap-3 text-sm text-gray-400">
                   <Check size={16} className="text-emerald-500 shrink-0" />
                   Smart Tutor (Bring Your Own Key)
               </div>
               {['Elite Learning Model', 'Deep Research', 'Priority Support'].map((feat, i) => (
                 <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                   <X size={16} className="shrink-0" />
                   {feat}
                 </div>
               ))}
            </div>
          </motion.div>

          {/* PREMIUM */}
          <motion.div 
            variants={itemVariants} 
            className="relative p-8 rounded-[2.5rem] bg-[#0A0A0A] border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
          >
            <h3 className="text-xl font-bold text-blue-400 mb-2 flex items-center gap-2">
              Premium <Sparkles size={16} />
            </h3>
            
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-white">₹750</span>
              <span className="text-sm text-gray-500 font-medium">/Month</span>
            </div>
            
            <p className="text-sm text-gray-400 mb-8 h-10">Enhanced power for serious students with priority support.</p>
            
            <div onClick={() => {
              // Manual override for testing
            }}>
              <a 
                href="#" 
                className="uropay-btn w-full block text-center py-6 text-lg font-bold rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90 transition-opacity" 
                data-uropay-api-key="PLSKD1Y8ILA2EJGYC4XDDVTBRTVWFYF4" 
                data-uropay-button-id="ECHO559265" 
                data-uropay-environment="LIVE" 
                data-uropay-amount="750"
              >
                Get Premium
              </a>
            </div>

            <div className="mt-8 space-y-4">
              {[
                'Quick Chat Available',
                '50 GB Storage',
                'Task Bulk Operations',
                'Task Timer & Analytics',
                'WhatsApp Progress Reports',
                'Priority Support'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="p-0.5 rounded-full bg-blue-500/20 text-blue-400">
                    <Check size={12} strokeWidth={4} />
                  </div>
                  <span className="text-gray-300 font-medium">{feature}</span>
                </div>
              ))}
               <div className="flex items-center gap-3 text-sm">
                  <div className="p-0.5 rounded-full bg-blue-500/20 text-blue-400">
                    <Check size={12} strokeWidth={4} />
                  </div>
                  <span className="text-gray-300 font-medium">Smart Tutor (Bring Your Own Key)</span>
               </div>
               <div className="flex items-center gap-3 text-sm text-gray-600">
                  <X size={16} className="shrink-0" />
                  Elite System (No Key Needed)
               </div>
            </div>
          </motion.div>

          {/* PREMIUM + ELITE */}
          <motion.div 
            variants={itemVariants} 
            className="relative p-8 rounded-[2.5rem] bg-gradient-to-b from-[#1a0b2e] to-black border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.2)] md:-translate-y-6"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
              Most Popular
            </div>

            <h3 className="text-xl font-bold text-purple-400 mb-2 flex items-center gap-2">
              Premium + Elite <BrainCircuit size={16} className="fill-current" />
            </h3>
            
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-white">₹1200</span>
              <span className="text-sm text-gray-500 font-medium">/Month</span>
            </div>
            
            <p className="text-sm text-gray-400 mb-8 h-10">The ultimate power-suite with Advanced Intelligence.</p>
            
            <div onClick={() => {
               // UNCOMMENT BELOW FOR MANUAL OVERRIDE IF UROPAY FAILS
               // if (confirm("Simulate Payment Success for Premium+Elite?")) updateSubscription('premium_elite');
            }}>
              <a 
                href="#" 
                className="uropay-btn w-full block text-center py-6 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all transform hover:scale-[1.02]"
                data-uropay-api-key="PLSKD1Y8ILA2EJGYC4XDDVTBRTVWFYF4"
                data-uropay-button-id="VICTOR148602"
                data-uropay-environment="LIVE" 
                data-uropay-amount="1200"
              >
                Get Premium + Elite
              </a>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                  <div className="p-0.5 rounded-full bg-purple-500/20 text-purple-400">
                    <Check size={12} strokeWidth={4} />
                  </div>
                  <span className="text-white font-bold text-emerald-400">Elite System (No Key Req)</span>
              </div>
              {[
                'Everything In Premium',
                'Deep Web Research & Vision',
                'All Premium Features',
                '500 GB Cloud Storage',
                'Predictive Grade Analytics',
                'Automatic Timetable Gen',
                'Dedicated 24/7 Smart Tutor',
                'And Much More'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="p-0.5 rounded-full bg-purple-500/20 text-purple-400">
                    <Check size={12} strokeWidth={4} />
                  </div>
                  <span className="text-white font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </motion.div>

        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
             <FaqItem q="Is this a one-time payment?" a="Yes, both Premium and Premium + Elite are lifetime access plans. No recurring monthly fees." />
             <FaqItem q="What is the Elite System?" a="The Elite System means you use our inbuilt high-performance processing engine without needing your own API key. It's fully managed and unrestricted." />
             <FaqItem q="Can I upgrade from Premium to Premium + Elite?" a="Yes, you can upgrade at any time by paying the difference. Contact support for assistance." />
             <FaqItem q="Is my data secure?" a="Absolutely. We use end-to-end encryption. Your data is your property and is never sold to third parties." />
          </div>
        </div>

        <footer className="mt-20 pt-10 border-t border-white/5 text-center">
            <p className="text-xs text-gray-600 font-medium">
              Secure Payments via Uropay • © 2025 Margdarshak Pro
            </p>
        </footer>

      </div>
    </div>
  );
};

const FaqItem = ({ q, a }: { q: string, a: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-2xl bg-white/[0.02] overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-6 text-left"
      >
        <span className="font-bold text-gray-200">{q}</span>
        <span className={`text-gray-500 transition-transform ${isOpen ? 'rotate-45' : ''}`}>
           <ArrowLeft className="rotate-[225deg]" /> 
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-6 text-sm text-gray-400 leading-relaxed"
          >
            {a}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Upgrade;