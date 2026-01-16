// src/components/tasks/KanbanBoard.tsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Task, SecureUser } from './types';
import TaskCard from './TaskCard';

type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed';

const KANBAN_COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'pending', title: 'Pending', color: 'border-yellow-500/50' },
  { id: 'in_progress', title: 'In Progress', color: 'border-blue-500/50' },
  { id: 'review', title: 'In Review', color: 'border-purple-500/50' },
  { id: 'completed', title: 'Completed', color: 'border-green-500/50' },
];

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string, name: string) => void;
  onTaskStatusUpdate: (taskId: string, newStatus: TaskStatus) => void;
  onToggleTimer: (task: Task) => void;
  onToggleFavorite: (task: Task) => void;
  selectedTasks: string[];
  onSelectTask: (taskId: string) => void;
  currentUser: SecureUser | null;
  hasPremiumAccess: boolean;
  celebratingTaskId: string | null;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  tasks, 
  onEditTask, 
  onDeleteTask, 
  onTaskStatusUpdate, 
  onToggleTimer, 
  onToggleFavorite, 
  selectedTasks, 
  onSelectTask, 
  currentUser, 
  hasPremiumAccess, 
  celebratingTaskId 
}) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const tasksByStatus = KANBAN_COLUMNS.reduce((acc, column) => {
    acc[column.id] = tasks.filter(task => task.status === column.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  return (
    <LayoutGroup>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {KANBAN_COLUMNS.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksByStatus[column.id]}
            draggedTask={draggedTask}
            setDraggedTask={setDraggedTask}
            onTaskStatusUpdate={onTaskStatusUpdate}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onToggleTimer={onToggleTimer}
            onToggleFavorite={onToggleFavorite}
            selectedTasks={selectedTasks}
            onSelectTask={onSelectTask}
            currentUser={currentUser}
            hasPremiumAccess={hasPremiumAccess}
            celebratingTaskId={celebratingTaskId}
          />
        ))}
      </div>
    </LayoutGroup>
  );
};

interface KanbanColumnProps {
  column: { id: TaskStatus; title: string; color: string };
  tasks: Task[];
  draggedTask: Task | null;
  setDraggedTask: React.Dispatch<React.SetStateAction<Task | null>>;
  onTaskStatusUpdate: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string, name: string) => void;
  onToggleTimer: (task: Task) => void;
  onToggleFavorite: (task: Task) => void;
  selectedTasks: string[];
  onSelectTask: (taskId: string) => void;
  currentUser: SecureUser | null;
  hasPremiumAccess: boolean;
  celebratingTaskId: string | null;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  draggedTask,
  setDraggedTask,
  onTaskStatusUpdate,
  onEditTask,
  onDeleteTask,
  onToggleTimer,
  onToggleFavorite,
  selectedTasks,
  onSelectTask,
  currentUser,
  hasPremiumAccess,
  celebratingTaskId,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDrop = () => {
    if (!draggedTask || draggedTask.status === column.id) return;
    onTaskStatusUpdate(draggedTask.id, column.id);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsHovered(true);
      }}
      onDragLeave={() => setIsHovered(false)}
      onDrop={(e) => {
        e.preventDefault();
        handleDrop();
        setIsHovered(false);
      }}
      className={`bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4 transition-all duration-300 h-full ${
        isHovered ? `bg-white/10 border-2 ${column.color}` : ''
      }`}
    >
      <div className={`flex items-center justify-between mb-4 pb-2 border-b-2 ${column.color}`}>
        <h3 className="font-bold text-white text-lg">{column.title}</h3>
        <span className="text-sm text-white/50 bg-white/10 rounded-full px-2 py-1">{tasks.length}</span>
      </div>
      <div className="space-y-4 min-h-[200px]">
        <AnimatePresence>
          {tasks.map((task, index) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              index={index}
              setDraggedTask={setDraggedTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onToggleTimer={onToggleTimer}
              onStatusChange={onTaskStatusUpdate}
              onToggleFavorite={onToggleFavorite}
              isSelected={selectedTasks.includes(task.id)}
              onSelect={onSelectTask}
              currentUser={currentUser}
              hasPremiumAccess={hasPremiumAccess}
              celebratingTaskId={celebratingTaskId}
            />
          ))}
        </AnimatePresence>
        {isHovered && draggedTask && draggedTask.status !== column.id && (
          <div className="h-24 border-2 border-dashed border-blue-400 rounded-xl bg-blue-500/10 flex items-center justify-center pointer-events-none">
            <p className="text-blue-300">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface DraggableTaskCardProps {
  task: Task;
  index: number;
  setDraggedTask: React.Dispatch<React.SetStateAction<Task | null>>;
  onEdit: (task: Task) => void;
  onDelete: (id: string, name: string) => void;
  onToggleTimer: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  isSelected: boolean;
  onSelect: (taskId: string) => void;
  onToggleFavorite: (task: Task) => void;
  hasPremiumAccess: boolean;
  currentUser: SecureUser | null;
  celebratingTaskId: string | null;
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({ 
  task, 
  index, 
  setDraggedTask, 
  onEdit, 
  onDelete, 
  onToggleTimer, 
  onStatusChange, 
  isSelected, 
  onSelect, 
  onToggleFavorite, 
  hasPremiumAccess, 
  currentUser, 
  celebratingTaskId 
}) => {
  return (
    <motion.div
      layoutId={task.id}
      draggable
      onDragStart={() => setDraggedTask(task)}
      className="cursor-grab active:cursor-grabbing"
    >
      <TaskCard 
        task={task} 
        index={index} 
        onEdit={onEdit} 
        onDelete={onDelete} 
        onToggleTimer={onToggleTimer} 
        onStatusChange={onStatusChange} 
        isSelected={isSelected} 
        onSelect={onSelect} 
        onToggleFavorite={onToggleFavorite} 
        hasPremiumAccess={hasPremiumAccess} 
        courses={[]}
        currentUser={currentUser} 
        celebratingTaskId={celebratingTaskId} 
      />
    </motion.div>
  );
};

export default KanbanBoard;