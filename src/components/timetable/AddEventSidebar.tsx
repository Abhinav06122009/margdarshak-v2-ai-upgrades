import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Palette, Clock, MapPin, User, BookOpen, TrendingUp, AlertTriangle, Star, GraduationCap, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface TimetableEvent {
  id: string;
  title: string;
  day: number;
  start_time: string;
  end_time: string;
  color?: string;
  location?: string;
  instructor?: string;
  category?: 'class' | 'meeting' | 'exam' | 'lab' | 'seminar' | 'break' | 'personal' | 'event';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  course_code?: string;
  tags?: string[];
  attendance_required?: boolean;
  is_exam?: boolean;
  credits?: number;
}

interface AddEventSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<TimetableEvent, 'id'>) => void;
  editingEvent?: TimetableEvent | null;
  selectedDay?: number;
}

const colorOptions = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Black', value: '#000000' },
];

const categoryOptions = [
  { id: 'class', name: 'Class', icon: '📚' },
  { id: 'lab', name: 'Lab', icon: '🔬' },
  { id: 'exam', name: 'Exam', icon: '📝' },
  { id: 'seminar', name: 'Seminar', icon: '💭' },
  { id: 'meeting', name: 'Meeting', icon: '🤝' },
  { id: 'break', name: 'Break', icon: '☕' },
  { id: 'personal', name: 'Personal', icon: '👤' },
  { id: 'event', name: 'Event', icon: '🎉' },
];

