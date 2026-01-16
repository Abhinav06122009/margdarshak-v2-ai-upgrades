import React from 'react';
import { motion } from 'framer-motion';

const AuroraBackground = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full">
        <motion.div
          className="absolute top-[-20%] left-[-20%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'mirror' }}
        />
        <motion.div
          className="absolute bottom-[-20%] right-[-20%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-3xl"
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, repeatType: 'mirror', delay: 5 }}
        />
        <motion.div
          className="absolute top-[10%] right-[10%] w-[30vw] h-[30vw] bg-emerald-600/10 rounded-full blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 30, repeat: Infinity, repeatType: 'mirror', delay: 10 }}
        />
      </div>
    </motion.div>
  );
};

export default AuroraBackground;