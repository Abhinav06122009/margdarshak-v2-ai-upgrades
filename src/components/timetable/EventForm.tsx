import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Clock, GraduationCap, Palette, Save, X, Zap } from 'lucide-react';
import { EventFormData, timetableHelpers } from './timetableUtils';
import { useToast } from '@/hooks/use-toast';

interface EventFormProps {
  formData: EventFormData;
  setFormData: React.Dispatch<React.SetStateAction<EventFormData>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  editingEvent: any | null;
  hasPremiumAccess: boolean;
  onClose: () => void;
}

const EventForm: React.FC<EventFormProps> = ({
  formData,
  setFormData,
  handleSubmit,
  editingEvent,
  hasPremiumAccess,
  onClose,
}) => {
  const { toast } = useToast();
  const categories = timetableHelpers.getEventCategories();

  const handleSuggestTime = () => {
    if (!hasPremiumAccess) {
        toast({
            title: "Premium Feature",
            description: "Upgrade to a Pro plan to use AI-powered time suggestions.",
            variant: "destructive",
        });
        return;
    }
    // The actual suggestion logic is in the parent component
    // This button will trigger the function passed via props if we move the logic
    // For now, we just call a prop function.
    (window as any).handleSuggestTime(); // This is a temporary way to call parent function
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
      className="fixed top-0 right-0 h-full w-full max-w-2xl bg-black/80 backdrop-blur-2xl border-l border-white/20 shadow-2xl z-50 flex flex-col"
    >
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3 text-xl text-white font-bold">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Palette className="w-6 h-6 text-white" />
          </div>
          {editingEvent ? 'Edit Event' : 'Create New Event'}
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
          <Card className="bg-black/20 border-white/10 shadow-glass-neumorphic">
            <CardHeader>
              <CardTitle className="text-2xl font-extrabold text-white flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
              <BookOpen className="w-7 h-7 text-cyan-300" /> Event Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold text-white/90">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Advanced Data Structures"
                  required
                  className="text-base bg-black/30 border border-white/15 rounded-xl text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-semibold text-white/90">Category *</Label>
                <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="text-base bg-black/30 border-2 border-white/15 text-white rounded-xl shadow-neumorphic-inset-lg focus:border-blue-500/70">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white shadow-neumorphic-lg">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="flex items-center gap-2">
                            {category.icon} {category.name}
                          </span>
                        </div>
                      </SelectItem>
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
                className="min-h-[120px] text-base resize-none bg-black/30 border border-white/15 rounded-xl text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300"
              />
            </div>
            </CardContent>
          </Card>

          {/* Schedule & Location */}
          <Card className="bg-black/20 border-white/10 shadow-glass-neumorphic">
            <CardHeader>
              <CardTitle className="text-2xl font-extrabold text-white flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400 drop-shadow-md">
              <Clock className="w-7 h-7" /> Schedule & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="day" className="text-base font-semibold text-white/90">Day *</Label>
                <Select value={formData.day.toString()} onValueChange={(value) => setFormData({ ...formData, day: parseInt(value) })}>
                  <SelectTrigger className="text-base bg-black/30 border border-white/15 text-white rounded-xl shadow-neumorphic-inset-lg focus:border-blue-500/70">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white shadow-neumorphic-lg">
                    {timetableHelpers.getDayNames().map((day, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: timetableHelpers.getDayColors()[index]?.color }}
                          />
                          {day}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="start_time" className="text-base font-semibold text-white/90">Start Time *</Label>
                <Input id="start_time" type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} className="text-base bg-black/30 border border-white/15 rounded-xl text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_time" className="text-base font-semibold text-white/90">End Time *</Label>
                <Input id="end_time" type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} className="text-base bg-black/30 border border-white/15 rounded-xl text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-base font-semibold text-white/90">Location</Label>
                <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Computer Lab 3, Building B" className="text-base bg-black/30 border border-white/15 rounded-xl text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instructor" className="text-base font-semibold text-white/90">Instructor</Label>
                <Input id="instructor" value={formData.instructor} onChange={(e) => setFormData({ ...formData, instructor: e.target.value })} placeholder="e.g., Dr. Sarah Johnson" className="text-base bg-black/30 border border-white/15 rounded-xl text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300" />
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card className="bg-black/20 border-white/10 shadow-glass-neumorphic">
            <CardHeader>
              <CardTitle className="text-2xl font-extrabold text-white flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-md">
              <GraduationCap className="w-7 h-7" /> Additional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="course_code" className="text-base font-semibold text-white/90">Course Code</Label>
                <Input id="course_code" value={formData.course_code} onChange={(e) => setFormData({ ...formData, course_code: e.target.value })} placeholder="e.g., CS401, MATH301" className="text-base font-mono bg-black/30 border border-white/15 rounded-xl text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="credits" className="text-base font-semibold text-white/90">Credits</Label>
                <Input id="credits" type="number" min="0" max="10" value={formData.credits || ''} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || undefined })} placeholder="e.g., 3" className="text-base bg-black/30 border-2 border-white/15 text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="text-base font-semibold text-white/90">Tags</Label>
              <Input id="tags" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="e.g., important, project, midterm (comma separated)" className="text-base bg-black/30 border-2 border-white/15 text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300" />
              <p className="text-sm text-white/60 mt-1">Use tags to organize and quickly find your events</p>
            </div>

            <div className="pt-4 border-t border-white/20">
              <Button
                type="button"
                variant="outline"
                onClick={handleSuggestTime}
                disabled={!hasPremiumAccess}
                className="w-full text-base text-yellow-300 border-yellow-400/50 hover:bg-yellow-500/10 hover:text-yellow-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <Zap className="w-5 h-5 mr-2" /> 
                {hasPremiumAccess ? "AI: Suggest Optimal Time" : "AI Suggestion (Pro Only)"}
              </Button>
            </div>
            </CardContent>
          </Card>
          
          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={onClose} className="px-8 py-3 text-base text-white/80 hover:bg-white/10 hover:text-white shadow-neumorphic-sm hover:shadow-neumorphic-lg transition-all duration-300 rounded-xl">
              Cancel
            </Button>
            <Button type="submit" className="px-8 py-3 text-base bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-neumorphic-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-500/60 transform hover:-translate-y-1 transition-all duration-300">
              <Save className="w-5 h-5 mr-2" /> {editingEvent ? 'Update' : 'Create'} Event
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EventForm;