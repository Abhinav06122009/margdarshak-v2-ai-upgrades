
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Shield } from 'lucide-react';

interface GradeHeaderProps {
  onBack?: () => void;
  openCreateDialog: () => void;
  userName: string;
}

const GradeHeader: React.FC<GradeHeaderProps> = ({ onBack, openCreateDialog, userName }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden border-b border-white/20"
    >
      <div className="relative px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-6">
            {onBack && (
              <motion.button
                onClick={onBack}
                className="group p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-white group-hover:text-white transition-colors" />
              </motion.button>
            )}
            <div>
              <motion.h1 
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 flex items-center gap-4 bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent drop-shadow-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Shield className="w-8 h-8" /> Gradebook
              </motion.h1>
              <motion.p 
                className="text-white/80 text-base sm:text-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Track academic performance for <span className="font-semibold text-white">{userName}</span>
              </motion.p>
            </div>
          </div>
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <motion.button
              onClick={openCreateDialog}
              className="group relative inline-flex w-full sm:w-auto h-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 px-8 py-4 font-bold text-lg text-white shadow-lg transition-all duration-300 ease-out hover:from-purple-700 hover:to-blue-700 hover:shadow-xl hover:shadow-purple-500/50 active:scale-95"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span className="absolute inset-0 flex h-full w-full justify-center [transform:skewX(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skewX(-12deg)_translateX(100%)] bg-white/30" />
              <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180 mr-3 z-10" />
              <span className="relative z-10">Add Grade</span>
            </motion.button>
          </div>
        </div>
      </div>
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/70 to-purple-500/0"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: "circOut", delay: 0.5 }}
      />
    </motion.div>
  );
};

export default GradeHeader;
