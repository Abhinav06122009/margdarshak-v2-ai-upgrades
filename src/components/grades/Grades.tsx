import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Trash2, Search, Filter, X, LayoutGrid, List, Award, TrendingUp, CheckCircle, Shield, AlertCircle, Palette, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { TiltCard } from '@/components/ui/TiltCard';
import { gradeService } from './gradeService';
import type { Grade, GradeFormData, SecureUser, GradeStats } from './types';
import ParallaxBackground from '@/components/ui/ParallaxBackground';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import GradeCard from './GradeCard';
import GradeHeader from './GradeHeader';
import Achievements from './Achievements.tsx';
import { achievementService } from './achievements';
import type { Achievement } from './achievements';

const Grades: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [filteredGrades, setFilteredGrades] = useState<Grade[]>([]);
  const [gradeStats, setGradeStats] = useState<GradeStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [currentUser, setCurrentUser] = useState<SecureUser | null>(null);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [formData, setFormData] = useState<GradeFormData>({
    subject: '',
    assignment_name: '',
    grade: 0,
    total_points: 100,
    date_recorded: new Date().toISOString().split('T')[0],
    semester: '',
    grade_type: 'assignment',
    notes: '',
    weight: 1.0,
    is_extra_credit: false,
  });

  const { toast } = useToast();

  useEffect(() => {
    initializeSecureGrades();
  }, []);

  useEffect(() => {
    setSelectedGrades([]);
  }, [viewMode, searchTerm, filterSubject, filterSemester, grades]); // Added grades to dependency array

  useEffect(() => {
    let results = grades;
    if (searchTerm) {
        results = results.filter(g => 
            g.assignment_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            g.subject.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    if (filterSubject !== 'all') {
        results = results.filter(g => g.subject === filterSubject);
    }
    if (filterSemester !== 'all') {
        results = results.filter(g => g.semester === filterSemester);
    }
    setFilteredGrades(results);
  }, [grades, searchTerm, filterSubject, filterSemester]);

  const handleSelectGrade = (gradeId: string) => {
    setSelectedGrades(prev =>
      prev.includes(gradeId)
        ? prev.filter(id => id !== gradeId)
        : [...prev, gradeId]
    );
  };

  const handleSelectAllGrades = () => {
    if (selectedGrades.length === filteredGrades.length) {
      setSelectedGrades([]);
    } else {
      setSelectedGrades(filteredGrades.map(grade => grade.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedGrades.length === 0) {
      toast({ title: "No Grades Selected", description: "Please select grades to delete.", variant: "warning" });
      return;
    }

    setModalState({
      isOpen: true,
      title: `Delete ${selectedGrades.length} Grades`,
      message: `Are you sure you want to permanently delete ${selectedGrades.length} selected grades? This action cannot be undone.`,
      onConfirm: async () => {
        if (!currentUser) return;
        try {
          await gradeService.bulkDeleteGrades(selectedGrades, currentUser.id);
          toast({ title: <span className="font-bold text-red-400">Bulk Delete Successful</span>, description: `${selectedGrades.length} grades have been removed.` });
          setSelectedGrades([]);
          const userGrades = await gradeService.fetchUserGrades(currentUser.id);
          setGrades(userGrades);
          const stats = gradeService.calculateStats(userGrades);
          setGradeStats(stats);
        } catch (error: any) {
          toast({ title: 'Error Bulk Deleting Grades', description: error.message, variant: 'destructive' });
        } finally {
          setModalState({ ...modalState, isOpen: false });
        }
      },
    });
  };

  const handleExportCsv = () => {
    if (filteredGrades.length === 0) {
      toast({ title: "No Grades to Export", description: "There are no grades to export to CSV.", variant: "warning" });
      return;
    }

    const gradesToExport = selectedGrades.length > 0
      ? filteredGrades.filter(grade => selectedGrades.includes(grade.id))
      : filteredGrades;

    const csv = gradeService.exportGradesToCsv(gradesToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'grades.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: <span className="font-bold text-green-400">Export Successful</span>, description: `${gradesToExport.length} grades exported to grades.csv.` });
  };

  const initializeSecureGrades = async () => {
    try {
      setLoading(true);
      const user = await gradeService.getCurrentUser();
      
      if (!user) {
        toast({ title: "Authentication Required", description: "Please log in to manage your grades.", variant: "destructive" });
        setSecurityVerified(true);
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      setSecurityVerified(true);
      
      const userGrades = await gradeService.fetchUserGrades(user.id);
      setGrades(userGrades);
      
      const stats = gradeService.calculateStats(userGrades);
      setGradeStats(stats);

      const achievementResult = achievementService.checkAchievements(userGrades);
      setAchievements(achievementResult.all);

      toast({
        title: <span className="font-bold text-emerald-400">Grades Loaded!</span>,
        description: `Welcome back ${user.profile?.full_name}! Your grades are loaded.`,
        icon: <Shield className="text-emerald-400" />
      });

    } catch (error) {
      console.error('Error initializing grades:', error);
      toast({ title: "Initialization Error", description: "Failed to initialize grade management.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !currentUser) return;
    setIsSubmitting(true);

    try {
      const updatableFormData: Partial<GradeFormData> = {
        subject: formData.subject,
        assignment_name: formData.assignment_name,
        grade: formData.grade,
        total_points: formData.total_points,
        date_recorded: formData.date_recorded,
        semester: formData.semester,
        grade_type: formData.grade_type,
        notes: formData.notes,
        weight: formData.weight,
        is_extra_credit: formData.is_extra_credit,
      };

      if (editingGrade) {
        await gradeService.updateGrade(editingGrade.id, updatableFormData, currentUser.id);
        toast({ title: <span className="font-bold text-emerald-400">Grade Updated!</span>, description: `${formData.assignment_name} has been updated.` });
      } else {
        await gradeService.createGrade(updatableFormData, currentUser.id);
        toast({ title: <span className="font-bold text-emerald-400">Grade Created!</span>, description: `${formData.assignment_name} has been added.` });
      }

      setIsSheetOpen(false);
      setEditingGrade(null);
      resetForm();
      
      const userGrades = await gradeService.fetchUserGrades(currentUser.id);
      setGrades(userGrades);
      const stats = gradeService.calculateStats(userGrades);
      setGradeStats(stats);

      const achievementResult = achievementService.checkAchievements(userGrades);
      setAchievements(achievementResult.all);

      if (achievementResult.unlocked.length > 0) {
        achievementResult.unlocked.forEach(achievement => {
          toast({
            title: <span className="font-bold text-yellow-400">Achievement Unlocked!</span>,
            description: `${achievement.name}: ${achievement.description}`,
            icon: <Award className="text-yellow-400" />
          });
        });
      }
      
    } catch (error: any) {
      toast({ title: 'Error Saving Grade', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    setFormData({
        ...grade,
        grade: Number(grade.grade),
        total_points: Number(grade.total_points),
        weight: grade.weight ? Number(grade.weight) : 1.0,
        date_recorded: new Date(grade.date_recorded).toISOString().split('T')[0],
    });
    setIsSheetOpen(true);
  };

  const handleDelete = async (gradeId: string, gradeName: string) => {
    setModalState({
      isOpen: true,
      title: `Delete Grade: ${gradeName}`,
      message: `Are you sure you want to permanently delete "${gradeName}"? This action cannot be undone.`,
      onConfirm: async () => {
        if (!currentUser) return;
        try {
          await gradeService.deleteGrade(gradeId, currentUser.id);
          toast({ title: <span className="font-bold text-red-400">Grade Deleted</span>, description: `${gradeName} has been removed.` });
          const userGrades = await gradeService.fetchUserGrades(currentUser.id);
          setGrades(userGrades);
          const stats = gradeService.calculateStats(userGrades);
          setGradeStats(stats);
        } catch (error: any) {
          toast({ title: 'Error Deleting Grade', description: error.message, variant: 'destructive' });
        } finally {
          setModalState({ ...modalState, isOpen: false });
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({
        subject: '',
        assignment_name: '',
        grade: 0,
        total_points: 100,
        date_recorded: new Date().toISOString().split('T')[0],
        semester: '',
        grade_type: 'assignment',
        notes: '',
        weight: 1.0,
        is_extra_credit: false,
    });
  };

  const openCreateDialog = () => {
    setEditingGrade(null);
    resetForm();
    setIsSheetOpen(true);
  };

  if (loading || !securityVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Initializing Gradebook...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white max-w-md p-8 bg-black/50 backdrop-blur-sm border border-white/20 rounded-2xl">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-white/80">Please Login To Access Your Gradebook.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center relative overflow-hidden">
      <ParallaxBackground />
      <ConfirmationModal {...modalState} onClose={() => setModalState({ ...modalState, isOpen: false })} />
      <div className="w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 z-10">
        <GradeHeader 
            onBack={onBack} 
            openCreateDialog={openCreateDialog} 
            userName={currentUser.profile?.full_name || 'Student'} 
        />

        {gradeStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-6 border-b border-white/10"
          >
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Award, value: `${gradeStats.average_grade.toFixed(1)}%`, label: 'Overall Average', gradient: 'from-blue-500 to-cyan-500'},
                { icon: TrendingUp, value: `${gradeStats.highest_grade.toFixed(1)}%`, label: 'Highest Grade', gradient: 'from-green-500 to-emerald-500'},
                { icon: CheckCircle, value: gradeStats.total_grades, label: 'Total Grades', gradient: 'from-purple-500 to-violet-500'},
                { icon: BookOpen, value: gradeStats.subjects.length, label: 'Subjects', gradient: 'from-pink-500 to-rose-500'},
              ].map((stat, index) => (
                <TiltCard key={stat.label} className="w-full h-full">
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0 } }}
                    transition={{ delay: 0.1 * index, type: 'spring', stiffness: 100 }}
                    className="bg-black/20 backdrop-blur-md p-6 rounded-3xl border border-white/10 h-full"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}><stat.icon className="w-7 h-7 text-white" /></div>
                      <span className="text-3xl font-bold text-white tracking-tighter">{stat.value}</span>
                    </div>
                    <h3 className="text-white/80 font-semibold text-base">{stat.label}</h3>
                  </motion.div>
                </TiltCard>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-6 space-y-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
                  <CardHeader><CardTitle className="text-white flex items-center gap-2"><Filter className="w-5 h-5 text-blue-400" /> Filter & Search</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                      <Input placeholder="Search grades..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-black/30 border-2 border-white/15 rounded-xl text-white" />
                    </div>
                    <Select value={filterSubject} onValueChange={setFilterSubject}>
                      <SelectTrigger className="bg-black/30 border-2 border-white/15 text-white rounded-xl"><SelectValue placeholder="Subject" /></SelectTrigger>
                      <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white">
                        <SelectItem value="all">All Subjects</SelectItem>
                        {gradeStats?.subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filterSemester} onValueChange={setFilterSemester}>
                      <SelectTrigger className="bg-black/30 border-2 border-white/15 text-white rounded-xl"><SelectValue placeholder="Semester" /></SelectTrigger>
                      <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white">
                        <SelectItem value="all">All Semesters</SelectItem>
                        {gradeStats?.semesters.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          <div className="lg:col-span-8 xl:col-span-9">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="selectAllGrades"
                  className="form-checkbox h-5 w-5 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500"
                  checked={selectedGrades.length === filteredGrades.length && filteredGrades.length > 0}
                  onChange={handleSelectAllGrades}
                />
                <label htmlFor="selectAllGrades" className="text-white/80">Select All ({selectedGrades.length})</label>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={selectedGrades.length === 0}
                  className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCsv}
                  disabled={filteredGrades.length === 0}
                  className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border-green-400"
                >
                  <List className="w-4 h-4 mr-2" /> Export to CSV
                </Button>
                <div className="bg-black/20 border border-white/10 rounded-xl p-1 flex items-center space-x-1">
                  <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}><LayoutGrid className="w-4 h-4" /></Button>
                  <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('table')}><List className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {viewMode === 'grid' && (
                <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredGrades.map((grade, index) => (
                    <GradeCard key={grade.id} grade={grade} index={index} onEdit={handleEdit} onDelete={handleDelete} isSelected={selectedGrades.includes(grade.id)} onSelect={handleSelectGrade} />
                  ))}
                </motion.div>
              )}
              {/* Add table view here if needed */}
            </AnimatePresence>

            {filteredGrades.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                 <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-8 border border-white/10 max-w-md mx-auto">
                    <BookOpen className="h-20 w-20 mx-auto text-white/50 mb-6" />
                    <h3 className="text-3xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">No Grades Found</h3>
                    <p className="text-white/80 mb-6 text-lg">Try adjusting your filters or create a new grade.</p>
                    <Button onClick={openCreateDialog} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-8 py-3 text-lg rounded-xl"> <Plus className="h-5 w-5 mr-2" /> Add Grade</Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <Achievements achievements={achievements} />

        <AnimatePresence>
          {isSheetOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSheetOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
              <motion.div
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 h-full w-full max-w-2xl bg-black/80 backdrop-blur-2xl border-l border-white/20 shadow-2xl z-50 flex flex-col"
              >
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center gap-3 text-xl text-white font-bold"><Palette className="w-6 h-6" />{editingGrade ? 'Edit Grade' : 'Create New Grade'}</div>
                  <Button variant="ghost" size="icon" onClick={() => setIsSheetOpen(false)}><X className="w-5 h-5" /></Button>
                </div>
                <div className="flex-grow overflow-y-auto p-6">
                  <form onSubmit={handleSubmit} className="space-y-8 p-1">
                    <div className="space-y-6 p-6 bg-black/20 rounded-2xl border border-white/10">
                        <h3 className="text-2xl font-extrabold text-white mb-4 flex items-center gap-3"><BookOpen className="w-7 h-7" /> Grade Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="assignment_name" className="text-base font-semibold text-white/90">Assignment Name *</Label>
                                <Input id="assignment_name" value={formData.assignment_name} onChange={(e) => setFormData({ ...formData, assignment_name: e.target.value })} required className="text-base bg-black/30 border-2 border-white/15 text-white"/>
                            </div>
                            <div>
                                <Label htmlFor="subject" className="text-base font-semibold text-white/90">Subject *</Label>
                                <Input id="subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required className="text-base bg-black/30 border-2 border-white/15 text-white"/>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="notes" className="text-base font-semibold text-white/90">Notes</Label>
                            <Textarea id="notes" value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="min-h-[120px] text-base bg-black/30 border-2 border-white/15 text-white"/>
                        </div>
                    </div>
                    <div className="space-y-6 p-6 bg-black/20 rounded-2xl border border-white/10">
                        <h3 className="text-2xl font-extrabold text-white mb-4 flex items-center gap-3"><TrendingUp className="w-7 h-7" /> Grade Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="grade" className="text-base font-semibold text-white/90">Grade *</Label>
                                <Input id="grade" type="number" value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) })} required className="text-base bg-black/30 border-2 border-white/15 text-white"/>
                            </div>
                            <div>
                                <Label htmlFor="total_points" className="text-base font-semibold text-white/90">Total Points *</Label>
                                <Input id="total_points" type="number" value={formData.total_points} onChange={(e) => setFormData({ ...formData, total_points: Number(e.target.value) })} required className="text-base bg-black/30 border-2 border-white/15 text-white"/>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="date_recorded" className="text-base font-semibold text-white/90">Date</Label>
                                <Input id="date_recorded" type="date" value={formData.date_recorded} onChange={(e) => setFormData({ ...formData, date_recorded: e.target.value })} className="text-base bg-black/30 border-2 border-white/15 text-white"/>
                            </div>
                            <div>
                                <Label htmlFor="grade_type" className="text-base font-semibold text-white/90">Type</Label>
                                <Select value={formData.grade_type} onValueChange={(v) => setFormData({...formData, grade_type: v})}>
                                    <SelectTrigger className="text-base bg-black/30 border-2 border-white/15 text-white"><SelectValue/></SelectTrigger>
                                    <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white">
                                        {gradeService.getGradeCategories().map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-white/10">
                      <Button type="button" variant="ghost" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : (editingGrade ? 'Update Grade' : 'Create Grade')}</Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      <footer className="w-full mt-12 py-8 border-t border-white/20 text-white/70 text-center relative z-10">
        <p>Developed by <span className="font-semibold text-emerald-400">VSAV GYANTAPA</span> | © 2025 VSAV GYANTAPA</p>
      </footer>
    </div>
  );
};

export default Grades;