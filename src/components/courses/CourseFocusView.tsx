// src/components/courses/CourseFocusView.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, CheckSquare, FileText, Youtube, Code } from 'lucide-react';
import { Course } from '@/components/dashboard/course';
import { recommendationService, CuratedContent } from './recommendationService';
import type { Task } from '@/components/tasks/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CourseFocusViewProps {
  course: Course;
  onClose: () => void;
}

const CourseFocusView: React.FC<CourseFocusViewProps> = ({ course, onClose }) => {
  const [relatedTasks, setRelatedTasks] = useState<Task[]>([]);
  const [curatedContent, setCuratedContent] = useState<CuratedContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [tasks, content] = await Promise.all([
        recommendationService.getRelatedTasks(course.id),
        recommendationService.getCuratedContent(course),
      ]);
      setRelatedTasks(tasks);
      setCuratedContent(content);
      setLoading(false);
    };
    fetchData();
  }, [course]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="relative w-full max-w-5xl h-[90vh] bg-black/50 border border-white/20 rounded-3xl shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: course.color }}>
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{course.name}</h2>
              <p className="text-white/70">{course.code}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-black/20 backdrop-blur-xl border border-white/10"><CardHeader><CardTitle className="text-white">Description</CardTitle></CardHeader><CardContent><p className="text-white/80 text-sm">{course.description || 'No description available.'}</p></CardContent></Card>
            <Card className="bg-black/20 backdrop-blur-xl border border-white/10"><CardHeader><CardTitle className="text-white">Details</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-white/60">Credits:</span> <span className="font-medium text-white">{course.credits}</span></div><div className="flex justify-between"><span className="text-white/60">Difficulty:</span> <Badge variant="secondary" className="capitalize">{course.difficulty}</Badge></div><div className="flex justify-between"><span className="text-white/60">Priority:</span> <Badge variant="secondary" className="capitalize">{course.priority}</Badge></div></CardContent></Card>
          </div>

          {/* Right Column: Related Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-black/20 backdrop-blur-xl border border-white/10"><CardHeader><CardTitle className="text-white flex items-center gap-2"><CheckSquare className="w-5 h-5 text-blue-400" /> Related Tasks</CardTitle></CardHeader><CardContent className="space-y-2">{loading ? <p className="text-white/60">Loading tasks...</p> : relatedTasks.length > 0 ? relatedTasks.map(task => (<div key={task.id} className={`p-2 rounded-md flex justify-between items-center ${task.status === 'completed' ? 'bg-green-500/10' : 'bg-white/5'}`}><span className={`${task.status === 'completed' ? 'line-through text-white/50' : 'text-white'}`}>{task.title}</span><Badge variant={task.status === 'completed' ? 'default' : 'outline'} className="text-xs">{task.status}</Badge></div>)) : <p className="text-white/60">No related tasks found.</p>}</CardContent></Card>
            <Card className="bg-black/20 backdrop-blur-xl border border-white/10"><CardHeader><CardTitle className="text-white flex items-center gap-2"><FileText className="w-5 h-5 text-purple-400" /> Curated Content</CardTitle></CardHeader><CardContent className="space-y-2">{loading ? <p className="text-white/60">Loading content...</p> : curatedContent.length > 0 ? curatedContent.map(content => (<a key={content.url} href={content.url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg flex items-center gap-4 bg-white/5 hover:bg-white/10 transition-colors"><div className="p-2 bg-cyan-500/20 rounded-md">{content.type === 'video' && <Youtube className="w-5 h-5 text-cyan-300" />}{content.type === 'article' && <FileText className="w-5 h-5 text-cyan-300" />}{content.type === 'tutorial' && <Code className="w-5 h-5 text-cyan-300" />}</div><div><p className="font-semibold text-white">{content.title}</p><p className="text-xs text-white/60 capitalize">{content.type}</p></div></a>)) : <p className="text-white/60">No curated content available.</p>}</CardContent></Card>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CourseFocusView;