const priorityOptions = [
  { id: 'low', name: 'Low', color: 'bg-gray-400', icon: '📝' },
  { id: 'medium', name: 'Medium', color: 'bg-blue-400', icon: '📋' },
  { id: 'high', name: 'High', color: 'bg-orange-400', icon: '⚡' },
  { id: 'urgent', name: 'Urgent', color: 'bg-red-400', icon: '🔥' },
];

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AddEventSidebar: React.FC<AddEventSidebarProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEvent,
  selectedDay,
}) => {
  const [formData, setFormData] = useState<Omit<TimetableEvent, 'id'>>({
    title: '',
    day: selectedDay !== undefined ? selectedDay : 0,
    start_time: '09:00',
    end_time: '10:00',
    color: '#3B82F6',
    location: '',
    instructor: '',
    category: 'class',
    priority: 'medium',
    course_code: '',
    tags: [],
    attendance_required: false,
    is_exam: false,
    credits: undefined,
  });

  const { toast } = useToast();

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        day: editingEvent.day,
        start_time: editingEvent.start_time,
        end_time: editingEvent.end_time,
        color: editingEvent.color || '#3B82F6',
        location: editingEvent.location || '',
        instructor: editingEvent.instructor || '',
        category: editingEvent.category || 'class',
        priority: editingEvent.priority || 'medium',
        course_code: editingEvent.course_code || '',
        tags: editingEvent.tags || [],
        attendance_required: editingEvent.attendance_required || false,
        is_exam: editingEvent.is_exam || false,
        credits: editingEvent.credits || undefined,
      });
    } else {
      setFormData({
        title: '',
        day: selectedDay !== undefined ? selectedDay : 0,
        start_time: '09:00',
        end_time: '10:00',
        color: '#3B82F6',
        location: '',
        instructor: '',
        category: 'class',
        priority: 'medium',
        course_code: '',
        tags: [],
        attendance_required: false,
        is_exam: false,
        credits: undefined,
      });
    }
  }, [editingEvent, selectedDay]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.start_time || !formData.end_time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Title, Start Time, End Time).",
        variant: "destructive",
      });
      return;
    }

    // Basic time validation
    const start = new Date(`2000-01-01T${formData.start_time}`);
    const end = new Date(`2000-01-01T${formData.end_time}`);
    if (start >= end) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
    onClose();
    toast({
      title: editingEvent ? "Event Updated!" : "Event Created!",
      description: `"${formData.title}" has been ${editingEvent ? 'updated' : 'added'} to your timetable.`,
      className: "bg-black border border-blue-400/50 shadow-xl",
      icon: <Save className="text-emerald-400" />,
    });
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      tags: value.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          {/* Sheet Content */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-black/80 backdrop-blur-2xl border-l border-white/20 shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3 text-xl text-white font-bold">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                {editingEvent ? 'Edit Event' : 'Create Event'}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-8 p-1">
                {/* Basic Event Information */}
                <div className="space-y-6 p-6 bg-black/20 rounded-2xl border border-white/10">
                  <h3 className="text-2xl font-extrabold text-white mb-4 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                    <BookOpen className="w-7 h-7 text-cyan-300" /> Event Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-base font-semibold text-white/90">Event Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Advanced Data Structures"
                        required
                        className="text-base bg-black/30 border border-white/15 rounded-xl text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="day" className="text-base font-semibold text-white/90">Day *</Label>
                      <Select value={formData.day.toString()} onValueChange={(value) => setFormData({ ...formData, day: parseInt(value) })}>
                        <SelectTrigger className="text-base bg-black/30 border-2 border-white/15 text-white rounded-xl">
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white">
                          {daysOfWeek.map((day, index) => (
                            <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base font-semibold text-white/90">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Provide detailed information about your event..."
                      className="min-h-[120px] text-base resize-none bg-black/30 border border-white/15 rounded-xl text-white"
                    />
                  </div>
                </div>

                {/* Schedule & Location */}
                <div className="space-y-6 p-6 bg-black/20 rounded-2xl border border-white/10">
                  <h3 className="text-2xl font-extrabold text-white mb-4 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
                    <Clock className="w-7 h-7" /> Schedule & Location
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="start_time" className="text-base font-semibold text-white/90">Start Time *</Label>
                      <Input id="start_time" type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} className="text-base bg-black/30 border border-white/15 rounded-xl text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_time" className="text-base font-semibold text-white/90">End Time *</Label>
                      <Input id="end_time" type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} className="text-base bg-black/30 border border-white/15 rounded-xl text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-base font-semibold text-white/90">Location</Label>
                      <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Computer Lab 3" className="text-base bg-black/30 border border-white/15 rounded-xl text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instructor" className="text-base font-semibold text-white/90">Instructor</Label>
                      <Input id="instructor" value={formData.instructor} onChange={(e) => setFormData({ ...formData, instructor: e.target.value })} placeholder="e.g., Dr. Sarah Johnson" className="text-base bg-black/30 border border-white/15 rounded-xl text-white" />
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-6 p-6 bg-black/20 rounded-2xl border border-white/10">
                  <h3 className="text-2xl font-extrabold text-white mb-4 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    <GraduationCap className="w-7 h-7" /> Additional Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="course_code" className="text-base font-semibold text-white/90">Course Code</Label>
                      <Input id="course_code" value={formData.course_code} onChange={(e) => setFormData({ ...formData, course_code: e.target.value })} placeholder="e.g., CS401" className="text-base font-mono bg-black/30 border border-white/15 rounded-xl text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="credits" className="text-base font-semibold text-white/90">Credits</Label>
                      <Input id="credits" type="number" value={formData.credits || ''} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || undefined })} placeholder="e.g., 3" className="text-base bg-black/30 border border-white/15 rounded-xl text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-base font-semibold text-white/90">Tags</Label>
                    <Input id="tags" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="e.g., important, project (comma separated)" className="text-base bg-black/30 border border-white/15 rounded-xl text-white" />
                  </div>
                  <div className="pt-4 border-t border-white/20">
                    <Button type="button" variant="outline" onClick={handleSuggestTime} className="w-full text-base text-yellow-300 border-yellow-400/50 hover:bg-yellow-500/10 hover:text-yellow-200">
                      <Zap className="w-5 h-5 mr-2" /> AI: Suggest an Optimal Time
                    </Button>
                  </div>
                </div>
                
                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-white/10">
                  <Button type="button" variant="ghost" onClick={onClose} className="px-8 py-3 text-base text-white/80 hover:bg-white/10 rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" className="px-8 py-3 text-base bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl">
                    <Save className="w-5 h-5 mr-2" /> {editingEvent ? 'Update' : 'Create'} Event
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

