export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          author_id: string | null
          content: string
          course_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_urgent: boolean | null
          target_audience: string | null
          title: string
        }
        Insert: {
          author_id?: string | null
          content: string
          course_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_urgent?: boolean | null
          target_audience?: string | null
          title: string
        }
        Update: {
          author_id?: string | null
          content?: string
          course_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_urgent?: boolean | null
          target_audience?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          assignment_type: string | null
          course_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          max_points: number | null
          title: string
        }
        Insert: {
          assignment_type?: string | null
          course_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          max_points?: number | null
          title: string
        }
        Update: {
          assignment_type?: string | null
          course_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          max_points?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          course_id: string | null
          created_at: string | null
          date: string
          id: string
          notes: string | null
          status: string
          student_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          status: string
          student_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          status?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          academic_year: string | null
          code: string
          created_at: string | null
          description: string | null
          grade_level: string | null
          id: string
          name: string
          semester: string | null
          teacher_id: string | null
        }
        Insert: {
          academic_year?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          grade_level?: string | null
          id?: string
          name: string
          semester?: string | null
          teacher_id?: string | null
        }
        Update: {
          academic_year?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          grade_level?: string | null
          id?: string
          name?: string
          semester?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string | null
          enrollment_date: string | null
          id: string
          status: string | null
          student_id: string | null
        }
        Insert: {
          course_id?: string | null
          enrollment_date?: string | null
          id?: string
          status?: string | null
          student_id?: string | null
        }
        Update: {
          course_id?: string | null
          enrollment_date?: string | null
          id?: string
          status?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          date: string
          duration: number
          id: string
          location: string | null
          priority: string | null
          status: string | null
          study_plan: Json | null
          subject: string
          syllabus: string[] | null
          time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          duration?: number
          id?: string
          location?: string | null
          priority?: string | null
          status?: string | null
          study_plan?: Json | null
          subject: string
          syllabus?: string[] | null
          time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          duration?: number
          id?: string
          location?: string | null
          priority?: string | null
          status?: string | null
          study_plan?: Json | null
          subject?: string
          syllabus?: string[] | null
          time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      grades: {
        Row: {
          assignment_name: string
          created_at: string | null
          date_recorded: string
          grade: number
          grade_type: string | null
          id: string
          semester: string | null
          subject: string
          total_points: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assignment_name: string
          created_at?: string | null
          date_recorded?: string
          grade: number
          grade_type?: string | null
          id?: string
          semester?: string | null
          subject: string
          total_points?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assignment_name?: string
          created_at?: string | null
          date_recorded?: string
          grade?: number
          grade_type?: string | null
          id?: string
          semester?: string | null
          subject?: string
          total_points?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          created_at: string | null
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          name: string
          next_dose: string
          notes: string | null
          start_date: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          name: string
          next_dose: string
          notes?: string | null
          start_date: string
          status: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          name?: string
          next_dose?: string
          notes?: string | null
          start_date?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          course_id: string | null
          created_at: string | null
          folder: string | null
          id: string
          is_highlighted: boolean | null
          is_public: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          course_id?: string | null
          created_at?: string | null
          folder?: string | null
          id?: string
          is_highlighted?: boolean | null
          is_public?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string | null
          created_at?: string | null
          folder?: string | null
          id?: string
          is_highlighted?: boolean | null
          is_public?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string | null
          full_name: string | null
          grade_level: string | null
          id: string
          student_id: string | null
          updated_at: string | null
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          grade_level?: string | null
          id: string
          student_id?: string | null
          updated_at?: string | null
          user_type: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          grade_level?: string | null
          id?: string
          student_id?: string | null
          updated_at?: string | null
          user_type?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          category: string
          created_at: string | null
          file_name: string
          file_size: string
          file_type: string
          file_url: string
          id: string
          notes: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          file_name: string
          file_size: string
          file_type: string
          file_url: string
          id?: string
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          file_name?: string
          file_size?: string
          file_type?: string
          file_url?: string
          id?: string
          notes?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          created_at: string | null
          duration: number
          end_time: string | null
          id: string
          session_type: string | null
          start_time: string
          subject: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration: number
          end_time?: string | null
          id?: string
          session_type?: string | null
          start_time: string
          subject?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration?: number
          end_time?: string | null
          id?: string
          session_type?: string | null
          start_time?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          assignment_id: string | null
          content: string | null
          feedback: string | null
          file_url: string | null
          grade: number | null
          id: string
          status: string | null
          student_id: string | null
          submitted_at: string | null
        }
        Insert: {
          assignment_id?: string | null
          content?: string | null
          feedback?: string | null
          file_url?: string | null
          grade?: number | null
          id?: string
          status?: string | null
          student_id?: string | null
          submitted_at?: string | null
        }
        Update: {
          assignment_id?: string | null
          content?: string | null
          feedback?: string | null
          file_url?: string | null
          grade?: number | null
          id?: string
          status?: string | null
          student_id?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      symptoms: {
        Row: {
          created_at: string | null
          date: string
          id: string
          name: string
          severity: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          name: string
          severity: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          name?: string
          severity?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "symptoms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          status: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable: {
        Row: {
          created_at: string | null
          day: string
          end_time: string
          id: string
          start_time: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          day: string
          end_time: string
          id?: string
          start_time: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          day?: string
          end_time?: string
          id?: string
          start_time?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timetable_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      timetables: {
        Row: {
          course_id: string | null
          created_at: string | null
          day_of_week: number | null
          end_time: string
          id: string
          room_number: string | null
          start_time: string
          user_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          day_of_week?: number | null
          end_time: string
          id?: string
          room_number?: string | null
          start_time: string
          user_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string
          id?: string
          room_number?: string | null
          start_time?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timetables_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetables_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      todos: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "todos_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "todos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_timetables: {
        Row: {
          color: string | null
          created_at: string
          day: number
          end_time: string
          id: string
          instructor: string | null
          location: string | null
          start_time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          day: number
          end_time: string
          id?: string
          instructor?: string | null
          location?: string | null
          start_time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          day?: number
          end_time?: string
          id?: string
          instructor?: string | null
          location?: string | null
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
