import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Users, BarChart, Shield, LifeBuoy } from 'lucide-react';

const features = [
  {
    name: 'Personalized Learning',
    description: 'Smart recommendations and adaptive learning paths.',
    icon: <Brain className="w-12 h-12 text-blue-500" />,
  },
  {
    name: 'Interactive Content',
    description: 'Engaging quizzes, simulations, and hands-on projects.',
    icon: <Zap className="w-12 h-12 text-green-500" />,
  },
  {
    name: 'Collaborative Tools',
    description: 'Real-time collaboration on projects and assignments.',
    icon: <Users className="w-12 h-12 text-purple-500" />,
  },
  {
    name: 'Progress Tracking',
    description: 'Detailed analytics and progress reports to monitor your growth.',
    icon: <BarChart className="w-12 h-12 text-yellow-500" />,
  },
  {
    name: 'Secure & Reliable',
    description: 'Built with a zero-trust security framework to protect your data.',
    icon: <Shield className="w-12 h-12 text-red-500" />,
  },
  {
    name: '24/7 Support',
    description: 'Get help from our instant virtual assistant and human support agents.',
    icon: <LifeBuoy className="w-12 h-12 text-indigo-500" />,
  },
];

const Features = () => {
  return (
    <section className="bg-gray-800 py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-white text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-gray-900 rounded-lg p-8 flex flex-col items-center text-center"
              whileHover={{ scale: 1.05, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.name}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;