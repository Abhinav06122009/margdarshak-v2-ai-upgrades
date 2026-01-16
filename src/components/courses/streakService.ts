// src/components/courses/streakService.ts
import { supabase } from '@/integrations/supabase/client';
import type { Course } from '@/components/dashboard/course';

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  insuranceAvailable: number;
  canUseInsurance: boolean;
}

// This is a mock service. In a real app, this would interact with a `study_sessions` table.
const streakService = {
  getStreakInfoForCourse: async (course: Course, userId: string): Promise<StreakInfo> => {
    // Simulate fetching streak data.
    // In a real app, you would query a `study_sessions` table for this course and user.
    
    // Let's generate some plausible mock data based on course properties.
    const hash = course.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const currentStreak = course.study_streak || (hash % 10) + 1; // Use real streak or mock one
    const longestStreak = currentStreak + (hash % 5);
    const insuranceAvailable = course.streak_insurance || Math.floor(longestStreak / 5); // 1 insurance per 5 days
    
    // Simulate a condition where insurance can be used (e.g., missed one day)
    const canUseInsurance = currentStreak < 3 && insuranceAvailable > 0;

    return {
      currentStreak,
      longestStreak,
      insuranceAvailable,
      canUseInsurance,
    };
  },

  useStreakInsurance: async (courseId: string, userId: string): Promise<{ success: boolean; message: string }> => {
    // In a real app, this would decrement insurance count and "fill in" a missed day.
    const { data, error } = await supabase.rpc('use_streak_insurance', {
      p_course_id: courseId,
      p_user_id: userId
    });

    if (error) {
      console.error('Error using streak insurance:', error);
      return { success: false, message: 'Could not use streak insurance.' };
    }

    console.log(`Used streak insurance for course ${courseId}`);
    return { success: true, message: 'Streak protected! Your consistency is safe for one day.' };
  },
};

export { streakService };