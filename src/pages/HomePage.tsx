
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Calendar, CheckSquare, BookOpen, Trophy, Timer, Calculator, LogOut, User, TrendingUp, Target, Zap, Star, Bell, Sparkles, Search, Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PremiumCard } from '@/components/ui/premium-card';
import { StaggerContainer, StaggerItem } from '@/components/ui/advanced-animations';
import { motion } from 'framer-motion';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  totalStudyTime: number;
  averageGrade: number;
  upcomingClasses: number;
  totalNotes: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  created_at: string;
}

interface StudySession {
  id: string;
  subject?: string;
  duration: number;
  start_time: string;
  session_type: string;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    totalStudyTime: 0,
    averageGrade: 0,
    upcomingClasses: 0,
    totalNotes: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
    fetchDashboardData();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setUser({ ...user, profile });
    }
  };

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch study sessions
      const { data: studySessions } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false })
        .limit(3);

      // Fetch grades
      const { data: grades } = await supabase
        .from('grades')
        .select('*')
        .eq('user_id', user.id);

      // Fetch timetable
      const { data: timetable } = await supabase
        .from('user_timetables')
        .select('*')
        .eq('user_id', user.id);

      // Fetch notes
      const { data: notes } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id);

      // Calculate stats
      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(task => task.status === 'completed').length || 0;
      const totalStudyTime = studySessions?.reduce((total, session) => total + session.duration, 0) || 0;
      const averageGrade = grades?.length ? 
        grades.reduce((sum, grade) => sum + (grade.grade / grade.total_points * 100), 0) / grades.length : 0;

      setStats({
        totalTasks,
        completedTasks,
        totalStudyTime,
        averageGrade,
        upcomingClasses: timetable?.length || 0,
        totalNotes: notes?.length || 0,
      });

      setRecentTasks(tasks?.slice(0, 3) || []);
      setRecentSessions(studySessions || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task status updated",
      });

      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task deleted successfully",
      });

      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleCreateQuickTask = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('tasks')
        .insert([{
          title: 'New Quick Task',
          description: 'Click to edit this task',
          status: 'pending',
          user_id: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quick task created",
      });

      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'in_progress':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'in_progress':
        return <div className="w-2 h-2 bg-orange-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-lg">
              VSAV
            </div>
            <div className="flex items-center space-x-6">
              <button className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium">
                This Month
              </button>
              <button className="text-slate-600 hover:text-slate-900 px-4 py-2 text-sm">Today</button>
              <button className="text-slate-600 hover:text-slate-900 px-4 py-2 text-sm">This Week</button>
              <button className="text-slate-600 hover:text-slate-900 px-4 py-2 text-sm">Reports</button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg">
              <Bell className="w-5 h-5 text-slate-600" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg">
              <Search className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center space-x-3 bg-white rounded-lg px-4 py-2 shadow-sm border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-600 to-slate-800 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-slate-900 font-medium text-sm">{user?.profile?.full_name || 'Student'}</span>
                <div className="text-slate-500 text-xs">Student</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">
              Manage and track your studies
            </h1>
            <h2 className="text-4xl font-bold text-slate-900">Study Dashboard</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Task, Meeting, Projects..."
              className="pl-10 pr-4 py-3 w-80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
            />
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* My Tasks Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">My Tasks</h3>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleCreateQuickTask}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>
                <button 
                  onClick={() => onNavigate('tasks')}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <MoreHorizontal className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
            
            <div className="flex space-x-2 mb-6">
              <button className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm">Recent</button>
              <button className="text-slate-600 px-4 py-2 text-sm">Today</button>
            </div>

            <div className="space-y-4">
              {recentTasks.length > 0 ? (
                recentTasks.map((task, index) => (
                  <div key={task.id} className={`flex items-center space-x-3 p-3 rounded-lg border-l-4 ${index === 0 ? 'border-l-red-500 bg-red-50' : index === 1 ? 'border-l-blue-500 bg-blue-50' : 'border-l-green-500 bg-green-50'}`}>
                    {getStatusIcon(task.status)}
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{task.title}</div>
                      <div className="text-sm text-slate-600">{task.description || 'No description'}</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleTaskStatusUpdate(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          task.status === 'completed' 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {task.status === 'completed' && <CheckSquare className="w-3 h-3 text-white" />}
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <CheckSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No tasks found</p>
                  <button 
                    onClick={handleCreateQuickTask}
                    className="mt-2 text-slate-600 hover:text-slate-900 text-sm"
                  >
                    Create your first task
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Academic Progress */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Academic Progress</h3>
              <button className="p-2 hover:bg-slate-100 rounded-lg">
                <MoreHorizontal className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="mb-6">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#f1f5f9"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(stats.completedTasks / (stats.totalTasks || 1)) * 351.86} 351.86`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{stats.completedTasks}</div>
                    <div className="text-sm text-slate-600">of {stats.totalTasks}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">Completed: {stats.completedTasks}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                  <span className="text-sm text-slate-600">Pending: {stats.totalTasks - stats.completedTasks}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="text-sm text-slate-600 mb-2">Study Time: {Math.floor(stats.totalStudyTime / 60)}h {stats.totalStudyTime % 60}m</div>
              <div className="text-sm text-slate-600">Average Grade: {stats.averageGrade.toFixed(1)}%</div>
            </div>
          </div>

          {/* Study Sessions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Recent Study Sessions</h3>
              <button 
                onClick={() => onNavigate('timer')}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <Timer className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="space-y-4">
              {recentSessions.length > 0 ? (
                recentSessions.map((session, index) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-slate-600">Session</div>
                      <div className="text-sm font-medium text-slate-900">{session.subject || 'General Study'}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-600">{Math.floor(session.duration / 60)}h {session.duration % 60}m</span>
                      <div className={`w-4 h-4 rounded flex items-center justify-center ${index === 0 ? 'bg-green-500' : 'bg-blue-500'}`}>
                        <span className="text-xs text-white">{index === 0 ? '📚' : '💻'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Timer className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No study sessions yet</p>
                  <button 
                    onClick={() => onNavigate('timer')}
                    className="mt-2 text-slate-600 hover:text-slate-900 text-sm"
                  >
                    Start your first session
                  </button>
                </div>
              )}

              <button 
                onClick={() => onNavigate('timer')}
                className="w-full text-center text-blue-600 text-sm font-medium py-2 hover:bg-blue-50 rounded-lg"
              >
                Start New Session →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { page: 'timetable', icon: Calendar, title: 'Timetable', desc: `${stats.upcomingClasses} classes`, color: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-50' },
            { page: 'tasks', icon: CheckSquare, title: 'Tasks', desc: `${stats.totalTasks} total tasks`, color: 'from-pink-500 to-rose-600', bg: 'bg-pink-50' },
            { page: 'timer', icon: Timer, title: 'Study Timer', desc: `${Math.floor(stats.totalStudyTime / 60)}h total`, color: 'from-green-500 to-emerald-600', bg: 'bg-green-50' },
            { page: 'notes', icon: BookOpen, title: 'Notes', desc: `${stats.totalNotes} saved notes`, color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50' },
            { page: 'grades', icon: Trophy, title: 'Grades', desc: `${stats.averageGrade.toFixed(1)}% average`, color: 'from-yellow-500 to-orange-600', bg: 'bg-yellow-50' },
            { page: 'calculator', icon: Calculator, title: 'Calculator', desc: 'Math calculations', color: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-50' }
          ].map((item, index) => (
            <motion.button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`${item.bg} p-6 rounded-2xl text-left hover:shadow-md transition-all duration-200 border border-slate-200 group`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${item.color} mb-4`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
