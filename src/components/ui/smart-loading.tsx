import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, GraduationCap } from 'lucide-react';

interface SmartLoadingProps {
  variant?: 'default' | 'premium' | 'minimal' | 'particles';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const SmartLoading: React.FC<SmartLoadingProps> = ({
  variant = 'premium',
  size = 'md',
  message = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  };

  if (variant === 'premium') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center space-y-4"
      >
        <div className="relative">
          <motion.div
            className={`${sizeClasses[size]} border-4 border-white/20 border-t-white rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className={`absolute top-2 left-2 ${size === 'lg' ? 'w-16 h-16' : size === 'md' ? 'w-8 h-8' : 'w-4 h-4'} border-4 border-purple-400/30 border-t-purple-400 rounded-full`}
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className={`absolute top-4 left-4 ${size === 'lg' ? 'w-12 h-12' : size === 'md' ? 'w-4 h-4' : 'w-2 h-2'} border-4 border-pink-400/30 border-t-pink-400 rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
        </div>
        
        <motion.div
          className="flex items-center space-x-2 text-white"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <GraduationCap className="w-5 h-5" />
          <span className="text-lg font-semibold">{message}</span>
          <Sparkles className="w-4 h-4" />
        </motion.div>

        <div className="flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white/60 rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  if (variant === 'particles') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative flex items-center justify-center"
      >
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-black rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transformOrigin: '0 40px'
              }}
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, delay: i * 0.1 }
              }}
              initial={{ rotate: i * 45 }}
            />
          ))}
        </div>
        <motion.div
          className="text-white font-semibold z-10"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center space-x-3"
    >
      <Loader2 className={`${sizeClasses[size]} animate-spin text-white`} />
      <span className="text-white">{message}</span>
    </motion.div>
  );
};