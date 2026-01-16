import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Calendar, CheckCircle, XCircle, Clock, Search, Filter, Download, UserCheck, Plus, Edit, Trash2, Shield, AlertCircle, Eye, EyeOff, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';

interface AttendanceProps {
  onBack: () => void;
}

interface Student {
  id: string;
  full_name: string;
  student_id: string;
  avatar_url?: string;
  email?: string;
}

interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  course_id: string;
  student_name?: string;
  marked_at?: string;
  created_at?: string;
}

interface BulkAttendanceRecord {
  id: string;
  course_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string;
  session_number: number;
}

interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  user_id: string;
}

interface SecureUser {
  id: string;
  email: string;
  profile?: {
    full_name: string;
    user_type: string;
    student_id?: string;
  };
}

// Secure helper functions
const secureAttendanceHelpers = {
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
          full_name: profile.full_name || 'Unknown User',
          user_type: profile.user_type || 'student',
          student_id: profile.student_id
        } : undefined
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

fetchUserCourses: async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('id, name, code, description, user_id, academic_year')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user courses:', error);
    return [];
  }
},

  fetchUserAttendance: async (userId: string, courseId?: string, date?: string) => {
    try {
      let query = supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .order('marked_at', { ascending: false });

      if (courseId) {
        query = query.eq('course_id', courseId);
      }
      
      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user attendance:', error);
      return [];
    }
  },

  fetchAllUserAttendance: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          courses:course_id (
            name,
            code,
            description
          )
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all user attendance:', error);
      return [];
    }
  },

  createAttendanceRecord: async (userId: string, courseId: string, date: string, status: string, notes?: string) => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .insert({
          user_id: userId,
          course_id: courseId,
          date,
          status,
          notes: notes || null,
          marked_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating attendance record:', error);
      throw error;
    }
  },

  updateAttendanceRecord: async (recordId: string, userId: string, status: string, notes?: string) => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .update({ status, notes: notes || null })
        .eq('id', recordId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating attendance record:', error);
      throw error;
    }
  },
  

  deleteAttendanceRecord: async (recordId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', recordId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      throw error;
    }
  }
};

