import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Trash2, Calendar, Star, Flag, Tag } from 'lucide-react';
import type { RealTask } from '@/types/dashboard';

interface TaskItemProps {
  task: RealTask;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onStatusUpdate: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  getPriorityClasses: (priority: string) => string;
  getStatusBorderColor: (status: string) => string;
  formatDate: (date: string) => string;
}

const TaskItem: React.FC<TaskItemProps> = React.memo(({
  task,
  isSelected,
  onSelect,
  onStatusUpdate,
  onDelete,
  getPriorityClasses,
  getStatusBorderColor,
  formatDate
}) => {
  const priorityIcon = {
    high: <Flag className="w-4 h-4" />,
    medium: <Star className="w-4 h-4" />,
    low: <Tag className="w-4 h-4" />,
  }[task.priority] || <Tag className="w-4 h-4" />;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -30, transition: { duration: 0.3 } }}
      className={`p-6 rounded-2xl border-2 ${getStatusBorderColor(task.status)} bg-black/20 backdrop-blur-md
        hover:bg-black/30 transition-all duration-300 group relative shadow-lg
        ${isSelected ? 'ring-2 ring-offset-2 ring-offset-black/50 ring-emerald-400 shadow-emerald-500/20' : 'border-white/10 hover:border-white/20'}
      `}
      whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300 } }}
    >
      <div className="flex items-start space-x-6">
        {/* Selection checkbox */}
        <motion.button
          onClick={() => onSelect(task.id)}
          className={`w-7 h-7 mt-1 rounded-lg border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
            isSelected
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-white/30 hover:border-emerald-400'
          }`}
          whileTap={{ scale: 0.9 }}
        >
          {isSelected && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <CheckSquare className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </motion.button>

        {/* Task content */}
        <div className="flex-1">
          <div className="font-bold text-white mb-3 text-2xl group-hover:text-emerald-300 transition-colors">
            {task.title}
          </div>
          {task.description && (
            <p className="text-sm text-white/70 mb-4 max-w-prose">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 flex-wrap">
            <div className={`text-sm flex items-center gap-2 px-4 py-2 rounded-full font-semibold border ${getPriorityClasses(task.priority)}`}>
              {priorityIcon}
              <span className="capitalize">{task.priority} Priority</span>
            </div>
            
            {task.due_date && (
              <div className={`text-sm flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
                new Date(task.due_date) < new Date() && task.status !== 'completed'
                  ? 'text-red-300 bg-red-900/50 border border-red-500/40'
                  : 'text-white/70 bg-white/10 border border-white/20'
              }`}>
                <Calendar className="w-4 h-4" />
                <span>Due: {formatDate(task.due_date)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col items-center space-y-3">
          <motion.button
            onClick={() => onStatusUpdate(task.id, task.status === 'completed' ? 'pending' : 'completed')}
            className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-300 shadow-md ${
              task.status === 'completed' 
                ? 'bg-emerald-500/30 border-emerald-500/40 text-emerald-300' 
                : 'border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/20 text-white/80 hover:text-emerald-300'
            }`}
            whileHover={{ scale: 1.1, rotate: task.status === 'completed' ? 360 : 0 }}
            whileTap={{ scale: 0.9 }}
            title={task.status === 'completed' ? 'Mark as Pending' : 'Mark as Complete'}
          >
            <CheckSquare className="w-6 h-6" />
          </motion.button>

          <motion.button
            onClick={() => onDelete(task.id)}
            className="w-12 h-12 rounded-lg border-2 border-red-500/40 text-red-400 hover:bg-red-500/30 transition-all duration-300 flex items-center justify-center opacity-60 group-hover:opacity-100 shadow-md"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Delete Task"
          >
            <Trash2 className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

export default TaskItem;