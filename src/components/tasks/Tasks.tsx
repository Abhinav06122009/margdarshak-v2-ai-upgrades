// src/components/tasks/Tasks.tsx

import React, { useState, useEffect } from 'react';
import TaskAIPanel from './ai/TaskAIPanel';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Trash2, Book, Users, Calendar, Search, Filter, BookOpen, X, LayoutGrid, List, Kanban, Play, Folder, Download, CheckSquare,
  GraduationCap, Shield, AlertCircle, CheckCircle, Eye, BarChart3, 
  ArrowLeft, Palette, Clock, MapPin, User, Star, TrendingUp, Flag, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TiltCard } from '@/components/ui/TiltCard';
import { taskService } from './taskService';
import { courseService } from '@/components/dashboard/courseService';
import type { Task, TaskFormData, SecureUser, TaskStats } from './types';
import type { Course } from '@/components/dashboard/course';
import ParallaxBackground from '@/components/ui/ParallaxBackground';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import TaskCard from './TaskCard';
import KanbanBoard from './KanbanBoard';
import TaskGrid from './TaskGrid';

interface TaskTableProps {
  tasks: Array<Task & { depth: number }>;
  onEdit: (task: Task) => void;
  onDelete: (id: string, name: string) => void;
  selectedTasks: string[];
  onSelectTask: (id: string) => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
  isSomeSelected: boolean;
}

