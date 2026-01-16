// src/components/timetable/useTimetable.ts

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CalendarCheck, Edit3, CalendarPlus, Trash2, Zap, CheckCircle } from 'lucide-react';

// Interfaces (as defined in Timetable.tsx)
interface TimetableEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  day: number;
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

interface ConflictInfo {
  conflictingEvent: TimetableEvent;
  eventToSchedule: TimetableEvent;
  suggestedSlot: { day: number; start_time: string; end_time: string } | null;
}

interface WorkloadSuggestion {
  eventToMove: TimetableEvent;
  newSlot: { day: number; start_time: string; end_time: string };
  fromDay: number;
  toDay: number;
  workloadBefore: number;
  workloadAfter: number;
}

interface TimetableStats {
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

interface SecureUser {
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

const timetableHelpers = {
  // ... (Copy the entire timetableHelpers object from Timetable.tsx here)
  // For brevity, I'm omitting the full object, but you should copy it.
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
          academic_year: profile.academic_year || '2024-25'
        } : undefined
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  fetchUserTimetable: async (userId: string) => {
    // ... implementation
    return [];
  },
  // ... all other helper functions
};

const smartScheduler = {
  // ... (Copy the entire smartScheduler object from Timetable.tsx here)
  findNextAvailableSlot: (allEvents: TimetableEvent[], eventToSchedule: any, startSearchDay: number) => {
    // ... implementation
    return null;
  },
  // ... all other scheduler functions
};

export const useTimetable = () => {
  const [currentUser, setCurrentUser] = useState<SecureUser | null>(null);
  const [events, setEvents] = useState<TimetableEvent[]>([]);
  const [timetableStats, setTimetableStats] = useState<TimetableStats | null>(null);
  const [categories] = useState(timetableHelpers.getEventCategories());
  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimetableEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | undefined>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDay, setFilterDay] = useState('all');

