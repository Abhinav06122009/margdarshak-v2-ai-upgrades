import React from 'react';
import { motion } from 'framer-motion';

const SectionHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="text-center mb-16">
    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h2>
    <p className="text-lg text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
    <motion.div      
      className="w-24 h-1 bg-blue-500 mx-auto mt-4 rounded-full"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1, transition: { duration: 0.8, ease: 'easeOut' } }}
      viewport={{ once: true }}
    />
  </div>
);

export default SectionHeader;