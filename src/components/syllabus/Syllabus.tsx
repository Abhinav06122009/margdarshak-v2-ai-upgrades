import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, Plus, FileText, Calendar, Clock, Users, Download, Edit, Trash2, 
  Search, Filter, Shield, Eye, BookOpen, GraduationCap, Building, Star,
  AlertCircle, History, Share, MessageCircle, BarChart3, Copy, Archive
} from 'lucide-react';
import { X } from 'lucide-react'; // Import these icons at top of your file
import logo from "@/components/logo/logo.png";


interface SyllabusItem {
  id: string;
  user_id: string;
  course_name: string;
  course_code: string;
  semester: string;
  academic_year: string;
  instructor_name: string;
  instructor_email?: string;
  department?: string;
  credits?: number;
  course_type?: string;
  description: string;
  prerequisites?: string[];
  objectives: string[];
  topics: string[];
  assignments: string[];
  grading_criteria: string;
  textbooks: string[];
  supplementary_materials?: string[];
  schedule?: any;
  office_hours?: string;
  contact_info?: any;
  course_policies?: string;
  attendance_policy?: string;
  file_url?: string;
  file_name?: string;
  version: number;
  status: 'draft' | 'published' | 'archived' | 'under_review';
  is_public: boolean;
  approval_status: string;
  tags?: string[];
  language: string;
  difficulty_level: string;
  estimated_workload_hours?: number;
  created_at: string;
  updated_at: string;
}

interface SyllabusStats {
  total_syllabi: number;
  published_syllabi: number;
  draft_syllabi: number;
  archived_syllabi: number;
  public_syllabi: number;
  departments: string[];
  semesters: string[];
  academic_years: string[];
  popular_tags: string[];
}

interface SecureUser {
  id: string;
  email: string;
  profile?: {
    full_name: string;
    user_type: string;
    student_id?: string;
    department?: string;
  };
}

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  color?: string;
  is_active: boolean;
}

// Enhanced schema - removed enum restrictions for flexible input
const syllabusSchema = z.object({
  course_name: z.string().min(1, 'Course name is required'),
  course_code: z.string().min(1, 'Course code is required'),
  semester: z.string().min(1, 'Semester is required'),
  academic_year: z.string().min(1, 'Academic year is required'),
  instructor_name: z.string().min(1, 'Instructor name is required'),
  instructor_email: z.string().email().optional().or(z.literal('')),
  department: z.string().min(1, 'Department is required'),
  credits: z.number().min(1).max(10).optional(),
  course_type: z.string().min(1, 'Course type is required'),
  description: z.string().min(1, 'Description is required'),
  prerequisites: z.string().optional(),
  objectives: z.string().min(1, 'Objectives are required'),
  topics: z.string().min(1, 'Topics are required'),
  assignments: z.string().optional(),
  grading_criteria: z.string().min(1, 'Grading criteria is required'),
  textbooks: z.string().optional(),
  supplementary_materials: z.string().optional(),
  office_hours: z.string().optional(),
  course_policies: z.string().optional(),
  attendance_policy: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived', 'under_review']),
  is_public: z.boolean().default(false),
  tags: z.string().optional(),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  estimated_workload_hours: z.number().min(1).max(40).optional(),
});

type SyllabusFormData = z.infer<typeof syllabusSchema>;

interface SyllabusProps {
  onBack: () => void;
}

