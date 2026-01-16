
import type { Grade } from './types';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const achievements: Achievement[] = [
  {
    id: 'subject_mastery',
    name: 'Subject Mastery',
    description: 'Get an A (>=90%) in 5 assignments for the same subject.',
    icon: '🎓',
    unlocked: false,
  },
  {
    id: 'top_of_the_class',
    name: 'Top of the Class',
    description: 'Get a 100% grade in any assignment.',
    icon: '👑',
    unlocked: false,
  },
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Improve average grade by 10% over the last 5 assignments.',
    icon: '🚀',
    unlocked: false,
  },
  {
    id: 'improvement_streak',
    name: 'Improvement Streak',
    description: 'Get 3 consecutive grades higher than the previous one.',
    icon: '🔥',
    unlocked: false,
  },
];

export const achievementService = {
  getAchievements(): Achievement[] {
    return JSON.parse(JSON.stringify(achievements)); // Return a copy
  },

  checkAchievements(grades: Grade[]): { unlocked: Achievement[], all: Achievement[] } {
    const updatedAchievements = this.getAchievements();
    const unlocked: Achievement[] = [];

    if (grades.length === 0) {
      return { unlocked: [], all: updatedAchievements };
    }

    // Top of the Class
    const topOfTheClass = updatedAchievements.find(a => a.id === 'top_of_the_class');
    if (topOfTheClass && !topOfTheClass.unlocked) {
      if (grades.some(g => (g.grade / g.total_points) * 100 === 100)) {
        topOfTheClass.unlocked = true;
        unlocked.push(topOfTheClass);
      }
    }

    // Subject Mastery
    const subjectMastery = updatedAchievements.find(a => a.id === 'subject_mastery');
    if (subjectMastery && !subjectMastery.unlocked) {
      const subjects = [...new Set(grades.map(g => g.subject))];
      for (const subject of subjects) {
        const subjectGrades = grades.filter(g => g.subject === subject);
        const aGrades = subjectGrades.filter(g => (g.grade / g.total_points) * 100 >= 90);
        if (aGrades.length >= 5) {
          subjectMastery.unlocked = true;
          unlocked.push(subjectMastery);
          break;
        }
      }
    }

    // Improvement Streak
    const improvementStreak = updatedAchievements.find(a => a.id === 'improvement_streak');
    if (improvementStreak && !improvementStreak.unlocked && grades.length >= 3) {
        for (let i = 2; i < grades.length; i++) {
            const grade1 = (grades[i-2].grade / grades[i-2].total_points) * 100;
            const grade2 = (grades[i-1].grade / grades[i-1].total_points) * 100;
            const grade3 = (grades[i].grade / grades[i].total_points) * 100;
            if (grade3 > grade2 && grade2 > grade1) {
                improvementStreak.unlocked = true;
                unlocked.push(improvementStreak);
                break;
            }
        }
    }

    // Comeback Kid
    const comebackKid = updatedAchievements.find(a => a.id === 'comeback_kid');
    if (comebackKid && !comebackKid.unlocked && grades.length >= 10) {
        const last5 = grades.slice(0, 5).map(g => (g.grade / g.total_points) * 100);
        const previous5 = grades.slice(5, 10).map(g => (g.grade / g.total_points) * 100);
        const avgLast5 = last5.reduce((a, b) => a + b, 0) / last5.length;
        const avgPrevious5 = previous5.reduce((a, b) => a + b, 0) / previous5.length;
        if (avgLast5 > avgPrevious5 * 1.1) {
            comebackKid.unlocked = true;
            unlocked.push(comebackKid);
        }
    }

    return { unlocked, all: updatedAchievements };
  },
};
