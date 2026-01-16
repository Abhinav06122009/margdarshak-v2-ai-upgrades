// src/components/progress/streakService.ts
import { supabase } from '@/integrations/supabase/client';
import type { Goal } from './ProgressTracker';

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  insuranceAvailable: number;
  canUseInsurance: boolean;
}

// This service simulates streak calculations based on progress entries.
const streakService = {
  getStreakInfoForGoal: async (goal: Goal, userId: string): Promise<StreakInfo> => {
    // In a real app, you would query a `progress_entries` table.
    // For now, we'll generate mock data based on goal properties.
    const hash = goal.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const currentStreak = goal.study_streak || (hash % 15) + 1;
    const longestStreak = currentStreak + (hash % 7);
    const insuranceAvailable = goal.streak_insurance || Math.floor(longestStreak / 7);
    
    // Simulate a condition where insurance can be used (e.g., missed one day)
    const canUseInsurance = currentStreak < 5 && insuranceAvailable > 0;

    return {
      currentStreak,
      longestStreak,
      insuranceAvailable,
      canUseInsurance,
    };
  },

  useStreakInsurance: async (goalId: string, userId: string): Promise<{ success: boolean; message: string }> => {
    // This is a mock function. In a real app, you would update the database.
    // For example, create a "protected" progress entry for a missed day.
    console.log(`Used streak insurance for goal ${goalId}`);
    return { 
      success: true, 
      message: 'Streak protected! Your consistency is safe for one day.' 
    };
  },
};

export { streakService };