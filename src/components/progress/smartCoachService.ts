import type { Goal, ProgressStats } from './ProgressTracker';

export interface GoalRecommendation {
  title: string;
  category: string;
  description: string;
  reason: string;
}

export interface GoalAdjustment {
  goal: Goal;
  suggestion: string;
  new_target_value: number;
}

export interface MotivationalTip {
  tip: string;
  category: 'consistency' | 'mindset' | 'planning';
}

const smartCoachService = {
  getPersonalizedRecommendations: async (goals: Goal[], stats: ProgressStats): Promise<GoalRecommendation[]> => {
    const recommendations: GoalRecommendation[] = [];
    const existingCategories = new Set(goals.map(g => g.category.toLowerCase()));

    if (stats.totalGoals > 2 && existingCategories.size < 3) {
      if (!existingCategories.has('fitness')) {
        recommendations.push({
          title: 'Start a Fitness Routine',
          category: 'Fitness',
          description: 'Track weekly workouts or daily steps.',
          reason: 'Balancing academic goals with physical activity can boost focus and reduce stress.'
        });
      }
    }

    const recentlyCompleted = goals.find(g => g.status === 'completed' && g.updated_at && (new Date().getTime() - new Date(g.updated_at).getTime()) < 7 * 24 * 60 * 60 * 1000);
    if (recentlyCompleted) {
      recommendations.push({
        title: `Advanced ${recentlyCompleted.title}`,
        category: recentlyCompleted.category,
        description: `Set a new, more challenging target for ${recentlyCompleted.unit}.`,
        reason: `You've mastered '${recentlyCompleted.title}'. Time for the next level!`
      });
    }

    return recommendations.slice(0, 2);
  },

  getSmartAdjustments: async (goals: Goal[]): Promise<GoalAdjustment[]> => {
    const adjustments: GoalAdjustment[] = [];
    const fastGoal = goals.find(g => {
      const progress = (g.current_value / g.target_value) * 100;
      const timeElapsed = (new Date().getTime() - new Date(g.start_date).getTime());
      const totalTime = (new Date(g.target_date).getTime() - new Date(g.start_date).getTime());
      const timeProgress = totalTime > 0 ? (timeElapsed / totalTime) * 100 : 0;
      return g.status === 'active' && progress > timeProgress + 50;
    });

    if (fastGoal) {
      const newTarget = Math.ceil(fastGoal.target_value * 1.25);
      adjustments.push({
        goal: fastGoal,
        suggestion: `You're crushing "${fastGoal.title}"! Consider increasing your target to ${newTarget} ${fastGoal.unit} to keep challenging yourself.`,
        new_target_value: newTarget,
      });
    }
    return adjustments.slice(0, 1);
  },

  getMotivationalTip: async (stats: ProgressStats): Promise<MotivationalTip> => {
    if (stats.streakDays > 3) {
      return { tip: `You're on a ${stats.streakDays}-day streak! Keep the momentum going. Consistency is key.`, category: 'consistency' };
    }
    return { tip: "Every small step is progress. Celebrate the small wins along the way!", category: 'mindset' };
  }
};

export { smartCoachService };