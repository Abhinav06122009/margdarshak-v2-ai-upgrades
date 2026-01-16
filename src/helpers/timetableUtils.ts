// src/helpers/timetableUtils.ts

import { supabase } from '@/integrations/supabase/client';
import React from 'react';
import { BookOpen, AlertCircle, Calendar, Clock, Palette, Users, GraduationCap } from 'lucide-react';

// Define interfaces for better type safety and clarity
export interface TimetableEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  day: number; // 0=Sunday, 1=Monday, 2=Tuesday, etc. (JavaScript Date.getDay() format)
  start_time: string;
  end_time: string;
  color?: string;
  location?: string;
  instructor?: string;
  course_code?: string;
  course_id?: string;
  room_number?: string;
  building?: string;
  category: 'class' | 'meeting' | 'exam' | 'lab' | 'seminar' | 'break' | 'personal' | 'event';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'cancelled' | 'rescheduled' | 'completed';
  recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrence_end?: string;
  week_type: 'all' | 'odd' | 'even';
  semester?: string;
  academic_year: string;
  credits?: number;
  attendance_required: boolean;
  online_meeting_link?: string;
  meeting_password?: string;
  notes?: string;
  reminder_minutes: number;
  reminder_enabled: boolean;
  is_public: boolean;
  is_exam: boolean;
  exam_type?: string;
  preparation_time: number;
  tags?: string[];
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

export interface TimetableStats {
  total_events: number;
  classes: number;
  meetings: number;
  exams: number;
  labs: number;
  total_weekly_hours: number;
  busiest_day: number;
  most_common_location: string;
  categories: Record<string, number>;
  daily_distribution: Record<number, number>;
}

export interface SecureUser {
  id: string;
  email: string;
  profile?: {
    full_name: string;
    user_type: string;
    student_id?: string;
    department?: string;
    academic_year?: string;
  };
}

export interface EventFormData {
  title: string;
  description: string;
  day: number;
  start_time: string;
  end_time: string;
  location: string;
  instructor: string;
  course_code: string;
  room_number: string;
  building: string;
  category: 'class' | 'meeting' | 'exam' | 'lab' | 'seminar' | 'break' | 'personal' | 'event';
  semester: string;
  credits?: number;
  attendance_required: boolean;
  online_meeting_link: string;
  meeting_password: string;
  notes: string;
  reminder_minutes: number;
  reminder_enabled: boolean;
  is_public: boolean;
  is_exam: boolean;
  exam_type: string;
  preparation_time: number;
  tags: string;
}