// Enhanced helper functions
const syllabusHelpers = {
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
          student_id: profile.student_id,
          department: profile.department
        } : undefined
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  fetchUserSyllabi: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('syllabi')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user syllabi:', error);
      return [];
    }
  },

  getSyllabusStatistics: async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_syllabus_statistics');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching syllabus statistics:', error);
      return null;
    }
  },

  searchSyllabi: async (query: string, semester?: string, academicYear?: string) => {
    try {
      const { data, error } = await supabase
        .rpc('search_syllabi', {
          p_query: query || null,
          p_semester: semester || null,
          p_academic_year: academicYear || null,
          p_limit: 50
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching syllabi:', error);
      return [];
    }
  },

  createSyllabus: async (syllabusData: any, userId: string) => {
    try {
      const cleanData = {
        user_id: userId,
        course_name: syllabusData.course_name,
        course_code: syllabusData.course_code,
        semester: syllabusData.semester,
        academic_year: syllabusData.academic_year,
        instructor_name: syllabusData.instructor_name,
        instructor_email: syllabusData.instructor_email || null,
        department: syllabusData.department,
        credits: syllabusData.credits || 3,
        course_type: syllabusData.course_type,
        description: syllabusData.description,
        prerequisites: syllabusData.prerequisites ? syllabusData.prerequisites.split('\n').filter((p: string) => p.trim()) : [],
        objectives: syllabusData.objectives.split('\n').filter((obj: string) => obj.trim()),
        topics: syllabusData.topics.split('\n').filter((topic: string) => topic.trim()),
        assignments: syllabusData.assignments ? syllabusData.assignments.split('\n').filter((assign: string) => assign.trim()) : [],
        grading_criteria: syllabusData.grading_criteria,
        textbooks: syllabusData.textbooks ? syllabusData.textbooks.split('\n').filter((book: string) => book.trim()) : [],
        supplementary_materials: syllabusData.supplementary_materials ? syllabusData.supplementary_materials.split('\n').filter((mat: string) => mat.trim()) : [],
        office_hours: syllabusData.office_hours || null,
        course_policies: syllabusData.course_policies || null,
        attendance_policy: syllabusData.attendance_policy || null,
        status: syllabusData.status,
        is_public: syllabusData.is_public || false,
        tags: syllabusData.tags ? syllabusData.tags.split(',').map((tag: string) => tag.trim()) : [],
        language: 'en',
        difficulty_level: syllabusData.difficulty_level || 'intermediate',
        estimated_workload_hours: syllabusData.estimated_workload_hours || null
      };

      const { data, error } = await supabase
        .from('syllabi')
        .insert([cleanData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating syllabus:', error);
      throw error;
    }
  },

  updateSyllabus: async (syllabusId: string, syllabusData: any, userId: string) => {
    try {
      // Create revision before updating
      await supabase.rpc('create_syllabus_revision', {
        p_syllabus_id: syllabusId,
        p_changes_summary: 'Updated syllabus content'
      });

      const cleanData = {
        course_name: syllabusData.course_name,
        course_code: syllabusData.course_code,
        semester: syllabusData.semester,
        academic_year: syllabusData.academic_year,
        instructor_name: syllabusData.instructor_name,
        instructor_email: syllabusData.instructor_email || null,
        department: syllabusData.department,
        credits: syllabusData.credits || 3,
        course_type: syllabusData.course_type,
        description: syllabusData.description,
        prerequisites: syllabusData.prerequisites ? syllabusData.prerequisites.split('\n').filter((p: string) => p.trim()) : [],
        objectives: syllabusData.objectives.split('\n').filter((obj: string) => obj.trim()),
        topics: syllabusData.topics.split('\n').filter((topic: string) => topic.trim()),
        assignments: syllabusData.assignments ? syllabusData.assignments.split('\n').filter((assign: string) => assign.trim()) : [],
        grading_criteria: syllabusData.grading_criteria,
        textbooks: syllabusData.textbooks ? syllabusData.textbooks.split('\n').filter((book: string) => book.trim()) : [],
        supplementary_materials: syllabusData.supplementary_materials ? syllabusData.supplementary_materials.split('\n').filter((mat: string) => mat.trim()) : [],
        office_hours: syllabusData.office_hours || null,
        course_policies: syllabusData.course_policies || null,
        attendance_policy: syllabusData.attendance_policy || null,
        status: syllabusData.status,
        is_public: syllabusData.is_public || false,
        tags: syllabusData.tags ? syllabusData.tags.split(',').map((tag: string) => tag.trim()) : [],
        difficulty_level: syllabusData.difficulty_level || 'intermediate',
        estimated_workload_hours: syllabusData.estimated_workload_hours || null
      };

      const { data, error } = await supabase
        .from('syllabi')
        .update(cleanData)
        .eq('id', syllabusId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating syllabus:', error);
      throw error;
    }
  },

  deleteSyllabus: async (syllabusId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('syllabi')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', syllabusId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting syllabus:', error);
      throw error;
    }
  },

  // Get unique values for suggestions
  getUniqueSemesters: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('syllabi')
        .select('semester')
        .eq('user_id', userId)
        .eq('is_deleted', false);

      if (error) throw error;
      return [...new Set(data?.map(item => item.semester).filter(Boolean))];
    } catch (error) {
      console.error('Error fetching semesters:', error);
      return [];
    }
  },

  getUniqueDepartments: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('syllabi')
        .select('department')
        .eq('user_id', userId)
        .eq('is_deleted', false);

      if (error) throw error;
      return [...new Set(data?.map(item => item.department).filter(Boolean))];
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  },

  getUniqueCourseTypes: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('syllabi')
        .select('course_type')
        .eq('user_id', userId)
        .eq('is_deleted', false);

      if (error) throw error;
      return [...new Set(data?.map(item => item.course_type).filter(Boolean))];
    } catch (error) {
      console.error('Error fetching course types:', error);
      return [];
    }
  }
};