  const [draggedEvent, setDraggedEvent] = useState<TimetableEvent | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);
  const [workloadSuggestions, setWorkloadSuggestions] = useState<WorkloadSuggestion[] | null>(null);

  const [formData, setFormData] = useState<EventFormData>({
    title: '', description: '', day: 1, start_time: '09:00', end_time: '10:00',
    location: '', instructor: '', course_code: '', room_number: '', building: '',
    category: 'class', semester: '', credits: undefined, attendance_required: true,
    online_meeting_link: '', meeting_password: '', notes: '', reminder_minutes: 15,
    reminder_enabled: true, is_public: false, is_exam: false, exam_type: '',
    preparation_time: 0, tags: '',
  });

  const { toast } = useToast();

  const initializeSecureTimetable = useCallback(async () => {
    try {
      setLoading(true);
      const user = await timetableHelpers.getCurrentUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access your timetable.",
          variant: "destructive",
        });
        setSecurityVerified(true);
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      setSecurityVerified(true);
      
      const [userTimetable, stats] = await Promise.all([
        timetableHelpers.fetchUserTimetable(user.id),
        timetableHelpers.getTimetableStatistics(user.id)
      ]);
      
      setEvents(userTimetable);
      setTimetableStats(stats);

      toast({
        title: (
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent font-bold">
            Timetable Ready
          </span>
        ),
        description: (
          <span className="text-white font-medium">
            Welcome <span className="text-cyan-400 font-semibold">{user.profile?.full_name}</span>! Your timetable was loaded successfully.
          </span>
        ),
        className: "bg-black border border-cyan-500/50 shadow-xl",
        icon: <CalendarCheck className="text-cyan-400" />,
        duration: 5000,
        isClosable: true,
        position: "top-right"
      });

    } catch (error) {
      console.error('Error initializing secure timetable:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize timetable system.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    initializeSecureTimetable();
  }, [initializeSecureTimetable]);

  const handlePreviousWeek = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  }, [currentDate]);

  const handleNextWeek = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  }, [currentDate]);

  const resetForm = useCallback(() => {
    setFormData({
      title: '', description: '', day: 1, start_time: '09:00', end_time: '10:00',
      location: '', instructor: '', course_code: '', room_number: '', building: '',
      category: 'class', semester: '', credits: undefined, attendance_required: true,
      online_meeting_link: '', meeting_password: '', notes: '', reminder_minutes: 15,
      reminder_enabled: true, is_public: false, is_exam: false, exam_type: '',
      preparation_time: 0, tags: '',
    });
  }, []);

  const handleAddEvent = useCallback(() => {
    resetForm();
    setEditingEvent(null);
    setSelectedDay(undefined);
    setIsSheetOpen(true);
  }, [resetForm]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to manage your timetable.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingEvent) {
        await timetableHelpers.updateEvent(editingEvent.id, formData, currentUser.id);
        toast({
          title: (
            <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent font-bold">
              Event Updated!
            </span>
          ),
          description: (
            <span className="text-white font-medium">
              "<span className="font-semibold text-pink-400">{formData.title}</span>" has been updated.
            </span>
          ),
          className: "bg-black border border-pink-500/60 shadow-xl",
          icon: <Edit3 className="text-pink-400" />,
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      } else {
        await timetableHelpers.createEvent(formData, currentUser.id);
        toast({
          title: (
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-bold">
              Event Created!
            </span>
          ),
          description: (
            <span className="text-white font-medium">
              "<span className="font-semibold text-indigo-400">{formData.title}</span>" event has been successfully added.
            </span>
          ),
          className: "bg-black border border-indigo-500/60 shadow-lg",
          icon: <CalendarPlus className="text-indigo-400" />,
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      }

      setIsSheetOpen(false);
      setEditingEvent(null);
      resetForm();
      const userTimetable = await timetableHelpers.fetchUserTimetable(currentUser.id);
      setEvents(userTimetable);
      const stats = await timetableHelpers.getTimetableStatistics(currentUser.id);
      setTimetableStats(stats);
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast({
        title: 'Error Saving Event',
        description: `Failed to save event: ${error.message || 'Please try again.'}`,
        variant: 'destructive',
      });
    }
  }, [currentUser, editingEvent, formData, resetForm, toast]);

  const handleEditEvent = useCallback((event: TimetableEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      day: event.day,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location || '',
      instructor: event.instructor || '',
      course_code: event.course_code || '',
      room_number: event.room_number || '',
      building: event.building || '',
      category: event.category,
      semester: event.semester || '',
      credits: event.credits || undefined,
      attendance_required: event.attendance_required,
      online_meeting_link: event.online_meeting_link || '',
      meeting_password: event.meeting_password || '',
      notes: event.notes || '',
      reminder_minutes: event.reminder_minutes,
      reminder_enabled: event.reminder_enabled,
      is_public: event.is_public,
      is_exam: event.is_exam,
      exam_type: '',
      preparation_time: event.preparation_time,
      tags: event.tags?.join(', ') || '',
    });
    setIsSheetOpen(true);
  }, []);

  const handleDeleteEvent = useCallback(async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    if (!currentUser) return;

    try {
      await timetableHelpers.deleteEvent(id, currentUser.id);
      
      toast({
        title: (
          <span className="bg-gradient-to-r from-red-500 via-pink-600 to-rose-400 bg-clip-text text-transparent font-bold">
            Event Deleted Successfully
          </span>
        ),
        description: (
          <span className="text-white font-medium">
            "<span className="text-rose-400 font-semibold">{title}</span>" has been removed from your timetable.
          </span>
        ),
        className: "bg-black border border-red-500/50 shadow-2xl",
        icon: <Trash2 className="text-rose-400" />,
        duration: 5000,
        isClosable: true,
        position: "top-right"
      });

      const userTimetable = await timetableHelpers.fetchUserTimetable(currentUser.id);
      setEvents(userTimetable);
      const stats = await timetableHelpers.getTimetableStatistics(currentUser.id);
      setTimetableStats(stats);
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error Deleting Event",
        description: `Failed to delete event: ${error.message}`,
        variant: "destructive",
      });
    }
  }, [currentUser, toast]);

  const handleDayClick = useCallback((day: number) => {
    setSelectedDay(day);
    setEditingEvent(null);
    setFormData(prev => ({ ...prev, day: day }));
    setIsSheetOpen(true);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!currentUser) return;
    try {
      if (searchTerm.trim() || filterDay !== 'all' || filterCategory !== 'all') {
        const results = await timetableHelpers.searchTimetableEvents(
          searchTerm,
          currentUser.id,
          filterDay !== 'all' ? parseInt(filterDay) : undefined,
          filterCategory !== 'all' ? filterCategory : undefined
        );
        setEvents(results);
      } else {
        const userTimetable = await timetableHelpers.fetchUserTimetable(currentUser.id);
        setEvents(userTimetable);
      }
    } catch (error) {
      console.error('Error searching timetable events:', error);
    }
  }, [currentUser, searchTerm, filterDay, filterCategory]);

  const getCurrentWeekDates = useCallback(() => {
    return timetableUtils.getCurrentWeekDates(currentDate);
  }, [currentDate]);

  const handleEventDrop = useCallback(async (eventId: string, newDay: number, newStartTime: string) => {
    if (!currentUser || !draggedEvent) return;

    const eventToUpdate = events.find(e => e.id === eventId);
    if (!eventToUpdate) return;

    const start = new Date(`2000-01-01T${eventToUpdate.start_time}`);
    const end = new Date(`2000-01-01T${eventToUpdate.end_time}`);
    const durationMs = end.getTime() - start.getTime();

    const newStart = new Date(`2000-01-01T${newStartTime}`);
    const newEnd = new Date(newStart.getTime() + durationMs);
    
    const newEndTime = `${String(newEnd.getHours()).padStart(2, '0')}:${String(newEnd.getMinutes()).padStart(2, '0')}`;

    const updatedEventData = { ...eventToUpdate, day: newDay, start_time: newStartTime, end_time: newEndTime };

    const conflicts = events.filter(e => 
      e.id !== eventId && e.day === newDay &&
      ( (newStartTime >= e.start_time && newStartTime < e.end_time) || (newEndTime > e.start_time && newEndTime <= e.end_time) || (newStartTime <= e.start_time && newEndTime >= e.end_time) )
    );

    if (conflicts.length > 0) {
      const suggestion = smartScheduler.findNextAvailableSlot(events, updatedEventData, newDay);
      setConflictInfo({ conflictingEvent: conflicts[0], eventToSchedule: updatedEventData, suggestedSlot: suggestion });
      setDraggedEvent(null);
      return;
    }

    setEvents(events.map(e => e.id === eventId ? updatedEventData : e));
    setDraggedEvent(null);
    await timetableHelpers.updateEvent(eventId, updatedEventData, currentUser.id);
  }, [currentUser, draggedEvent, events]);

  const handleEventSelect = useCallback((eventId: string) => {
    setSelectedEvents(prev => prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]);
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (!currentUser || selectedEvents.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedEvents.length} selected events?`)) return;
    
    await Promise.all(selectedEvents.map(id => timetableHelpers.deleteEvent(id, currentUser.id)));
    
    toast({ title: "Bulk Delete Successful", description: `${selectedEvents.length} events have been removed.` });
    
    const userTimetable = await timetableHelpers.fetchUserTimetable(currentUser.id);
    setEvents(userTimetable);
    setSelectedEvents([]);
  }, [currentUser, selectedEvents, toast]);

  const handleSuggestTime = useCallback(() => {
    const tempEvent = { ...formData, start_time: '09:00', end_time: '10:00' };
    const suggestion = smartScheduler.findNextAvailableSlot(events, tempEvent, new Date().getDay());
    if (suggestion) {
      setFormData(prev => ({ ...prev, day: suggestion.day, start_time: suggestion.start_time, end_time: suggestion.end_time }));
      toast({ title: "Time Suggested!", description: `We found an open slot for you on ${timetableHelpers.getDayNames()[suggestion.day]} at ${timetableHelpers.formatTime(suggestion.start_time)}.`, icon: <Zap className="text-yellow-400" /> });
    } else {
      toast({ title: "No Obvious Slots", description: "Your schedule is looking full!", variant: "destructive" });
    }
  }, [events, formData, toast]);

  const handleSmartAction = useCallback((action: 'balance' | 'breaks') => {
    if (action === 'balance') {
      const currentWorkload = smartScheduler.analyzeWorkload(events);
      const suggestions = smartScheduler.balanceWorkload(events, currentWorkload);
      if (suggestions && suggestions.length > 0) {
        setWorkloadSuggestions(suggestions);
      } else {
        toast({ title: "Schedule is Already Balanced", description: "Your workload seems well-distributed.", icon: <CheckCircle className="text-green-400" /> });
      }
    }
  }, [events, toast]);

  const handleConflictResolution = useCallback(async (resolution: 'override' | 'reschedule' | 'cancel') => {
    if (!conflictInfo || !currentUser) return;
    const { eventToSchedule } = conflictInfo;
    const isNewEvent = !events.some(e => e.id === eventToSchedule.id);

    if (resolution === 'reschedule' && conflictInfo.suggestedSlot) {
      const rescheduledEvent = { ...eventToSchedule, ...conflictInfo.suggestedSlot };
      isNewEvent ? await timetableHelpers.createEvent(rescheduledEvent, currentUser.id) : await timetableHelpers.updateEvent(rescheduledEvent.id, rescheduledEvent, currentUser.id);
    } else if (resolution === 'override') {
      isNewEvent ? await timetableHelpers.createEvent(eventToSchedule, currentUser.id) : await timetableHelpers.updateEvent(eventToSchedule.id, eventToSchedule, currentUser.id);
    }

    setConflictInfo(null);
    setIsSheetOpen(false);
    const userTimetable = await timetableHelpers.fetchUserTimetable(currentUser.id);
    setEvents(userTimetable);
  }, [conflictInfo, currentUser, events]);

  const handleWorkloadBalanceAccept = useCallback(async () => {
    if (!workloadSuggestions || !currentUser) return;
    const suggestion = workloadSuggestions[0];
    const { eventToMove, newSlot } = suggestion;
    const updatedEventData = { ...eventToMove, ...newSlot };

    setEvents(events.map(e => e.id === eventToMove.id ? updatedEventData : e));
    await timetableHelpers.updateEvent(eventToMove.id, updatedEventData, currentUser.id);

    toast({ title: "Workload Balanced!", description: `Moved "${eventToMove.title}" to a less busy day.` });
    setWorkloadSuggestions(null);
  }, [workloadSuggestions, currentUser, events, toast]);

  return {
    currentUser,
    events,
    timetableStats,
    loading,
    securityVerified,
    isSheetOpen,
    setIsSheetOpen,
    editingEvent,
    currentDate,
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    filterDay,
    setFilterDay,
    formData,
    setFormData,
    handlePreviousWeek,
    handleNextWeek,
    handleAddEvent,
    handleSubmit,
    handleEditEvent,
    handleDeleteEvent,
    handleDayClick,
    handleSearch,
    getCurrentWeekDates,
    categories: timetableUtils.getEventCategories(),
    timetableHelpers: timetableUtils,
  };
};