export const timetableUtils = {
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

  getSlotBackgroundColor: (event: { category: string; color?: string }) => {
    if (event.color) return event.color;
    const categories = timetableUtils.getEventCategories();
    const category = categories.find(c => c.id === event.category);
    return category?.color || '#3B82F6';
  },

  getCategoryIcon: (category?: string) => {
    const categories = timetableUtils.getEventCategories();
    const cat = categories.find(c => c.id === category);
    return cat?.icon || '📅';
  },

  getDayColors: () => [
    { day: 0, color: '#FF6B6B', name: 'Sunday' },
    { day: 1, color: '#4ECDC4', name: 'Monday' },
    { day: 2, color: '#45B7D1', name: 'Tuesday' },
    { day: 3, color: '#96CEB4', name: 'Wednesday' },
    { day: 4, color: '#FFEAA7', name: 'Thursday' },
    { day: 5, color: '#DDA0DD', name: 'Friday' },
    { day: 6, color: '#F7DC6F', name: 'Saturday' }
  ],

  getPriorityColorIntensity: (priority: string = 'medium') => {
    const intensities: Record<string, string> = {
      'low': '70',
      'medium': '85',
      'high': '95',
      'urgent': '100'
    };
    return intensities[priority] || '85';
  },

  getTimeZoneColor: (startTime: string) => {
    const hour = parseInt(startTime.split(':')[0]);
    
    if (hour >= 6 && hour < 12) {
      return '#FFE4B5'; // Morning
    } else if (hour >= 12 && hour < 17) {
      return '#E0F6FF'; // Afternoon
    } else if (hour >= 17 && hour < 21) {
      return '#F0E68C'; // Evening
    } else {
      return '#E6E6FA'; // Night
    }
  },

  getCompleteSlotStyle: (event: any, dayIndex: number) => {
    const categoryColor = timetableUtils.getSlotBackgroundColor(event);
    const priorityIntensity = timetableUtils.getPriorityColorIntensity(event.priority);
    const dayColor = timetableUtils.getDayColors()[dayIndex]?.color;
    const timeZoneColor = timetableUtils.getTimeZoneColor(event.time || event.start_time);
    
    return {
      backgroundColor: categoryColor,
      opacity: parseInt(priorityIntensity) / 100,
      borderLeft: `4px solid ${categoryColor}`,
      borderTop: dayColor ? `2px solid ${dayColor}` : undefined,
      borderBottom: `1px solid ${timeZoneColor}50`,
      boxShadow: event.priority === 'urgent' 
        ? `0 0 12px ${categoryColor}80, 0 4px 8px rgba(0,0,0,0.2)` 
        : '0 2px 4px rgba(0,0,0,0.1)',
      color: 'white',
      padding: '8px',
      borderRadius: '6px',
      margin: '2px 0',
      transition: 'all 0.2s ease'
    };
  },

  getDayNames: () => [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ],

  formatTime: (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  getCurrentWeekDates: (currentDate: Date) => {
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

export const fetchUserTimetable = async (userId: string): Promise<TimetableEvent[]> => {
  const { data, error } = await supabase
    .from('timetable_events')
    .select('*')
    .eq('user_id', userId)
    .order('day', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching timetable:', error);
    throw error;
  }
  return data || [];
};

export const getTimetableStatistics = async (userId: string): Promise<TimetableStats> => {
    const { data: events, error } = await supabase
        .from('timetable_events')
        .select('category, day, start_time, end_time, location')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching stats:', error);
        throw error;
    }

    if (!events || events.length === 0) {
        return {
            total_events: 0,
            classes: 0,
            meetings: 0,
            exams: 0,
            labs: 0,
            total_weekly_hours: 0,
            busiest_day: -1,
            most_common_location: 'N/A',
            categories: {},
            daily_distribution: {},
        };
    }

    const stats: TimetableStats = {
        total_events: events.length,
        classes: 0,
        meetings: 0,
        exams: 0,
        labs: 0,
        total_weekly_hours: 0,
        busiest_day: 0,
        most_common_location: 'N/A',
        categories: {},
        daily_distribution: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    };

    const locationCounts: Record<string, number> = {};

    events.forEach(event => {
        stats.categories[event.category] = (stats.categories[event.category] || 0) + 1;
        if (event.category === 'class') stats.classes++;
        if (event.category === 'meeting') stats.meetings++;
        if (event.category === 'exam') stats.exams++;
        if (event.category === 'lab') stats.labs++;

        stats.daily_distribution[event.day] = (stats.daily_distribution[event.day] || 0) + 1;

        const start = new Date(`1970-01-01T${event.start_time}`);
        const end = new Date(`1970-01-01T${event.end_time}`);
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        stats.total_weekly_hours += durationHours;

        if (event.location) {
            locationCounts[event.location] = (locationCounts[event.location] || 0) + 1;
        }
    });

    if (Object.keys(stats.daily_distribution).length > 0) {
      stats.busiest_day = Object.keys(stats.daily_distribution).reduce((a, b) => 
          stats.daily_distribution[Number(a)] > stats.daily_distribution[Number(b)] ? Number(a) : Number(b)
      , 0);
    }

    if (Object.keys(locationCounts).length > 0) {
        stats.most_common_location = Object.keys(locationCounts).reduce((a, b) => 
            locationCounts[a] > locationCounts[b] ? a : b
        );
    }

    return stats;
};

export const createEvent = async (formData: EventFormData, userId: string): Promise<TimetableEvent> => {
  const { data, error } = await supabase
    .from('timetable_events')
    .insert([{ ...formData, user_id: userId, tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean) }])
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }
  return data;
};

export const updateEvent = async (eventId: string, formData: EventFormData, userId: string): Promise<TimetableEvent> => {
  const { data, error } = await supabase
    .from('timetable_events')
    .update({ ...formData, user_id: userId, tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean) })
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    throw error;
  }
  return data;
};

export const deleteEvent = async (eventId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('timetable_events')
    .delete()
    .eq('id', eventId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

export const searchTimetableEvents = async (
  searchTerm: string,
  userId: string,
  filterDay?: number,
  filterCategory?: string
): Promise<TimetableEvent[]> => {
  let query = supabase.from('timetable_events').select('*').eq('user_id', userId);

  if (searchTerm) {
    query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,instructor.ilike.%${searchTerm}%,course_code.ilike.%${searchTerm}%`);
  }
  if (filterDay !== undefined) query = query.eq('day', filterDay);
  if (filterCategory && filterCategory !== 'all') query = query.eq('category', filterCategory);

  const { data, error } = await query.order('day').order('start_time');

  if (error) {
    console.error('Error searching events:', error);
    throw error;
  }
  return data || [];
};
