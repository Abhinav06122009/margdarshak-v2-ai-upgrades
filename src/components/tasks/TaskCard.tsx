// src/components/tasks/TaskCard.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar, Flag, Play, Pause, CheckSquare, Link, ChevronDown, ChevronUp, CheckCircle, GitCommitHorizontal, Star, MoreVertical, BookOpen, Lock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Task, SecureUser, Course } from './types';
import { Checkbox } from '@/components/ui/checkbox';
import { taskService } from './taskService';
import CompletionCelebration from './CompletionCelebration';

const GlareEffect = () => (
  <motion.div
    className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl pointer-events-none"
    style={{ transform: "translateZ(50px)" }}
  >
    <motion.div 
      className="absolute w-96 h-96 bg-white/10 -top-1/4 -left-1/4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        transform: 'rotate(45deg)',
        filter: 'blur(50px)',
        mixBlendMode: 'overlay'
      }}
    />
  </motion.div>
);

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (id: string, name: string) => void;
  onToggleTimer: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onToggleFavorite: (task: Task) => void;
  isSelected: boolean;
  onSelect: (taskId: string) => void;
  hasPremiumAccess: boolean;
  currentUser: SecureUser | null;
  courses: Course[];
  celebratingTaskId: string | null;
  view?: 'default' | 'calendar';
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, onEdit, onDelete, onToggleTimer, onStatusChange, onToggleFavorite, isSelected, onSelect, hasPremiumAccess, currentUser, courses, celebratingTaskId, view = 'default' }) => {
  const categoryColor = taskService.getCategoryColor(task.category, taskService.getTaskCategories()) || '#6B7280';
  const priorityColor = taskService.getPriorityColor(task.priority);
  const [currentTime, setCurrentTime] = useState(task.time_spent || 0);
  const [isInteractionHovered, setIsInteractionHovered] = useState(false);
  const [isSubtasksVisible, setIsSubtasksVisible] = useState(true);

  useEffect(() => {
    let interval: number | undefined;
    if (task.timer_active && task.timer_start) {
      const startTime = new Date(task.timer_start).getTime();
      const baseTime = task.time_spent || 0;
      
      // Set initial time immediately
      const initialElapsed = Math.floor((Date.now() - startTime) / 1000);
      setCurrentTime(baseTime + initialElapsed);

      interval = setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setCurrentTime(baseTime + elapsed);
      }, 1000);
    } else {
      setCurrentTime(task.time_spent || 0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [task.timer_active, task.timer_start, task.time_spent]);

  const estimatedTimeInSeconds = task.estimated_time ? task.estimated_time * 60 : 0;
  const timeProgress = estimatedTimeInSeconds > 0 ? Math.min(100, (currentTime / estimatedTimeInSeconds) * 100) : 0;

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (timeProgress / 100) * circumference;

    const getRollupProgress = (t: Task): number => {
        if (!t.subtasks || t.subtasks.length === 0) {
            // For a task with no subtasks, progress is based on its own status.
            return t.status === 'completed' ? 100 : (t.progress_percentage || 0);
        }
        const completedSubtasks = t.subtasks.filter(sub => sub.status === 'completed').length;
        return Math.round((completedSubtasks / t.subtasks.length) * 100);
    };
    const displayProgress = task.subtasks && task.subtasks.length > 0 ? getRollupProgress(task) : (task.status === 'completed' ? 100 : (task.progress_percentage || 0));

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const handleInteractionEnter = () => setIsInteractionHovered(true);
  const handleInteractionLeave = () => setIsInteractionHovered(false);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
  };

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12.5deg", "-12.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12.5deg", "12.5deg"]);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isInteractionHovered) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const { width, height } = rect;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (view === 'calendar') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="group relative"
        onClick={() => onEdit(task)}
      >
        <div className="w-full p-1.5 rounded-md text-white text-xs font-medium cursor-pointer border overflow-hidden"
             style={{ backgroundColor: `${categoryColor}20`, borderColor: `${categoryColor}80` }}
             title={task.title}>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: priorityColor }}></div>
            <span className="flex-grow truncate">{task.title}</span>
            <div className="flex-shrink-0 flex items-center gap-1">
              {task.is_favorited && <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />}
              {task.subtasks && task.subtasks.length > 0 && <GitCommitHorizontal className="h-3 w-3 text-white/70" title={`${task.subtasks.length} subtasks`} />}
              {task.timer_active && <Play className="h-3 w-3 text-white/90 animate-pulse" title="Timer active" />}
            </div>
          </div>
          {displayProgress > 0 && (
            <div className="w-full bg-black/30 rounded-full h-1 mt-1 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${displayProgress}%` }}
                transition={{ duration: 0.5, ease: 'circOut' }}
              />
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, y: 50, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      exit={{ opacity: 0, y: -20, rotateX: -10 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 100, damping: 10 }}
      className="group h-full"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.98, rotateX: 2 }}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} whileHover={{ scale: 1.03 }}>
      <Card className={`
        relative bg-gradient-to-br from-black/60 to-black/60 backdrop-blur-xl border border-white/10 
        rounded-3xl transition-all duration-500 shadow-2xl group-hover:shadow-cyan-500/40 h-full 
        overflow-hidden flex flex-col transform-gpu
        ${task.status === 'completed' ? 'opacity-60 hover:opacity-100' : ''}
      `} style={{ transform: "translateZ(20px)" }}>
        <GlareEffect />
        {celebratingTaskId === task.id && <CompletionCelebration />}
        <div
          className="absolute top-4 right-4 z-30"
          onMouseEnter={handleInteractionEnter}
          onMouseLeave={handleInteractionLeave}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(task.id)}
            className="h-6 w-6 bg-black/50 border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-400 transition-all"
          />
        </div>
        {/* Dynamic Holographic Overlay */}
        <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '25px 25px',
          backgroundPosition: '0 0, 0 0',
          animation: 'hologram-move 10s infinite linear'
        }}></div>
        {/* Animated Border Glow */}
        <div className="absolute inset-0 rounded-3xl border-4 border-transparent group-hover:border-cyan-400/50 transition-all duration-500 z-10" style={{
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.5), inset 0 0 10px rgba(6, 182, 212, 0.3)'
        }}></div>

        {/* Multi-color header strip */}
        <div className="h-3 flex relative z-20">
          <div
            className="flex-1 h-full"
            style={{ backgroundColor: categoryColor }}
            title={`Category: ${task.category}`}
          />
          <div
            className="flex-1 h-full"
            style={{ backgroundColor: priorityColor }}
            title={`Priority: ${task.priority}`}
          />
        </div>

        <CardHeader className="pb-4 relative z-20">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-grow min-w-0">
              <motion.div
                className="p-3 rounded-xl shadow-neumorphic-light-sm"
                style={{ backgroundColor: `${categoryColor}80` }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                {React.createElement(taskService.getCategoryIcon(task.category), { className: "h-6 w-6 text-white" })}
              </motion.div>
              <div>
                <CardTitle className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300 group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300 drop-shadow-md">
                  {task.title}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="mt-2 text-white border-white/30 text-sm px-3 py-1 rounded-full shadow-neumorphic-inset-sm"
                  style={{
                    backgroundColor: `${categoryColor}40`,
                    borderColor: categoryColor
                  }}
                >
                  {task.category}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onToggleFavorite(task)}
                className="h-10 w-10 p-0 rounded-full text-white/70 hover:text-yellow-400 hover:bg-yellow-500/10"
                onMouseEnter={handleInteractionEnter} onMouseLeave={handleInteractionLeave}
              >
                <Star className={`h-5 w-5 transition-all ${task.is_favorited ? 'text-yellow-400 fill-yellow-400' : ''}`} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 p-0 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                    onMouseEnter={handleInteractionEnter} onMouseLeave={handleInteractionLeave}
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-black/80 backdrop-blur-xl border-white/20 text-white">
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <DropdownMenuItem onSelect={() => onEdit(task)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onStatusChange(task.id, 'pending')}>Pending</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onStatusChange(task.id, 'in_progress')}>In Progress</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onStatusChange(task.id, 'review')}>In Review</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onStatusChange(task.id, 'completed')}>Completed</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onDelete(task.id, task.title)} className="text-red-400 focus:bg-red-500/20 focus:text-red-300">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </motion.div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 flex-grow flex flex-col justify-between relative z-20">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-3">
              {task.due_date && <Badge variant="outline" className="text-sm border-white/30 text-white bg-white/10 px-3 py-1 rounded-full shadow-neumorphic-inset-xs"><Calendar className="h-4 w-4 mr-2 text-green-300" /> Due {new Date(task.due_date).toLocaleDateString()}</Badge>}
              <Badge variant="outline" className="text-sm border-white/30 text-white bg-white/10 px-3 py-1 rounded-full shadow-neumorphic-inset-xs" style={{color: priorityColor}}><Flag className="h-4 w-4 mr-2" /> {task.priority}</Badge>
            </div>
            {task.course_id && courses && (
              <Badge variant="outline" className="text-sm border-purple-400/50 text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full shadow-neumorphic-inset-xs mt-2">
                <BookOpen className="h-4 w-4 mr-2" /> {courses.find(c => c.id === task.course_id)?.name || 'Linked Course'}
              </Badge>
            )}
            {currentUser && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md" title={currentUser.profile?.full_name}>
                {getInitials(currentUser.profile?.full_name)}
              </div>
            )}
          </div>

          {task.description && (
            <p className="text-base text-white/80 line-clamp-3 leading-relaxed">
              {task.description}
            </p>
          )}

          {task.depends_on && task.depends_on.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-400/80 pt-3">
                <Link className="h-3 w-3" />
                <span>Depends on {task.depends_on.length} task(s)</span>
            </div>
          )}

          {displayProgress > 0 && (
            <div>
              <div className="flex justify-between text-sm text-white/70">
                <span>Progress</span>
                <span>{displayProgress}%</span>
              </div>
              <div className="w-full bg-black/30 rounded-full h-2.5 mt-1 overflow-hidden border border-white/10 shadow-inner">
                <motion.div 
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${displayProgress}%` }}
                  transition={{ duration: 0.5, ease: 'circOut' }}
                >
                  <div className="absolute top-0 left-0 h-full w-full bg-white/20 opacity-70 animate-pulse-slow" />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div key={i} className="absolute top-1/2 -translate-y-1/2 h-1 w-1 bg-white/70 rounded-full"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: '100vw', opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: Math.random() * 2, ease: 'linear' }} />
                  ))}
                </motion.div>
              </div>
            </div>
          )}

          <div
            className="pt-4 border-t border-white/15 mt-auto"
            onMouseEnter={handleInteractionEnter}
            onMouseLeave={handleInteractionLeave}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" onClick={() => onToggleTimer(task)} disabled={!hasPremiumAccess} className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex-shrink-0 shadow-neumorphic-sm hover:shadow-neumorphic-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50">
                        {hasPremiumAccess 
                          ? (task.timer_active ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />)
                          : <Lock className="h-5 w-5" />
                        }
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{hasPremiumAccess ? 'Start/Stop Timer' : 'Timer is a Premium Feature'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div>
                  <div className="text-white font-bold text-lg">{formatTime(currentTime)}</div>
                  <div className="text-xs text-white/60">
                    {task.estimated_time ? `of ${task.estimated_time}m estimated` : 'No estimate'}
                  </div>
                </div>
              </div>
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-full h-full" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r={radius} fill="transparent" stroke="#ffffff20" strokeWidth="3" />
                  <motion.circle
                    cx="22" cy="22" r={radius}
                    fill="transparent"
                    stroke={priorityColor}
                    strokeLinecap="round" strokeWidth="3"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.3 }}
                    transform="rotate(-90 22 22)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                  {Math.round(timeProgress)}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        {task.subtasks && task.subtasks.length > 0 && (
            <div
                className="border-t border-white/10 px-4 pt-4 pb-2 bg-black/10 relative z-20"
                onMouseEnter={handleInteractionEnter}
                onMouseLeave={handleInteractionLeave}
            >
                <button
                    onClick={() => setIsSubtasksVisible(!isSubtasksVisible)}
                    className="flex items-center justify-between w-full text-left text-white/80 hover:text-white mb-3"
                >
                    <span className="font-semibold">{task.subtasks.length} Subtasks</span>
                    {isSubtasksVisible ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                <AnimatePresence>
                    {isSubtasksVisible && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-2">
                                {task.subtasks.map((subtask) => (
                                    <SubtaskItem
                                        key={subtask.id}
                                        task={subtask}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onStatusChange={onStatusChange}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )}
      </Card>
      </motion.div>
    </motion.div>
  );
};

const SubtaskItem: React.FC<{ 
    task: Task, 
    onEdit: (task: Task) => void,
    onDelete: (id: string, name: string) => void,
    onStatusChange: (id: string, status: Task['status']) => void
}> = ({ task, onEdit, onDelete, onStatusChange }) => {
    const priorityColor = taskService.getPriorityColor(task.priority);

    const handleComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onStatusChange(task.id, 'completed');
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(task.id, task.title);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center justify-between p-2 rounded-lg group transition-colors ${
                task.status === 'completed' ? 'bg-green-500/10 hover:bg-green-500/20' : 'bg-white/5 hover:bg-white/10'
            }`}
        >
            <div 
                className="flex items-center gap-2 overflow-hidden flex-grow cursor-pointer"
                onClick={() => onEdit(task)}
                title={`Edit "${task.title}"`}
            >
                <div className="w-1.5 h-4 rounded flex-shrink-0" style={{ backgroundColor: priorityColor }}></div>
                <span className={`text-sm truncate group-hover:text-white ${
                    task.status === 'completed' ? 'line-through text-white/60' : 'text-white/90'
                }`}>{task.title}</span>
            </div>
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                <Badge variant="outline" className={`text-xs capitalize flex-shrink-0 opacity-100 group-hover:opacity-0 transition-opacity ${
                    task.status === 'completed' ? 'border-green-400/50 text-green-400' : ''
                }`}>{task.status.replace('_', ' ')}</Badge>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {task.status !== 'completed' && (
                        <Button size="icon" variant="ghost" className="h-6 w-6 p-0 text-green-400 hover:bg-green-500/20 hover:text-green-300" onClick={handleComplete} title="Mark as complete">
                            <CheckCircle className="h-4 w-4" />
                        </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-6 w-6 p-0 text-red-400 hover:bg-red-500/20 hover:text-red-300" onClick={handleDelete} title="Delete subtask">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default TaskCard;
