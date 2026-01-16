import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Command, BarChart3, Calendar, MousePointerClick, Brush } from 'lucide-react';

const features = [
  {
    icon: <Brush className="w-8 h-8 text-purple-400" />,
    title: 'Enhanced UI/UX',
    description: 'The dashboard has been updated with a modern and interactive design, featuring glassmorphism, neumorphism, and 3D effects.',
  },
  {
    icon: <MousePointerClick className="w-8 h-8 text-blue-400" />,
    title: 'Interactive Elements',
    description: 'The dashboard now features interactive cards, buttons, and other elements that respond to your actions.',
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-emerald-400" />,
    title: 'Live Analytics',
    description: 'Your dashboard provides real-time insights into your study habits, task completion, and academic progress.',
  },
  {
    icon: <Command className="w-8 h-8 text-yellow-400" />,
    title: 'Command Palette',
    description: 'Press Ctrl+K (or Cmd+K) anywhere to quickly navigate, create tasks, or log out. Power at your fingertips.',
  },
];

const FeatureSpotlightModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[100]"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-3xl p-8 max-w-2xl w-full m-4 relative shadow-2xl shadow-purple-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                Welcome to Your Enhanced Dashboard!
              </h2>
              <p className="text-white/70">Here are a few powerful features to get you started.</p>
            </div>

            <div className="space-y-6 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-5 p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="flex-shrink-0 p-3 bg-black/30 rounded-lg">{feature.icon}</div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">{feature.title}</h3>
                    <p className="text-white/60 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              onClick={onClose}
              className="w-full py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Got It, Let's Go!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeatureSpotlightModal;