// src/components/timetable/Timetable.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, Clock, MapPin, BookOpen,
  Search, Filter, Edit, Trash2, Shield, Eye, BarChart3, CheckCircle,
  AlertCircle, Users, GraduationCap, Palette, X, Zap, CalendarPlus, CalendarCheck, Edit3
} from 'lucide-react';
import TimetableHeader from './TimetableHeader';
import TimeSlots from './TimeSlots';
import TimetableGrid from './TimetableGrid';
import EventForm from './EventForm';
import { timetableHelpers, smartScheduler, TimetableEvent, ConflictInfo, WorkloadSuggestion, TimetableStats, SecureUser, EventFormData } from './timetableUtils';
import ParallaxBackground from '@/components/ui/ParallaxBackground';
import { TiltCard } from '@/components/ui/TiltCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import logo from "@/components/logo/logo.png";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Social Icons
const linkedinLogo = () => (
  <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
  </svg>
);

const TwitterLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z"/>
  </svg>
);


const Timetable: React.FC = () => {
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

  // State for Drag and Drop & Multi-select
  const [draggedEvent, setDraggedEvent] = useState<TimetableEvent | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);
  const [workloadSuggestions, setWorkloadSuggestions] = useState<WorkloadSuggestion[] | null>(null);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    day: 1,
    start_time: '09:00',
    end_time: '10:00',
    location: '',
    instructor: '',
    course_code: '',
    room_number: '',
    building: '',
    category: 'class',
    semester: '',
    credits: undefined,
    attendance_required: true,
    online_meeting_link: '',
    meeting_password: '',
    notes: '',
    reminder_minutes: 15,
    reminder_enabled: true,
    is_public: false,
    is_exam: false,
    exam_type: '',
    preparation_time: 0,
    tags: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    initializeSecureTimetable();
  }, []);

  useEffect(() => {
    const stats = timetableHelpers.getTimetableStatistics(events);
    setTimetableStats(stats);
  }, [events]);

  const initializeSecureTimetable = async () => {
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

      const premiumRoles = ['premium', 'admin', 'superadmin', 'bdo'];
      const userRole = user.profile?.role || 'user';
      setHasPremiumAccess(premiumRoles.includes(userRole));
      
      const userTimetable = await timetableHelpers.fetchUserTimetable(user.id);
      
      setEvents(userTimetable);

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
  };

  // Handler functions
  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      day: 1,
      start_time: '09:00',
      end_time: '10:00',
      location: '',
      instructor: '',
      course_code: '',
      room_number: '',
      building: '',
      category: 'class',
      semester: '',
      credits: undefined,
      attendance_required: true,
      online_meeting_link: '',
      meeting_password: '',
      notes: '',
      reminder_minutes: 15,
      reminder_enabled: true,
      is_public: false,
      is_exam: false,
      exam_type: '',
      preparation_time: 0,
      tags: '',
    });
  };

  const handleAddEvent = () => {
    resetForm();
    setEditingEvent(null);
    setSelectedDay(undefined);
    setIsSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      let savedEvent;
      if (editingEvent) {
        savedEvent = await timetableHelpers.updateEvent(editingEvent.id, formData, currentUser.id);
        setEvents(events.map(e => e.id === savedEvent.id ? savedEvent : e));
        toast({
          title: (
            <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent font-bold">
              Event Updated!
            </span>
          ),
          description: (
            <span className="text-white font-medium">
              "<span className="font-semibold text-pink-400">{savedEvent.title}</span>" has been updated.
            </span>
          ),
          className: "bg-black border border-pink-500/60 shadow-xl",
          icon: <Edit3 className="text-pink-400" />,
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      } else {
        savedEvent = await timetableHelpers.createEvent(formData, currentUser.id);
        setEvents([...events, savedEvent]);
        toast({
          title: (
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-bold">
              Event Created!
            </span>
          ),
          description: (
            <span className="text-white font-medium">
              "<span className="font-semibold text-indigo-400">{savedEvent.title}</span>" event has been successfully added.
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
      
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast({
        title: 'Error Saving Event',
        description: `Failed to save event: ${error.message || 'Please try again.'}`,
        variant: 'destructive',
      });
    }
  };

  const handleEditEvent = (event: TimetableEvent) => {
    setEditingEvent(event);
    // Use spread to ensure all existing data is carried over to the form
    setFormData({
      ...formData, // Keep defaults for fields not in event
      ...event,
      description: event.description || '', // Ensure non-nullable fields have defaults
      credits: event.credits ?? undefined,
      tags: event.tags?.join(', ') || '',
      online_meeting_link: event.online_meeting_link || '',
      meeting_password: event.meeting_password || '',
      notes: event.notes || '',
      reminder_minutes: event.reminder_minutes,
      reminder_enabled: event.reminder_enabled,
      is_public: event.is_public,
      is_exam: event.is_exam,
    });
    setIsSheetOpen(true);
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    if (!currentUser) return;

    try {
      setEvents(events.filter(e => e.id !== id)); // Optimistic update
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

      
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error Deleting Event",
        description: `Failed to delete event: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setEditingEvent(null);
    setFormData({
      ...formData,
      day: day
    });
    setIsSheetOpen(true);
  };

  const handleSuggestTime = () => {
    if (!hasPremiumAccess) {
      toast({
          title: "Premium Feature",
          description: "Upgrade to a Pro plan to use AI-powered time suggestions.",
          variant: "destructive",
      });
      return;
    }

    const tempEvent = {
      ...formData,
      start_time: '09:00',
      end_time: '10:00', // Assume 1-hour duration for suggestion
    };
    const suggestion = smartScheduler.findNextAvailableSlot(events, tempEvent, new Date().getDay());
    if (suggestion) {
      setFormData(prev => ({
        ...prev,
        day: suggestion.day,
        start_time: suggestion.start_time,
        end_time: suggestion.end_time,
      }));
      toast({
        title: (
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-bold">
            AI Time Suggested!
          </span>
        ),
        description: `We found an open slot for you on ${timetableHelpers.getDayNames()[suggestion.day]} at ${timetableHelpers.formatTime(suggestion.start_time)}.`,
        className: "bg-black border border-blue-500/50 shadow-xl", // Info: Blue
        icon: <Zap className="text-blue-400" />,
      });
    } else {
      toast({
        title: "No Obvious Slots",
        description: "Your schedule is looking full! We couldn't find an easy opening.",
        className: "bg-black border border-amber-500/50 shadow-xl", // Warning: Amber
        icon: <AlertCircle className="text-amber-400" />,
      });
    }
  };

  const handleEventDrop = async (eventId: string, newDay: number, newStartTime: string) => {
    if (!currentUser || !draggedEvent) return;

    const eventToUpdate = events.find(e => e.id === eventId);
    if (!eventToUpdate) return;

    // Calculate new end time based on original duration
    const start = new Date(`2000-01-01T${eventToUpdate.start_time}`);
    const end = new Date(`2000-01-01T${eventToUpdate.end_time}`);
    const durationMs = end.getTime() - start.getTime();

    const newStart = new Date(`2000-01-01T${newStartTime}`);
    const newEnd = new Date(newStart.getTime() + durationMs);
    
    const newEndTime = `${String(newEnd.getHours()).padStart(2, '0')}:${String(newEnd.getMinutes()).padStart(2, '0')}`;

    const updatedEventData = {
      ...eventToUpdate,
      day: newDay,
      start_time: newStartTime,
      end_time: newEndTime,
    };

    // Conflict detection
    const conflicts = events.filter(e => 
      e.id !== eventId &&
      e.day === newDay &&
      (
        (newStartTime >= e.start_time && newStartTime < e.end_time) ||
        (newEndTime > e.start_time && newEndTime <= e.end_time) ||
        (newStartTime <= e.start_time && newEndTime >= e.end_time)
      )
    );

    if (conflicts.length > 0) {
      const suggestion = smartScheduler.findNextAvailableSlot(events, updatedEventData, newDay);
      setConflictInfo({
        conflictingEvent: conflicts[0],
        eventToSchedule: updatedEventData,
        suggestedSlot: suggestion,
      });
      setDraggedEvent(null); // Reset dragged event
      return;
    }

    // Optimistic update
    setEvents(events.map(e => e.id === eventId ? updatedEventData : e));
    setDraggedEvent(null);

    // Actual update
    await timetableHelpers.updateEvent(eventId, updatedEventData, currentUser.id);
  };

  const handleEventSelect = (eventId: string) => {
    setSelectedEvents(prev => 
        prev.includes(eventId) 
            ? prev.filter(id => id !== eventId) 
            : [...prev, eventId]
    );
  };

  const handleBulkDelete = async () => {
    if (!currentUser || selectedEvents.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedEvents.length} selected events?`)) return;    
    try {
      await Promise.all(selectedEvents.map(id => timetableHelpers.deleteEvent(id, currentUser.id)));
      toast({ title: "Bulk Delete Successful", description: `${selectedEvents.length} events have been removed.` });
    } catch (error) {
      toast({ title: "Bulk Delete Failed", description: "Could not delete all selected events.", variant: "destructive" });
    }
    setEvents(events.filter(e => !selectedEvents.includes(e.id)));
    setSelectedEvents([]);
  };

  const handleSearch = async () => {
    if (!currentUser) return;

    try {
      if (searchTerm.trim()) {
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
  };

  const getCurrentWeekDates = () => {
    return timetableHelpers.getCurrentWeekDates(currentDate);
  };

  const handleSmartAction = (action: 'balance' | 'breaks') => {
    if (!hasPremiumAccess) {
      toast({
          title: "Premium Feature",
          description: "Upgrade to a Pro plan to use Smart Actions.",
          variant: "destructive",
      });
      return;
    }

    if (action === 'balance') {
      const currentWorkload = smartScheduler.analyzeWorkload(events);
      const suggestions = smartScheduler.balanceWorkload(events, currentWorkload);
      if (suggestions && suggestions.length > 0) {
        setWorkloadSuggestions(suggestions);
      } else {
        toast({
          title: "Schedule is Already Balanced",
          description: "Your workload seems to be well-distributed. No changes needed.",
          icon: <CheckCircle className="text-green-400" />,
          className: "bg-black border border-green-500/50 shadow-xl",
        });
      }
    } else {
      // Placeholder for other smart actions like suggesting breaks
      console.log('Smart action:', action);
    }
  };

  const handleConflictResolution = async (resolution: 'override' | 'reschedule' | 'cancel') => {
    if (!conflictInfo || !currentUser) return;

    const { eventToSchedule } = conflictInfo;
    const isNewEvent = !events.some(e => e.id === eventToSchedule.id);

    if (resolution === 'reschedule' && conflictInfo.suggestedSlot) {
      const rescheduledEvent: TimetableEvent = {
        ...eventToSchedule,
        day: conflictInfo.suggestedSlot.day,
        start_time: conflictInfo.suggestedSlot.start_time,
        end_time: conflictInfo.suggestedSlot.end_time,
      };
      if (isNewEvent) {
        const newEvent = await timetableHelpers.createEvent(rescheduledEvent, currentUser.id);
        setEvents(prev => [...prev, newEvent]);
      } else {
        const updatedEvent = await timetableHelpers.updateEvent(rescheduledEvent.id, rescheduledEvent, currentUser.id);
        setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      }
    } else if (resolution === 'override') {
      if (isNewEvent) {
        const newEvent = await timetableHelpers.createEvent(eventToSchedule, currentUser.id);
        setEvents(prev => [...prev, newEvent]);
      } else {
        const updatedEvent = await timetableHelpers.updateEvent(eventToSchedule.id, eventToSchedule, currentUser.id);
        setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      }
    }
    // 'cancel' does nothing to the backend, and if it was a new event, it's just discarded.

    setConflictInfo(null);
    setIsSheetOpen(false); // Close the form if it was open
  };

  const handleWorkloadBalanceAccept = async () => {
    if (!workloadSuggestions || !currentUser) return;

    // For now, we handle one suggestion at a time. This can be extended.
    const suggestion = workloadSuggestions[0];
    const { eventToMove, newSlot } = suggestion;

    const updatedEventData = {
      ...eventToMove,
      day: newSlot.day,
      start_time: newSlot.start_time,
      end_time: newSlot.end_time,
    };

    await timetableHelpers.updateEvent(eventToMove.id, updatedEventData, currentUser.id);
    setEvents(events.map(e => e.id === eventToMove.id ? updatedEventData : e));

    toast({
      title: (
        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-bold">
          AI Workload Balanced!
        </span>
      ),
      description: `Moved "${eventToMove.title}" to a less busy day to improve your schedule.`,
      className: "bg-black border border-blue-500/50 shadow-xl", // Info: Blue
      icon: <Zap className="text-blue-400" />,
    });

    setWorkloadSuggestions(null);
  };

  if (loading || !securityVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 z-10 animate-pulse">
          <div className="h-24 bg-black/20 rounded-2xl mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            {[...Array(5)].map(i => <div key={i} className="h-32 bg-black/20 rounded-3xl"></div>)}
          </div>
          <div className="h-16 bg-black/20 rounded-2xl mb-4"></div>
          <div className="h-[60vh] bg-black/20 rounded-2xl"></div>
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="h-20 bg-black/20 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="bg-black/50 backdrop-blur-md rounded-3xl p-12 border border-red-400/20 text-center relative z-10 max-w-md mx-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-white/70 mb-8">Please log in to access your secure timetable.</p>
          <div className="flex items-center justify-center space-x-4 text-sm text-white/60">
            <div className="flex items-center gap-2"><Shield className="w-4 h-4" /><span>Private & Secure</span></div>
            <div className="flex items-center gap-2"><Palette className="w-4 h-4" /><span>Fully Customizable</span></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <ParallaxBackground />
      <div className="w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 z-10">
      {/* Enhanced Multi-Color Header */}
      <TimetableHeader        
        currentDate={currentDate}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onAddEvent={handleAddEvent}
        onSmartAction={handleSmartAction}
        hasPremiumAccess={hasPremiumAccess}
        eventCount={events.length}
        userName={currentUser?.profile?.full_name || 'User'}
      />

      {/* Enhanced Statistics Dashboard */}
      {timetableStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 border-b border-white/10"
        >
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { 
                icon: Calendar, 
                value: timetableStats.total_events, 
                label: 'Total Events', 
                gradient: 'from-blue-500 to-cyan-500'
              },
              { 
                icon: BookOpen, 
                value: timetableStats.classes, 
                label: 'Classes', 
                gradient: 'from-green-500 to-emerald-500'
              },
              { 
                icon: AlertCircle, 
                value: timetableStats.exams, 
                label: 'Exams', 
                gradient: 'from-red-500 to-rose-500'
              },
              { 
                icon: Clock, 
                value: `${Math.round(timetableStats.total_weekly_hours)}h`, 
                label: 'Weekly Hours', 
                gradient: 'from-purple-500 to-violet-500'
              },
              { 
                icon: MapPin, 
                value: timetableStats.most_common_location || 'N/A', 
                label: 'Top Location', 
                gradient: 'from-orange-500 to-amber-500'
              }
            ].map((stat, index) => (
              <TiltCard
                key={stat.label}
                className="w-full h-full"
              >
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0 } }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-black/20 backdrop-blur-md p-6 rounded-3xl border border-white/10 transition-all duration-300 group relative overflow-hidden shadow-lg hover:border-white/20 h-full"
                  whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(6, 182, 212, 0.7), inset 0 0 15px rgba(6, 182, 212, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                        <stat.icon className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-3xl font-bold text-white tracking-tighter">
                        {stat.value}
                      </span>
                    </div>
                    <h3 className="text-white/80 font-semibold text-base">{stat.label}</h3>
                  </div>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </motion.div>
      )}

      {/* Advanced Search & Filter System */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 border-b border-white/10 bg-gradient-to-r from-slate-900/30 to-gray-900/30"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
              <Input
                placeholder="Search events, locations, instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 bg-black/30 border-2 border-white/15 rounded-xl text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="bg-black/30 border-2 border-white/15 text-white rounded-xl shadow-neumorphic-inset-lg focus:border-blue-500/70">
                <Filter className="h-4 w-4 mr-2 text-white/70" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white shadow-neumorphic-lg">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.icon} {category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterDay} onValueChange={setFilterDay}>
              <SelectTrigger className="bg-black/30 border-2 border-white/15 text-white rounded-xl shadow-neumorphic-inset-lg focus:border-blue-500/70">
                <Calendar className="h-4 w-4 mr-2 text-white/70" />
                <SelectValue placeholder="All Days" />
              </SelectTrigger>
              <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white shadow-neumorphic-lg">
                <SelectItem value="all">All Days</SelectItem>
                {timetableHelpers.getDayNames().map((day, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: timetableHelpers.getDayColors()[index]?.color }}
                      />
                      {day}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl shadow-neumorphic-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-500/60 transform hover:-translate-y-1 transition-all duration-300"
            >
              <Search className="h-4 w-4 mr-2" />
              Search Events
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Multi-Color Timetable Grid */}
      <div className="flex-1 flex overflow-hidden mt-4 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg">
        <TimeSlots colorHelpers={timetableHelpers} />
        <TimetableGrid
          currentWeekDates={getCurrentWeekDates()}
          events={events}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
          onDayClick={handleDayClick}
          colorHelpers={timetableHelpers}
          onEventDrop={handleEventDrop}
          draggedEvent={draggedEvent}
          setDraggedEvent={setDraggedEvent}
          selectedEvents={selectedEvents}
          hasPremiumAccess={hasPremiumAccess}
          onEventSelect={handleEventSelect}
        />
      </div>

      {/* Slide-over Panel for Event Creation/Edit */}
      <AnimatePresence>
        {isSheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSheetOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            {/* Sheet Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
            >
            <EventForm
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              editingEvent={editingEvent}
              hasPremiumAccess={hasPremiumAccess}
              onClose={() => {
                setIsSheetOpen(false);
                resetForm();
                setEditingEvent(null);
              }}
            />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Batch Operations Bar */}
      <AnimatePresence>
        {selectedEvents.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-auto bg-black/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-2 flex items-center gap-2 z-50"
          >
            <span className="text-white font-semibold px-3 text-sm">{selectedEvents.length} selected</span>
            <div className="h-6 w-px bg-white/20" />
            {hasPremiumAccess ? (
              <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm rounded-xl" onClick={handleBulkDelete}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild><Button variant="ghost" className="text-red-400/50 cursor-not-allowed text-sm rounded-xl"><Trash2 className="w-4 h-4 mr-2" /> Delete</Button></TooltipTrigger>
                  <TooltipContent><p>Bulk Delete is a Pro feature.</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white" onClick={() => setSelectedEvents([])}>
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Workload Balancing Dialog */}
      <Dialog open={!!workloadSuggestions} onOpenChange={() => setWorkloadSuggestions(null)}>
        <DialogContent className="bg-black/80 backdrop-blur-2xl border-white/20 text-white">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-2xl text-yellow-400">
              <Zap className="w-7 h-7" /> Smart Schedule Suggestion
            </DialogTitle>
            {workloadSuggestions && workloadSuggestions.length > 0 && (
              <DialogDescription className="text-white/80 pt-2">
                Your schedule on <span className="font-bold text-white">{timetableHelpers.getDayNames()[workloadSuggestions[0].fromDay]}</span> seems a bit heavy
                ({Math.round(workloadSuggestions[0].workloadBefore)} hours).
                <br />
                We can move "<span className="font-bold text-white">{workloadSuggestions[0].eventToMove.title}</span>" to a quieter slot on <span className="font-bold text-white">{timetableHelpers.getDayNames()[workloadSuggestions[0].toDay]}</span> to balance things out.
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4">
            <div className="border border-white/10 rounded-lg p-4 bg-black/20">
              <p className="font-bold text-white">Proposed Change:</p>
              <p className="text-white/80">
                Move <span className="text-cyan-400">{workloadSuggestions?.[0].eventToMove.title}</span>
              </p>
              <p className="text-white/80">
                From: <span className="text-red-400">{timetableHelpers.getDayNames()[workloadSuggestions?.[0].fromDay ?? 0]}</span>
              </p>
              <p className="text-white/80">
                To: <span className="text-green-400">{timetableHelpers.getDayNames()[workloadSuggestions?.[0].toDay ?? 0]} at {timetableHelpers.formatTime(workloadSuggestions?.[0].newSlot.start_time ?? '00:00')}</span>
              </p>
            </div>
            <Button
              onClick={handleWorkloadBalanceAccept}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-6 text-base rounded-xl"
            >
              <Zap className="w-5 h-5 mr-2" />
              Yes, Balance My Schedule
            </Button>
          </div>
          <DialogFooter className="pt-4">
            <Button onClick={() => setWorkloadSuggestions(null)} variant="ghost" className="w-full">No, Keep It As Is</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Conflict Resolution Dialog */}
      <Dialog open={!!conflictInfo} onOpenChange={() => setConflictInfo(null)}>
        <DialogContent className="bg-black/80 backdrop-blur-2xl border-white/20 text-white">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-2xl text-orange-400">
              <AlertCircle className="w-7 h-7" /> Scheduling Conflict Detected
            </DialogTitle>
            <DialogDescription className="text-white/80 pt-2">
              The event "<span className="font-bold text-white">{conflictInfo?.eventToSchedule.title}</span>"
              overlaps with "<span className="font-bold text-white">{conflictInfo?.conflictingEvent.title}</span>".
              <br />
              How would you like to proceed?
            </DialogDescription>
          </DialogHeader> 
          <div className="space-y-4">
            {conflictInfo?.suggestedSlot && (
              <Button
                onClick={() => handleConflictResolution('reschedule')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-6 text-base rounded-xl"
              >
                <Zap className="w-5 h-5 mr-2" />
                Reschedule to {timetableHelpers.getDayNames()[conflictInfo.suggestedSlot.day]} at {timetableHelpers.formatTime(conflictInfo.suggestedSlot.start_time)}
              </Button>
            )}
            <Button onClick={() => handleConflictResolution('override')} variant="destructive" className="w-full py-6 text-base rounded-xl">
              Override & Create Conflict Anyway
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => handleConflictResolution('cancel')} variant="ghost" className="w-full">
              Cancel Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </div>

      {/* Enhanced Multi-Color System Footer - Now inline */}
       <footer className="w-full mt-12 pt-8 border-t border-white/20 text-white/70 text-xs relative z-10">
        {/* Subtle animated gradient overlay */}
        <div className="absolute inset-0 z-0 opacity-20 animate-pulse-slow" style={{
          background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1), rgba(236, 72, 153, 0.1))',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 15s ease infinite'
        }}></div>
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center sm:text-left">
          {/* Column 1: Branding - Removed to avoid duplication with header */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="font-bold text-base text-white mb-2">MARGDARSHAK</h3>
            <p className="text-white/50 text-sm">by VSAV GYANTAPA</p>
          </div>
          {/* Column 2: Legal */}
          <div>
            <h3 className="font-bold text-base text-white mb-2">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="hover:text-white hover:underline transition-colors duration-200">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white hover:underline transition-colors duration-200">Privacy Policy</Link></li>
            </ul>
          </div>
          {/* Column 3: Support */}
          <div>
            <h3 className="font-bold text-base text-white mb-2">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="hover:text-white hover:underline transition-colors duration-200">Help Center</Link></li>
              <li><a href="mailto:abhinavjha393@gmail.com" className="hover:text-white hover:underline transition-colors duration-200">Contact Us</a></li>
            </ul>
          </div>
          {/* Column 4: Social */}
          <div>
            <h3 className="font-bold text-base text-white mb-2">Follow Us</h3>
            <div className="flex justify-center sm:justify-start space-x-4">
               <a href="https://x.com/gyantappas" aria-label="Twitter" className="hover:text-white transition-colors"><TwitterLogo /></a>
                  <a href="https://www.facebook.com/profile.php?id=61584618795158" aria-label="Facebook" className="hover:text-white transition-colors"><FacebookLogo /></a>
                  <a href="https://www.linkedin.com/in/vsav-gyantapa-33893a399/" aria-label="Linkdelin" className="hover:text-white transition-colors"><linkedinLogo /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10 text-center relative z-10 text-sm">
          <p>Developed by <span className="font-semibold text-emerald-400">VSAV GYANTAPA</span> | © 2025 VSAV GYANTAPA</p>
        </div>
      </footer>
    </div>
  );
};

export default Timetable;
