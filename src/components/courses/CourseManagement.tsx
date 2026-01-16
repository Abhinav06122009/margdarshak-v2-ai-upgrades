import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Trash2, Book, Users, Calendar, Search, Filter, BookOpen, X, LayoutGrid, List,
  GraduationCap, Shield, AlertCircle, CheckCircle, Eye, BarChart3,
  ArrowLeft, Palette, Clock, MapPin, User, Star, TrendingUp, Zap, Youtube, FileText, Code, Route
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label'; 
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react'; 
import { Link } from 'react-router-dom';
import { courseService } from '@/components/dashboard/courseService';
import type { Course, CourseFormData, SecureUser, CourseStats } from '@/components/dashboard/course'; 
import { recommendationService, RecommendedCourse, LearningPath, CuratedContent } from './recommendationService';
import CourseCard from './CourseCard';
import CourseFocusView from './CourseFocusView';
import ParallaxBackground from '@/components/ui/ParallaxBackground';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const linkedinLogo = () => (
  <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
  </svg>
);

const TwitterLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z"/>
  </svg>
);

interface CourseManagementProps {
  onBack?: () => void;
}

const CourseTable: React.FC<{ courses: Course[], onEdit: (course: Course) => void, onDelete: (id: string, name: string) => void }> = ({ courses, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
      <table className="w-full min-w-[640px] text-sm text-left text-white/80">
        <thead className="text-xs text-white/60 uppercase bg-white/5">
          <tr>
            <th scope="col" className="px-6 py-3">Course Name</th>
            <th scope="col" className="px-6 py-3">Code</th>
            <th scope="col" className="px-6 py-3">Credits</th>
            <th scope="col" className="px-6 py-3">Difficulty</th>
            <th scope="col" className="px-6 py-3">Priority</th>
            <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <motion.tbody layout>
          <AnimatePresence>
            {courses.map((course, index) => (
              <motion.tr
                key={course.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-white/10 hover:bg-white/10 transition-colors duration-200 group"
              >
                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap flex items-center gap-3">
                  <div className="w-2 h-6 rounded" style={{ backgroundColor: courseService.getCourseBackgroundColor(course) }}></div>
                  {course.name}
                </th>
                <td className="px-6 py-4 font-mono text-white/70">{course.code}</td>
                <td className="px-6 py-4">{course.credits}</td>
                <td className="px-6 py-4" style={{ color: courseService.getDifficultyColor(course.difficulty) }}>
                  <span className="flex items-center gap-2 capitalize" style={{ color: courseService.getDifficultyColor(course.difficulty) }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: courseService.getDifficultyColor(course.difficulty) }}></div>
                    {course.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4 capitalize">{course.priority}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(course)} 
                      className="h-8 w-8 p-0 hover:bg-white/10 text-white"
                      title="Edit Course"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(course.id, course.name)}
                      className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400 text-white"
                      title="Delete Course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </motion.tbody>
      </table>
    </div>
  );
};

const CourseManagement: React.FC<CourseManagementProps> = ({ onBack }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showColorLegend, setShowColorLegend] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [currentUser, setCurrentUser] = useState<SecureUser | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [recommendations, setRecommendations] = useState<RecommendedCourse[]>([]);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const [focusedCourse, setFocusedCourse] = useState<Course | null>(null);
  const [curatedContent, setCuratedContent] = useState<CuratedContent[]>([]);
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    code: '',
    description: '',
    grade_level: '',
    semester: '',
    academic_year: new Date().getFullYear().toString(),
    credits: 3,
    color: '#3B82F6',
    priority: 'medium',
    difficulty: 'intermediate',
  });

  const { toast } = useToast();

  useEffect(() => {
    initializeSecureCourseManagement();
  }, []);

  useEffect(() => {
    if (currentUser) {
      performSearch();
    }
  }, [currentUser, searchTerm, filterGrade, filterDifficulty]);

  const initializeSecureCourseManagement = async () => {
    try {
      setLoading(true);
      
      const user = await courseService.getCurrentUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to manage your courses.",
          variant: "destructive",
        });
        setSecurityVerified(true);
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      setSecurityVerified(true);
      
      const [userCourses, stats] = await Promise.all([
        courseService.fetchUserCourses(user.id),
        courseService.getCourseStatistics(user.id)
      ]);

      const aiRecommendations = await recommendationService.getPersonalizedRecommendations(user.id, userCourses);
      
      setCourses(userCourses);
      setFilteredCourses(userCourses);
      setCourseStats(stats);
      setRecommendations(aiRecommendations);

 toast({
   title: (
     <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
      Courses Loaded Successfully!
     </span>
   ),
   description: (
     <span className="text-white font-medium">
       Welcome Back <span className="text-emerald-400 font-semibold">{user.profile?.full_name}</span>! Your Courses Is Updated.
     </span>
   ),
   className: "bg-black border border-emerald-500/50 shadow-xl", 
   icon: <Shield className="text-emerald-400" />
 });


    } catch (error) {
      console.error('Error initializing course management:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize course management.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    if (!currentUser) return;

    try {
      const results = await courseService.searchUserCourses(
        currentUser.id,
        searchTerm.trim() || undefined,
        filterGrade === 'all' ? undefined : filterGrade,
        filterDifficulty === 'all' ? undefined : filterDifficulty
      );
      setFilteredCourses(results);
    } catch (error) {
      console.error('Error performing search:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to manage courses.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const enhancedData = {
        ...formData,
        color: formData.color || courseService.getCourseBackgroundColor({
          color: formData.color
        } as Course),
      };

      if (editingCourse) {
        await courseService.updateCourse(editingCourse.id, enhancedData, currentUser.id);
toast({
  title: (
    <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
    Course Updated!
    </span>
  ),
  description: (
    <span className="text-white font-medium">
      <span className="font-semibold">{formData.name}</span> has been updated.
    </span>
  ),
  className: "bg-black border border-emerald-500/50 shadow-xl", 
  icon: <Shield className="text-emerald-400" />,
  duration: 2000,         
  isClosable: true,       
  position: "top-right",  
});

} else {
  await courseService.createCourse(enhancedData, currentUser.id);
  toast({
    title: (
      <span className="bg-gradient-to-r from-pink-400 via-yellow-400 to-emerald-400 bg-clip-text text-transparent font-bold">
      Course Created!
      </span>
    ),
    description: (
      <span className="text-white font-medium">
        <span className="text-emerald-400 font-semibold">{formData.name}</span> Has Been Added<span className="text-yellow-400"></span>
      </span>
    ),
    className: "bg-black border border-emerald-500/50 shadow-2xl", 
    icon: <Sparkles className="text-yellow-400" />,
    duration: 5000,
    isClosable: true,
    position: "top-right",
  });
}

      setIsSheetOpen(false);
      setEditingCourse(null);
      resetForm();
      
      const userCourses = await courseService.fetchUserCourses(currentUser.id);
      setCourses(userCourses);
      await performSearch();
      
      const stats = await courseService.getCourseStatistics(currentUser.id);
      setCourseStats(stats);

      const newRecommendations = await recommendationService.getPersonalizedRecommendations(currentUser.id, userCourses);
      setRecommendations(newRecommendations);
    } catch (error: any) {
      console.error('Error saving course:', error);
      toast({
        title: 'Error Saving Course',
        description: `Failed to save course: ${error.message || 'Please try again.'}`,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      description: course.description || '',
      grade_level: course.grade_level || '',
      semester: course.semester || '',
      academic_year: course.academic_year || new Date().getFullYear().toString(),
      credits: course.credits || 3,
      color: course.color || '#3B82F6',
      priority: course.priority || 'medium',
      difficulty: course.difficulty || 'intermediate',
    });
    recommendationService.getCuratedContent(course).then(content => {
      setCuratedContent(content);
    });
    setIsSheetOpen(true);
  };

  const handleDelete = async (courseId: string, courseName: string) => {
    setModalState({
      isOpen: true,
      title: `Delete Course: ${courseName}`,
      message: `Are you sure you want to permanently delete "${courseName}"? This action cannot be undone.`,
      onConfirm: async () => {
        if (!currentUser) return;
        try {
          await courseService.deleteCourse(courseId, currentUser.id);
          toast({
            title: (
              <span className="bg-gradient-to-r from-pink-500 via-red-500 to-rose-400 bg-clip-text text-transparent font-bold">
                Course Deleted Successfully
              </span>
            ),
            description: (
              <span className="text-white font-medium">
                <span className="text-rose-400 font-semibold">{courseName}</span> has been removed.
              </span>
            ),
            className: "bg-black border border-red-500/50 shadow-2xl", 
            icon: <Trash2 className="text-rose-400" />,
          });
          const userCourses = await courseService.fetchUserCourses(currentUser.id);
          setCourses(userCourses);
          const stats = await courseService.getCourseStatistics(currentUser.id);
          setCourseStats(stats);
        } catch (error: any) {
          toast({ title: 'Error Deleting Course', description: `Failed to delete course: ${error.message}`, variant: 'destructive' });
        } finally {
          setModalState({ ...modalState, isOpen: false });
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      grade_level: '',
      semester: '',
      academic_year: new Date().getFullYear().toString(),
      credits: 3,
      color: '#3B82F6',
      priority: 'medium',
      difficulty: 'intermediate',
    });
  };

  const openCreateDialog = () => {
    setEditingCourse(null);
    resetForm();
    setIsSheetOpen(true);
  };

  const handleGeneratePath = async () => {
    if (!currentUser) return;
    const path = await recommendationService.generateLearningPath(currentUser.id, "Full-Stack Developer");
    setLearningPath(path);
    toast({
      title: (
        <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent font-bold">
          AI Learning Path Generated!
        </span>
      ),
      description: "Your personalized learning path is ready to view.",
      className: "bg-black border border-blue-500/50 shadow-xl", 
      icon: <Route className="text-blue-400" />,
    });
    setIsPathModalOpen(true);
  };

  const handleFocusCourse = (course: Course) => {
    setFocusedCourse(course);
  };

  if (loading || !securityVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 border border-white/20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing Multi-Color Course System...</p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-green-300 text-sm">Secure • Private • Color-Coded</span>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 border border-white/20 text-center max-w-md">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-white/80 mb-6">Please Login To Access Your Courses.</p>
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2 text-sm text-white/70">
              <Shield className="w-4 h-4" />
              <span>Your Data Is Private & Secure</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-white/70">
              <Palette className="w-4 h-4" />
              <span>Full Course system available after login</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <ParallaxBackground />
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
      />
      <div className="w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 z-10">
      {/* Enhanced Multi-Color Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden border-b border-white/20"
        style={{
          background: `linear-gradient(135deg, #3B82F615, #10B98110, #EF444415)`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        {/* Multi-color accent strips */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          {courseService.getCourseCategories().slice(0, 6).map((category, index) => (
            <motion.div 
              key={index}
              className="flex-1 h-full"
              style={{ backgroundColor: category.color }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            />
          ))}
        </div>

        <div className="relative px-6 py-6">
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              {/* Left section */}
              <div className="flex items-center space-x-6">
                {onBack && (
                  <motion.button
                    onClick={onBack}
                    className="group p-3 bg-blur/transparent hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="w-5 h-5 text-white group-hover:text-white transition-colors" />
                  </motion.button>
                )}
                
                <div>
                  <motion.h1 
                    className="text-5xl font-black text-white mb-2 flex items-center gap-4 bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent drop-shadow-xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    📚 Course Management
                  </motion.h1>
                  <motion.p 
                    className="text-white/80 text-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Advanced course system for <span className="font-semibold text-white">{currentUser.profile?.full_name}</span>
                  </motion.p>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <motion.div 
                      className="flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full border border-white/20"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Eye className="w-4 h-4 text-green-300" />
                      <span className="text-white text-sm font-medium">Private Workspace</span>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full border border-white/20"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <BookOpen className="w-4 h-4 text-blue-300" />
                      <span className="text-white text-sm font-medium">{courses.length} Courses</span>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Right section */}
              <div className="flex items-center space-x-4">
                
                
                  
                    <motion.button
                      onClick={openCreateDialog}
                      className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 px-8 py-4 font-bold text-lg text-white shadow-lg transition-all duration-300 ease-out hover:from-purple-700 hover:to-blue-700 hover:shadow-xl hover:shadow-purple-500/50 active:scale-95"
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <span className="absolute inset-0 flex h-full w-full justify-center [transform:skewX(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skewX(-12deg)_translateX(100%)] bg-white/30" />
                      <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180 mr-3 z-10" />
                      <span className="relative z-10">Create Course</span>
                    </motion.button>
                  
                
              </div>
            </div>
          </div>
        </div>

        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(90deg, ${courseService.getCourseCategories().map(c => c.color).join(', ')})`,
            opacity: 0.8
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        />
      </motion.div>


      {/* AI Recommendation System */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 border-b border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-400" />
              AI Recommendations
            </h2>
            <Button variant="outline" onClick={handleGeneratePath} className="text-yellow-300 border-yellow-400/50 hover:bg-yellow-500/10 hover:text-yellow-200">
              <Route className="w-4 h-4 mr-2" />
              Generate Learning Path
            </Button>
          </div>
          <div className="flex space-x-6 overflow-x-auto pb-4 custom-scrollbar">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                transition={{ delay: 0.1 * index }}
                className="w-80 flex-shrink-0"
              >
                <motion.div className="w-full h-full">
                  <div
                    className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl p-6 h-full flex flex-col justify-between shadow-lg hover:border-yellow-400/50 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                          <Book className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">{rec.name}</h3>
                      </div>
                      <p className="text-sm text-white/70 mb-4 line-clamp-2">
                        <span className="font-semibold text-yellow-300">Reason:</span> {rec.recommendationReason}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="capitalize">{rec.difficulty}</Badge>
                        <Badge variant="secondary">{rec.credits} cr</Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingCourse(null);
                          setFormData({
                            name: rec.name,
                            code: rec.code,
                            description: rec.description || '',
                            credits: rec.credits,
                            difficulty: rec.difficulty,
                            priority: rec.priority,
                            color: courseService.getCourseBackgroundColor(rec),
                            grade_level: '', semester: '', academic_year: ''
                          });
                          setIsSheetOpen(true);
                        }}
                      >Add to My Courses</Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Enhanced Statistics Dashboard */}
      {courseStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 border-b border-white/10"
        >
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: BookOpen, 
                value: courseStats.total_courses, 
                label: 'Total Courses', 
                gradient: 'from-blue-500 to-cyan-500'
              },
              { 
                icon: CheckCircle, 
                value: courseStats.active_courses, 
                label: 'Active Courses', 
                gradient: 'from-green-500 to-emerald-500'
              },
              { 
                icon: GraduationCap, 
                value: courseStats.completed_courses, 
                label: 'Completed', 
                gradient: 'from-purple-500 to-violet-500'
              },
              { 
                icon: BarChart3, 
                value: courseStats.total_credits, 
                label: 'Total Credits', 
                gradient: 'from-orange-500 to-amber-500'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="w-full h-full"
              >
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0 } }}
                  transition={{ delay: 0.1 * index, type: 'spring', stiffness: 120 }}
                  className="bg-black/20 backdrop-blur-md p-6 rounded-3xl border border-white/10 transition-all duration-300 group relative overflow-hidden shadow-soft-light hover:border-white/20 h-full"
                  whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(6, 182, 212, 0.7), inset 0 0 15px rgba(6, 182, 212, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                        <stat.icon className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-3xl font-bold text-white tracking-tighter">
                        {stat.value}
                      </span>
                    </div>
                    <h3 className="text-white/80 font-semibold text-base">{stat.label}</h3>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Content Area with 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Left Sticky Column */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-6 space-y-8">
            {/* Search and Filter Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-400" /> 
                    Filter & Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      className="pl-10 bg-black/30 border-2 border-white/15 rounded-xl text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300"
                    />
                  </div>
                  <Input
                    placeholder="Grade Level..."
                    value={filterGrade} 
                    onChange={(e) => setFilterGrade(e.target.value)}
                    className="bg-black/30 border-2 border-white/15 rounded-xl text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300"
                  />
                  <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                    <SelectTrigger className="bg-black/30 border-2 border-white/15 text-white rounded-xl shadow-neumorphic-inset-lg focus:border-blue-500/70">
                      <TrendingUp className="h-4 w-4 mr-2 text-white/70" />
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white shadow-neumorphic-lg">
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">🌱 Beginner</SelectItem>
                      <SelectItem value="intermediate">🚀 Intermediate</SelectItem>
                      <SelectItem value="advanced">🎯 Advanced</SelectItem>
                      <SelectItem value="expert">💎 Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={performSearch}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl shadow-neumorphic-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-500/60 transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Right Scrolling Column */}
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="flex justify-end mb-4">
            <div className="bg-black/20 border border-white/10 rounded-xl p-1 flex items-center space-x-1">
              <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className={`transition-all ${viewMode === 'grid' ? 'bg-white/10' : ''}`}>
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('table')} className={`transition-all ${viewMode === 'table' ? 'bg-white/10' : ''}`}>
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {viewMode === 'grid' ? (
              <motion.div 
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
              {filteredCourses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onFocus={handleFocusCourse}
                />
              ))}
              </motion.div>
            ) : (
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              ><CourseTable courses={filteredCourses} onEdit={handleEdit} onDelete={handleDelete} /></motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Empty State */}
          {filteredCourses.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-8 border border-white/10 max-w-md mx-auto shadow-glass-neumorphic-lg">
                <BookOpen className="h-20 w-20 mx-auto text-white/50 mb-6 animate-pulse-slow" />
                <h3 className="text-3xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  {searchTerm || filterGrade !== 'all' || filterDifficulty !== 'all' 
                    ? 'No courses match your filters'
                    : 'No courses found'}
                </h3>
                <p className="text-white/80 mb-6 text-lg leading-relaxed">
                  {searchTerm || filterGrade !== 'all' || filterDifficulty !== 'all'
                    ? 'Try adjusting your search criteria or create a new course to see it here.'
                    : 'It looks like you haven\'t added any courses yet. Let\'s create your first one!'
                  }
                </p>
                <Button 
                  onClick={openCreateDialog} 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-8 py-3 text-lg rounded-xl shadow-neumorphic-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-500/60 transform hover:-translate-y-1 transition-all duration-300 group"
                >
                  <Plus className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-90" />
                  Create Your First Course
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Slide-over Panel for Course Creation/Edit */}
      <AnimatePresence>
        {isSheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSheetOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            {/* Sheet Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full max-w-2xl bg-black/80 backdrop-blur-2xl border-l border-white/20 shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3 text-xl text-white font-bold">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  {editingCourse ? 'Edit Course' : 'Create New Course'}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSheetOpen(false)}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-6">
          
          <form onSubmit={handleSubmit} className="space-y-8 p-1">
            {/* Basic Course Information */}
            <div className="space-y-6 p-6 bg-black/20 rounded-2xl border border-white/10 shadow-glass-neumorphic">
              <h3 className="text-2xl font-extrabold text-white mb-4 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                <BookOpen className="w-7 h-7" /> Course Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-semibold text-white/90">Course Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Advanced Data Structures"
                    required
                    className="text-base bg-black/30 border-2 border-white/15 text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-base font-semibold text-white/90">Course Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., CS401"
                    required
                    className="text-base font-mono bg-black/30 border-2 border-white/15 text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold text-white/90">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed information about your course objectives, content, and expectations..."
                  className="min-h-[120px] text-base resize-none bg-black/30 border-2 border-white/15 text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300"
                />
              </div>
            </div>

            {/* Course Details - MADE GRADE LEVEL AND SEMESTER WRITEABLE */}
            <div className="space-y-6 p-6 bg-black/20 rounded-2xl border border-white/10 shadow-glass-neumorphic">
              <h3 className="text-2xl font-extrabold text-white mb-4 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
                <GraduationCap className="w-7 h-7" /> Course Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="grade_level" className="text-base font-semibold text-white/90">Grade Level</Label>
                  <Input
                    id="grade_level"
                    value={formData.grade_level}
                    onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                    placeholder="e.g., Grade 10, Undergraduate, Graduate"
                    className="text-base bg-black/30 border-2 border-white/15 text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="semester" className="text-base font-semibold text-white/90">Semester</Label>
                  <Input
                    id="semester"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    placeholder="e.g., Fall 2024, Spring 2025, Semester 1"
                    className="text-base bg-black/30 border-2 border-white/15 text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="academic_year" className="text-base font-semibold text-white/90">Academic Year</Label>
                  <Input
                    id="academic_year"
                    value={formData.academic_year}
                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                    placeholder="2024"
                    className="text-base bg-black/30 border-2 border-white/15 text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="credits" className="text-base font-semibold text-white/90">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })}
                    min="1"
                    max="12"
                    className="text-base bg-black/30 border-2 border-white/15 text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="color" className="text-base font-semibold text-white/90">Course Color</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-16 h-12 p-1 rounded-lg border-2 border-white/15 shadow-neumorphic-inset-lg"
                    />
                    <Input
                      type="text"
                      placeholder="#3B82F6"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 text-base font-mono bg-black/30 border-2 border-white/15 text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Course Classification */}
            <div className="space-y-6 p-6 bg-black/20 rounded-2xl border border-white/10 shadow-glass-neumorphic">
              <h3 className="text-2xl font-extrabold text-white mb-4 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                <TrendingUp className="w-7 h-7" /> Course Classification
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-base font-semibold text-white/90">Priority Level</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })} >
                    <SelectTrigger className="text-base bg-black/30 border-2 border-white/15 text-white rounded-xl shadow-neumorphic-inset-lg focus:border-blue-500/70">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white shadow-neumorphic-lg">
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-400" />
                          📝 Low Priority
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-400" />
                          📋 Medium Priority
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-400" />
                          ⚡ High Priority
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
                          🔥 Urgent Priority
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-base font-semibold text-white/90">Difficulty Level</Label>
                  <Select value={formData.difficulty} onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })} >
                    <SelectTrigger className="text-base bg-black/30 border-2 border-white/15 text-white rounded-xl shadow-neumorphic-inset-lg focus:border-blue-500/70">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white shadow-neumorphic-lg">
                      <SelectItem value="beginner">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-400" />
                          🌱 Beginner
                        </div>
                      </SelectItem>
                      <SelectItem value="intermediate">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-400" />
                          🚀 Intermediate
                        </div>
                      </SelectItem>
                      <SelectItem value="advanced">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-400" />
                          🎯 Advanced
                        </div>
                      </SelectItem>
                      <SelectItem value="expert">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-400" />
                          💎 Expert
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Curated Content Section */}
            {editingCourse && curatedContent.length > 0 && (
              <div className="space-y-4 p-6 bg-black/20 rounded-2xl border border-white/10 shadow-glass-neumorphic">
                <h3 className="text-2xl font-extrabold text-white mb-4 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">
                  <Zap className="w-7 h-7" /> AI Curated Content
                </h3>
                <div className="space-y-3">
                  {curatedContent.map((content, index) => (
                    <a
                      key={index}
                      href={content.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <div className="p-2 bg-cyan-500/20 rounded-md">
                        {content.type === 'video' && <Youtube className="w-5 h-5 text-cyan-300" />}
                        {content.type === 'article' && <FileText className="w-5 h-5 text-cyan-300" />}
                        {content.type === 'tutorial' && <Code className="w-5 h-5 text-cyan-300" />}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{content.title}</p>
                        <p className="text-xs text-white/60 capitalize">{content.type}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Multi-Color Preview Section */}
            <div className="space-y-4 p-6 bg-black/20 rounded-xl border-2 border-white/10 shadow-glass-neumorphic-lg">
              <h3 className="text-2xl font-extrabold text-white flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400">
                <Palette className="w-7 h-7" /> Live Multi-Color Preview
              </h3>
              
              <div 
                className="p-6 rounded-xl text-white text-base relative overflow-hidden shadow-lg"
                style={courseService.getCompleteCourseStyle({
                  color: formData.color,
                  priority: formData.priority,
                  difficulty: formData.difficulty,
                  name: formData.name
                })}
              >
                {/* Multi-color header strip */}
                <div className="absolute top-0 left-0 right-0 h-2 flex">
                  <div 
                    className="flex-1 h-full" 
                    style={{ backgroundColor: formData.color }}
                    title="Course Color"
                  />
                  <div 
                    className="flex-1 h-full" 
                    style={{ backgroundColor: courseService.getDifficultyColor(formData.difficulty) }}
                    title="Difficulty Level"
                  />
                </div>

                <div className="mt-3">
                  <div className="font-bold text-xl flex items-center gap-3 mb-2">
                    📚 {formData.name || 'Sample Course Title'}
                  </div>
                  
                  {formData.code && (
                    <div className="inline-block px-3 py-1 bg-black/30 rounded-full text-sm font-mono mb-2">
                      {formData.code}
                    </div>
                  )}

                  <div className="text-sm opacity-95 mb-2 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {formData.priority} Priority
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {formData.difficulty} Level
                    </span>
                  </div>

                  {formData.credits && (
                    <div className="text-sm opacity-90 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      {formData.credits} Credits
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-white/5 rounded-lg shadow-neumorphic-inset-xs">
                  <div className="font-semibold text-white/80">Color</div>
                  <div className="text-white/60 mt-1">{formData.color}</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg shadow-neumorphic-inset-xs">
                  <div className="font-semibold text-white/80">Priority</div>
                  <div className="text-white/60 mt-1 capitalize">{formData.priority}</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg shadow-neumorphic-inset-xs">
                  <div className="font-semibold text-white/80">Difficulty</div>
                  <div className="text-white/60 mt-1 capitalize">{formData.difficulty}</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg shadow-neumorphic-inset-xs">
                  <div className="font-semibold text-white/80">Credits</div>
                  <div className="text-white/60 mt-1">{formData.credits}</div>
                </div>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsSheetOpen(false);
                  resetForm();
                  setEditingCourse(null);
                }}
                className="px-8 py-3 text-base text-white/80 hover:bg-white/10 hover:text-white shadow-neumorphic-sm hover:shadow-neumorphic-lg transition-all duration-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="px-8 py-3 text-base bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-neumorphic-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-500/60 transform hover:-translate-y-1 transition-all duration-300"
              >
                {editingCourse ? 'Update' : 'Create'} Multi-Color Course
              </Button>
            </div>
          </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Learning Path Modal */}
      <Dialog open={isPathModalOpen} onOpenChange={setIsPathModalOpen}>
        <DialogContent className="bg-black/80 backdrop-blur-2xl border-white/20 text-white max-w-2xl">
          <DialogHeader className="pb-4 text-center">
            <DialogTitle className="text-3xl font-bold flex items-center justify-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400">
              <Route className="w-8 h-8" /> {learningPath?.title}
            </DialogTitle>
            <DialogDescription className="text-white/80 pt-2">
              {learningPath?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            {learningPath?.steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold text-lg shadow-lg">
                    {index + 1}
                  </div>
                  {index < learningPath.steps.length - 1 && (
                    <div className="w-0.5 h-8 bg-white/20 my-1"></div>
                  )}
                </div>
                <div className="flex-1 bg-black/20 p-4 rounded-lg border border-white/10">
                  <h4 className="font-bold text-white">{step.name}</h4>
                  <p className="text-sm text-white/70">{step.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="capitalize">{step.difficulty}</Badge>
                    <Badge variant="secondary">{step.credits} cr</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="pt-4">
            <Button
              onClick={() => setIsPathModalOpen(false)}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 text-base rounded-xl"
            >
              Start Learning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Multi-Color System Footer - FIXED CENTER ALIGNMENT */}
      <footer className="w-full mt-12 pt-8 border-t border-white/20 text-white/70 text-xs relative overflow-hidden">
        {/* Subtle animated gradient overlay */}
        <div className="absolute inset-0 z-0 opacity-20 animate-pulse-slow" style={{
          background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1), rgba(236, 72, 153, 0.1))',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 15s ease infinite'
        }}></div>
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center sm:text-left">
          {/* Column 1: Branding */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="font-bold text-base text-white mb-2">MARGDARSHAK</h3>
            <p className="text-white/50">by VSAV GYANTAPAS</p>
          </div>
          {/* Column 2: Legal */}
          <div>
            <h3 className="font-bold text-base text-white mb-2">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="hover:text-white hover:underline transition-colors duration-200">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white hover:underline transition-colors duration-200">Privacy Policy</Link></li>
            </ul>
          </div>
          {/* Column 3: Support */}
          <div>
            <h3 className="font-bold text-base text-white mb-2">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="hover:text-white hover:underline transition-colors duration-200">Help Center</Link></li>
              <li><a href="mailto:abhinavjha393@gmail.com" className="hover:text-white hover:underline transition-colors duration-200">Contact Us</a></li>
            </ul>
          </div>
          {/* Column 4: Social */}
          <div>
            <h3 className="font-bold text-base text-white mb-2">Follow Us</h3>
            <div className="flex justify-center sm:justify-start space-x-4">
               <a href="https://x.com/gyantappas" aria-label="Twitter" className="hover:text-white transition-colors"><TwitterLogo /></a>
                  <a href="https://www.facebook.com/profile.php?id=61584618795158" aria-label="Facebook" className="hover:text-white transition-colors"><FacebookLogo /></a>
                  <a href="https://www.linkedin.com/in/vsav-gyantapa-33893a399/" aria-label="Linkdelin" className="hover:text-white transition-colors"><linkedinLogo /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10 text-center relative z-10">
          <p>Developed by <span className="font-semibold text-emerald-400">VSAV GYANTAPA</span> | © 2025 VSAV GYANTAPA</p>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default CourseManagement;
