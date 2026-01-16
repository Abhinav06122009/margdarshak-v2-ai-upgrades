// src/lib/courseService.ts
import { supabase } from '@/integrations/supabase/client';
import type { Course, CourseFormData, SecureUser, CourseStats } from './course';

export const courseService = {
  getCurrentUser: async (): Promise<SecureUser | null> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email || '',
        profile: profile ? {
          full_name: profile.full_name || 'User',
          user_type: profile.user_type || 'student',
          department: profile.department,
          academic_year: profile.academic_year || '2024-25'
        } : undefined
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  fetchUserCourses: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user courses:', error);
      return [];
    }
  },

  getCourseStatistics: async (userId: string): Promise<CourseStats | null> => {
    try {
      const courses = await courseService.fetchUserCourses(userId);
      
      const stats: CourseStats = {
        total_courses: courses.length,
        active_courses: courses.filter(c => c.status === 'active').length,
        completed_courses: courses.filter(c => c.status === 'completed').length,
        total_credits: courses.reduce((sum, course) => sum + (course.credits || 0), 0),
        categories: courses.reduce((acc, course) => {
          const type = courseService.getCourseType(course);
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        difficulty_distribution: courses.reduce((acc, course) => {
          const difficulty = course.difficulty || 'intermediate';
          acc[difficulty] = (acc[difficulty] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      return stats;
    } catch (error) {
      console.error('Error fetching course statistics:', error);
      return null;
    }
  },

  createCourse: async (courseData: CourseFormData, userId: string) => {
    const { data, error } = await supabase
      .from('courses')
      .insert([{ ...courseData, user_id: userId, teacher_id: userId, is_active: true }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateCourse: async (courseId: string, courseData: Partial<CourseFormData>, userId: string) => {
    const { data, error } = await supabase
      .from('courses')
      .update({ ...courseData, updated_at: new Date().toISOString() })
      .eq('id', courseId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteCourse: async (courseId: string, userId: string) => {
    const { error } = await supabase.from('courses').delete().eq('id', courseId).eq('user_id', userId);
    if (error) throw error;
    return true;
  },

  searchUserCourses: async (userId: string, searchTerm?: string, gradeFilter?: string, difficultyFilter?: string) => {
    let query = supabase.from('courses').select('*').eq('user_id', userId).eq('is_active', true);
    if (searchTerm) query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    if (gradeFilter && gradeFilter !== 'all') query = query.eq('grade_level', gradeFilter);
    if (difficultyFilter && difficultyFilter !== 'all') query = query.eq('difficulty', difficultyFilter);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getCourseCategories: () => [
    { id: 'science', name: 'Science', color: '#10B981', icon: '🔬' },
    { id: 'mathematics', name: 'Mathematics', color: '#3B82F6', icon: '📊' },
    { id: 'humanities', name: 'Humanities', color: '#8B5CF6', icon: '📚' },
    { id: 'arts', name: 'Arts', color: '#EC4899', icon: '🎨' },
    { id: 'technical', name: 'Technical', color: '#EF4444', icon: '💻' },
    { id: 'language', name: 'Language', color: '#F59E0B', icon: '🗣️' },
    { id: 'social', name: 'Social Studies', color: '#14B8A6', icon: '🌍' },
    { id: 'physical', name: 'Physical Ed', color: '#6B7280', icon: '⚽' },
  ],

  getCourseType: (course: Pick<Course, 'name' | 'code'>) => {
    const name = course.name.toLowerCase();
    const code = course.code.toLowerCase();
    if (name.includes('math') || code.includes('math')) return 'mathematics';
    if (name.includes('science') || name.includes('physics') || name.includes('chemistry') || name.includes('biology')) return 'science';
    if (name.includes('art') || name.includes('design') || name.includes('music')) return 'arts';
    if (name.includes('computer') || name.includes('programming') || name.includes('tech')) return 'technical';
    if (name.includes('english') || name.includes('language') || name.includes('writing')) return 'language';
    if (name.includes('history') || name.includes('literature') || name.includes('philosophy')) return 'humanities';
    if (name.includes('geography') || name.includes('social') || name.includes('economics')) return 'social';
    if (name.includes('physical') || name.includes('sports') || name.includes('gym')) return 'physical';
    return 'humanities';
  },

  getCourseBackgroundColor: (course: Partial<Course>) => {
    if (course.color) return course.color;
    const categories = courseService.getCourseCategories();
    const courseType = courseService.getCourseType(course as Course);
    const category = categories.find(c => c.id === courseType);
    return category?.color || '#3B82F6';
  },

  getPriorityColorIntensity: (priority: string = 'medium') => {
    const intensities: Record<string, string> = { 'low': '70', 'medium': '85', 'high': '90', 'urgent': '95' };
    return intensities[priority] || '85';
  },

  getDifficultyColor: (difficulty?: string) => {
    const colors: Record<string, string> = { 'beginner': '#10B981', 'intermediate': '#3B82F6', 'advanced': '#F59E0B', 'expert': '#EF4444' };
    return colors[difficulty || 'intermediate'];
  },

  getCompleteCourseStyle: (course: Partial<Course>) => {
    const backgroundColor = courseService.getCourseBackgroundColor(course);
    const priorityIntensity = courseService.getPriorityColorIntensity(course.priority);
    const difficultyColor = courseService.getDifficultyColor(course.difficulty);
    return {
      backgroundColor: backgroundColor,
      opacity: parseInt(priorityIntensity) / 100,
      borderLeft: `4px solid ${backgroundColor}`,
      borderTop: `2px solid ${difficultyColor}`,
      boxShadow: course.priority === 'urgent' ? `0 0 12px ${backgroundColor}80, 0 4px 8px rgba(0,0,0,0.2)` : '0 2px 4px rgba(0,0,0,0.1)',
      color: 'white',
      padding: '8px',
      borderRadius: '6px',
      margin: '2px 0',
      transition: 'all 0.2s ease'
    };
  }
};