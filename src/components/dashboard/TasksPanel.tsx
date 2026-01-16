import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Plus, Search, ChevronDown, AlertCircle, Trash2, Download, Eye, Inbox, X } from 'lucide-react';
import TaskItem from './TaskItem';
import type { RealTask } from '@/types/dashboard';
import { cn } from '@/lib/utils';
import NeumorphicButton from '@/lib/NeumorphicButton';
import { Button } from '@/components/ui/button';

interface TasksPanelProps {
  tasks: RealTask[];
  filteredTasks: RealTask[];
  selectedTasks: string[];
  taskFilter: 'all' | 'pending' | 'completed' | 'overdue';
  searchTerm: string;
  sortBy: 'date' | 'priority' | 'name';
  onTaskFilterChange: (filter: 'all' | 'pending' | 'completed' | 'overdue') => void;
  onSearchTermChange: (term: string) => void;
  onSortByChange: (sort: 'date' | 'priority' | 'name') => void;
  onSelectTask: (id: string) => void;
  onStatusUpdate: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onCreateQuickTask: () => void;
  onBulkAction: (action: 'complete' | 'delete' | 'export') => void;
  onNavigateToTasks: () => void;
  onSelectAllTasks: () => void;
  onClearSelection: () => void;
  className?: string;
}

const getPriorityClasses = (priority: string) => {
  switch (priority) {
    case 'high': return 'text-red-300 bg-red-500/20 border-red-400/30';
    case 'medium': return 'text-amber-300 bg-amber-500/20 border-amber-400/30';
    case 'low': return 'text-emerald-300 bg-emerald-500/20 border-emerald-400/30';
    default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  }
};

