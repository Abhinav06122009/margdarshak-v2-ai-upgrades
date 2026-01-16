import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Award, TrendingUp, Zap } from 'lucide-react';
import AnimatedGradientText from './AnimatedGradientText';
import MagneticButton from './MagneticButton';

const Hero = () => {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <motion.section 
      id="home" 
      style={{ scale, opacity }}
      className="relative text-white text-center px-6 overflow-hidden h-screen flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-grid-white/[0.07] z-0"></div>
      <div className="relative z-10 max-w-6xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6"
      >
        <AnimatedGradientText>Unlock Your Academic Potential</AnimatedGradientText>
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10"
      >
        MARGDARSHAK is the all-in-one, AI-powered student management system designed to streamline your studies. Use our task manager, schedule maker, and grade tracker to boost productivity and secure your academic journey.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.6, type: 'spring', stiffness: 150 }}
      >
        <MagneticButton>
          <Link to="/auth" className="inline-flex items-center gap-3 bg-white text-gray-900 font-bold py-4 px-10 rounded-xl text-lg shadow-2xl shadow-emerald-500/30 button-interactive relative overflow-hidden shimmer-effect button-nova group">
            Start Learning Now <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </MagneticButton>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-20"
        >
          {[
            { icon: Users, value: '50K+', label: 'Active Students' },
            { icon: Award, value: '98%', label: 'Success Rate' },
            { icon: TrendingUp, value: '4.9/5', label: 'User Rating' },
            { icon: Zap, value: '24/7', label: 'Support' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + index * 0.1, type: "spring" }}
              whileHover={{ scale: 1.1, y: -5 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4"
            >
              <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
          >
            <motion.div animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1 h-2 bg-white rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Hero;