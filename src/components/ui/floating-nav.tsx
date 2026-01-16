import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Calendar,
  CheckSquare,
  Timer,
  BookOpen,
  Trophy,
  Calculator,
  GraduationCap,
  UserCheck,
  Book,
  FolderOpen,
  Shield,
  FileText,
  Target, // ✅ Added for Progress Tracker
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingNavProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

// Enhanced Custom Styles with World-Class Color Matching
const navStyles = `
  .floating-nav-container {
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(25px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  .nav-item-active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #B24BF3 100%);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  }

  .nav-item-hover:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 255, 255, 0.1);
  }

  .nav-tooltip {
    background: linear-gradient(135deg, #0A0A0A 0%, #1A1A2E 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
    50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.6); }
  }
`;

// Add styles to document head
const addNavStyles = () => {
  if (document.getElementById('floating-nav-styles')) {
    return;
  }

  const styleSheet = document.createElement("style");
  styleSheet.id = 'floating-nav-styles';
  styleSheet.type = "text/css";
  styleSheet.innerText = navStyles;
  document.head.appendChild(styleSheet);
};

// Enhanced navigation items with Progress Tracker + world-class color matching
const navigationItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'courses', icon: Book, label: 'Courses' },
  { id: 'timetable', icon: Calendar, label: 'Timetable' },
  { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
  { id: 'progress', icon: Target, label: 'Progress Tracker' }, // ✅ Added Progress Tracker
  { id: 'notes', icon: BookOpen, label: 'Notes' },
  { id: 'grades', icon: Trophy, label: 'Grades' },
  { id: 'syllabus', icon: GraduationCap, label: 'Syllabus' },
  { id: 'resources', icon: FolderOpen, label: 'Resources' },
  // Legal pages
  { id: 'privacy', icon: Shield, label: 'Privacy Policy' },
  { id: 'terms', icon: FileText, label: 'Terms & Conditions' },
];

export const FloatingNav: React.FC<FloatingNavProps> = ({ onNavigate, currentPage }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    addNavStyles(); // ✅ Add enhanced styles
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(lastScrollY > currentScrollY || currentScrollY < 10);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="floating-nav-container rounded-2xl p-2 shadow-2xl">
            <div className="flex items-center space-x-1 overflow-x-auto max-w-screen-lg scrollbar-hide">
              {navigationItems.map((item, index) => {
                const isActive = currentPage === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      'relative p-3 rounded-xl transition-all duration-300 flex-shrink-0 group nav-item-hover',
                      isActive
                        ? 'nav-item-active text-black shadow-lg'
                        : 'text-black/70 hover:text-black'
                    )}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { type: "spring", stiffness: 400, damping: 10 }
                    }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { 
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }
                    }}
                  >
                    <motion.div
                      animate={isActive ? {
                        rotate: [0, 360],
                        transition: { duration: 2, repeat: Infinity, ease: "linear" }
                      } : {}}
                    >
                      <item.icon className="w-5 h-5" />
                    </motion.div>

                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 50%, rgba(178, 75, 243, 0.3) 100%)',
                          animation: 'pulseGlow 2s ease-in-out infinite'
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}

                    {/* Enhanced Tooltip */}
                    <motion.div 
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 nav-tooltip text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none"
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      whileHover={{ opacity: 1, y: 0, scale: 1 }}
                    >
                      {item.label}
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </motion.div>

                    {/* Special indicator for Progress Tracker */}
                    {item.id === 'progress' && (
                      <motion.div
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Navigation Indicator */}
          <motion.div
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {navigationItems.slice(0, 3).map((_, index) => (
              <motion.div
                key={index}
                className="w-1 h-1 bg-white/30 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};