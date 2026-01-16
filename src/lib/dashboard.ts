export interface DashboardProps {
  onNavigate: (page: string) => void;
}

export interface RealDashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalStudyTime: number;
  todayStudyTime: number;
  weeklyStudyTime: number;
  monthlyStudyTime: number;
  averageGrade: number;
  totalGrades: number;
  upcomingClasses: number;
  totalNotes: number;
  favoritedNotes: number;
  totalCourses: number;
  activeCourses: number;
  completionRate: number;
  highPriorityTasks: number;
  completedToday: number;
  averageSessionLength: number;
  bestPerformingSubject: string;
  worstPerformingSubject: string;
  totalStudySessions: number;
  productivityScore: number;
  studyStreak: number;
  incompleteTasksCount: number;
  topGradePercentage: number;
  totalClassesCount: number;
}

export interface RealTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  course_id?: string;
  courses?: {
    name: string;
    code?: string;
    color?: string;
  };
}

export interface RealStudySession {
  id: string;
  subject: string;
  duration: number;
  start_time: string;
  end_time?: string;
  session_type?: 'study' | 'review' | 'practice' | 'exam';
  notes?: string;
  user_id: string;
  course_id?: string;
  created_at: string;
}

export interface RealGrade {
  id: string;
  subject: string;
  assignment_name: string;
  grade?: number;
  total_points?: number;
  percentage: number;
  date_recorded: string;
  user_id: string;
  course_id?: string;
  assignment_type?: string;
  created_at: string;
}

export interface RealNote {
  id: string;
  title: string;
  content?: string;
  folder?: string;
  is_favorite: boolean;
  created_at: string;
  updated_at?: string;
  user_id: string;
  course_id?: string;
  tags?: string[];
}

export interface RealCourse {
  id: string;
  name: string;
  code?: string;
  description?: string;
  grade_level?: string;
  semester?: string;
  instructor?: string;
  credits?: number;
  color?: string;
  user_id: string;
  is_active: boolean;
  created_at: string;
}

export interface RealTimetableEntry {
  id: string;
  class_name?: string;
  title?: string;
  subject?: string;
  day?: number;
  day_of_week?: number;
  start_time: string;
  end_time: string;
  location?: string;
  instructor?: string;
  course_id?: string;
  user_id: string;
  created_at: string;
  courses?: {
    name: string;
    code?: string;
    color?: string;
  };
}

export interface SecureUser {
  id: string;
  email: string;
  profile?: {
    full_name: string;
    user_type: string;
    student_id?: string;
  };
}

export interface RealAnalytics {
  dailyStudyTime: { date: string; minutes: number; sessions: number }[];
  subjectBreakdown: { subject: string; minutes: number; percentage: number; sessions: number }[];
  weeklyProgress: { week: string; studyTime: number; tasksCompleted: number; averageGrade: number }[];
  monthlyTrends: { month: string; studyTime: number; productivity: number }[];
  gradeDistribution: { grade: string; count: number; percentage: number }[];
  sessionTypes: { type: string; count: number; totalMinutes: number }[];
  incompleteTasksCount: number;
  topGrades: { subject: string; percentage: number; assignment_name: string }[];
  totalClasses: number;
}