// src/lib/course.ts

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  teacher_id?: string;
  user_id: string;
  grade_level?: string;
  semester?: string;
  academic_year?: string;
  credits?: number;
  color?: string;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'active' | 'completed' | 'archived' | 'planning';
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface CourseFormData {
  name: string;
  code: string;
  description: string;
  grade_level: string;
  semester: string;
  academic_year: string;
  credits: number;
  color: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface SecureUser {
  id: string;
  email: string;
  profile?: {
    full_name: string;
    user_type: string;
    department?: string;
    academic_year?: string;
    // --- ADDED THESE FIELDS ---
    role?: string; 
    subscription_tier?: 'free' | 'premium' | 'premium_elite';
  };
}

export interface CourseStats {
  total_courses: number;
  active_courses: number;
  completed_courses: number;
  total_credits: number;
  categories: Record<string, number>;
  difficulty_distribution: Record<string, number>;
}