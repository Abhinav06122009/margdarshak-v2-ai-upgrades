import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, AlertCircle, Trophy, Calendar as CalendarIcon, Clock, Award, CheckCircle2, Zap, Folder, LineChart as LineChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import type { RealAnalytics, RealTask } from '@/types/dashboard';
import InteractiveCard from '@/components/ui/InteractiveCard';
import { cn } from '@/lib/utils';

interface AnalyticsPanelProps {
  analytics: RealAnalytics;
  tasks: RealTask[];
  taskPriorityAnalytics: {
    high: number;
    medium: number;
    low: number;
    other: number;
  };
  taskCompletionTrend: { date: string; completed: number }[];
  categoryAnalytics: { name: string; color: string; completionRate: number; timeSpent: number }[];
  className?: string;
}

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const StudyTimeTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/70 backdrop-blur-sm p-3 rounded-lg border border-white/20 text-white">
        <p className="label font-semibold">{`${label}`}</p>
        <p className="intro text-emerald-400">{`Study Time: ${formatTime(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

const TaskCompletionTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/70 backdrop-blur-sm p-3 rounded-lg border border-white/20 text-white">
        <p className="label font-semibold">{`${label}`}</p>
        <p className="intro text-blue-400">{`Completed: ${payload[0].value} tasks`}</p>
      </div>
    );
  }
  return null;
};

const COLORS = ['#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4d'];

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ analytics, tasks, taskPriorityAnalytics, taskCompletionTrend, categoryAnalytics, className }) => {
  const dailyStudyData = analytics.dailyStudyTime.slice(-7).map(d => ({
    name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    time: d.minutes,
  }));

  const subjectBreakdownData = analytics.subjectBreakdown.map(s => ({
    name: s.subject,
    value: s.time,
  }));

  const priorityCompletionData = [
    { name: 'High', value: taskPriorityAnalytics.high, color: '#EF4444' },
    { name: 'Medium', value: taskPriorityAnalytics.medium, color: '#F59E0B' },
    { name: 'Low', value: taskPriorityAnalytics.low, color: '#10B981' },
    { name: 'Other', value: taskPriorityAnalytics.other, color: '#6B7280' },
  ].filter(d => d.value > 0);

  const busiestDay = useMemo(() => {
    if (!tasks || tasks.length === 0) return 'N/A';

    const completionsByDay: Record<number, number> = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 };
    
    tasks.forEach(task => {
      // Use updated_at for completed tasks as a proxy for completion date
      if (task.status === 'completed' && task.updated_at) {
        const dayIndex = new Date(task.updated_at).getDay();
        completionsByDay[dayIndex]++;
      }
    });

    const busiestDayIndex = Object.keys(completionsByDay).map(Number).reduce((a, b) =>
      completionsByDay[a] > completionsByDay[b] ? a : b
    );

    if (completionsByDay[busiestDayIndex] === 0) return 'N/A';

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[busiestDayIndex];
  }, [tasks]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("bg-black/20 backdrop-blur-xl p-8 rounded-3xl border border-white/10", className)}
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-purple-400" />
          Your Analytics
        </h3>
        <div className="px-3 py-1 bg-purple-500/20 rounded-full text-sm text-purple-400 font-bold border border-purple-400/30">
          LIVE
        </div>
      </div>

      <div className="space-y-8">
        {/* Key Analytics Cards */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InteractiveCard className="w-full bg-red-900/20 border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white/80 font-semibold mb-1 text-sm">Incomplete Tasks</h4>
                <p className="text-2xl font-bold text-red-400">{analytics.incompleteTasksCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400/70" />
            </div>
          </InteractiveCard>

          <InteractiveCard className="w-full bg-emerald-900/20 border-emerald-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white/80 font-semibold mb-1 text-sm">Top Grade</h4>
                <p className="text-2xl font-bold text-emerald-400">
                  {analytics.topGrades.length > 0 ? `${analytics.topGrades[0].percentage.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-emerald-400/70" />
            </div>
          </InteractiveCard>

          <InteractiveCard className="w-full bg-blue-900/20 border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white/80 font-semibold mb-1 text-sm">Total Classes</h4>
                <p className="text-2xl font-bold text-blue-400">{analytics.totalClasses}</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-blue-400/70" />
            </div>
          </InteractiveCard>

          <InteractiveCard className="w-full bg-purple-900/20 border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white/80 font-semibold mb-1 text-sm">Busiest Day</h4>
                <p className="text-2xl font-bold text-purple-400 truncate">
                  {busiestDay}
                </p>
              </div>
              <Zap className="w-8 h-8 text-purple-400/70" />
            </div>
          </InteractiveCard>
        </motion.div>

        {/* Study Time Chart */}
        <div>
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Study Sessions (Last 7 Days)
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStudyData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255, 255, 255, 0.5)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}m`} />
                <Tooltip content={<StudyTimeTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                <Bar dataKey="time" fill="url(#colorStudyTime)" radius={[4, 4, 0, 0]}>
                  {(dailyStudyData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorStudyTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Task Completion Trend */}
        <div>
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            <LineChartIcon className="w-4 h-4 text-blue-400" />
            Task Completion Trend (Last 7 Days)
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={taskCompletionTrend} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.5)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255, 255, 255, 0.5)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<TaskCompletionTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Area type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Performance */}
        {categoryAnalytics.length > 0 && (
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Folder className="w-4 h-4 text-green-400" />
              Category Performance
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryAnalytics} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis type="number" domain={[0, 100]} stroke="rgba(255, 255, 255, 0.5)" fontSize={12} tickFormatter={(value) => `${value}%`} />
                  <YAxis type="category" dataKey="name" stroke="rgba(255, 255, 255, 0.5)" fontSize={12} width={80} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} formatter={(value) => `${(value as number).toFixed(0)}%`} />
                  <Bar dataKey="completionRate" name="Completion Rate" radius={[0, 4, 4, 0]}>
                    {categoryAnalytics.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Time Allocation by Category */}
        {categoryAnalytics.filter(c => c.timeSpent > 0).length > 0 && (
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              Time Allocation by Category
            </h4>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryAnalytics} dataKey="timeSpent" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} fill="#8884d8">
                    {categoryAnalytics.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} stroke={entry.color} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatTime(value as number)} />
                  <Legend wrapperStyle={{fontSize: "12px"}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Subject Breakdown Pie Chart */}
        {subjectBreakdownData.length > 0 && (
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" />
              Subject Breakdown
            </h4>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    animationBegin={200}
                    animationDuration={800}
                  >
                    {subjectBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} formatter={(value) => formatTime(value as number)} />
                  <Legend wrapperStyle={{fontSize: "12px"}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Task Completion by Priority */}
        {priorityCompletionData.length > 0 && (
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Completed Tasks by Priority
            </h4>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityCompletionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    animationBegin={400}
                    animationDuration={800}
                  >
                    {priorityCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                  <Legend wrapperStyle={{fontSize: "12px"}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AnalyticsPanel;