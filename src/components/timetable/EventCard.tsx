// src/components/timetable/EventCard.tsx

import React from 'react';
import { Clock, MapPin, User, Edit, Trash2, AlertTriangle, Star, Eye } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  color?: string;
  location?: string;
  instructor?: string;
  category?: 'class' | 'meeting' | 'exam' | 'lab' | 'seminar' | 'break' | 'personal' | 'event';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  day?: number; // 0=Sunday, 1=Monday, 2=Tuesday, etc. (JavaScript Date.getDay() format)
  course_code?: string;
  tags?: string[];
  attendance_required?: boolean;
  is_exam?: boolean;
  credits?: number;
}

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string, title: string) => void;
  dayIndex?: number;
  onDragStart: (e: React.DragEvent, event: Event) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  isHighlighted?: boolean;
  hasPremiumAccess: boolean;
}

const colorHelpers = {
  getEventCategories: () => [
    { id: 'class', name: 'Class', color: '#3B82F6', icon: '📚' },
    { id: 'lab', name: 'Lab', color: '#10B981', icon: '🔬' },
    { id: 'exam', name: 'Exam', color: '#EF4444', icon: '📝' },
    { id: 'seminar', name: 'Seminar', color: '#8B5CF6', icon: '💭' },
    { id: 'meeting', name: 'Meeting', color: '#F59E0B', icon: '🤝' },
    { id: 'break', name: 'Break', color: '#6B7280', icon: '☕' },
    { id: 'personal', name: 'Personal', color: '#EC4899', icon: '👤' },
    { id: 'event', name: 'Event', color: '#14B8A6', icon: '🎉' },
  ],

  getSlotBackgroundColor: (event: Event) => {
    if (event.color) return event.color;
    const categories = colorHelpers.getEventCategories();
    const category = categories.find(c => c.id === event.category);
    return category?.color || '#3B82F6';
  },

  getCategoryIcon: (category?: string) => {
    const categories = colorHelpers.getEventCategories();
    const cat = categories.find(c => c.id === category);
    return cat?.icon || '📅';
  },

  getPriorityColorIntensity: (priority: string = 'medium') => {
    const intensities: Record<string, string> = {
      'low': '70',
      'medium': '85',
      'high': '95',
      'urgent': '100'
    };
    return intensities[priority] || '85';
  },

  getDayAccentColor: (dayIndex?: number) => {
    const dayColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#F7DC6F'
    ];
    return dayIndex !== undefined ? dayColors[dayIndex] : null;
  },

  getDayName: (dayIndex?: number) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayIndex !== undefined ? dayNames[dayIndex] : '';
  },

  getTimeZoneColor: (startTime: string) => {
    const hour = parseInt(startTime.split(':')[0]);
    
    if (hour >= 6 && hour < 12) {
      return '#FFE4B5';
    } else if (hour >= 12 && hour < 17) {
      return '#E0F6FF';
    } else if (hour >= 17 && hour < 21) {
      return '#F0E68C';
    } else {
      return '#E6E6FA';
    }
  },

  getContrastTextColor: (backgroundColor: string) => {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  }
};