const getStatusBorderColor = (status: string) => {
  switch (status) {
    case 'completed': return 'border-emerald-500/50';
    case 'in_progress': return 'border-amber-500/50';
    case 'pending': return 'border-blue-500/50';
    default: return 'border-gray-600/50';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const TasksPanel: React.FC<TasksPanelProps> = ({
  tasks,
  filteredTasks,
  selectedTasks,
  taskFilter,
  searchTerm,
  sortBy,
  onTaskFilterChange,
  onSearchTermChange,
  onSortByChange,
  onSelectTask,
  onStatusUpdate,
  onDelete,
  onCreateQuickTask,
  onBulkAction,
  onNavigateToTasks,
  onSelectAllTasks,
  onClearSelection,
  className,
}) => {
  const overdueTasks = filteredTasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  ).length;
  
  const highPriorityTasks = filteredTasks.filter(task => 
    task.priority === 'high' && task.status !== 'completed'
  ).length;

  const allFilteredTasksSelected = filteredTasks.length > 0 && selectedTasks.length === filteredTasks.length;

  return (
    <motion.div className={cn("bg-black/20 backdrop-blur-xl p-8 rounded-3xl border border-white/10", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <CheckSquare className="w-7 h-7 text-emerald-400" />
          Your Tasks
          <span className="text-lg text-white/60">({filteredTasks.length})</span>
        </h3>
        
        <div className="flex items-center space-x-2">
          {selectedTasks.length > 0 && (
            <motion.div              
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 bg-black/20 p-2 rounded-xl border border-white/10"
            >
              <span className="text-sm text-white/60">
                {selectedTasks.length} selected
              </span>
              <button
                onClick={() => onBulkAction('complete')}
                className="p-2 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors"
                title="Mark as Complete"
              >
                <CheckSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => onBulkAction('export')}
                className="p-2 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                title="Export Selected"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => onBulkAction('delete')}
                className="p-2 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                title="Delete Selected"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-white/20 mx-1"></div>
              <button
                onClick={onClearSelection}
                className="p-2 text-gray-400 rounded-lg hover:bg-gray-500/20 transition-colors"
                title="Clear Selection"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
          
          <button
            onClick={onCreateQuickTask}
            className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-all duration-300 shadow-soft-light active:shadow-inner-soft hover:shadow-emerald-500/40"
            title="Add New Task"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search and filter controls */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
        <div className="flex items-center gap-2 pr-4 mr-2 border-r border-white/10">
            <motion.button
              onClick={onSelectAllTasks}
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                allFilteredTasksSelected
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'border-white/30 hover:border-emerald-400'
              }`}
              title={allFilteredTasksSelected ? "Deselect All" : "Select All Visible Tasks"}
              whileTap={{ scale: 0.9 }}
            >
              {allFilteredTasksSelected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <CheckSquare className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </motion.button>
        </div>
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search your tasks..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-emerald-400/50 transition-colors shadow-inner-soft"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant={taskFilter === 'all' ? 'secondary' : 'ghost'} onClick={() => onTaskFilterChange('all')} className="transition-all">All</Button>
          <Button size="sm" variant={taskFilter === 'pending' ? 'secondary' : 'ghost'} onClick={() => onTaskFilterChange('pending')} className="transition-all">Pending</Button>
          <Button size="sm" variant={taskFilter === 'completed' ? 'secondary' : 'ghost'} onClick={() => onTaskFilterChange('completed')} className="transition-all">Completed</Button>
          <Button size="sm" variant={taskFilter === 'overdue' ? 'secondary' : 'ghost'} onClick={() => onTaskFilterChange('overdue')} className="transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300">Overdue</Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant={sortBy === 'date' ? 'secondary' : 'ghost'} onClick={() => onSortByChange('date')} className="transition-all">Date</Button>
          <Button size="sm" variant={sortBy === 'priority' ? 'secondary' : 'ghost'} onClick={() => onSortByChange('priority')} className="transition-all">Priority</Button>
          <Button size="sm" variant={sortBy === 'name' ? 'secondary' : 'ghost'} onClick={() => onSortByChange('name')} className="transition-all">Name</Button>
        </div>
      </div>

      {/* Task alerts */}
      {(overdueTasks > 0 || highPriorityTasks > 0) && (
        <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl border border-red-400/20">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div className="text-sm text-white">
            {overdueTasks > 0 && (
              <span className="text-red-400 font-medium">
                {overdueTasks} overdue task{overdueTasks > 1 ? 's' : ''}
              </span>
            )}
            {overdueTasks > 0 && highPriorityTasks > 0 && ', '}
            {highPriorityTasks > 0 && (
              <span className="text-orange-400 font-medium">
                {highPriorityTasks} high priority task{highPriorityTasks > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tasks List */}
      <motion.div layout className="space-y-5 max-h-[600px] overflow-y-auto pr-2">
        <AnimatePresence>
          {filteredTasks.length > 0 ? (
            filteredTasks.slice(0, 10).map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isSelected={selectedTasks.includes(task.id)}
                onSelect={() => onSelectTask(task.id)}
                onStatusUpdate={onStatusUpdate}
                onDelete={onDelete}
                getPriorityClasses={getPriorityClasses}
                getStatusBorderColor={getStatusBorderColor}
                formatDate={formatDate}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.2 }}
                className="p-6 bg-black/20 rounded-full border border-white/10 mb-6"
              >
                <Inbox className="w-16 h-16 text-white/20" />
              </motion.div>
              <p className="text-white/50 mb-4 text-lg font-medium">
                {searchTerm || taskFilter !== 'all' ? 'No tasks match your filters.' : 'Your task list is empty.'}
              </p>
              {(!searchTerm && taskFilter === 'all') ? (
                <motion.button
                  onClick={onCreateQuickTask}
                  className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors px-6 py-3 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 shadow-soft-light"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4" /> Create Your First Task
                </motion.button>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {filteredTasks.length > 10 && (
        <motion.button 
          onClick={onNavigateToTasks}
          className="w-full mt-6 text-center text-emerald-400 font-semibold py-4 hover:bg-emerald-500/10 rounded-2xl transition-all duration-300 border border-dashed border-emerald-400/30 hover:border-emerald-400/50"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-center gap-2">
            <Eye className="w-5 h-5" />
            View All {filteredTasks.length} Secure Tasks
          </div>
        </motion.button>
      )}
    </motion.div>
  );
};

export default TasksPanel;