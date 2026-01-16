import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedText } from '@/components/ui/animated-text';

const Hero = () => {
  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat h-screen flex items-center justify-center text-white"
      style={{ backgroundImage: "url('https://via.placeholder.com/1920x1080')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-6xl font-bold mb-4">
            <AnimatedText text="Welcome to MARGDARSHAK" />
          </h1>
          <p className="text-2xl mb-8">
            The ultimate platform for modern education.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg"
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;