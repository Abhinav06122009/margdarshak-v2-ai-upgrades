import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Star, Zap, X } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlanCard = ({ title, price, features, isFeatured, icon: Icon, gradient }: { title: string, price: string, features: string[], isFeatured?: boolean, icon: React.ElementType, gradient: string }) => (
  <motion.div
    whileHover={{ y: -10, scale: 1.03 }}
    className={`relative p-8 rounded-3xl border transition-all duration-300 ${isFeatured ? 'border-purple-500 bg-black/50' : 'border-white/20 bg-black/30'}`}
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
    <Button className={`w-full py-6 text-lg font-bold rounded-xl ${isFeatured ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-white/10 border border-white/20'}`}>
      Choose Plan
    </Button>
  </motion.div>
);

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl bg-black/80 backdrop-blur-2xl border-white/20 text-white p-0 rounded-3xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <DialogHeader className="p-8 text-center">
                <DialogTitle className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                  Unlock Your Full Potential
                </DialogTitle>
                <DialogDescription className="text-white/70 text-lg max-w-2xl mx-auto">
                  Choose a plan that fits your needs and gain access to exclusive features to supercharge your productivity.
                </DialogDescription>
              </DialogHeader>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <PlanCard
                  title="Premium"
                  price="₹750"
                  features={[
                    '50 GB Storage',
                    'AI Note Summarization',
                    'Task Bulk Operations',
                    'Task Timer',
                    'Full Progress Tracker Access',
                    'Priority Support'
                  ]}
                  icon={Star}
                  gradient="from-blue-500 to-cyan-500"
                />
                <PlanCard
                  title="Extra++"
                  price="₹1200"
                  features={[
                    'All Premium Features',
                    '500 GB Expandable Storage',
                    'Advanced AI Coach Insights',
                    'Team Collaboration (Soon)',
                    'Dedicated Onboarding'
                  ]}
                  isFeatured
                  icon={Zap}
                  gradient="from-purple-500 to-violet-500"
                />
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