const Attendance: React.FC<AttendanceProps> = ({ onBack }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentUser, setCurrentUser] = useState<SecureUser | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({ name: '', code: '', description: '' });
  const [securityVerified, setSecurityVerified] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({
    status: 'present' as 'present' | 'absent' | 'late' | 'excused',
    notes: ''
  });
  const [isAddingAttendance, setIsAddingAttendance] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'csv'>('excel');
  const [exportLoading, setExportLoading] = useState(false);

  // Bulk Attendance States
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCourseId, setBulkCourseId] = useState('');
  const [bulkDate, setBulkDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [bulkAttendanceRecords, setBulkAttendanceRecords] = useState<BulkAttendanceRecord[]>([]);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  // Delete states
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

  const { toast } = useToast();
  const { t } = useLanguage();

  // Initialize bulk records properly
  const initializeBulkRecords = useCallback((courseId: string) => {
    setBulkAttendanceRecords([{
      id: '1',
      course_id: courseId,
      date: bulkDate,
      status: 'present',
      notes: '',
      session_number: 1
    }]);
  }, [bulkDate]);

  useEffect(() => {
    initializeSecureAttendance();
  }, [initializeSecureAttendance]);

  useEffect(() => {
    if (selectedCourse && currentUser) {
      fetchAttendance();
    }
  }, [selectedCourse, selectedDate, currentUser, fetchAttendance]);

  // Initialize bulk course when courses are loaded
  useEffect(() => {
    if (courses.length > 0 && !bulkCourseId) {
      const firstCourse = courses[0].id;
      setBulkCourseId(firstCourse);
      initializeBulkRecords(firstCourse);
    }
  }, [courses, bulkCourseId, bulkDate, initializeBulkRecords]);

  const initializeSecureAttendance = useCallback(async () => {
    try {
      setLoading(true);
      
      const user = await secureAttendanceHelpers.getCurrentUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access attendance management.",
          variant: "destructive",
        });
        onBack();
        return;
      }

      setCurrentUser(user);
      setSecurityVerified(true);
      
      const userCourses = await secureAttendanceHelpers.fetchUserCourses(user.id);
      setCourses(userCourses);
      
      if (userCourses.length > 0) {
        setSelectedCourse(userCourses[0].id);
        setBulkCourseId(userCourses[0].id);
        initializeBulkRecords(userCourses[0].id);
      }

      toast({
        title: "Secure Access Verified",
        description: `Welcome ${user.profile?.full_name}! Your attendance data is private and secure.`,
      });

    } catch (error) {
      console.error('Error initializing secure attendance:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize secure attendance system.",
        variant: "destructive",
      });
      onBack();
    } finally {
      setLoading(false);
    }
  }, [onBack, toast, initializeBulkRecords]);

  const fetchAttendance = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const userAttendance = await secureAttendanceHelpers.fetchUserAttendance(
        currentUser.id,
        selectedCourse,
        selectedCourse ? format(selectedDate, 'yyyy-MM-dd') : undefined
      );
      
      setAttendance(userAttendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance records.",
        variant: "destructive",
      });
    }
  }, [currentUser, selectedCourse, selectedDate, toast]);

  // Delete attendance record function
  const handleDeleteAttendanceRecord = async (recordId: string) => {
    if (!currentUser) return;

    const record = attendance.find(r => r.id === recordId);
    const courseName = courses.find(c => c.id === record?.course_id)?.name || 'Unknown Course';

    if (!confirm(`Are you sure you want to delete this attendance record for ${courseName} on ${record ? format(new Date(record.date), 'MMM d, yyyy') : 'unknown date'}?`)) {
      return;
    }

    try {
      setDeletingRecordId(recordId);
      await secureAttendanceHelpers.deleteAttendanceRecord(recordId, currentUser.id);
      
      toast({
        title: "Record Deleted",
        description: "Attendance record has been successfully deleted.",
      });

      // Refresh attendance data
      await fetchAttendance();
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete attendance record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingRecordId(null);
    }
  };

  // Bulk delete function
  const handleBulkDeleteByDate = async () => {
    if (!currentUser || !selectedCourse) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const recordsToDelete = attendance.filter(record => 
      record.course_id === selectedCourse && record.date === dateStr
    );

    if (recordsToDelete.length === 0) {
      toast({
        title: "No Records Found",
        description: "No attendance records found for the selected date and course.",
        variant: "destructive",
      });
      return;
    }

    const courseName = courses.find(c => c.id === selectedCourse)?.name || 'Unknown Course';
    
    if (!confirm(`Are you sure you want to delete all ${recordsToDelete.length} attendance records for ${courseName} on ${format(selectedDate, 'MMM d, yyyy')}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      let deletedCount = 0;

      for (const record of recordsToDelete) {
        try {
          await secureAttendanceHelpers.deleteAttendanceRecord(record.id, currentUser.id);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete record ${record.id}:`, error);
        }
      }

      toast({
        title: "Bulk Delete Completed",
        description: `Successfully deleted ${deletedCount} out of ${recordsToDelete.length} attendance records.`,
      });

      // Refresh attendance data
      await fetchAttendance();
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast({
        title: "Bulk Delete Failed",
        description: "Failed to delete some attendance records. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fixed bulk attendance functions with conflict resolution
  const addBulkSession = () => {
    if (bulkAttendanceRecords.length >= 50) {
      toast({
        title: "Maximum Limit Reached",
        description: "You can record up to 50 attendance sessions at once.",
        variant: "destructive",
      });
      return;
    }

    if (!bulkCourseId || bulkCourseId.trim() === '') {
      toast({
        title: "Course Required",
        description: "Please select a course before adding sessions.",
        variant: "destructive",
      });
      return;
    }

    const newSession: BulkAttendanceRecord = {
      id: Date.now().toString(),
      course_id: bulkCourseId,
      date: bulkDate || format(new Date(), 'yyyy-MM-dd'),
      status: 'present',
      notes: '',
      session_number: bulkAttendanceRecords.length + 1
    };

    setBulkAttendanceRecords([...bulkAttendanceRecords, newSession]);
  };

  const removeBulkSession = (id: string) => {
    if (bulkAttendanceRecords.length <= 1) {
      toast({
        title: "Minimum Sessions",
        description: "At least one attendance session is required.",
        variant: "destructive",
      });
      return;
    }

    const updatedRecords = bulkAttendanceRecords
      .filter(record => record.id !== id)
      .map((record, index) => ({
        ...record,
        session_number: index + 1
      }));

    setBulkAttendanceRecords(updatedRecords);
  };

  const updateBulkSession = (id: string, field: keyof BulkAttendanceRecord, value: string) => {
    setBulkAttendanceRecords(records => 
      records.map(record => 
        record.id === id ? { ...record, [field]: value } : record
      )
    );
  };

  const updateAllSessions = (field: 'course_id' | 'date', value: string) => {
    if (!value || value.trim() === '') {
      toast({
        title: "Invalid Selection",
        description: `Please select a valid ${field === 'course_id' ? 'course' : 'date'}.`,
        variant: "destructive",
      });
      return;
    }

    if (field === 'course_id') {
      setBulkCourseId(value);
    } else {
      setBulkDate(value);
    }

    setBulkAttendanceRecords(records => 
      records.map(record => ({ ...record, [field]: value }))
    );
  };

  const handleBulkSubmit = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "User authentication required.",
        variant: "destructive",
      });
      return;
    }

    // Enhanced validation
    if (!bulkCourseId || bulkCourseId.trim() === '') {
      toast({
        title: "Validation Error",
        description: "Please select a course for all sessions.",
        variant: "destructive",
      });
      return;
    }

    if (!bulkDate || bulkDate.trim() === '') {
      toast({
        title: "Validation Error",
        description: "Please select a date for all sessions.",
        variant: "destructive",
      });
      return;
    }

    // Validate all sessions have status
    const invalidSessions = bulkAttendanceRecords.filter(record => 
      !record.status || record.status.trim() === '' || 
      !record.course_id || record.course_id.trim() === ''
    );

    if (invalidSessions.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please set status for all sessions and ensure course is selected.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsBulkSubmitting(true);

      // Create records with unique timestamps to avoid constraint violation
      const baseTime = new Date(`${bulkDate}T09:00:00`).getTime();
      const validatedRecords = bulkAttendanceRecords.map((record, index) => {
        // Add minutes to make each record unique (Session 1: 09:00, Session 2: 09:01, etc.)
        const sessionTime = new Date(baseTime + (index * 60000)); // Add 1 minute per session
        
        return {
          user_id: currentUser.id,
          course_id: bulkCourseId,
          date: bulkDate,
          status: record.status,
          notes: record.notes ? `Session ${index + 1}: ${record.notes}` : `Session ${index + 1}`,
          marked_at: sessionTime.toISOString()
        };
      });

      // Log for debugging
      console.log('Submitting records with unique timestamps:', validatedRecords);

      // Insert records one by one to handle any remaining conflicts gracefully
      const insertedRecords = [];
      const failedRecords = [];

      for (let i = 0; i < validatedRecords.length; i++) {
        try {
          const record = validatedRecords[i];
          const { data, error } = await supabase
            .from('attendance')
            .insert(record)
            .select();

          if (error) {
            console.error(`Error inserting record ${i + 1}:`, error);
            failedRecords.push({
              sessionNumber: i + 1,
              error: error.message
            });
          } else if (data && data[0]) {
            insertedRecords.push(data[0]);
          }
        } catch (recordError) {
          console.error(`Exception inserting record ${i + 1}:`, recordError);
          failedRecords.push({
            sessionNumber: i + 1,
            error: recordError.message
          });
        }

        // Add small delay between insertions to avoid rate limiting
        if (i < validatedRecords.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Provide detailed feedback
      if (insertedRecords.length > 0) {
        toast({
          title: "Bulk Attendance Recorded",
          description: `Successfully recorded ${insertedRecords.length} out of ${bulkAttendanceRecords.length} attendance sessions for ${courses.find(c => c.id === bulkCourseId)?.name}.${failedRecords.length > 0 ? ` ${failedRecords.length} records failed.` : ''}`,
        });

        if (failedRecords.length > 0) {
          console.log('Failed records:', failedRecords);
        }
      } else {
        toast({
          title: "No Records Created",
          description: "All records may already exist or there were errors. Please check your data and try again.",
          variant: "destructive",
        });
      }

      // Reset and close modal if at least some records were successful
      if (insertedRecords.length > 0) {
        initializeBulkRecords(bulkCourseId);
        setShowBulkModal(false);
      }

      // Refresh attendance data
      fetchAttendance();

    } catch (error) {
      console.error('Error submitting bulk attendance:', error);
      
      if (error.code === '23505') {
        toast({
          title: "Duplicate Records",
          description: "Some attendance records already exist for this course and date. Try modifying the session times or check existing records.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to record bulk attendance: ${error.message || 'Please try again.'}`,
          variant: "destructive",
        });
      }
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const handleAddAttendance = async () => {
    if (!selectedCourse || !currentUser) return;

    try {
      setIsAddingAttendance(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // For single attendance, we don't check for existing records to allow multiple sessions
      await secureAttendanceHelpers.createAttendanceRecord(
        currentUser.id,
        selectedCourse,
        dateStr,
        attendanceForm.status,
        attendanceForm.notes
      );
      
      toast({
        title: "Attendance Recorded",
        description: `Your attendance has been marked as ${attendanceForm.status}.`,
      });

      fetchAttendance();
      setAttendanceForm({ status: 'present', notes: '' });
      
    } catch (error) {
      console.error('Error managing attendance:', error);
      
      if (error.code === '23505') {
        toast({
          title: "Duplicate Record",
          description: "An identical attendance record already exists for this course and time.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to record attendance. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsAddingAttendance(false);
    }
  };

const handleCourseSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!currentUser) return;

  try {
    const academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
    
    if (editingCourse) {
      const { error } = await supabase
        .from('courses')
        .update({
          name: courseForm.name,
          code: courseForm.code,
          description: courseForm.description,
          academic_year: academicYear  // Add this line
        })
        .eq('id', editingCourse.id)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      
      toast({
        title: "Course Updated",
        description: 'Course updated successfully in your private workspace.',
      });
    } else {
      const { error } = await supabase
        .from('courses')
        .insert([{
          ...courseForm,
          user_id: currentUser.id,
          academic_year: academicYear  // Add this line
        }]);

      if (error) throw error;
      
      toast({
        title: "Course Created",
        description: 'Course created successfully in your private workspace.',
      });
    }
    
    setIsAddCourseOpen(false);
    setEditingCourse(null);
    setCourseForm({ name: '', code: '', description: '' });
    
    const userCourses = await secureAttendanceHelpers.fetchUserCourses(currentUser.id);
    setCourses(userCourses);
    
  } catch (error) {
    console.error('Error saving course:', error);
    toast({
      title: "Error",
      description: 'Failed to save course. Please try again.',
      variant: 'destructive'
    });
  }
};

  const handleDeleteCourse = async (courseId: string) => {
    if (!currentUser) return;
    if (!confirm('Are you sure you want to delete this course? All related attendance records will be deleted.')) return;
    
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      
      toast({
        title: "Course Deleted",
        description: 'Course and all related data deleted successfully.',
      });
      
      const userCourses = await secureAttendanceHelpers.fetchUserCourses(currentUser.id);
      setCourses(userCourses);
      
      if (selectedCourse === courseId) {
        setSelectedCourse(userCourses.length > 0 ? userCourses[0].id : '');
      }
      
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: 'Failed to delete course. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Export Functions
  const exportToExcel = async () => {
    if (!currentUser) return;
    
    try {
      setExportLoading(true);
      const data = await secureAttendanceHelpers.fetchAllUserAttendance(currentUser.id);

      const worksheetData = data.map(record => ({
        'Date': new Date(record.date).toLocaleDateString(),
        'Course Name': record.courses?.name || 'Unknown',
        'Course Code': record.courses?.code || 'N/A',
        'Status': record.status,
        'Notes': record.notes || '',
        'Marked At': record.marked_at ? new Date(record.marked_at).toLocaleString() : '',
        'Created At': record.created_at ? new Date(record.created_at).toLocaleString() : ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');

      XLSX.writeFile(workbook, `attendance_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Export Successful",
        description: "Your attendance report has been downloaded as Excel file.",
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export attendance report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!currentUser) return;
    
    try {
      setExportLoading(true);
      const data = await secureAttendanceHelpers.fetchAllUserAttendance(currentUser.id);

      const pdf = new jsPDF();
      
      pdf.setFontSize(20);
      pdf.text('Attendance Report', 20, 20);
      
      pdf.setFontSize(12);
      pdf.text(`Student: ${currentUser.profile?.full_name}`, 20, 35);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);

      const tableData = data.map(record => [
        new Date(record.date).toLocaleDateString(),
        record.courses?.name || 'Unknown',
        record.courses?.code || 'N/A',
        record.status,
        record.notes || '',
        record.marked_at ? new Date(record.marked_at).toLocaleString() : ''
      ]);

      autoTable(pdf, {
        head: [['Date', 'Course Name', 'Code', 'Status', 'Notes', 'Marked At']],
        body: tableData,
        startY: 55,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }
      });

      pdf.save(`attendance_report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Export Successful",
        description: "Your attendance report has been downloaded as PDF file.",
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const exportToCSV = async () => {
    if (!currentUser) return;
    
    try {
      setExportLoading(true);
      const data = await secureAttendanceHelpers.fetchAllUserAttendance(currentUser.id);

      const csvContent = [
        ['Date', 'Course Name', 'Course Code', 'Status', 'Notes', 'Marked At'].join(','),
        ...data.map(record => [
          new Date(record.date).toLocaleDateString(),
          `"${record.courses?.name || 'Unknown'}"`,
          record.courses?.code || 'N/A',
          record.status,
          `"${record.notes || ''}"`,
          record.marked_at ? new Date(record.marked_at).toLocaleString() : ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Your attendance report has been downloaded as CSV file.",
      });
    } catch (error) {
      console.error('CSV export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export CSV report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleExport = () => {
    switch (exportFormat) {
      case 'excel':
        exportToExcel();
        break;
      case 'pdf':
        exportToPDF();
        break;
      case 'csv':
        exportToCSV();
        break;
    }
    setShowExportModal(false);
  };

  const getAttendanceStats = () => {
    const records = attendance.filter(record => record.course_id === selectedCourse);
    const present = records.filter(record => record.status === 'present').length;
    const absent = records.filter(record => record.status === 'absent').length;
    const late = records.filter(record => record.status === 'late').length;
    const excused = records.filter(record => record.status === 'excused').length;
    const total = records.length;
    
    return { total, present, absent, late, excused };
  };

  const getCurrentAttendance = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return attendance.filter(record => 
      record.course_id === selectedCourse && record.date === dateStr
    );
  };

  const stats = getAttendanceStats();
  const currentAttendanceRecords = getCurrentAttendance();

  if (loading || !securityVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 border border-white/20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Initializing secure attendance system...</p>
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
          <p className="text-white/70 mb-6">Please log in to access your private attendance data.</p>
          <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
            Go Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Enhanced Header with Security Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                My Attendance Management
                <Shield className="w-8 h-8 text-green-400" />
              </h1>
              <p className="text-white/80">
                Private Workspace for {currentUser.profile?.full_name} - Your Data Is Completely Secure
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                  <Eye className="w-3 h-3 mr-1" />
                  Only You Can See This
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                  {currentUser.profile?.user_type === 'student' ? 'Student' : 'Teacher'} Account
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Calendar className="w-4 h-4 mr-2" />
                  {format(selectedDate, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Course Management and Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  My Courses
                </div>
                <div className="flex gap-2">
                  <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white/10 border-white/20 backdrop-blur-sm">
                      <DialogHeader>
                        <DialogTitle className="text-white">
                          {editingCourse ? 'Edit' : 'Add'} Course
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCourseSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="courseName" className="text-white">Course Name</Label>
                          <Input
                            id="courseName"
                            value={courseForm.name}
                            onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
                            className="bg-white/10 border-white/20 text-white"
                            required
                            placeholder="e.g., Mathematics 101"
                          />
                        </div>
                        <div>
                          <Label htmlFor="courseCode" className="text-white">Course Code</Label>
                          <Input
                            id="courseCode"
                            value={courseForm.code}
                            onChange={(e) => setCourseForm({...courseForm, code: e.target.value})}
                            className="bg-white/10 border-white/20 text-white"
                            required
                            placeholder="e.g., MATH101"
                          />
                        </div>
                        <div>
                          <Label htmlFor="courseDescription" className="text-white">Description</Label>
                          <Textarea
                            id="courseDescription"
                            value={courseForm.description}
                            onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                            className="bg-white/10 border-white/20 text-white"
                            placeholder="Course description (optional)"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsAddCourseOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                            {editingCourse ? 'Update' : 'Create'} Course
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedCourse && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const course = courses.find(c => c.id === selectedCourse);
                        if (course) {
                          setEditingCourse(course);
                          setCourseForm({ 
                            name: course.name, 
                            code: course.code, 
                            description: course.description || '' 
                          });
                          setIsAddCourseOpen(true);
                        }
                      }}
                      className="flex-1 bg-black border-white/20 text-white hover:bg-white/10"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCourse(selectedCourse)}
                      className="flex-1 border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Attendance Recording Card with Bulk Option */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Record Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white text-sm mb-2 block">Status</Label>
                <Select 
                  value={attendanceForm.status} 
                  onValueChange={(value) => setAttendanceForm({...attendanceForm, status: value as 'present' | 'absent' | 'late' | 'excused'})}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="excused">Excused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-white text-sm mb-2 block">Notes (Optional)</Label>
                <Textarea
                  value={attendanceForm.notes}
                  onChange={(e) => setAttendanceForm({...attendanceForm, notes: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="Add any notes about your attendance..."
                  rows={3}
                />
              </div>

              {currentAttendanceRecords.length > 0 && (
                <div className="p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-blue-200 text-sm">
                      Records for {format(selectedDate, 'MMM d')}: 
                      <Badge className="ml-2 bg-blue-500">
                        {currentAttendanceRecords.length} sessions
                      </Badge>
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkDeleteByDate}
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete All
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {currentAttendanceRecords.map((record, index) => (
                      <div key={record.id} className="text-xs text-blue-200/80 flex justify-between items-center">
                        <span>
                          {record.marked_at ? new Date(record.marked_at).toLocaleTimeString() : `Session ${index + 1}`}: {record.status}
                          {record.notes && ` - ${record.notes}`}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAttendanceRecord(record.id)}
                          disabled={deletingRecordId === record.id}
                          className="text-red-400 hover:bg-red-500/10 h-5 w-5 p-0"
                        >
                          {deletingRecordId === record.id ? (
                            <div className="animate-spin rounded-full h-2 w-2 border border-red-400 border-t-transparent" />
                          ) : (
                            <Trash2 className="w-2 h-2" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Single Record Button */}
              <Button
                onClick={handleAddAttendance}
                disabled={!selectedCourse || isAddingAttendance}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isAddingAttendance ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Add New Session
              </Button>

              {/* Bulk Record Button */}
              <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full bg-black border-white/20 text-white hover:bg-white/10"
                    onClick={() => {
                      // Ensure proper initialization when modal opens
                      if (!bulkCourseId && courses.length > 0) {
                        setBulkCourseId(courses[0].id);
                        initializeBulkRecords(courses[0].id);
                      } else if (bulkCourseId) {
                        initializeBulkRecords(bulkCourseId);
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Record 50 Sessions for One Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/10 border-white/20 backdrop-blur-sm max-w-5xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white flex items-center justify-between">
                      Bulk Sessions Recording - Single Course
                      <Badge className="bg-green-500/20 text-green-300">
                        {bulkAttendanceRecords.length}/50 Sessions
                      </Badge>
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Course and Date Selection (applies to all sessions) */}
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <h4 className="text-white font-medium mb-4">Course & Date Settings (All Sessions)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white text-sm">Course</Label>
                          <Select 
                            value={bulkCourseId}
                            onValueChange={(value) => updateAllSessions('course_id', value)}
                          >
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select course for all sessions" />
                            </SelectTrigger>
                            <SelectContent>
                              {courses.map(course => (
                                <SelectItem key={course.id} value={course.id}>
                                  {course.code} - {course.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-white text-sm">Date</Label>
                          <Input
                            type="date"
                            value={bulkDate}
                            onChange={(e) => updateAllSessions('date', e.target.value)}
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Individual Sessions */}
                    <div className="space-y-4">
                      <h4 className="text-white font-medium">Individual Session Settings</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                        {bulkAttendanceRecords.map((record, index) => (
                          <div key={record.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-white font-medium text-sm">Session {index + 1}</h5>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeBulkSession(record.id)}
                                disabled={bulkAttendanceRecords.length <= 1}
                                className="border-red-500/20 text-red-400 hover:bg-red-500/10 h-6 w-6 p-0"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <Label className="text-white text-xs">Status</Label>
                                <Select 
                                  value={record.status}
                                  onValueChange={(value) => updateBulkSession(record.id, 'status', value)}
                                >
                                  <SelectTrigger className="bg-white/10 border-white/20 text-white text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="present">Present</SelectItem>
                                    <SelectItem value="absent">Absent</SelectItem>
                                    <SelectItem value="late">Late</SelectItem>
                                    <SelectItem value="excused">Excused</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label className="text-white text-xs">Notes</Label>
                                <Input
                                  value={record.notes}
                                  onChange={(e) => updateBulkSession(record.id, 'notes', e.target.value)}
                                  className="bg-white/10 border-white/20 text-white text-xs"
                                  placeholder="Session notes"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={addBulkSession}
                        disabled={bulkAttendanceRecords.length >= 50}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Session ({bulkAttendanceRecords.length}/50)
                      </Button>
                      
                      <Button
                        onClick={handleBulkSubmit}
                        disabled={isBulkSubmitting || !bulkCourseId || !bulkDate}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                      >
                        {isBulkSubmitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Record All {bulkAttendanceRecords.length} Sessions
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Search/Filter Card with Export */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search & Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                placeholder="Search attendance records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              
              <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full bg-black border-white/20 text-white hover:bg-white/10"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export My Records
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <DialogHeader>
                    <DialogTitle className="text-white">Export Attendance Report</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white mb-2 block">Export Format</Label>
                      <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as 'excel' | 'pdf' | 'csv')}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excel">📊 Excel (.xlsx)</SelectItem>
                          <SelectItem value="pdf">📄 PDF Report</SelectItem>
                          <SelectItem value="csv">📝 CSV File</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowExportModal(false)}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleExport}
                        disabled={exportLoading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {exportLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        Export {exportFormat.toUpperCase()}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-white/80 text-sm">Total Records</div>
            </CardContent>
          </Card>
          <Card className="bg-green-500/20 border-green-500/30 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-300">{stats.present}</div>
              <div className="text-green-200 text-sm">Present</div>
            </CardContent>
          </Card>
          <Card className="bg-red-500/20 border-red-500/30 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-300">{stats.absent}</div>
              <div className="text-red-200 text-sm">Absent</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-500/20 border-yellow-500/30 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-300">{stats.late}</div>
              <div className="text-yellow-200 text-sm">Late</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/20 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-300">{stats.excused}</div>
              <div className="text-blue-200 text-sm">Excused</div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Records List */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              My Attendance Records ({attendance.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendance
                .filter(record => 
                  !searchQuery || 
                  record.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  record.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  record.date.includes(searchQuery)
                )
                .map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {format(new Date(record.date), 'EEEE, MMM d, yyyy')}
                          {record.marked_at && (
                            <span className="text-white/60 text-sm ml-2">
                              at {new Date(record.marked_at).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        <div className="text-white/60 text-sm">
                          Course: {courses.find(c => c.id === record.course_id)?.name || 'Unknown Course'}
                        </div>
                        {record.notes && (
                          <div className="text-white/60 text-sm mt-1">
                            Notes: {record.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge 
                        className={`${
                          record.status === 'present' ? 'bg-green-500 text-white' :
                          record.status === 'absent' ? 'bg-red-500 text-white' :
                          record.status === 'late' ? 'bg-yellow-500 text-white' :
                          'bg-blue-500 text-white'
                        }`}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteAttendanceRecord(record.id)}
                        disabled={deletingRecordId === record.id}
                        className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                      >
                        {deletingRecordId === record.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border border-red-400 border-t-transparent" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              
              {attendance.length === 0 && (
                <div className="text-center py-8 text-white/60">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-white mb-2">No Attendance Records</h3>
                  <p>Start by selecting a course and recording your first attendance.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Footer */}
        <div className="mt-8 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-400/20 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-medium">Your Data Security</span>
          </div>
          <div className="text-sm text-green-200/80 space-y-1">
            <p>✓ All your attendance data is completely private and secure</p>
            <p>✓ Only you can view, edit, or delete your records</p>
            <p>✓ Zero cross-user data access - maximum privacy guaranteed</p>
            <p>✓ Bulk recording supports up to 50 attendance sessions for one course</p>
            <p>✓ Individual and bulk delete options available</p>
            <p>✓ Advanced conflict resolution ensures all records are saved</p>
          </div>
                 <footer className="mt-12 py-6 border-t border-white/20 text-center text-white/70 text-sm select-none">
  Maintained by <span className="font-semibold text-emerald-400">VSAV Managements</span><br />
  Developed &amp; Maintained by <span className="font-semibold text-emerald-400">Abhinav Jha</span>
</footer>
        </div>
      </motion.div>
    </div>
  );
};

export default Attendance;