const Syllabus: React.FC<SyllabusProps> = ({ onBack }) => {
  const [currentUser, setCurrentUser] = useState<SecureUser | null>(null);
  const [syllabi, setSyllabi] = useState<SyllabusItem[]>([]);
  const [syllabusStats, setSyllabusStats] = useState<SyllabusStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState<SyllabusItem | null>(null);
  
  // Suggestion states for autocomplete
  const [semesterSuggestions, setSemesterSuggestions] = useState<string[]>([]);
  const [departmentSuggestions, setDepartmentSuggestions] = useState<string[]>([]);
  const [courseTypeSuggestions, setCourseTypeSuggestions] = useState<string[]>([]);
  
  const { toast } = useToast();

  const form = useForm<SyllabusFormData>({
    resolver: zodResolver(syllabusSchema),
    defaultValues: {
      course_name: '',
      course_code: '',
      semester: '',
      academic_year: new Date().getFullYear().toString(),
      instructor_name: '',
      instructor_email: '',
      department: '',
      credits: 3,
      course_type: '',
      description: '',
      prerequisites: '',
      objectives: '',
      topics: '',
      assignments: '',
      grading_criteria: '',
      textbooks: '',
      supplementary_materials: '',
      office_hours: '',
      course_policies: '',
      attendance_policy: '',
      status: 'draft',
      is_public: false,
      tags: '',
      difficulty_level: 'intermediate',
      estimated_workload_hours: undefined,
    },
  });

  useEffect(() => {
    initializeSecureSyllabus();
  }, []);

  const initializeSecureSyllabus = async () => {
    try {
      setLoading(true);
      
      const user = await syllabusHelpers.getCurrentUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access your syllabi.",
          variant: "destructive",
        });
        setSecurityVerified(true);
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      setSecurityVerified(true);
      
      // Set default instructor name from profile
      if (user.profile?.full_name) {
        form.setValue('instructor_name', user.profile.full_name);
      }
      
      // Set default department from profile
      if (user.profile?.department) {
        form.setValue('department', user.profile.department);
      }
      
      // Fetch user's syllabi and statistics
      const [userSyllabi, stats] = await Promise.all([
        syllabusHelpers.fetchUserSyllabi(user.id),
        syllabusHelpers.getSyllabusStatistics()
      ]);
      
      setSyllabi(userSyllabi);
      setSyllabusStats(stats);

      // Load suggestions from user's existing data
      const [semesters, departments, courseTypes] = await Promise.all([
        syllabusHelpers.getUniqueSemesters(user.id),
        syllabusHelpers.getUniqueDepartments(user.id),
        syllabusHelpers.getUniqueCourseTypes(user.id)
      ]);

      setSemesterSuggestions(semesters);
      setDepartmentSuggestions(departments);
      setCourseTypeSuggestions(courseTypes);

toast({
  title: (
    <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
      Secure Access Verified
    </span>
  ),
  description: (
    <span className="text-white font-medium">
      Welcome {user.profile?.full_name || 'User'}! Your syllabi are private and secure.
    </span>
  ),
  icon: <Shield className="text-emerald-400" />,
  className: "relative bg-black border border-emerald-400/70 shadow-xl px-6 py-4 pr-12 rounded-lg max-w-sm",
  action: (
    <button
      onClick={() => toast.dismiss()}
      aria-label="Close"
      className="
        absolute top-2 right-2 p-1 rounded-full 
        text-emerald-400 hover:text-emerald-200 
        focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1
        transition-colors duration-300 shadow-md hover:shadow-lg
      "
    >
      <X className="w-5 h-5" />
    </button>
  ),
});


    } catch (error) {
      console.error('Error initializing secure syllabus:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize secure syllabus system.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SyllabusFormData) => {
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to manage syllabi.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingSyllabus) {
        await syllabusHelpers.updateSyllabus(editingSyllabus.id, data, currentUser.id);
 toast({
  title: (
    <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
      Syllabus Updated Successfully!
    </span>
  ),
  description: (
    <span className="text-white font-medium">
      &quot;<em>{data.course_name}</em>&quot; has been updated in your secure syllabus collection.
    </span>
  ),
  icon: <Edit className="text-emerald-400" />,
  className: "relative bg-black border border-emerald-400/70 shadow-xl px-6 py-4 pr-12 rounded-lg max-w-sm",
  action: (
    <button
      onClick={() => toast.dismiss()}
      aria-label="Close"
      className="
        absolute top-2 right-2 p-1 rounded-full 
        text-emerald-400 hover:text-emerald-200 
        focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1
        transition-colors duration-300 shadow-md hover:shadow-lg
      "
    >
      <X className="w-5 h-5" />
    </button>
  ),
});

      } else {
        await syllabusHelpers.createSyllabus(data, currentUser.id);
toast({
  title: (
    <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
      Syllabus Created Successfully!
    </span>
  ),
  description: (
    <span className="text-white font-medium">
      &quot;<em>{data.course_name}</em>&quot; has been added to your private syllabus collection.
    </span>
  ),
  icon: <Plus className="text-emerald-400" />,
  className: "relative bg-black border border-emerald-400/70 shadow-xl px-6 py-4 pr-12 rounded-lg max-w-sm",
  action: (
    <button
      onClick={() => toast.dismiss()}
      aria-label="Close"
      className="
        absolute top-2 right-2 p-1 rounded-full 
        text-emerald-400 hover:text-emerald-200 
        focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1
        transition-colors duration-300 shadow-md hover:shadow-lg
      "
    >
      <X className="w-5 h-5" />
    </button>
  ),
});

      }

      form.reset();
      setIsDialogOpen(false);
      setEditingSyllabus(null);
      
      // Refresh syllabi and suggestions
      const userSyllabi = await syllabusHelpers.fetchUserSyllabi(currentUser.id);
      setSyllabi(userSyllabi);

      // Update suggestions
      const [semesters, departments, courseTypes] = await Promise.all([
        syllabusHelpers.getUniqueSemesters(currentUser.id),
        syllabusHelpers.getUniqueDepartments(currentUser.id),
        syllabusHelpers.getUniqueCourseTypes(currentUser.id)
      ]);

      setSemesterSuggestions(semesters);
      setDepartmentSuggestions(departments);
      setCourseTypeSuggestions(courseTypes);
      
    } catch (error: any) {
      console.error('Error saving syllabus:', error);
      toast({
        title: 'Error Saving Syllabus',
        description: `Failed to save syllabus: ${error.message || 'Please try again.'}`,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (syllabus: SyllabusItem) => {
    setEditingSyllabus(syllabus);
    form.reset({
      course_name: syllabus.course_name,
      course_code: syllabus.course_code,
      semester: syllabus.semester,
      academic_year: syllabus.academic_year,
      instructor_name: syllabus.instructor_name,
      instructor_email: syllabus.instructor_email || '',
      department: syllabus.department || '',
      credits: syllabus.credits || 3,
      course_type: syllabus.course_type || '',
      description: syllabus.description,
      prerequisites: syllabus.prerequisites?.join('\n') || '',
      objectives: syllabus.objectives.join('\n'),
      topics: syllabus.topics.join('\n'),
      assignments: syllabus.assignments.join('\n'),
      grading_criteria: syllabus.grading_criteria,
      textbooks: syllabus.textbooks.join('\n'),
      supplementary_materials: syllabus.supplementary_materials?.join('\n') || '',
      office_hours: syllabus.office_hours || '',
      course_policies: syllabus.course_policies || '',
      attendance_policy: syllabus.attendance_policy || '',
      status: syllabus.status,
      is_public: syllabus.is_public,
      tags: syllabus.tags?.join(', ') || '',
      difficulty_level: (syllabus.difficulty_level as any) || 'intermediate',
      estimated_workload_hours: syllabus.estimated_workload_hours || undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, courseName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone.`)) return;
    if (!currentUser) return;

    try {
      await syllabusHelpers.deleteSyllabus(id, currentUser.id);
      
 toast({
  title: (
    <span className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent font-bold">
      Syllabus Deleted Successfully
    </span>
  ),
  description: (
    <span className="text-white font-medium">
      &quot;<em>{courseName}</em>&quot; has been moved to trash.
    </span>
  ),
  icon: <Trash2 className="text-red-500" />,
  className: "relative bg-black border border-red-500/70 shadow-xl px-6 py-4 pr-12 rounded-lg max-w-sm",
  action: (
    <button
      onClick={() => toast.dismiss()}
      aria-label="Close"
      className="
        absolute top-2 right-2 p-1 rounded-full 
        text-red-500 hover:text-red-300 
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1
        transition-colors duration-300 shadow-md hover:shadow-lg
      "
    >
      <X className="w-5 h-5" />
    </button>
  ),
});

      
      // Refresh syllabi
      const userSyllabi = await syllabusHelpers.fetchUserSyllabi(currentUser.id);
      setSyllabi(userSyllabi);
      
    } catch (error: any) {
      console.error('Error deleting syllabus:', error);
      toast({
        title: "Error Deleting Syllabus",
        description: `Failed to delete syllabus: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    }
  };

  const handleSearch = async () => {
    if (!currentUser) return;

    try {
      if (searchTerm.trim()) {
        const results = await syllabusHelpers.searchSyllabi(
          searchTerm,
          selectedSemester !== 'all' ? selectedSemester : undefined,
          selectedAcademicYear !== 'all' ? selectedAcademicYear : undefined
        );
        setSyllabi(results);
      } else {
        // Reset to user's syllabi
        const userSyllabi = await syllabusHelpers.fetchUserSyllabi(currentUser.id);
        setSyllabi(userSyllabi);
      }
    } catch (error) {
      console.error('Error searching syllabi:', error);
    }
  };

  const filteredSyllabi = syllabi.filter(syllabus => {
    const matchesSearch = !searchTerm || 
      syllabus.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      syllabus.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      syllabus.instructor_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || syllabus.status === filterStatus;
    const matchesSemester = selectedSemester === 'all' || syllabus.semester === selectedSemester;
    const matchesYear = selectedAcademicYear === 'all' || syllabus.academic_year === selectedAcademicYear;
    
    return matchesSearch && matchesStatus && matchesSemester && matchesYear;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const resetForm = () => {
    form.reset();
    setEditingSyllabus(null);
  };

  // Custom input component with suggestions
  const InputWithSuggestions: React.FC<{
    field: any;
    placeholder: string;
    suggestions: string[];
    label: string;
  }> = ({ field, placeholder, suggestions, label }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

    const handleInputChange = (value: string) => {
      field.onChange(value);
      if (value.trim()) {
        const filtered = suggestions.filter(suggestion =>
          suggestion.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setShowSuggestions(false);
      }
    };

    const selectSuggestion = (suggestion: string) => {
      field.onChange(suggestion);
      setShowSuggestions(false);
    };

    return (
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={field.value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setFilteredSuggestions(suggestions);
              setShowSuggestions(true);
            }
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion}
              </div>
            ))}
            <div className="px-3 py-2 text-xs text-gray-500 border-t">
              💡 These are suggestions from your previous entries
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading || !securityVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 border border-white/20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Initializing secure syllabus system...</p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-green-300 text-sm">Maximum Security Active</span>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 border border-white/20 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-4">Authentication Required</h2>
          <p className="text-white/70 mb-6">Please log in to access your private syllabus management system.</p>
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-white/60">
              <Shield className="w-4 h-4" />
              <span>Your syllabi are completely private and secure</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                📚 My Syllabus Collection
                <Shield className="w-8 h-8 text-green-400" />
              </h1>
              <p className="text-white/80">
                Private workspace for {currentUser.profile?.full_name} - Your syllabi are completely secure
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-400/30">
                  <Eye className="w-3 h-3 text-green-400" />
                  <span className="text-green-300 text-xs">Private Collection</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-400/30">
                  <BookOpen className="w-3 h-3 text-blue-400" />
                  <span className="text-blue-300 text-xs">{syllabi.length} Syllabi</span>
                </div>
              </div>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-black text-white hover:opacity-90"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Syllabus
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  {editingSyllabus ? 'Edit Syllabus' : 'Create New Syllabus'}
                </DialogTitle>
                <DialogDescription>
                  {editingSyllabus 
                    ? 'Update the syllabus information below.' 
                    : 'Fill in the course information to create a new secure syllabus. You can type custom values - suggestions will appear from your previous entries.'}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Course Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="course_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Introduction to Computer Science" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="course_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., CS101" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Custom Input Fields with Suggestions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="semester"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Semester *</FormLabel>
                          <FormControl>
                            <InputWithSuggestions
                              field={field}
                              placeholder="e.g., Fall 2024, Spring 2025"
                              suggestions={semesterSuggestions}
                              label="Semester"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="academic_year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Academic Year *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 2024, 2024-2025" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Instructor Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="instructor_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instructor Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Dr. John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="instructor_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instructor Email (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="e.g., professor@university.edu" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Department and Course Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department *</FormLabel>
                          <FormControl>
                            <InputWithSuggestions
                              field={field}
                              placeholder="e.g., Computer Science, Mathematics"
                              suggestions={departmentSuggestions}
                              label="Department"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="course_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Type *</FormLabel>
                          <FormControl>
                            <InputWithSuggestions
                              field={field}
                              placeholder="e.g., Core, Elective, Lab, Seminar"
                              suggestions={courseTypeSuggestions}
                              label="Course Type"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="credits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Credits</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="10" 
                              placeholder="3" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 3)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="difficulty_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of the course..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="objectives"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Learning Objectives (one per line) *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Students will be able to...&#10;Understand key concepts of...&#10;Apply principles of..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="topics"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Topics (one per line) *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Introduction to Programming&#10;Data Structures&#10;Algorithms..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="grading_criteria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grading Criteria *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Homework: 30%&#10;Midterm: 25%&#10;Final: 30%&#10;Participation: 15%"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Additional Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="prerequisites"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prerequisites (one per line)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="MATH101 - Calculus I&#10;CS100 - Introduction to Programming"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="textbooks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Required Textbooks (one per line)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Introduction to Algorithms - Cormen&#10;Clean Code - Robert Martin"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="assignments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignments & Projects (one per line)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Programming Assignment 1 - Basic Algorithms&#10;Midterm Project - Data Structure Implementation&#10;Final Project - Complete Application"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="office_hours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time To Complete</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Mon/Wed 2-4 PM, Room 101" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estimated_workload_hours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Weekly Hours</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="40" 
                              placeholder="10" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (comma-separated)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., programming, algorithms, data-structures" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="course_policies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Policies</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Late submission policy, academic integrity, etc."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="attendance_policy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Attendance Policy</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Attendance requirements and consequences"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="is_public"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            
                          </FormControl>

                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingSyllabus(null);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingSyllabus ? 'Update' : 'Create'} Syllabus
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats Overview */}
        {syllabusStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="glass-morphism p-6 rounded-2xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <BookOpen className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">{syllabusStats.total_syllabi}</span>
              </div>
              <h3 className="text-white font-semibold">Total Syllabi</h3>
              <p className="text-white/60 text-sm">In your collection</p>
            </div>

            <div className="glass-morphism p-6 rounded-2xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <GraduationCap className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-white">{syllabusStats.published_syllabi}</span>
              </div>
              <h3 className="text-white font-semibold">Published</h3>
              <p className="text-white/60 text-sm">Active syllabi</p>
            </div>

            <div className="glass-morphism p-6 rounded-2xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <Edit className="w-8 h-8 text-yellow-400" />
                <span className="text-2xl font-bold text-white">{syllabusStats.draft_syllabi}</span>
              </div>
              <h3 className="text-white font-semibold">Drafts</h3>
              <p className="text-white/60 text-sm">Work in progress</p>
            </div>

            <div className="glass-morphism p-6 rounded-2xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <Building className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">{departmentSuggestions.length}</span>
              </div>
              <h3 className="text-white font-semibold">Departments</h3>
              <p className="text-white/60 text-sm">Your Departments</p>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="glass-morphism border-white/20">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                    <Input
                      placeholder="Search syllabi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-40 bg-white/10 border-white/20 text-white">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="w-full md:w-40 bg-white/10 border-white/20 text-white">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {semesterSuggestions.map((semester) => (
                      <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Syllabi Grid */}
        <AnimatePresence>
          {filteredSyllabi.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FileText className="h-16 w-16 mx-auto text-white/40 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No syllabi found</h3>
              <p className="text-white/70">
                {syllabi.length === 0 ? 'Create your first syllabus to get started' : 'Try adjusting your search or filters'}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSyllabi.map((syllabus, index) => (
                <motion.div
                  key={syllabus.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-morphism border-white/20 hover:bg-white/15 transition-all duration-300 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg mb-1">
                            {syllabus.course_name}
                          </CardTitle>
                          <p className="text-white/70 text-sm">{syllabus.course_code}</p>
                        </div>
                        <Badge className={`${getStatusColor(syllabus.status)} text-xs`}>
                          {syllabus.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-white/70 text-sm">
                          <Users className="h-4 w-4 mr-2" />
                          {syllabus.instructor_name}
                        </div>
                        
                        <div className="flex items-center text-white/70 text-sm">
                          <Building className="h-4 w-4 mr-2" />
                          {syllabus.department} • {syllabus.course_type}
                        </div>
                        
                        <div className="flex items-center text-white/70 text-sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          {syllabus.semester} • {syllabus.academic_year}
                        </div>
                        
                        <div className="flex items-center text-white/70 text-sm">
                          <Clock className="h-4 w-4 mr-2" />
                          Updated {new Date(syllabus.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <p className="text-white/80 text-sm mb-4 line-clamp-2">
                        {syllabus.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-white/60 text-xs">
                          {syllabus.topics.length} topics • {syllabus.objectives.length} objectives
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(syllabus)}
                            className="text-white/70 hover:text-white hover:bg-white/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(syllabus.id, syllabus.course_name)}
                            className="text-red-300 hover:text-red-200 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
            
      {/* Footer */}
 <footer className="mt-12 py-6 border-t border-white/20 text-sm select-none flex items-center justify-center gap-4 text-white/70">
  <img
    src={logo}
    alt="VSAV GyanVedu Logo"
    className="w-15 h-14 object-contain mr-4 bg-white"
    draggable={false}
    style={{ minWidth: 48 }}
  />
  <div className="text-center">
    Maintained by <span className="font-semibold text-emerald-400">VSAV GYANTAPA</span>
    <br />
    Developed &amp; Maintained by <span className="font-semibold text-emerald-400">VSAV GYANTAPA</span>
    <br />
    © 2025 VSAV GYANTAPA. All Rights Reserved
  </div>
</footer>
    </div>
  );
};

export default Syllabus;
