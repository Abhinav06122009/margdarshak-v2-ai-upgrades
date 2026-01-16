// src/components/timetable/TimetableHeader.tsx

import React from 'react';
import { ArrowLeft, BrainCircuit, Calendar, ChevronLeft, ChevronRight, Clock, Palette, Plus, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimetableHeaderProps {
  onBack: () => void;
  currentDate: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onAddEvent: () => void;
  onSmartAction: (action: 'balance' | 'breaks') => void;
  eventCount?: number;
  userName?: string;
}

const TimetableHeader = ({ 
  onBack, 
  currentDate, 
  onPreviousWeek, 
  onNextWeek, 
  onAddEvent,
  onSmartAction,
  eventCount = 0,
  userName = 'User'
}: TimetableHeaderProps) => {
  
  const formatWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: startOfWeek.getFullYear() !== endOfWeek.getFullYear() ? 'numeric' : undefined
    };
    
    return `${startOfWeek.toLocaleDateString('en-US', options)} - ${endOfWeek.toLocaleDateString('en-US', options)}`;
  };

  const getCurrentWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(currentDate.getDate() - day);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Multi-color day system
  const getDayColors = () => [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#F7DC6F'
  ];

  const getDayNames = () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const weekColors = getDayColors();
  const dayNames = getDayNames();
  const today = new Date();
  const currentWeekDates = getCurrentWeekDates();

  return (
    <motion.div 
      className="relative overflow-hidden border-b border-white/20"
      style={{
        background: `linear-gradient(135deg, #3B82F615, #10B98110, #EF444415)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Multi-color accent strips */}
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        {weekColors.map((color, index) => (
          <motion.div 
            key={index}
            className="flex-1 h-full"
            style={{ backgroundColor: color }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          />
        ))}
      </div>

      <div className="relative px-6 py-6">
        <div className="w-full">
          {/* Main header row */}
          <div className="flex items-center justify-between mb-4">
            {/* Left section */}
            <div className="flex items-center space-x-6">
              <motion.button
                onClick={onBack}
                className="group p-3 bg-blur/transparent hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-white group-hover:text-white transition-colors" />
              </motion.button>
              
              <div>
                <motion.h1 
                  className="text-5xl font-black text-white mb-2 flex items-center gap-4 bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent drop-shadow-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  📅 Timetable Scheduler
                </motion.h1>
                <motion.p 
                  className="text-white/80 text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Advanced color-coded scheduling for <span className="font-semibold text-white">{userName}</span>
                </motion.p>
                
                {/* Stats badges */}
                <div className="flex items-center gap-4 mt-2">
                  <motion.div 
                    className="flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full border border-white/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Calendar className="w-4 h-4 text-blue-300" />
                    <span className="text-white text-sm font-medium">{eventCount} Events</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full border border-white/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Shield className="w-4 h-4 text-green-300" />
                    <span className="text-white text-sm font-medium">Secure & Private</span>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => onSmartAction('balance')}
                className="group p-3 bg-blur/transparent hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="AI Smart Actions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <BrainCircuit className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
              </motion.button>


              {/* Add event button */}
              <motion.button
                onClick={onAddEvent}
                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 px-8 py-4 font-bold text-lg text-white shadow-lg transition-all duration-300 ease-out hover:from-purple-700 hover:to-blue-700 hover:shadow-xl hover:shadow-purple-500/50 active:scale-95"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className="absolute inset-0 flex h-full w-full justify-center [transform:skewX(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skewX(-12deg)_translateX(100%)] bg-white/30" />
                <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90 mr-3 z-10" />
                <span className="relative z-10">Add Event</span>
              </motion.button>
            </div>
          </div>

          {/* Week overview indicators */}
          <motion.div 
            className="flex items-center justify-center space-x-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {dayNames.map((day, index) => {
              const weekDate = currentWeekDates[index];
              const isToday = today.toDateString() === weekDate.toDateString();
              const isPast = weekDate < today && !isToday;
              const dayColor = weekColors[index];
              
              return (
                <motion.div
                  key={day}
                  className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isToday 
                      ? 'bg-white/30 text-white border-2 border-white/60 shadow-lg scale-110' 
                      : isPast
                      ? 'bg-white/5 text-white/40 border border-white/10'
                      : 'bg-white/15 text-white/90 hover:bg-white/25 border border-white/20 hover:border-white/40'
                  }`}
                  style={{ 
                    borderTop: `3px solid ${dayColor}`,
                    boxShadow: isToday ? `0 0 20px ${dayColor}40` : undefined
                  }}
                  whileHover={!isPast ? { scale: 1.1, y: -2 } : {}}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index + 0.7 }}
                >
                  <div className="flex flex-col items-center">
                    <span className="font-bold">{day}</span>
                    <span className="text-xs opacity-80">{weekDate.getDate()}</span>
                  </div>
                  
                  {isToday && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                      style={{ backgroundColor: dayColor }}
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Bottom multi-color gradient border */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${weekColors.join(', ')})`,
          opacity: 0.8
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      />
    </motion.div>
  );
};

export default TimetableHeader;
