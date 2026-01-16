import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Star, Zap, ArrowLeft } from 'lucide-react';
import ParallaxBackground from '@/components/ui/ParallaxBackground';

interface UpgradePageProps {
  onBack: () => void;
}

const PlanCard = ({ title, price, features, isFeatured, icon: Icon, gradient, paymentButton }: { title: string, price: string, features: string[], isFeatured?: boolean, icon: React.ElementType, gradient: string, paymentButton?: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -10, scale: 1.03 }}
    transition={{ type: 'spring', stiffness: 100 }}
    className={`relative p-8 rounded-3xl border transition-all duration-300 ${isFeatured ? 'border-purple-500 bg-black/50 shadow-purple-500/20' : 'border-white/20 bg-black/30'} shadow-2xl`}
  >
    {isFeatured && (
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-purple-600 text-white text-sm font-bold rounded-full shadow-lg">
        Most Popular
      </div>
    )}
    <div className="flex items-center gap-4 mb-6">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-white">{title}</h3>
    </div>
    <p className="text-4xl font-extrabold text-white mb-2">{price}<span className="text-base font-normal text-white/60">/month</span></p>
    <ul className="space-y-3 my-8">
      {features.map((feature, i) => (
        <li key={i} className="flex items-center gap-3 text-white/90">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    {paymentButton || (
      <Button className={`w-full py-6 text-lg font-bold rounded-xl ${isFeatured ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-white/10 border border-white/20'}`}>
        Choose Plan
      </Button>
    )}
  </motion.div>
);

const UpgradePage: React.FC<UpgradePageProps> = ({ onBack }) => {
  useEffect(() => {
    const scriptId = 'uropay-embed-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdn.uropay.me/uropay-embed.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden p-6">
      <ParallaxBackground />
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center mb-12">
          <Button onClick={onBack} variant="ghost" size="icon" className="mr-4 bg-white/10 hover:bg-white/20 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Unlock Your Full Potential
          </h1>
        </motion.div>
        
        <p className="text-center text-white/70 text-lg max-w-2xl mx-auto mb-12">
          Choose a plan that fits your needs and gain access to exclusive features to supercharge your productivity.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PlanCard
            title="Premium"
            price="₹750"
            features={[
              '50 GB Storage',
              'AI Note Summarization (Soon)',
              'Task Bulk Operations',
              'Task Timer',
              'Full Progress Tracker Access',
              'Priority Support'
            ]}
            icon={Star}
            gradient="from-blue-500 to-cyan-500"
            paymentButton={
              <a 
                href="#" 
                className="uropay-btn w-full block text-center py-6 text-lg font-bold rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500" 
                data-uropay-api-key="PLSKD1Y8ILA2EJGYC4XDDVTBRTVWFYF4" 
                data-uropay-button-id="ECHO559265" 
                data-uropay-environment="LIVE" 
                data-uropay-amount="750"
              >Buy Now for ₹750</a>
            }
          />
          <PlanCard
            title="Extra++"
            price="₹1200"
            features={[
              'All Premium Features',
              '500 GB Expandable Storage',
              'Advanced AI Coach Insights (Soon)',
              'Team Collaboration (Soon)',
              'Dedicated Onboarding'
            ]}
            isFeatured
            icon={Zap}
            gradient="from-purple-500 to-violet-500"
            paymentButton={
              <a 
                href="#" 
                className="uropay-btn w-full block text-center py-6 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600"
                data-uropay-api-key="PLSKD1Y8ILA2EJGYC4XDDVTBRTVWFYF4"
                data-uropay-button-id="VICTOR148602"
                data-uropay-environment="LIVE" 
                data-uropay-amount="1200"
              >Buy Now for ₹1200</a>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;