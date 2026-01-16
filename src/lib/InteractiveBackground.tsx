import React from 'react';
import { motion } from 'framer-motion';
import AuroraBackground from '@/components/ui/AuroraBackground';

const GridPattern = () => (
  <div className="absolute inset-0 h-full w-full bg-transparent bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>
);

const FloatingShape = ({ className, ...props }: React.ComponentProps<typeof motion.div>) => (
  <motion.div
    className={`absolute rounded-full mix-blend-soft-light ${className}`}
    animate={{
      scale: [1, 1.2, 1],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: Math.random() * 20 + 20,
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
    }}
    {...props}
  />
);

const InteractiveBackground = () => {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden bg-[#0A0A0A]">
      <AuroraBackground />
      <GridPattern />
      <div className="relative h-full w-full">
        <FloatingShape className="w-64 h-64 bg-blue-500/10 blur-2xl" style={{ top: '10%', left: '15%' }} />
        <FloatingShape className="w-72 h-72 bg-purple-500/10 blur-3xl" style={{ bottom: '5%', right: '10%' }} transition={{ duration: 35, repeat: Infinity, repeatType: 'mirror' }} />
        <FloatingShape className="w-48 h-48 bg-emerald-500/5 blur-xl" style={{ top: '20%', right: '25%' }} transition={{ duration: 28, repeat: Infinity, repeatType: 'mirror' }} />
        <FloatingShape className="w-32 h-32 bg-pink-500/10 blur-2xl" style={{ bottom: '25%', left: '5%' }} transition={{ duration: 22, repeat: Infinity, repeatType: 'mirror' }} />
      </div>
    </div>
  );
};

export default InteractiveBackground;