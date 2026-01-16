// src/components/courses/recommendationService.ts
import type { Course } from '@/components/dashboard/course';
import type { Task } from '@/components/tasks/types';
import { supabase } from '@/integrations/supabase/client';

export interface RecommendedCourse extends Course {
  recommendationReason: string;
}

export interface LearningPath {
  title: string;
  description: string;
  steps: Course[];
}

export interface CuratedContent {
  title: string;
  url: string;
  type: 'video' | 'article' | 'tutorial';
}

// Mock AI/ML logic
const recommendationService = {
  getPersonalizedRecommendations: async (
    userId: string,
    existingCourses: Course[]
  ): Promise<RecommendedCourse[]> => {
    const existingCourseIds = new Set(existingCourses.map(c => c.id));
    
    // Fetch all courses from the database to act as the recommendation pool.
    const { data: allCoursesData, error } = await supabase
      .from('courses')
      .select('*');

    if (error) {
      console.error('Error fetching all courses for recommendations:', error);
      return [];
    }

    const allCourses: Course[] = allCoursesData || [];

    const recommendations: RecommendedCourse[] = [];

    // Suggest a more advanced course in the same category
    const lastCourse = existingCourses[existingCourses.length - 1];
    if (lastCourse && lastCourse.difficulty === 'beginner') {
      const nextLevelCourse = allCourses.find(c => !existingCourseIds.has(c.id) && c.difficulty === 'intermediate');
      if (nextLevelCourse) {
        recommendations.push({
          ...nextLevelCourse,
          recommendationReason: `Based on your completion of ${lastCourse.name}, this is a great next step.`
        });
      }
    }

    // Suggest a popular or foundational course if not already taken (example: Data Structures)
    const foundationalCourse = allCourses.find(c => c.code?.toUpperCase().includes('CS') && c.difficulty === 'intermediate' && !existingCourseIds.has(c.id));
    if (foundationalCourse) {
        recommendations.push({
            ...foundationalCourse,
            recommendationReason: 'This is a foundational course for many advanced topics.'
        });
    }

    // Add another general recommendation for a different category
     const anotherRec = allCourses.find(c => !c.code?.toUpperCase().includes('CS') && !existingCourseIds.has(c.id));
     if (anotherRec && recommendations.length < 2) {
         recommendations.push({
             ...anotherRec,
             recommendationReason: 'Cloud skills are in high demand across the industry.'
         });
     }

    // Fallback: suggest any course not already taken
    if (recommendations.length < 3) {
      const fallbacks = allCourses.filter(c => !existingCourseIds.has(c.id) && !recommendations.some(r => r.id === c.id));
      for (const fallback of fallbacks) {
        if (recommendations.length >= 3) break;
        recommendations.push({ ...fallback, recommendationReason: 'Broaden your skillset with this course.' });
      }
    }

    return recommendations.slice(0, 3); // Return top 3 recommendations
  },

  generateLearningPath: async (userId: string, goal: string): Promise<LearningPath> => {
    // In a real app, this would be a complex query or ML model call.
    // For now, we'll fetch some courses and arrange them by difficulty.
    const { data: allCourses, error } = await supabase.from('courses').select('*');
    if (error || !allCourses) return { title: 'Could not generate path', description: 'Error fetching courses.', steps: [] };

    const beginner = allCourses.find(c => c.difficulty === 'beginner');
    const intermediate = allCourses.find(c => c.difficulty === 'intermediate' && c.id !== beginner?.id);
    const advanced = allCourses.find(c => c.difficulty === 'advanced' && c.id !== beginner?.id && c.id !== intermediate?.id);
    
    const steps = [beginner, intermediate, advanced].filter((c): c is Course => !!c);

    return {
      title: 'Full-Stack Developer Learning Path',
      description: 'A recommended sequence of courses to achieve your goal.',
      steps: steps.length > 1 ? steps : [ // Provide a fallback if not enough courses are found
        { id: 'db-102', name: 'Database Design', code: 'DB102', difficulty: 'beginner', priority: 'medium', credits: 3, description: 'Understand relational database design.' },
        { id: 'ds-201', name: 'Data Structures & Algorithms', code: 'DS201', difficulty: 'intermediate', priority: 'high', credits: 4, description: 'Master core data structures.' },
        { id: 'web-301', name: 'Advanced Web Development', code: 'WEB301', difficulty: 'advanced', priority: 'high', credits: 4, description: 'Build complex web applications.' },
      ]
    };
  },

  getCuratedContent: async (course: Course): Promise<CuratedContent[]> => {
    // Mock fetching curated content from external APIs
    return [
      { title: `Crash Course: ${course.name}`, url: 'https://youtube.com', type: 'video' },
      { title: `In-depth article on ${course.code}`, url: 'https://medium.com', type: 'article' },
      { title: `Interactive tutorial for ${course.name}`, url: 'https://www.freecodecamp.org/', type: 'tutorial' },
    ];
  },

  getRelatedTasks: async (courseId: string): Promise<Task[]> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, status')
      .eq('course_id', courseId)
      .eq('is_deleted', false)
      .limit(5);

    if (error) {
      console.error('Error fetching related tasks:', error);
      return [];
    }
    return data || [];
  },
};

export { recommendationService };