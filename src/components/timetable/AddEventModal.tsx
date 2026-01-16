import React, { useState, useEffect } from 'react';
import { X, Save, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Event {
  id: string;
  title: string;
  day: number;
  start_time: string;
  end_time: string;
  color?: string;
}

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, 'id'>) => void;
  editingEvent?: Event | null;
  selectedDay?: number;
}

const AddEventModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingEvent, 
  selectedDay 
}: AddEventModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    day: selectedDay || 0,
    start_time: '05:00',
    end_time: '24:00',
    color: '#3B82F6',
  });

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        day: editingEvent.day,
        start_time: editingEvent.start_time,
        end_time: editingEvent.end_time,
        color: editingEvent.color || '#3B82F6',
      });
    } else {
      setFormData({
        title: '',
        day: selectedDay || 0,
        start_time: '05:00',
        end_time: '24:00',
        color: '#3B82F6'
      });
    }
  }, [editingEvent, selectedDay]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const colors = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'black', value: '#000000' }
  ];

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
                {editingEvent ? 'Edit Event' : 'Add New Event'}
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
                <div className="space-y-6 p-6 bg-black/20 rounded-2xl border border-white/10 shadow-glass-neumorphic">
                  <h3 className="text-2xl font-extrabold text-white mb-4 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                    <Palette className="w-7 h-7" /> Event Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base font-semibold text-white/90">Event Title *</Label>
                    <Input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Project Meeting"
                      required
                      className="text-base bg-black/30 border-2 border-white/15 rounded-xl text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="day" className="text-base font-semibold text-white/90">Day *</Label>
                    <Select
                      value={formData.day.toString()}
                      onValueChange={(value) => setFormData({ ...formData, day: parseInt(value) })}
                    >
                      <SelectTrigger className="text-base bg-black/30 border-2 border-white/15 rounded-xl text-white focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300">
                        <SelectValue placeholder="Select a day" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white shadow-neumorphic-lg">
                        {daysOfWeek.map((day, index) => (
                          <SelectItem key={day} value={index.toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="start_time" className="text-base font-semibold text-white/90">Start Time *</label>
                      <input
                        id="start_time"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        className="text-base bg-black/30 border-2 border-white/15 rounded-xl text-white focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="end_time" className="text-base font-semibold text-white/90">End Time *</label>
                      <input
                        id="end_time"
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        className="text-base bg-black/30 border-2 border-white/15 rounded-xl text-white focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-white/90">Color</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          className={`w-full h-10 rounded-lg border-2 ${
                            formData.color === color.value ? 'border-blue-500' : 'border-white/15'
                          } shadow-neumorphic-inset-sm transition-all duration-200`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-white/10">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="px-8 py-3 text-base text-white/80 hover:bg-white/10 hover:text-white shadow-neumorphic-sm hover:shadow-neumorphic-lg transition-all duration-300"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="px-8 py-3 text-base bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-neumorphic-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-500/60 transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingEvent ? 'Update Event' : 'Create Event'}
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

export default AddEventModal;