const EventCard = ({ event, onEdit, onDelete, dayIndex, onDragStart, onSelect, isSelected, isHighlighted = false, hasPremiumAccess }: EventCardProps) => {
  const getEventHeight = (startTime: string, endTime: string) => {
    const start = new Date(`2024-01-01T${startTime}`);
    const end = new Date(`2024-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.max(diffHours * 100, 50); // Changed 80 to 100
  };

  const getEventTop = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startHour = 3; // Align with TimeSlots.tsx
    const position = (hours - startHour) * 100 + (minutes / 60) * 100;
    return Math.max(position, 0);
  };

  const getEnhancedCardStyle = () => {
    const baseColor = event.color || colorHelpers.getSlotBackgroundColor(event);
    const priorityIntensity = colorHelpers.getPriorityColorIntensity(event.priority);
    const dayAccentColor = colorHelpers.getDayAccentColor(dayIndex);
    const timeZoneColor = colorHelpers.getTimeZoneColor(event.start_time);
    const textColor = colorHelpers.getContrastTextColor(baseColor);

    let boxShadow = `0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)`; // Default subtle shadow
    
    if (event.priority === 'urgent') {
      boxShadow = `0 0 20px ${baseColor}90, 0 8px 25px rgba(0,0,0,0.3), var(--tw-shadow-neumorphic-light)`;
    } else if (event.priority === 'high') {
      boxShadow = `0 0 12px ${baseColor}60, 0 6px 15px rgba(0,0,0,0.2), var(--tw-shadow-neumorphic-light)`;
    } else if (isHighlighted) {
      boxShadow = `0 0 15px #FFD700, 0 6px 12px rgba(0,0,0,0.2), var(--tw-shadow-neumorphic-light)`;
    } else {
      boxShadow = `var(--tw-shadow-neumorphic-light)`; // Apply neumorphic shadow by default
    }

    return {
      backgroundColor: baseColor,
      opacity: parseInt(priorityIntensity) / 100,
      borderLeft: `5px solid ${baseColor}`, // Main category color
      borderTop: dayAccentColor ? `3px solid ${dayAccentColor}` : '1px solid rgba(255, 255, 255, 0.1)', // Day accent
      borderRight: `1px solid ${timeZoneColor}80`, // Time zone accent
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)', // Subtle bottom border
      boxShadow,
      top: getEventTop(event.start_time),
      height: getEventHeight(event.start_time, event.end_time),
      color: textColor,
      background: event.priority === 'urgent' 
        ? `linear-gradient(135deg, ${baseColor} 0%, ${baseColor}DD 50%, ${baseColor} 100%)`
        : `linear-gradient(145deg, ${baseColor} 0%, ${baseColor}CC 100%)`,
      backdropFilter: 'blur(10px)',
    };
  };

  const getPriorityIcon = () => {
    switch (event.priority) {
      case 'urgent':
        return <AlertTriangle className="w-3 h-3 text-red-200 animate-pulse" />;
      case 'high':
        return <Star className="w-3 h-3 text-orange-200" />;
      default:
        return null;
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = () => {
    const start = new Date(`2024-01-01T${event.start_time}`);
    const end = new Date(`2024-01-01T${event.end_time}`);
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      onSelect(event.id);
    } else {
      onEdit(event);
    }
  };

  return (
    <div
      className={`
        absolute left-1 right-1 rounded-lg p-2 text-xs 
        cursor-pointer group overflow-hidden transition-all duration-300 
        hover:scale-102 hover:shadow-xl hover:z-20
        ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-black' : isHighlighted ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''}
      `}
      style={getEnhancedCardStyle()}
      onClick={handleClick}
      draggable={hasPremiumAccess}
      onDragStart={(e) => onDragStart(e, event)}
    >
      {/* Category emoji indicator */}
      <div className="absolute top-1 left-1 text-lg opacity-80">
        {colorHelpers.getCategoryIcon(event.category)}
      </div>
      
      {/* Priority and day indicator */}
      <div className="flex items-center justify-between mb-1 pl-6">
        <div className="font-semibold truncate flex-1 pr-2 text-sm">
          {event.title}
        </div>
        <div className="flex items-center gap-1">
          {getPriorityIcon()}
          {dayIndex !== undefined && (
            <span className="text-xs font-bold opacity-70">
              {colorHelpers.getDayName(dayIndex)}
            </span>
          )}
        </div>
      </div>

      {/* Course code and credits */}
      <div className="flex items-center gap-2 mb-1">
        {event.course_code && ( // Course code badge
          <div className="inline-block px-2 py-0.5 bg-black/25 rounded text-xs font-mono">
            {event.course_code}
          </div>
        )}
        {event.credits && (
          <div className="inline-block px-2 py-0.5 bg-white/20 rounded text-xs">
            {event.credits} cr
          </div>
        )} 
        {event.is_exam && (
          <div className="inline-block px-2 py-0.5 bg-red-500/30 rounded text-xs font-bold">
            EXAM
          </div>
        )}
      </div>

      {/* Time display with duration */}
      <div className="flex items-center gap-1 mb-1 opacity-90"> {/* Time and Duration */}
        <Clock className="w-3 h-3 flex-shrink-0" />
        <span className="text-xs">
          {formatTime(event.start_time)} - {formatTime(event.end_time)}
        </span>
        <span className="text-xs opacity-70 ml-1">
          ({getDuration()})
        </span>
      </div>

      {/* Location with building info */}
      {event.location && ( // Location
        <div className="flex items-center gap-1 mb-1 opacity-90">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="text-xs truncate">{event.location}</span>
        </div>
      )}

      {/* Instructor */}
      {event.instructor && ( // Instructor
        <div className="flex items-center gap-1 mb-1 opacity-90">
          <User className="w-3 h-3 flex-shrink-0" />
          <span className="text-xs truncate">{event.instructor}</span>
        </div>
      )}

      {/* Attendance indicator */}
      {event.attendance_required && ( // Attendance Required
        <div className="flex items-center gap-1 mb-1 opacity-75">
          <Eye className="w-3 h-3" />
          <span className="text-xs">Attendance Required</span>
        </div>
      )}

      {/* Tags */}
      {event.tags && event.tags.length > 0 && ( // Tags
        <div className="flex flex-wrap gap-1 mb-1">
          {event.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index} 
              className="px-1.5 py-0.5 bg-white/25 rounded-full text-xs font-medium"
            >
              #{tag}
            </span>
          ))}
          {event.tags.length > 3 && (
            <span className="text-xs opacity-70 px-1">+{event.tags.length - 3} more</span>
          )}
        </div>
      )}

      {/* Priority indicator strip (top) */}
      <div className={`
        absolute top-0 left-0 w-full h-1 rounded-t-lg
        ${event.priority === 'urgent' ? 'bg-red-500' : ''}
        ${event.priority === 'high' ? 'bg-orange-500' : ''}
        ${event.priority === 'medium' ? 'bg-blue-500' : ''}
        ${event.priority === 'low' ? 'bg-gray-500' : ''}
      `} />

      {/* Time zone indicator */}
      <div 
        className="absolute right-0 top-0 w-1 h-full opacity-60"
        style={{ backgroundColor: colorHelpers.getTimeZoneColor(event.start_time) }}
      />

      {/* Category indicator dot (bottom-left) */}
      <div className="absolute bottom-2 left-2">
        <div 
          className="w-2 h-2 rounded-full border border-white/40 shadow-sm"
          style={{ backgroundColor: colorHelpers.getSlotBackgroundColor(event) }}
        />
      </div>

      {/* Action buttons */}
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(event);
          }}
          className="p-1 bg-white/25 hover:bg-white/40 rounded-full transition-colors shadow-neumorphic-light-sm hover:shadow-neumorphic-inset-sm"
          title="Edit event"
        >
          <Edit className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(event.id, event.title);
          }}
          className="p-1 bg-red-500/30 hover:bg-red-500/50 rounded-full transition-colors shadow-neumorphic-light-sm hover:shadow-neumorphic-inset-sm"
          title="Delete event"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg pointer-events-none z-0" />

      {/* Urgent event pulse effect */}
      {event.priority === 'urgent' && ( // Pulse effect for urgent events
        <div className="absolute inset-0 rounded-lg border-2 border-red-400 animate-pulse opacity-50 pointer-events-none" />
      )}
    </div>
  );
};

export default EventCard;
