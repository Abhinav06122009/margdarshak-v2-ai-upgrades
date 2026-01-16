import React, { ReactNode, useContext } from 'react';
import { motion } from 'framer-motion';
import { CursorContext } from '@/lib/CursorContext';
import { cn } from '@/lib/utils';

interface NeumorphicButtonProps extends React.ComponentProps<typeof motion.button> {
  children: ReactNode;
  className?: string;
}

const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({ children, className, ...props }) => {
  const { setCursorVariant } = useContext(CursorContext);

  return (
    <motion.button
      onMouseEnter={() => setCursorVariant('link')}
      onMouseLeave={() => setCursorVariant('default')}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'px-6 py-3 rounded-xl font-semibold text-white/80 transition-all duration-200',
        'bg-gradient-to-br from-gray-800 to-gray-900',
        'shadow-[8px_8px_16px_#060606,-8px_-8px_16px_#1a1a1a]',
        'active:shadow-[inset_8px_8px_16px_#060606,inset_-8px_-8px_16px_#1a1a1a]',
        'hover:text-emerald-400',
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default NeumorphicButton;