const TaskTable: React.FC<TaskTableProps> = ({ tasks, onEdit, onDelete, selectedTasks, onSelectTask, onSelectAll, isAllSelected, isSomeSelected }) => {
  return (
    <div className="overflow-x-auto bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
      <table className="w-full min-w-[640px] text-sm text-left text-white/80">
        <thead className="text-xs text-white/60 uppercase bg-white/5 border-b-2 border-purple-400/30">
          <tr>
            <th scope="col" className="p-4">
              <Checkbox
                checked={isAllSelected || (isSomeSelected ? 'indeterminate' : false)}
                onCheckedChange={onSelectAll}
              />
            </th>
            <th scope="col" className="px-6 py-3">Task Name</th>
            <th scope="col" className="px-6 py-3">Status</th>
            <th scope="col" className="px-6 py-3 hidden sm:table-cell">Priority</th>
            <th scope="col" className="px-6 py-3 hidden md:table-cell">Category</th>
            <th scope="col" className="px-6 py-3">Due Date</th>
            <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <motion.tbody layout>
          <AnimatePresence>
            {tasks.map((task, index) => (
              <motion.tr
                key={task.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
                className="border-b border-white/10 hover:bg-white/10 transition-colors duration-200 group"
              >
                <td className="p-4">
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={() => onSelectTask(task.id)}
                  />
                </td>
                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                  <div style={{ paddingLeft: `${task.depth * 1.5}rem` }} className="flex items-center gap-3">
                    <div className="w-2 h-6 rounded transition-transform duration-300 group-hover:scale-y-125 flex-shrink-0" style={{ backgroundColor: taskService.getCategoryColor(task.category, taskService.getTaskCategories()) }}></div>
                    <span>{task.title}</span>
                  </div>
                </th>
                <td className="px-6 py-4 capitalize">{task.status.replace('_', ' ')}</td>
                <td className="px-6 py-4 capitalize hidden sm:table-cell" style={{ color: taskService.getPriorityColor(task.priority) }}>{task.priority}</td>
                <td className="px-6 py-4 capitalize hidden md:table-cell">{task.category}</td>
                <td className="px-6 py-4">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(task)}
                      className="h-8 w-8 p-0 hover:bg-white/10 text-white"
                      title="Edit Task"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(task.id, task.title)}
                      className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400 text-white"
                      title="Delete Task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </motion.tbody>
      </table>
    </div>
  );
};

const Tasks: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [flattenedTasksForTable, setFlattenedTasksForTable] = useState<Array<Task & { depth: number }>>([]);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentUser, setCurrentUser] = useState<SecureUser | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'kanban' | 'calendar'>('grid');
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    category: 'general',
    due_date: '',
    tags: [],
    progress_percentage: 0,
    estimated_time: null,
    time_spent: 0,
    timer_active: false,
    timer_start: null,
    parent_task_id: null,
    course_id: null,
    depends_on: [],
  });

  const { toast } = useToast();

  useEffect(() => {
    initializeSecureTasks();
  }, []);

  useEffect(() => {
    // Clear selection when view mode or filters change
    setSelectedTasks([]);
  }, [viewMode, searchTerm, filterStatus, filterPriority, filterCategory]);

  useEffect(() => {
    if (!tasks.length && !loading) {
        setFilteredTasks([]);
        setFlattenedTasksForTable([]);
        return;
    }
    // 1. Create a map for quick lookups and initialize subtasks array
    const taskMap = new Map<string, Task>();
    tasks.forEach(task => {
        taskMap.set(task.id, { ...task, subtasks: [] });
    });

    // 2. Build the tree structure
    const rootTasks: Task[] = [];
    taskMap.forEach(task => {
        if (task.parent_task_id && taskMap.has(task.parent_task_id)) {
            const parent = taskMap.get(task.parent_task_id);
            parent?.subtasks?.push(task);
        } else {
            rootTasks.push(task);
        }
    });

    // 4. Apply filters (this is a simplified filter on root tasks)
    let results = rootTasks;
    if (searchTerm) {
        results = results.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterStatus !== 'all') {
        results = results.filter(t => t.status === filterStatus);
    }
    if (filterPriority !== 'all') {
        results = results.filter(t => t.priority === filterPriority);
    }
    if (filterCategory !== 'all') {
        results = results.filter(t => t.category === filterCategory);
    }

    const flattenTasks = (tasksToFlatten: Task[], depth = 0): Array<Task & { depth: number }> => {
        return tasksToFlatten.reduce((acc, task) => {
            return acc.concat({ ...task, depth }, flattenTasks(task.subtasks || [], depth + 1));
        }, [] as Array<Task & { depth: number }>);
    };

    setFilteredTasks(results);
    setFlattenedTasksForTable(flattenTasks(results));
  }, [tasks, searchTerm, filterStatus, filterPriority, filterCategory, loading]);

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    const allVisibleIds = (viewMode === 'table' ? flattenedTasksForTable : filteredTasks).map(t => t.id);
    if (selectedTasks.length === allVisibleIds.length) setSelectedTasks([]);
    else setSelectedTasks(allVisibleIds);
  };

  const initializeSecureTasks = async () => {
    try {
      setLoading(true);
      
      const user = await taskService.getCurrentUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to manage your tasks.",
          variant: "destructive",
        });
        setSecurityVerified(true);
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      setSecurityVerified(true);

      const premiumRoles = ['premium', 'bdo', 'admin', 'superadmin'];
      const userRole = user.profile?.role || 'student';
      setHasPremiumAccess(premiumRoles.includes(userRole));
      
      const [userTasks, stats, userCourses] = await Promise.all([
        taskService.fetchUserTasks(user.id),
        taskService.getTaskStatistics(user.id),
        courseService.fetchUserCourses(user.id)
      ]);
      
      setTasks(userTasks);
      setTaskStats(stats);
      setCourses(userCourses);

      toast({
        title: (
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
            Tasks Loaded Successfully!
          </span>
        ),
        description: (
          <span className="text-white font-medium">
            Welcome Back <span className="text-emerald-400 font-semibold">{user.profile?.full_name}</span>! Your tasks are ready.
          </span>
        ),
        className: "bg-black border border-blue-400/50 shadow-xl",
        icon: <Shield className="text-emerald-400" />
      });

    } catch (error) {
      console.error('Error initializing tasks:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize task management.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskDateUpdate = async (taskId: string, newDueDate: Date) => {
    if (!currentUser) return;

    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    const originalTasks = [...tasks];
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, due_date: newDueDate.toISOString() } : t
    );
    setTasks(updatedTasks);

    try {
      await taskService.updateTask(taskId, { due_date: newDueDate.toISOString() }, currentUser.id);
      toast({
        title: "Task Rescheduled",
        description: `Task "${taskToUpdate.title}" due date updated.`,
        className: "bg-black border border-blue-400/50 shadow-xl",
        icon: <Calendar className="text-blue-400" />,
      });
    } catch (error: any) {
      setTasks(originalTasks);
      toast({
        title: 'Error Rescheduling Task',
        description: `Failed to update due date: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleTaskStatusUpdate = async (taskId: string, newStatus: Task['status']) => {
    if (!currentUser) return;

    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate || taskToUpdate.status === newStatus) return;

    // Optimistic UI update
    const originalTasks = [...tasks];
    let updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );

    let parentTaskToUpdate: Task | undefined;
    let parentUpdatePayload: Partial<TaskFormData> | undefined;

    if (taskToUpdate.parent_task_id) {
        const parentTask = updatedTasks.find(t => t.id === taskToUpdate.parent_task_id);
        if (parentTask) {
            const subtasks = updatedTasks.filter(t => t.parent_task_id === parentTask.id);
            const completedSubtasks = subtasks.filter(st => st.status === 'completed').length;
            const newProgress = Math.round((completedSubtasks / subtasks.length) * 100);

            if (parentTask.progress_percentage !== newProgress) {
                parentTaskToUpdate = { ...parentTask, progress_percentage: newProgress };
                parentUpdatePayload = { progress_percentage: newProgress };
                updatedTasks = updatedTasks.map(t =>
                    t.id === (parentTaskToUpdate && parentTaskToUpdate.id) ? parentTaskToUpdate : t
                );
            }
        }
    }

    setTasks(updatedTasks);

    try {
      const updatePromises = [
          taskService.updateTask(taskId, { status: newStatus }, currentUser.id)
      ];

      if (parentTaskToUpdate && parentUpdatePayload) {
          updatePromises.push(
              taskService.updateTask(parentTaskToUpdate.id, parentUpdatePayload, currentUser.id)
          );
      }
      
      await Promise.all(updatePromises);

      toast({
        title: "Task Status Updated",
        description: `Task "${taskToUpdate.title}" moved to ${newStatus.replace('_', ' ')}.`,
        className: "bg-black border border-blue-400/50 shadow-xl",
        icon: <Shield className="text-emerald-400" />,
      });
      // Fetch fresh stats after update
      const stats = await taskService.getTaskStatistics(currentUser.id);
      setTaskStats(stats);
    } catch (error: any) {
      setTasks(originalTasks);
      toast({ title: 'Error Updating Task', description: `Failed to update task status: ${error.message}`, variant: 'destructive' });
    }
  };

  const handleToggleTimer = async (taskToToggle: Task) => {
    if (!currentUser) return;

    const now = new Date();
    const originalTasks = [...tasks];
    let activeTaskStoppedInfo: { title: string } | null = null;

    // Create the new state in a single pass to avoid race conditions
    const updatedTasks = tasks.map(t => {
      // Stop any other currently active timer
      if (t.timer_active && t.id !== taskToToggle.id) {
        activeTaskStoppedInfo = { title: t.title };
        const startTime = new Date(t.timer_start!).getTime();
        const elapsedSeconds = Math.floor((now.getTime() - startTime) / 1000);
        return {
          ...t,
          timer_active: false,
          timer_start: null,
          time_spent: (t.time_spent || 0) + elapsedSeconds,
        };
      }

      // Toggle the selected task
      if (t.id === taskToToggle.id) {
        if (t.timer_active) {
          // It's currently active, so stop it
          const startTime = new Date(t.timer_start!).getTime();
          const elapsedSeconds = Math.floor((now.getTime() - startTime) / 1000);
          return {
            ...t,
            timer_active: false,
            timer_start: null,
            time_spent: (t.time_spent || 0) + elapsedSeconds,
          };
        } else {
          // It's not active, so start it
          return {
            ...t,
            timer_active: true,
            timer_start: now.toISOString(),
          };
        }
      }

      return t; // Return other tasks unchanged
    });

    // Optimistic UI update
    setTasks(updatedTasks);

    // Find all tasks that were changed to update them in the backend
    const tasksToUpdate = updatedTasks.filter((updatedTask, index) => {
        return JSON.stringify(updatedTask) !== JSON.stringify(originalTasks[index]);
    });

    // Persist all changes to the backend
    try {
      await Promise.all(
        tasksToUpdate.map(task => 
          taskService.updateTask(task.id, task, currentUser.id)
        )
      );

      const toggledTaskAfterUpdate = updatedTasks.find(t => t.id === taskToToggle.id);
      if (toggledTaskAfterUpdate) {
        const isStarting = toggledTaskAfterUpdate.timer_active;
        toast({
            title: `Timer ${isStarting ? 'started' : 'stopped'} for "${toggledTaskAfterUpdate.title}"`,
            icon: isStarting ? <Play className="text-blue-400" /> : <CheckCircle className="text-green-400" />,
        });
      }
      if (activeTaskStoppedInfo) {
        toast({
            title: `Timer stopped for "${activeTaskStoppedInfo.title}"`,
            icon: <CheckCircle className="text-green-400" />,
        });
      }
    } catch (error: any) {
        // Revert on error
        setTasks(originalTasks);
        toast({ title: 'Timer Error', description: `Failed to save timer state: ${error.message}`, variant: 'destructive' });
    }
  };

  const handleBulkUpdate = async (updates: Partial<TaskFormData>) => {
    if (!currentUser || selectedTasks.length === 0) return;

    try {
      await taskService.bulkUpdateTasks(selectedTasks, updates, currentUser.id);
      toast({
        title: "Bulk Update Successful",
        description: `${selectedTasks.length} tasks have been updated.`,
        icon: <CheckCircle className="text-green-400" />,
      });
      const userTasks = await taskService.fetchUserTasks(currentUser.id);
      setTasks(userTasks);
      setSelectedTasks([]);
    } catch (error: any) {
      toast({ title: 'Bulk Update Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleBulkDelete = () => {
    if (selectedTasks.length === 0) return;
    setModalState({
      isOpen: true,
      title: `Delete ${selectedTasks.length} Tasks`,
      message: `Are you sure you want to permanently delete ${selectedTasks.length} selected tasks? This action cannot be undone.`,
      onConfirm: async () => {
        if (!currentUser) return;
        try {
          await taskService.bulkDeleteTasks(selectedTasks, currentUser.id);
          toast({
            title: "Tasks Deleted",
            description: `${selectedTasks.length} tasks have been removed.`,
            icon: <Trash2 className="text-rose-400" />,
          });
          const userTasks = await taskService.fetchUserTasks(currentUser.id);
          setTasks(userTasks);
          setSelectedTasks([]);
        } catch (error: any) {
          toast({ title: 'Error Deleting Tasks', description: error.message, variant: 'destructive' });
        } finally {
          setModalState({ ...modalState, isOpen: false });
        }
      },
    });
  };

  const handleExportCSV = () => {
    const tasksToExport = tasks.filter(t => selectedTasks.includes(t.id));
    if (tasksToExport.length === 0) return;

    const headers = ['id', 'title', 'description', 'status', 'priority', 'category', 'due_date', 'time_spent'];
    const csvContent = [
      headers.join(','),
      ...tasksToExport.map(t => headers.map(header => JSON.stringify(t[header as keyof Task], (key, value) => value === null ? '' : value)).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'tasks.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);
    
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to manage tasks.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }
    
    const dataToSubmit: TaskFormData = {
      ...formData,
      due_date: formData.due_date || null,
      parent_task_id: formData.parent_task_id || null,
      depends_on: formData.depends_on || [],
    };

    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id, dataToSubmit, currentUser.id);
        toast({
          title: (
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
              Task Updated!
            </span>
          ),
          description: (
            <span className="text-white font-medium">
              <span className="font-semibold">{formData.title}</span> has been updated.
            </span>
          ),
          className: "bg-black border border-blue-400/50 shadow-xl",
          icon: <Shield className="text-emerald-400" />,
        });
      } else {
        await taskService.createTask(dataToSubmit, currentUser.id);
        toast({
          title: (
            <span className="bg-gradient-to-r from-pink-400 via-yellow-400 to-emerald-400 bg-clip-text text-transparent font-bold">
              Task Created!
            </span>
          ),
          description: (
            <span className="text-white font-medium">
              <span className="text-emerald-400 font-semibold">{formData.title}</span> has been added.
            </span>
          ),
          className: "bg-black border border-pink-400/40 shadow-2xl",
          icon: <Sparkles className="text-yellow-400" />,
        });
      }

      setIsSheetOpen(false);
      setEditingTask(null);
      resetForm();
      
      const userTasks = await taskService.fetchUserTasks(currentUser.id);
      setTasks(userTasks);
      
      const stats = await taskService.getTaskStatistics(currentUser.id);
      setTaskStats(stats);
      
    } catch (error: any) {
      console.error('Error saving task:', error);
      toast({
        title: 'Error Saving Task',
        description: `Failed to save task: ${error.message || 'Please try again.'}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      category: task.category,
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
      tags: task.tags || [],
      progress_percentage: task.progress_percentage || 0,
      estimated_time: task.estimated_time || null,
      parent_task_id: task.parent_task_id || null,
      course_id: task.course_id || null,
      depends_on: task.depends_on || [],
    });
    setIsSheetOpen(true);
  };

  const handleDelete = async (taskId: string, taskName: string) => {
    setModalState({
      isOpen: true,
      title: `Delete Task: ${taskName}`,
      message: `Are you sure you want to permanently delete "${taskName}"? This action cannot be undone.`,
      onConfirm: async () => {
        if (!currentUser) return;
        try {
          await taskService.deleteTask(taskId, currentUser.id);
          toast({
            title: (
              <span className="bg-gradient-to-r from-pink-500 via-red-500 to-rose-400 bg-clip-text text-transparent font-bold">
                Task Deleted
              </span>
            ),
            description: (
              <span className="text-white font-medium">
                <span className="text-rose-400 font-semibold">{taskName}</span> has been removed.
              </span>
            ),
            className: "bg-black border border-red-400/40 shadow-2xl",
            icon: <Trash2 className="text-rose-400" />,
          });
          const userTasks = await taskService.fetchUserTasks(currentUser.id);
          setTasks(userTasks);
          const stats = await taskService.getTaskStatistics(currentUser.id);
          setTaskStats(stats);
        } catch (error: any) {
          toast({ title: 'Error Deleting Task', description: `Failed to delete task: ${error.message}`, variant: 'destructive' });
        } finally {
          setModalState({ ...modalState, isOpen: false });
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      category: 'general',
      due_date: '',
      tags: [],
      progress_percentage: 0,
      estimated_time: null,
      parent_task_id: null,
      depends_on: [],
      time_spent: 0,
      timer_active: false,
      timer_start: null,
    });
  };

  const openCreateDialog = () => {
    setEditingTask(null);
    resetForm();
    setIsSheetOpen(true);
  };

  const allVisibleTaskIds = (viewMode === 'table' ? flattenedTasksForTable : filteredTasks).map(t => t.id);
  const isAllSelected = allVisibleTaskIds.length > 0 && selectedTasks.length === allVisibleTaskIds.length;
  const isSomeSelected = selectedTasks.length > 0 && !isAllSelected;

  if (loading || !securityVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 border border-white/20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing Task System...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 border border-white/20 text-center max-w-md">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-white/80 mb-6">Please Login To Access Your Tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center relative overflow-hidden">
      <ParallaxBackground />
      <AnimatePresence>
        {selectedTasks.length > 0 && hasPremiumAccess && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-auto bg-black/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-2 flex items-center gap-2 z-50"
          >
            <span className="text-white font-semibold px-3 text-sm">{selectedTasks.length} selected</span>
            <div className="h-6 w-px bg-white/20" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-sm"><CheckSquare className="w-4 h-4 mr-2" /> Change Status</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="bg-black/60 backdrop-blur-xl border-white/20 text-white">
                {(['pending', 'in_progress', 'review', 'completed'] as const).map(status => (
                  <DropdownMenuItem key={status} onSelect={() => handleBulkUpdate({ status })}>{status.replace('_', ' ')}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-sm"><Folder className="w-4 h-4 mr-2" /> Change Category</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="bg-black/60 backdrop-blur-xl border-white/20 text-white">
                {taskService.getTaskCategories().map(cat => (
                  <DropdownMenuItem key={cat.id} onSelect={() => handleBulkUpdate({ category: cat.id })}>{cat.name}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-sm" onClick={handleExportCSV}><Download className="w-4 h-4 mr-2" /> Export</Button>

            <div className="h-6 w-px bg-white/20" />

            <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm" onClick={handleBulkDelete}><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
            
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white" onClick={() => setSelectedTasks([])}><X className="w-4 h-4" /></Button>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
      />
      <div className="w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden border-b border-white/20"
        >
          <div className="relative px-4 sm:px-6 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center space-x-6">
                {onBack && (
                  <motion.button
                    onClick={onBack}
                    className="group p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="w-5 h-5 text-white group-hover:text-white transition-colors" />
                  </motion.button>
                )}
                <div>
                  <motion.h1 
                    className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 flex items-center gap-4 bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent drop-shadow-xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    📝 Task Management
                  </motion.h1>
                  <motion.p 
                    className="text-white/80 text-base sm:text-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Organize your work for <span className="font-semibold text-white">{currentUser.profile?.full_name}</span>
                  </motion.p>
                </div>
              </div>
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <motion.button
                  onClick={openCreateDialog}
                  className="group relative inline-flex w-full sm:w-auto h-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 px-8 py-4 font-bold text-lg text-white shadow-lg transition-all duration-300 ease-out hover:from-purple-700 hover:to-blue-700 hover:shadow-xl hover:shadow-purple-500/50 active:scale-95"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="absolute inset-0 flex h-full w-full justify-center [transform:skewX(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skewX(-12deg)_translateX(100%)] bg-white/30" />
                  <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180 mr-3 z-10" />
                  <span className="relative z-10">Create Task</span>
                </motion.button>
              </div>
            </div>
          </div>
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/70 to-purple-500/0"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: "circOut", delay: 0.5 }}
          />
        </motion.div>

        {taskStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 border-b border-white/10"
          >
            <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                { icon: List, value: taskStats.total_tasks, label: 'Total Tasks', gradient: 'from-blue-500 to-cyan-500'},
                { icon: Clock, value: taskStats.pending_tasks, label: 'Pending', gradient: 'from-yellow-500 to-amber-500'},
                { icon: TrendingUp, value: taskStats.in_progress_tasks, label: 'In Progress', gradient: 'from-purple-500 to-violet-500'},
                { icon: Eye, value: taskStats.review_tasks || 0, label: 'In Review', gradient: 'from-pink-500 to-rose-500'},
                { icon: CheckCircle, value: taskStats.completed_tasks, label: 'Completed', gradient: 'from-green-500 to-emerald-500'},
              ].map((stat, index) => (
                <TiltCard key={stat.label} className="w-full h-full">
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0 } }}
                    transition={{ delay: 0.1 * index, type: 'spring', stiffness: 100 }}
                    className="bg-black/20 backdrop-blur-md p-6 rounded-3xl border border-white/10 transition-all duration-300 group relative overflow-hidden shadow-lg hover:shadow-cyan-500/30 h-full"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-6 space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Filter className="w-5 h-5 text-blue-400" />
                      Filter & Search
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                      <Input
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-black/30 border-2 border-white/15 rounded-xl text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="bg-black/30 border-2 border-white/15 text-white rounded-xl shadow-neumorphic-inset-lg focus:border-blue-500/70">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white shadow-neumorphic-lg">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">In Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger className="bg-black/30 border-2 border-white/15 text-white rounded-xl shadow-neumorphic-inset-lg focus:border-blue-500/70">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white shadow-neumorphic-lg">
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="bg-black/30 border-2 border-white/15 text-white rounded-xl shadow-neumorphic-inset-lg focus:border-blue-500/70">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white shadow-neumorphic-lg">
                        <SelectItem value="all">All Categories</SelectItem>
                        {taskService.getTaskCategories().map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <TaskAIPanel tasks={tasks} />
              </motion.div>
            </div>
          </div>

          <div className="lg:col-span-8 xl:col-span-9">
            <div className="flex justify-end mb-4">
              <div className="bg-black/20 border border-white/10 rounded-xl p-1 flex items-center space-x-1">
                <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className={`transition-all ${viewMode === 'grid' ? 'bg-white/10' : ''}`}>
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('table')} className={`transition-all ${viewMode === 'table' ? 'bg-white/10' : ''}`}>
                  <List className="w-4 h-4" />
                </Button>
                <Button variant={viewMode === 'kanban' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('kanban')} className={`transition-all ${viewMode === 'kanban' ? 'bg-white/10' : ''}`}>
                  <Kanban className="w-4 h-4" />
                </Button>
                <Button variant={viewMode === 'calendar' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('calendar')} className={`transition-all ${viewMode === 'calendar' ? 'bg-white/10' : ''}`}>
                  <Calendar className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {viewMode === 'grid' && (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {filteredTasks.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleTimer={handleToggleTimer}
                      onStatusChange={handleTaskStatusUpdate}
                      isSelected={selectedTasks.includes(task.id)}
                      onSelect={handleSelectTask}
                      hasPremiumAccess={hasPremiumAccess}
                      courses={courses}
                    />
                  ))}
                </motion.div>
              )}
              {viewMode === 'table' && (
                <motion.div key="table" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <TaskTable
                      tasks={flattenedTasksForTable}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      selectedTasks={selectedTasks}
                      onSelectTask={handleSelectTask}
                      onSelectAll={handleSelectAll}
                      isAllSelected={allVisibleTaskIds.length > 0 && selectedTasks.length === allVisibleTaskIds.length}
                      isSomeSelected={selectedTasks.length > 0 && selectedTasks.length < allVisibleTaskIds.length}
                    />
                </motion.div>
              )}
              {viewMode === 'kanban' && (
                <motion.div key="kanban" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <KanbanBoard
                    tasks={filteredTasks}
                    onEditTask={handleEdit}
                    onDeleteTask={handleDelete}
                    onTaskStatusUpdate={handleTaskStatusUpdate}
                    onToggleTimer={handleToggleTimer}
                    selectedTasks={selectedTasks}
                    onSelectTask={handleSelectTask}
                  />
                </motion.div>
              )}
              {viewMode === 'calendar' && (
                <motion.div key="calendar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <TaskGrid
                    tasks={tasks}
                    onEditTask={handleEdit}
                    onDeleteTask={handleDelete}
                    onStatusChange={handleTaskStatusUpdate}
                    onToggleTimer={handleToggleTimer}
                    onDateUpdate={handleTaskDateUpdate}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {filteredTasks.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-8 border border-white/10 max-w-md mx-auto">
                  <BookOpen className="h-20 w-20 mx-auto text-white/50 mb-6" />
                  <h3 className="text-3xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    No tasks match your filters
                  </h3>
                  <p className="text-white/80 mb-6 text-lg">
                    Try adjusting your search criteria or create a new task.
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={openCreateDialog} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all">
                      <Plus className="h-5 w-5 mr-2" />
                      Create a Task
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isSheetOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSheetOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 h-full w-full max-w-2xl bg-black/80 backdrop-blur-2xl border-l border-white/20 shadow-2xl z-50 flex flex-col"
              >
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center gap-3 text-xl text-white font-bold">
                    <Palette className="w-6 h-6 text-white" />
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsSheetOpen(false)} className="text-white/70 hover:text-white hover:bg-white/10">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-6">
                  <form onSubmit={handleSubmit} className="space-y-8 p-1">
                    <div className="space-y-6 p-6 bg-black/20 rounded-2xl border border-white/10">
                      <h3 className="text-2xl font-extrabold text-white mb-4 flex items-center gap-3">
                        <BookOpen className="w-7 h-7" /> Task Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="title" className="text-base font-semibold text-white/90">Task Title *</Label>
                          <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Design new dashboard" required className="text-base bg-black/30 border-2 border-white/15 text-white"/>
                        </div>
                        <div>
                          <Label htmlFor="category" className="text-base font-semibold text-white/90">Category *</Label>
                          <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                            <SelectTrigger className="text-base bg-black/30 border-2 border-white/15 text-white"><SelectValue/></SelectTrigger>
                            <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white">
                                {taskService.getTaskCategories().map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description" className="text-base font-semibold text-white/90">Description</Label>
                        <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Provide details about the task..." className="min-h-[120px] text-base bg-black/30 border-2 border-white/15 text-white"/>
                      </div>
                    </div>

                    <div className="space-y-6 p-6 bg-black/20 rounded-2xl border border-white/10">
                        <h3 className="text-2xl font-extrabold text-white mb-4 flex items-center gap-3">
                            <TrendingUp className="w-7 h-7" /> Task Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="priority" className="text-base font-semibold text-white/90">Priority</Label>
                                <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v as any})}>
                                    <SelectTrigger className="text-base bg-black/30 border-2 border-white/15 text-white"><SelectValue/></SelectTrigger>
                                    <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white">
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="status" className="text-base font-semibold text-white/90">Status</Label>
                                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v as any})}>
                                    <SelectTrigger className="text-base bg-black/30 border-2 border-white/15 text-white"><SelectValue/></SelectTrigger>
                                    <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white">
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="review">In Review</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="overdue">Overdue</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="due_date" className="text-base font-semibold text-white/90">Due Date</Label>
                                <Input id="due_date" type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="text-base bg-black/30 border-2 border-white/15 text-white"/>
                            </div>
                            <div>
                                <Label htmlFor="estimated_time" className="text-base font-semibold text-white/90">Estimated Time (minutes)</Label>
                                <Input
                                    id="estimated_time"
                                    type="number"
                                    min="0"
                                    value={formData.estimated_time || ''}
                                    onChange={(e) => setFormData({ ...formData, estimated_time: e.target.value ? Number(e.target.value) : null })}
                                    placeholder="e.g., 60"
                                    className="text-base bg-black/30 border-2 border-white/15 text-white"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="progress" className="text-base font-semibold text-white/90">Progress (%)</Label>
                                <Input id="progress" type="number" min="0" max="100" value={formData.progress_percentage || 0} onChange={(e) => setFormData({ ...formData, progress_percentage: Number(e.target.value) })} className="text-base bg-black/30 border-2 border-white/15 text-white"/>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="parent_task" className="text-base font-semibold text-white/90">Parent Task</Label>
                            <Select
                                value={formData.parent_task_id || ''}
                                onValueChange={(v) => setFormData({ ...formData, parent_task_id: v === 'none' ? null : v })}
                            >
                                <SelectTrigger className="text-base bg-black/30 border-2 border-white/15 text-white"><SelectValue placeholder="Select a parent task..."/></SelectTrigger>
                                <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white">
                                    <SelectItem value="none">None</SelectItem>
                                    {tasks
                                        .filter(t => !editingTask || t.id !== editingTask.id) // Prevent self-parenting
                                        .map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="course_id" className="text-base font-semibold text-white/90">Related Course</Label>
                            <Select
                                value={formData.course_id || 'none'}
                                onValueChange={(v) => setFormData({ ...formData, course_id: v === 'none' ? null : v })}
                            >
                                <SelectTrigger className="text-base bg-black/30 border-2 border-white/15 text-white"><SelectValue placeholder="Link to a course..."/></SelectTrigger>
                                <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white">
                                    <SelectItem value="none">None</SelectItem>
                                    {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-6 p-6 bg-black/20 rounded-2xl border border-white/10">
                        <h3 className="text-2xl font-extrabold text-white mb-4 flex items-center gap-3">
                            <Palette className="w-7 h-7" /> Live Preview
                        </h3>
                        <TaskCard task={{...formData, id: 'preview', created_at: new Date().toISOString(), is_deleted: false, user_id: 'preview', time_spent: 0, timer_active: false, timer_start: null}} index={0} onEdit={() => {}} onDelete={() => {}} onToggleTimer={() => {}} onStatusChange={() => {}} isSelected={false} onSelect={() => {}} />
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-white/10">
                      <Button type="button" variant="ghost" onClick={() => setIsSheetOpen(false)} className="px-8 py-3 text-base text-white/80 hover:bg-white/10">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting} className="px-8 py-3 text-base bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl disabled:opacity-50">
                        {isSubmitting ? 'Saving...' : (editingTask ? 'Update Task' : 'Create Task')}
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
<footer className="w-full mt-12 pt-8 border-t border-white/20 text-white/70 text-xs relative overflow-hidden">
    <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center sm:text-left">
        <div className="absolute inset-0 z-0 opacity-20 animate-pulse-slow" style={{
          background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1), rgba(236, 72, 153, 0.1))',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 15s ease infinite'
        }}></div>
        <div className="col-span-2 sm:col-span-1">
        <h3 className="font-bold text-base text-white mb-2">MARGDARSHAK</h3>
        <p className="text-white/50">by VSAV GYANTAPA</p>
        </div>
        <div>
        <h3 className="font-bold text-base text-white mb-2">Legal</h3>
        <ul className="space-y-2">
            <li><Link to="/terms" className="hover:text-white hover:underline transition-colors duration-200">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-white hover:underline transition-colors duration-200">Privacy Policy</Link></li>
        </ul>
        </div>
        <div>
        <h3 className="font-bold text-base text-white mb-2">Support</h3>
        <ul className="space-y-2">
            <li><Link to="/help" className="hover:text-white hover:underline transition-colors duration-200">Help Center</Link></li>
            <li><a href="mailto:abhinavjha393@gmail.com" className="hover:text-white hover:underline transition-colors duration-200">Contact Us</a></li>
        </ul>
        </div>
        <div>
        <h3 className="font-bold text-base text-white mb-2">Follow Us</h3>
        <div className="flex justify-center sm:justify-start space-x-4">
            <a href="https://x.com/gyantappas" aria-label="Twitter" className="hover:text-white transition-colors duration-200"><svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></a>
            <a href="https://www.facebook.com/profile.php?id=61584618795158" aria-label="Facebook" className="hover:text-white transition-colors duration-200"><svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z"/></svg></a>
            <a href="https://www.linkedin.com/in/vsav-gyantapa-33893a399/" aria-label="linkedin" className="hover:text-white transition-colors duration-200"><svg viewBox="0 0 16 16" className="w-5 h-5 fill-current"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg></a>
        </div>
        </div>
    </div>
    <div className="mt-8 pt-6 border-t border-white/10 text-center relative z-10">
        <p>Developed by <span className="font-semibold text-emerald-400">VSAV GYANTAPA</span> | © 2025 VSAV GYANTAPA</p>
    </div>
</footer>
    </div>
  );
};

export default Tasks;
