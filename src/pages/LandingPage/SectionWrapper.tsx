import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const SectionWrapper = ({ children, id, className = '' }: { children: React.ReactNode, id: string, className?: string }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  React.useEffect(() => {
    if (inView) { controls.start('visible'); }
  }, [controls, inView]);

  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] } }
      }}
      className={`py-20 md:py-28 px-6 relative ${className}`}
    >
      {children}
    </motion.section>
  );
};

export default SectionWrapper;