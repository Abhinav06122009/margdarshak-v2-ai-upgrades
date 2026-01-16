
export interface Grade {
  id: string;
  subject: string;
  assignment_name: string;
  grade: number;
  total_points: number;
  date_recorded: string;
  semester?: string;
  grade_type: string;
  academic_year?: string;
  weight?: number;
  notes?: string;
  is_extra_credit?: boolean;
  user_id: string;
  created_at: string;
}

export interface GradeFormData {
  subject: string;
  assignment_name: string;
  grade: number;
  total_points: number;
  date_recorded: string;
  semester?: string;
  grade_type: string;
  academic_year?: string;
  weight?: number;
  notes?: string;
  is_extra_credit?: boolean;
}

export interface GradeStats {
  total_grades: number;
  average_grade: number;
  highest_grade: number;
  lowest_grade: number;
  grade_distribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
  subjects: string[];
  semesters: string[];
}

export interface SecureUser {
  id: string;
  email?: string;
  profile?: {
    full_name?: string;
    user_type?: string;
    student_id?: string;
  };
}
