// src/components/tasks/types.ts
import type { Course } from '@/components/dashboard/course';
export type { Course };

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'review';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  due_date?: string;
  tags?: string[];
  progress_percentage?: number;
  created_at: string;
  is_deleted: boolean;
  deleted_at?: string;
  time_spent: number; // in seconds
  timer_active: boolean;
  timer_start: string | null;
  estimated_time: number | null; // in minutes
  is_favorited: boolean;
  parent_task_id: string | null;
  depends_on: string[] | null; // Array of task IDs this task depends on
  course_id?: string | null;
  subtasks?: Task[]; // Client-side computed property
}

export interface TaskFormData {
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'review';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  due_date?: string | null;
  tags?: string[];
  progress_percentage?: number;
  estimated_time?: number | null;
  // Timer fields are managed by the system, not directly in the form, but needed for updates
  time_spent?: number;
  timer_active?: boolean;
  timer_start?: string | null;
  is_favorited?: boolean;
  parent_task_id?: string | null;
  depends_on?: string[] | null;
  course_id?: string | null;
}

export interface TaskStats {
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  review_tasks: number;
}

export interface SecureUser {
  id: string;
  email: string;
  profile?: {
    full_name: string;
    role: string;
    student_id?: string;
  };
}
