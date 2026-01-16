import { supabase } from '@/integrations/supabase/client';
import type {
  SecureUser,
  RealTask,
  RealStudySession,
  RealGrade,
  RealNote,
  RealCourse,
  RealTimetableEntry,
  RealDashboardStats,
  RealAnalytics,
} from '@/types/dashboard';

export const dashboardService = {
  getCurrentUser: async (): Promise<SecureUser | null> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, user_type, student_id')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email || '',
        profile: profile ? {
          full_name: profile.full_name || 'User',
          user_type: profile.user_type || 'student',
          student_id: profile.student_id
        } : undefined
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  fetchAllUserData: async (userId: string) => {
    console.log('Fetching data for user:', userId);
    
    try {
      // Fixed queries with proper error handling
      const [
        tasksResult,
        studySessionsResult,
        gradesResult,
        notesResult,
        coursesResult,
        timetableResult
      ] = await Promise.allSettled([
        // Simple tasks query
        supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),

        // Study sessions query
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('start_time', { ascending: false }),

        // Grades query
        supabase
          .from('grades')
          .select('*')
          .eq('user_id', userId)
          .order('date_recorded', { ascending: false }),

        // Notes query
        supabase
          .from('notes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),

        // Courses query
        supabase
          .from('courses')
          .select('*')
          .eq('user_id', userId)
          .order('name'),

        // Fixed timetable query - try multiple possible table structures
        dashboardService.fetchTimetableData(userId)
      ]);

      // Log results for debugging
      console.log('Tasks result:', tasksResult);
      console.log('Study sessions result:', studySessionsResult);
      console.log('Grades result:', gradesResult);
      console.log('Notes result:', notesResult);
      console.log('Courses result:', coursesResult);
      console.log('Timetable result:', timetableResult);

      return {
        tasks: tasksResult.status === 'fulfilled' ? (tasksResult.value.data || []) : [],
        studySessions: studySessionsResult.status === 'fulfilled' ? (studySessionsResult.value.data || []) : [],
        grades: gradesResult.status === 'fulfilled' ? (gradesResult.value.data || []) : [],
        notes: notesResult.status === 'fulfilled' ? (notesResult.value.data || []) : [],
        courses: coursesResult.status === 'fulfilled' ? (coursesResult.value.data || []) : [],
        timetable: timetableResult.status === 'fulfilled' ? (timetableResult.value.data || []) : [],
        errors: [
          tasksResult.status === 'rejected' ? tasksResult.reason : null,
          studySessionsResult.status === 'rejected' ? studySessionsResult.reason : null,
          gradesResult.status === 'rejected' ? gradesResult.reason : null,
          notesResult.status === 'rejected' ? notesResult.reason : null,
          coursesResult.status === 'rejected' ? coursesResult.reason : null,
          timetableResult.status === 'rejected' ? timetableResult.reason : null
        ].filter(Boolean)
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return {
        tasks: [],
        studySessions: [],
        grades: [],
        notes: [],
        courses: [],
        timetable: [],
        errors: [error]
      };
    }
  },

  // New helper function to handle different timetable structures
  fetchTimetableData: async (userId: string) => {
    try {
      // Try the original structure first
      const { data, error } = await supabase
        .from('user_timetables')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.warn('user_timetables error:', error);
        // If user_timetables fails, try 'timetables' or return empty
        try {
          const fallback = await supabase
            .from('timetables')
            .select('*')
            .eq('user_id', userId);
          
          return fallback;
        } catch (fallbackError) {
          console.warn('timetables fallback failed:', fallbackError);
          return { data: [], error: null };
        }
      }

      return { data, error };
    } catch (error) {
      console.error('Error in fetchTimetableData:', error);
      return { data: [], error };
    }
  },

  calculateSecureStats: (data: { tasks: RealTask[], studySessions: RealStudySession[], grades: RealGrade[], notes: RealNote[], courses: RealCourse[], timetable: RealTimetableEntry[] }): RealDashboardStats => {
    const { tasks, studySessions, grades, notes, courses, timetable } = data;
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Task statistics with safe defaults
    const totalTasks = Array.isArray(tasks) ? tasks.length : 0;
    const completedTasks = Array.isArray(tasks) ? tasks.filter((t: RealTask) => t.status === 'completed').length : 0;
    const pendingTasks = Array.isArray(tasks) ? tasks.filter((t: RealTask) => t.status === 'pending').length : 0;
    const inProgressTasks = Array.isArray(tasks) ? tasks.filter((t: RealTask) => t.status === 'in_progress').length : 0;
    const overdueTasks = Array.isArray(tasks) ? tasks.filter((t: RealTask) => 
      t.due_date && new Date(t.due_date) < now && t.status !== 'completed'
    ).length : 0;
    const highPriorityTasks = Array.isArray(tasks) ? tasks.filter((t: RealTask) => 
      t.priority === 'high' && t.status !== 'completed'
    ).length : 0;
    const completedToday = Array.isArray(tasks) ? tasks.filter((t: RealTask) => 
      t.status === 'completed' && 
      t.updated_at && 
      new Date(t.updated_at).toISOString().split('T')[0] === today
    ).length : 0;
    const incompleteTasksCount = Array.isArray(tasks) ? tasks.filter((t: RealTask) => t.status !== 'completed').length : 0;

    // Study time calculations with safe defaults
    const totalStudyTime = Array.isArray(studySessions) ? 
      studySessions.reduce((sum: number, s: RealStudySession) => sum + (s.duration || 0), 0) : 0;
    const todayStudyTime = Array.isArray(studySessions) ? 
      studySessions
        .filter((s: RealStudySession) => s.start_time && s.start_time.split('T')[0] === today)
        .reduce((sum: number, s: RealStudySession) => sum + (s.duration || 0), 0) : 0;
    const weeklyStudyTime = Array.isArray(studySessions) ?
      studySessions
        .filter((s: RealStudySession) => s.start_time && new Date(s.start_time) >= weekAgo)
        .reduce((sum: number, s: RealStudySession) => sum + (s.duration || 0), 0) : 0;
    const monthlyStudyTime = Array.isArray(studySessions) ?
      studySessions
        .filter((s: RealStudySession) => s.start_time && new Date(s.start_time) >= monthAgo)
        .reduce((sum: number, s: RealStudySession) => sum + (s.duration || 0), 0) : 0;

    const totalStudySessions = Array.isArray(studySessions) ? studySessions.length : 0;
    const averageSessionLength = totalStudySessions > 0 ? totalStudyTime / totalStudySessions : 0;

    // Study streak calculation
    let studyStreak = 0;
    if (Array.isArray(studySessions)) {
      let currentDate = new Date(now);
      currentDate.setHours(0, 0, 0, 0);
      
      const studyDates = new Set(
        studySessions
          .filter((s: RealStudySession) => s.start_time)
          .map((s: RealStudySession) => s.start_time.split('T')[0])
      );

      // Check consecutive days backwards from today
      for (let i = 0; i < 365; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (studyDates.has(dateStr)) {
          studyStreak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (dateStr === today) {
          // Skip today if no study session yet, continue checking yesterday
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Grade calculations with safe defaults
    const totalGrades = Array.isArray(grades) ? grades.length : 0;
    const averageGrade = totalGrades > 0 && Array.isArray(grades) 
      ? grades.reduce((sum: number, g: RealGrade) => sum + (g.percentage || 0), 0) / totalGrades 
      : 0;

    // Top grade calculation
    const topGradePercentage = totalGrades > 0 && Array.isArray(grades)
      ? Math.max(...grades.map((g: RealGrade) => g.percentage || 0))
      : 0;

    // Subject performance analysis with safe defaults, ensuring acc is an object
    const subjectPerformance = Array.isArray(grades) ? grades.reduce((acc: Record<string, { total: number, count: number }>, grade: RealGrade) => {
      const subject = grade.subject || 'General';
      if (!acc[subject]) {
        acc[subject] = { total: 0, count: 0 };
      }
      acc[subject].total += grade.percentage || 0;
      acc[subject].count += 1;
      return acc;
    }, {}) : {};

    const subjectAverages = Object.keys(subjectPerformance).length > 0 ? Object.keys(subjectPerformance).map(subject => ({
      subject,
      average: subjectPerformance[subject].total / subjectPerformance[subject].count
    })) : [];

    const bestPerformingSubject = subjectAverages.length > 0
      ? subjectAverages.reduce((best, current) => current.average > best.average ? current : best).subject
      : 'None';

    const worstPerformingSubject = subjectAverages.length > 0 && subjectAverages.length > 1
      ? subjectAverages.reduce((worst, current) => current.average < worst.average ? current : worst).subject
      : 'None';

    // Course statistics with safe defaults
    const totalCourses = Array.isArray(courses) ? courses.length : 0;
    const activeCourses = Array.isArray(courses) ? courses.filter((c: RealCourse) => c.is_active).length : 0;

    // Timetable statistics with safe defaults and flexible field handling
    const totalClassesCount = Array.isArray(timetable) ? timetable.length : 0;
    const upcomingClasses = Array.isArray(timetable) ? timetable.filter((entry: RealTimetableEntry) => {
      const today = new Date();
      const currentDay = today.getDay();
      const currentTime = today.getHours() * 60 + today.getMinutes();
      
      if (!entry.start_time) return false;
      
      try {
        const [hours, minutes] = entry.start_time.split(':').map(Number);
        const entryTime = hours * 60 + minutes;
        
        // Handle both 'day' and 'day_of_week' fields
        const dayField = entry.day_of_week !== undefined ? entry.day_of_week : entry.day;
        if (dayField === undefined) return false;
        
        return (dayField === currentDay && entryTime > currentTime) || 
               (dayField > currentDay);
      } catch (error) {
        console.error('Error parsing time:', error);
        return false;
      }
    }).length : 0;

    // Completion rate
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Productivity score with fallback calculation
    const onTimeCompletionRate = completedTasks > 0 && Array.isArray(tasks)
      ? tasks.filter((t: RealTask) => 
          t.status === 'completed' && 
          t.due_date && 
          t.updated_at && 
          new Date(t.updated_at) <= new Date(t.due_date)
        ).length / completedTasks * 100 
      : 0;

    const studyConsistency = Math.min(studyStreak * 10, 100); // Max 100 for 10+ day streak
    const productivityScore = Math.round(
      (completionRate * 0.4 + onTimeCompletionRate * 0.3 + studyConsistency * 0.3)
    );

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      totalStudyTime,
      todayStudyTime,
      weeklyStudyTime,
      monthlyStudyTime,
      averageGrade: Math.round(averageGrade * 10) / 10,
      totalGrades,
      upcomingClasses,
      totalNotes: Array.isArray(notes) ? notes.length : 0,
      favoritedNotes: Array.isArray(notes) ? notes.filter((n: RealNote) => n.is_favorite).length : 0,
      totalCourses,
      activeCourses,
      completionRate: Math.round(completionRate * 10) / 10,
      studyStreak,
      highPriorityTasks,
      completedToday,
      averageSessionLength: Math.round(averageSessionLength),
      bestPerformingSubject,
      worstPerformingSubject,
      totalStudySessions,
      productivityScore: Math.max(0, Math.min(100, productivityScore)),
      incompleteTasksCount,
      topGradePercentage,
      totalClassesCount
    };
  },

  calculateSecureAnalytics: async (userId: string): Promise<RealAnalytics> => {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const [sessionsResult, gradesResult, tasksResult, timetableResult] = await Promise.allSettled([
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', userId)
          .gte('start_time', thirtyDaysAgo.toISOString())
          .order('start_time', { ascending: false }),

        supabase
          .from('grades')
          .select('*')
          .eq('user_id', userId)
          .order('date_recorded', { ascending: false }),

        supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId),

        dashboardService.fetchTimetableData(userId)
      ]);

      const sessions = sessionsResult.status === 'fulfilled' ? (sessionsResult.value.data || []) : [];
      const grades = gradesResult.status === 'fulfilled' ? (gradesResult.value.data || []) : [];
      const tasks = tasksResult.status === 'fulfilled' ? (tasksResult.value.data || []) : [];
      const timetable = timetableResult.status === 'fulfilled' ? (timetableResult.value.data || []) : [];

      // Safe analytics calculations
      const dailyData = Array.isArray(sessions) ? sessions.reduce((acc: Record<string, { minutes: number, sessions: number }>, session: RealStudySession) => {
        if (!session.start_time) return acc;
        const date = new Date(session.start_time).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { minutes: 0, sessions: 0 };
        }
        acc[date].minutes += session.duration || 0;
        acc[date].sessions += 1;
        return acc;
      }, {}) : {};

      const dailyStudyTime = Object.keys(dailyData)
        .sort()
        .slice(-30)
        .map(date => ({
          date,
          minutes: dailyData[date].minutes,
          sessions: dailyData[date].sessions
        }));

      // Subject breakdown with safety
      const subjectData = Array.isArray(sessions) ? sessions.reduce((acc: Record<string, { minutes: number, sessions: number }>, session: RealStudySession) => {
        const subject = session.subject || 'General';
        if (!acc[subject]) {
          acc[subject] = { minutes: 0, sessions: 0 };
        }
        acc[subject].minutes += session.duration || 0;
        acc[subject].sessions += 1;
        return acc;
      }, {}) : {};

      const totalMinutes = Object.values(subjectData).reduce((sum: number, data: { minutes: number, sessions: number }) => sum + data.minutes, 0);
      const subjectBreakdown = Object.keys(subjectData).map(subject => ({
        subject,
        minutes: subjectData[subject].minutes,
        sessions: subjectData[subject].sessions,
        percentage: totalMinutes > 0 ? (subjectData[subject].minutes / totalMinutes) * 100 : 0
      }));

      // Session types with safety
      const sessionTypeData = Array.isArray(sessions) ? sessions.reduce((acc: Record<string, { count: number, totalMinutes: number }>, session: RealStudySession) => {
        const type = session.session_type || 'study';
        if (!acc[type]) {
          acc[type] = { count: 0, totalMinutes: 0 };
        }
        acc[type].count += 1;
        acc[type].totalMinutes += session.duration || 0;
        return acc;
      }, {}) : {};

      const sessionTypes = Object.keys(sessionTypeData).map(type => ({
        type,
        count: sessionTypeData[type].count,
        totalMinutes: sessionTypeData[type].totalMinutes
      }));

      // Grade distribution with safety
      const gradeRanges = {
        'A (90-100%)': Array.isArray(grades) ? grades.filter((g: RealGrade) => (g.percentage || 0) >= 90).length : 0,
        'B (80-89%)': Array.isArray(grades) ? grades.filter((g: RealGrade) => (g.percentage || 0) >= 80 && (g.percentage || 0) < 90).length : 0,
        'C (70-79%)': Array.isArray(grades) ? grades.filter((g: RealGrade) => (g.percentage || 0) >= 70 && (g.percentage || 0) < 80).length : 0,
        'D (60-69%)': Array.isArray(grades) ? grades.filter((g: RealGrade) => (g.percentage || 0) >= 60 && (g.percentage || 0) < 70).length : 0,
        'F (Below 60%)': Array.isArray(grades) ? grades.filter((g: RealGrade) => (g.percentage || 0) < 60).length : 0
      };

      const totalGradesCount = Array.isArray(grades) ? grades.length : 0;
      const gradeDistribution = Object.keys(gradeRanges).map(grade => ({
        grade,
        count: gradeRanges[grade as keyof typeof gradeRanges],
        percentage: totalGradesCount > 0 ? (gradeRanges[grade as keyof typeof gradeRanges] / totalGradesCount) * 100 : 0
      }));

      // Top grades with safety
      const topGrades = Array.isArray(grades) 
        ? grades
            .sort((a: RealGrade, b: RealGrade) => (b.percentage || 0) - (a.percentage || 0))
            .slice(0, 3)
            .map((grade: RealGrade) => ({
              subject: grade.subject || 'Unknown',
              percentage: grade.percentage || 0,
              assignment_name: grade.assignment_name || 'Unknown'
            }))
        : [];

      return {
        dailyStudyTime,
        subjectBreakdown,
        weeklyProgress: [],
        monthlyTrends: [],
        gradeDistribution,
        sessionTypes,
        incompleteTasksCount: Array.isArray(tasks) ? tasks.filter((t: RealTask) => t.status !== 'completed').length : 0,
        topGrades,
        totalClasses: Array.isArray(timetable) ? timetable.length : 0
      };
    } catch (error) {
      console.error('Error calculating secure analytics:', error);
      return {
        dailyStudyTime: [],
        subjectBreakdown: [],
        weeklyProgress: [],
        monthlyTrends: [],
        gradeDistribution: [],
        sessionTypes: [],
        incompleteTasksCount: 0,
        topGrades: [],
        totalClasses: 0
      };
    }
  },

  setupSecureRealTimeSubscription: (userId: string, callbacks: any) => {
    const channels = [
      supabase
        .channel('secure_tasks_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${userId}`
          },
          callbacks.onTaskUpdate
        )
        .subscribe(),

      supabase
        .channel('secure_sessions_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'study_sessions',
            filter: `user_id=eq.${userId}`
          },
          callbacks.onSessionUpdate
        )
        .subscribe(),

      supabase
        .channel('secure_grades_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'grades',
            filter: `user_id=eq.${userId}`
          },
          callbacks.onGradeUpdate
        )
        .subscribe(),

      supabase
        .channel('secure_notes_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notes',
            filter: `user_id=eq.${userId}`
          },
          callbacks.onNoteUpdate
        )
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  },

  // Secure task operations with proper error handling
  updateTaskStatus: async (taskId: string, status: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  },

  deleteTask: async (taskId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  createQuickTask: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: 'New Task',
          description: 'Add description here',
          status: 'pending',
          priority: 'medium',
          user_id: userId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating quick task:', error);
      throw error;
    }
  },

  bulkUpdateTasks: async (taskIds: string[], updates: any, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .in('id', taskIds)
        .eq('user_id', userId)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in bulk update:', error);
      throw error;
    }
  },

  exportToCSV: (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).filter(key => 
      typeof data[0][key] !== 'object' || data[0][key] === null
    );
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + data.map(row => 
          headers.map(header => {
            const value = row[header];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          }).join(",")
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportToJSON: (data: any, filename: string) => {
    const jsonContent = "data:text/json;charset=utf-8," + JSON.stringify(data, null, 2);
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(jsonContent));
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};