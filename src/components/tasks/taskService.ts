// src/components/tasks/taskService.ts

import { Briefcase, Heart, GraduationCap, PiggyBank, Home, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Task, TaskFormData, SecureUser, TaskStats, TaskTemplate, TaskTemplateFormData } from './types';

export const taskService = {
  async getCurrentUser(): Promise<SecureUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role, student_id')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email || '',
      profile: profile || undefined,
    };
  },

  async fetchUserTasks(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async getTaskStatistics(userId: string): Promise<TaskStats> {
    const { data, error } = await supabase.rpc('get_user_task_stats', { p_user_id: userId });
    if (error) {
        // Fallback calculation if RPC fails
        const tasks = await this.fetchUserTasks(userId);
        return {
            total_tasks: tasks.length,
            pending_tasks: tasks.filter(t => t.status === 'pending').length,
            in_progress_tasks: tasks.filter(t => t.status === 'in_progress').length,
            completed_tasks: tasks.filter(t => t.status === 'completed').length,
            review_tasks: tasks.filter(t => t.status === 'review').length,
        };
    }
    const stats = data[0];
    // The user's RPC might not return review_tasks, so we calculate it if missing.
    if (stats && stats.review_tasks === undefined) {
        const tasks = await this.fetchUserTasks(userId);
        stats.review_tasks = tasks.filter(t => t.status === 'review').length;
    }
    return stats;
  },

  async createTask(taskData: TaskFormData, userId: string): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...taskData, user_id: userId }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateTask(taskId: string, taskData: Partial<TaskFormData>, userId: string): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(taskData)
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteTask(taskId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', taskId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  },
  
  async toggleFavoriteStatus(taskId: string, currentStatus: boolean, userId: string): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({ is_favorited: !currentStatus })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async bulkUpdateTasks(taskIds: string[], updates: Partial<TaskFormData>, userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .in('id', taskIds)
      .eq('user_id', userId)
      .select();
    if (error) throw new Error(error.message);
    return data || [];
  },

  async bulkDeleteTasks(taskIds: string[], userId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .in('id', taskIds)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  },

  async fetchTaskTemplates(): Promise<TaskTemplate[]> {
    const { data, error } = await supabase
      .from('task_templates')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async createTaskTemplate(templateData: TaskTemplateFormData, userId: string): Promise<TaskTemplate> {
    const { data, error } = await supabase
      .from('task_templates')
      .insert([{ ...templateData, user_id: userId }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  getTaskCategories: () => {
    return [
      { id: 'personal', name: 'Personal', color: '#3B82F6', icon: Home },
      { id: 'work', name: 'Work', color: '#10B981', icon: Briefcase },
      { id: 'study', name: 'Study', color: '#8B5CF6', icon: GraduationCap },
      { id: 'health', name: 'Health', color: '#F59E0B', icon: Heart },
      { id: 'finance', name: 'Finance', color: '#EF4444', icon: PiggyBank },
      { id: 'general', name: 'General', color: '#6B7280', icon: Settings },
    ];
  },

  getCategoryIcon: (category: string) => {
    const categories = taskService.getTaskCategories();
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : Settings;
  },

  getPriorityColor: (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    switch (priority) {
      case 'urgent': return '#F87171';
      case 'high': return '#FBBF24';
      case 'medium': return '#60A5FA';
      case 'low': return '#4ADE80';
      default: return '#9CA3AF';
    }
  },

  getCategoryColor: (category: string, categories: any[]) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : '#6B7280';
  }
};