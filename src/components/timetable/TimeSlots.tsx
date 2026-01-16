// src/components/timetable/TimeSlots.tsx

import React from 'react';
import { Clock, Sun, Sunset, Moon } from 'lucide-react';

interface TimeSlotsProps {
  colorHelpers?: any;
}

const TimeSlots: React.FC<TimeSlotsProps> = ({ colorHelpers }) => {
  const timeSlots = [];
  for (let hour = 3; hour < 24; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  const getTimeZoneInfo = (timeSlot: string) => {
    const hour = parseInt(timeSlot.split(':')[0]);
    
    // Aligned with Timetable.tsx ColorLegend for consistency
    if (hour >= 6 && hour < 12) {
      return { color: '#FFE4B5', accent: '#FFB74D', label: 'Morning', emoji: '🌅' };
    } else if (hour >= 12 && hour < 17) {
      return { color: '#E0F6FF', accent: '#4FC3F7', label: 'Afternoon', emoji: '☀️' };
    } else if (hour >= 17 && hour < 21) {
      return { color: '#F0E68C', accent: '#FFC107', label: 'Evening', emoji: '🌆' };
    } else {
      // Corrected color and logic to match Timetable.tsx
      return { color: '#E6E6FA', accent: '#BA68C8', label: 'Night', emoji: '🌙' };
    }
  };

  const formatTime = (time: string) => {
    const date = new Date(`2000-01-01T${time}`);
    const hour12 = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const [hour, minute] = time.split(':');
    return { time12: hour12, time24: `${hour}:${minute}` };
  };

  return (
    <div className="w-24 bg-black/10 border-r border-white/10 text-white/80 shrink-0">
      {/* Time entries */}
      {timeSlots.map((timeSlot, index) => {
        const timeInfo = getTimeZoneInfo(timeSlot);
        const { time12, time24 } = formatTime(timeSlot);

        return (
          <div
            key={timeSlot} // Each time slot is 100px high
            className="h-[100px] border-b border-white/5 p-2 relative flex flex-col items-center justify-center text-center group"
          >
            {/* Time zone indicator */}
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: timeInfo.accent }}
            />
            <div className="text-lg group-hover:scale-110 transition-transform duration-200">{timeInfo.emoji}</div>
            <div className="text-sm font-bold group-hover:text-white transition-colors duration-200" style={{ color: timeInfo.accent }}>
              {time24}
            </div>
            <div className="text-xs opacity-70 group-hover:opacity-100 transition-opacity duration-200">{time12}</div>
          </div>
        );
      })}
    </div>
  );
};

export default TimeSlots;
