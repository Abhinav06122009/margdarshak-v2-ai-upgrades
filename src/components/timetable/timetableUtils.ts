import { supabase } from '@/integrations/supabase/client';

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
  
  // AI Feature Interfaces
  export interface ConflictInfo {
    conflictingEvent: TimetableEvent;
    eventToSchedule: TimetableEvent;
    suggestedSlot: {
      day: number;
      start_time: string;
      end_time: string;
    } | null;
  }
  
  export interface WorkloadSuggestion {
    eventToMove: TimetableEvent;
    newSlot: { day: number; start_time: string; end_time: string };
    fromDay: number;
    toDay: number;
    workloadBefore: number;
    workloadAfter: number;
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
      role?: string; // Added role for RBAC
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
  
  // Enhanced helper functions with complete multi-color support
  export const timetableHelpers = {
    getCurrentUser: async (): Promise<SecureUser | null> => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return null;
  
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
  
        return {
          id: user.id,
          email: user.email || '',
          profile: profile ? {
            full_name: profile.full_name || 'User',
            user_type: profile.user_type || 'student',
            student_id: profile.student_id,
            department: profile.department,
            academic_year: profile.academic_year || '2024-25',
            role: profile.role || 'user' // Default role
          } : { role: 'user' }
        };
      } catch (error) {
        console.error('Error getting current user:', error);
        return null;
      }
    },
  
    fetchUserTimetable: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('user_timetables')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('day', { ascending: true })
          .order('start_time', { ascending: true });
  
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching user timetable:', error);
        return [];
      }
    },
  
    getTimetableStatistics: (events: TimetableEvent[]): TimetableStats | null => {
        if (!events || events.length === 0) return null;
        
        const stats: TimetableStats = {
          total_events: events.length,
          classes: events.filter(e => e.category === 'class').length,
          meetings: events.filter(e => e.category === 'meeting').length,
          exams: events.filter(e => e.category === 'exam').length,
          labs: events.filter(e => e.category === 'lab').length,
          total_weekly_hours: events.reduce((total, event) => {
            const start = new Date(`2024-01-01T${event.start_time}`);
            const end = new Date(`2024-01-01T${event.end_time}`);
            return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          }, 0),
          busiest_day: 1,
          most_common_location: 'N/A',
          categories: events.reduce((acc, event) => {
            acc[event.category] = (acc[event.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          daily_distribution: events.reduce((acc, event) => {
            acc[event.day] = (acc[event.day] || 0) + 1;
            return acc;
          }, {} as Record<number, number>)
        };
  
        const locationCounts = events.reduce((acc, event) => {
            if (event.location) {
                acc[event.location] = (acc[event.location] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const locationEntries = Object.entries(locationCounts);
        if (locationEntries.length > 0) {
            stats.most_common_location = locationEntries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
        }
  
        return stats;
    },
  
    createEvent: async (eventData: any, userId: string) => {
      try {
        const cleanData = {
          user_id: userId,
          title: eventData.title,
          description: eventData.description || null,
          day: eventData.day,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          color: eventData.color || timetableHelpers.getSlotBackgroundColor({
            category: eventData.category,
            color: eventData.color
          }),
          location: eventData.location || null,
          instructor: eventData.instructor || null,
          course_code: eventData.course_code || null,
          room_number: eventData.room_number || null,
          building: eventData.building || null,
          category: eventData.category,
          priority: 'medium',
          status: 'active',
          recurrence_type: 'weekly',
          week_type: 'all',
          semester: eventData.semester || null,
          academic_year: '2024-25', // Should be based on user profile or a setting
          credits: eventData.credits ?? null,
          attendance_required: eventData.attendance_required !== false,
          online_meeting_link: eventData.online_meeting_link || null,
          meeting_password: eventData.meeting_password || null,
          notes: eventData.notes || null,
          reminder_minutes: eventData.reminder_minutes ?? 15,
          reminder_enabled: eventData.reminder_enabled !== false,
          is_public: eventData.is_public || false,
          is_exam: eventData.is_exam || false,
          exam_type: eventData.exam_type || null,
          preparation_time: eventData.preparation_time ?? 0,
        tags: typeof eventData.tags === 'string' 
          ? eventData.tags.split(',').map((tag: string) => tag.trim()) 
          : (eventData.tags || []),
        };
  
        const { data, error } = await supabase
          .from('user_timetables')
          .insert([cleanData])
          .select()
          .single();
  
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating event:', error);
        throw error;
      }
    },
  
    updateEvent: async (eventId: string, eventData: any, userId: string) => {
      try {
        const cleanData: Partial<TimetableEvent> = {
          title: eventData.title,
          description: eventData.description || null,
          day: eventData.day,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          location: eventData.location || null,
          instructor: eventData.instructor || null,
          course_code: eventData.course_code || null,
          room_number: eventData.room_number || null,
          building: eventData.building || null,
          category: eventData.category,
          semester: eventData.semester || null,
          credits: eventData.credits ?? null,
          attendance_required: eventData.attendance_required !== false,
          online_meeting_link: eventData.online_meeting_link || null,
          meeting_password: eventData.meeting_password || null,
          notes: eventData.notes || null,
          reminder_minutes: eventData.reminder_minutes ?? 15,
          reminder_enabled: eventData.reminder_enabled !== false,
          is_public: eventData.is_public || false,
          is_exam: eventData.is_exam || false,
          exam_type: eventData.exam_type || null,
          preparation_time: eventData.preparation_time ?? 0,
          tags: typeof eventData.tags === 'string'
            ? eventData.tags.split(',').map((tag: string) => tag.trim())
            : (eventData.tags || []),
          priority: eventData.priority || 'medium',
          status: eventData.status || 'active',
          recurrence_type: eventData.recurrence_type || 'weekly',
          week_type: eventData.week_type || 'all',
          academic_year: eventData.academic_year || '2024-25',
          attachments: eventData.attachments || [],
          color: eventData.color,
        };
  
        Object.keys(cleanData).forEach(key => {
          const k = key as keyof typeof cleanData;
          if (cleanData[k] === undefined) {
            delete cleanData[k];
          }
        });
  
        const { data, error } = await supabase
          .from('user_timetables')
          .update(cleanData)
          .eq('id', eventId)
          .eq('user_id', userId)
          .select()
          .single();
  
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error updating event:', error);
        throw error;
      }
    },
  
    deleteEvent: async (eventId: string, userId: string) => {
      try {
        const { error } = await supabase
          .from('user_timetables')
          .delete()
          .eq('id', eventId)
          .eq('user_id', userId);
  
        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
      }
    },
  
    searchTimetableEvents: async (query: string, userId: string, day?: number, category?: string) => {
      try {
        let queryBuilder = supabase
          .from('user_timetables')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active');
  
        if (query) {
          queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,instructor.ilike.%${query}%,location.ilike.%${query}%,course_code.ilike.%${query}%`);
        }
  
        if (day !== undefined) {
          queryBuilder = queryBuilder.eq('day', day);
        }
  
        if (category && category !== 'all') {
          queryBuilder = queryBuilder.eq('category', category);
        }
  
        const { data, error } = await queryBuilder.order('day', { ascending: true }).order('start_time', { ascending: true });
  
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error searching timetable events:', error);
        return [];
      }
    },
  
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
  
    getSlotBackgroundColor: (event: any) => {
      if (event.color) return event.color;
      const categories = timetableHelpers.getEventCategories();
      const category = categories.find(c => c.id === event.category);
      return category?.color || '#3B82F6';
    },
  
    getCategoryIcon: (category?: string) => {
      const categories = timetableHelpers.getEventCategories();
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
        'high': '90',
        'urgent': '95'
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
      const categoryColor = timetableHelpers.getSlotBackgroundColor(event);
      const priorityIntensity = timetableHelpers.getPriorityColorIntensity(event.priority);
      const dayColor = timetableHelpers.getDayColors()[dayIndex]?.color;
      const timeZoneColor = timetableHelpers.getTimeZoneColor(event.time || event.start_time);
      
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
  
    getEventHeight: (startTime: string, endTime: string) => {
      const start = new Date(`2024-01-01T${startTime}`);
      const end = new Date(`2024-01-01T${endTime}`);
      const diffMs = end.getTime() - start.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return Math.max(diffHours * 100, 50);
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
    }
  };
  
  // AI-Powered Smart Scheduling Assistant
  export const smartScheduler = {
    findNextAvailableSlot: (
      allEvents: TimetableEvent[],
      eventToSchedule: Omit<TimetableEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
      startSearchDay: number
    ): { day: number; start_time: string; end_time: string } | null => {
      const durationMs = new Date(`2000-01-01T${eventToSchedule.end_time}`).getTime() - new Date(`2000-01-01T${eventToSchedule.start_time}`).getTime();
  
      const sortedEvents = [...allEvents].sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        return a.start_time.localeCompare(b.start_time);
      });
  
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDay = (startSearchDay + dayOffset) % 7;
        const eventsOnDay = sortedEvents.filter(e => e.day === currentDay && e.id !== (eventToSchedule as TimetableEvent).id);
  
        let lastEndTime = '05:00'; // Start checking from 5 AM
  
        for (const event of eventsOnDay) {
          const potentialStartTime = new Date(`2000-01-01T${lastEndTime}`);
          const nextEventStartTime = new Date(`2000-01-01T${event.start_time}`);
          
          if (nextEventStartTime.getTime() - potentialStartTime.getTime() >= durationMs) {
            const newEndTime = new Date(potentialStartTime.getTime() + durationMs);
            return {
              day: currentDay,
              start_time: lastEndTime,
              end_time: `${String(newEndTime.getHours()).padStart(2, '0')}:${String(newEndTime.getMinutes()).padStart(2, '0')}`,
            };
          }
          lastEndTime = event.end_time > lastEndTime ? event.end_time : lastEndTime;
        }
  
        const endOfDay = new Date(`2000-01-01T23:59`);
        const potentialStartTimeAfterLast = new Date(`2000-01-01T${lastEndTime}`);
        if (endOfDay.getTime() - potentialStartTimeAfterLast.getTime() >= durationMs) {
          const newEndTime = new Date(potentialStartTimeAfterLast.getTime() + durationMs);
          return {
            day: currentDay,
            start_time: lastEndTime,
            end_time: `${String(newEndTime.getHours()).padStart(2, '0')}:${String(newEndTime.getMinutes()).padStart(2, '0')}`,
          };
        }
      }
      return null;
    },
  
    analyzeWorkload: (events: TimetableEvent[]): Record<number, number> => {
      const workload: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      events.forEach(event => {
        if (event.category === 'break' || event.category === 'personal') return;
        const start = new Date(`2000-01-01T${event.start_time}`);
        const end = new Date(`2000-01-01T${event.end_time}`);
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        workload[event.day] = (workload[event.day] || 0) + durationHours;
      });
      return workload;
    },
  
    balanceWorkload: (
      events: TimetableEvent[],
      workload: Record<number, number>
    ): WorkloadSuggestion[] | null => {
      const suggestions: WorkloadSuggestion[] = [];
      const averageWorkload = Object.values(workload).reduce((a, b) => a + b, 0) / 7;
      const busiestDay = Object.keys(workload).reduce((a, b) => workload[a as any] > workload[b as any] ? a : b);
      const leastBusyDay = Object.keys(workload).reduce((a, b) => workload[a as any] < workload[b as any] ? a : b);
  
      const busiestDayIndex = parseInt(busiestDay);
      const leastBusyDayIndex = parseInt(leastBusyDay);
  
      // Only suggest if there's a significant imbalance
      if (workload[busiestDayIndex] <= averageWorkload * 1.25 || workload[busiestDayIndex] - workload[leastBusyDayIndex] < 2) {
        return null;
      }
  
      // Find a movable event from the busiest day (e.g., personal tasks, study sessions)
      const movableEvents = events.filter(e => 
        e.day === busiestDayIndex && 
        ['personal', 'seminar', 'break'].includes(e.category)
      ).sort((a, b) => { // Prioritize shorter events to move
          const durationA = new Date(`2000-01-01T${a.end_time}`).getTime() - new Date(`2000-01-01T${a.start_time}`).getTime();
          const durationB = new Date(`2000-01-01T${b.end_time}`).getTime() - new Date(`2000-01-01T${b.start_time}`).getTime();
          return durationA - durationB;
      });
  
      if (movableEvents.length === 0) return null;
  
      const eventToMove = movableEvents[0];
      
      // Find a new slot on the least busy day
      const newSlot = smartScheduler.findNextAvailableSlot(events, eventToMove, leastBusyDayIndex);
  
      if (newSlot) {
        suggestions.push({
          eventToMove,
          newSlot,
          fromDay: busiestDayIndex,
          toDay: leastBusyDayIndex,
          workloadBefore: workload[busiestDayIndex],
          workloadAfter: workload[leastBusyDayIndex],
        });
        return suggestions;
      }
  
      return null;
    },
  };
  