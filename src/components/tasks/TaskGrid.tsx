// src/components/tasks/TaskGrid.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, addDays, subDays, format, isSameMonth, isToday as isTodayFns } from 'date-fns';
import TaskCard from './TaskCard';
import { Task, SecureUser } from './types';
import { Button } from '@/components/ui/button';

interface TaskGridProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string, name: string) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onToggleTimer: (task: Task) => void;
  onDateUpdate: (taskId: string, newDate: Date) => void;
  onToggleFavorite: (task: Task) => void;
  currentUser: SecureUser | null;
  celebratingTaskId: string | null;
}

const TaskGrid: React.FC<TaskGridProps> = (props) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handlePrevious = () => {
    setCurrentDate(prev => {
      return view === 'month' ? subMonths(prev, 1) : subDays(prev, 7);
    });
  };

  const handleNext = () => {
    setCurrentDate(prev => {
      return view === 'month' ? addMonths(prev, 1) : addDays(prev, 7);
    });
  };

  const generateGrid = () => {
    if (view === 'week') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return eachDayOfInterval({ start, end });
    } else { // month view
      const start = startOfWeek(startOfMonth(currentDate));
      const end = endOfWeek(endOfMonth(currentDate));
      return eachDayOfInterval({ start, end });
    }
  };

  const gridDays = generateGrid();
  const gridColsClass = view === 'week' ? 'grid-cols-1 md:grid-cols-7' : 'grid-cols-7';

  return (
    <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-white">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handlePrevious}><ChevronLeft /></Button>
          <h2 className="text-xl font-bold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button variant="ghost" size="icon" onClick={handleNext}><ChevronRight /></Button>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={view === 'month' ? 'secondary' : 'ghost'} onClick={() => setView('month')}>Month</Button>
          <Button variant={view === 'week' ? 'secondary' : 'ghost'} onClick={() => setView('week')}>Week</Button>
        </div>
      </header>

      <div className={`grid ${gridColsClass} gap-px bg-white/10 border-t border-l border-white/10`}>
        {daysOfWeek.map(day => (
          <div key={day} className="p-2 text-center font-semibold text-sm bg-white/5 border-r border-b border-white/10 hidden md:block">
            {day}
          </div>
        ))}
        {view === 'week' && <div className="p-2 text-center font-semibold text-sm bg-white/5 border-r border-b border-white/10 md:hidden">This Week</div>}

        {gridDays.map((day, index) => (
          <DayCell
            key={day ? day.toISOString() : index}
            day={day}
            view={view}
            currentDisplayDate={currentDate}
            dayName={daysOfWeek[index % 7]}
            draggedTask={draggedTask}
            onDrop={() => {
              if (draggedTask && day) {
                props.onDateUpdate(draggedTask.id, day);
              }
            }}
          >
            {props.tasks
              .filter(task => {
                if (!task.due_date || !day) return false;
                // To avoid timezone issues, compare the date parts of the strings.
                // Supabase returns a full ISO string (e.g., "2024-05-21T00:00:00+00:00").
                // We only care about the "YYYY-MM-DD" part.
                const taskDatePart = task.due_date.substring(0, 10);
                const calendarDatePart = day.toISOString().substring(0, 10);
                return taskDatePart === calendarDatePart;
              })
              .map((task, taskIndex) => (
                <DraggableTask
                  key={task.id}
                  task={task}
                  taskIndex={taskIndex}
                  setDraggedTask={setDraggedTask}
                  onEditTask={props.onEditTask}
                  onDeleteTask={props.onDeleteTask}
                  onStatusChange={props.onStatusChange}
                  onToggleTimer={props.onToggleTimer}
                  onToggleFavorite={props.onToggleFavorite}
                  currentUser={props.currentUser}
                  celebratingTaskId={props.celebratingTaskId}
                />
              ))}
          </DayCell>
        ))}
      </div>
    </div>
  );
};

interface DayCellProps {
  day: Date | null;
  view: 'month' | 'week';
  currentDisplayDate: Date;
  dayName?: string;
  children: React.ReactNode;
  draggedTask: Task | null;
  onDrop: () => void;
}

const DayCell: React.FC<DayCellProps> = ({ day, view, currentDisplayDate, dayName, children, draggedTask, onDrop }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isToday = day ? isTodayFns(day) : false;
  const isCurrentMonth = day ? isSameMonth(day, currentDisplayDate) : false;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovered(true);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={() => setIsHovered(false)}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
        setIsHovered(false);
      }}
      className={`
        p-2 border-r border-b border-white/10
        ${view === 'month' ? 'h-40 md:h-48' : 'h-96'}
        ${day ? (isCurrentMonth ? 'bg-black/20' : 'bg-black/40') : 'bg-black/50'}
        ${isToday ? 'relative ring-2 ring-cyan-400' : ''}
        ${isHovered && draggedTask ? 'bg-blue-500/20 shadow-inner shadow-blue-400' : ''}
        flex flex-col transition-all duration-300 ease-in-out group
      `}
    >
      {isToday && <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>}
      <div className="flex justify-between items-center font-bold">
        <span className="font-bold text-lg md:hidden">{dayName?.substring(0, 3)}</span>
        <span className={`
          ${isCurrentMonth ? 'text-white' : 'text-white/40'}
          ${isToday ? 'text-cyan-300' : ''}
        `}>{day?.getDate()}</span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1 mt-2 relative">
        {isHovered && draggedTask && <div className="absolute inset-0 bg-grid-slate-100/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0))]"></div>}
        {children}
      </div>
    </div>
  );
};

interface DraggableTaskProps {
  task: Task;
  taskIndex: number;
  setDraggedTask: (task: Task | null) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string, name: string) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onToggleTimer: (task: Task) => void;
  onToggleFavorite: (task: Task) => void;
  currentUser: SecureUser | null;
  celebratingTaskId: string | null;
}

const DraggableTask: React.FC<DraggableTaskProps> = ({ task, taskIndex, setDraggedTask, onEditTask, onDeleteTask, onStatusChange, onToggleTimer, onToggleFavorite, currentUser, celebratingTaskId }) => {
  return (
    <motion.div
      draggable
      onDragStart={() => setDraggedTask(task)}
      onDragEnd={() => setDraggedTask(null)}
      className="cursor-grab active:cursor-grabbing"
      layoutId={`cal-${task.id}`} // Using a prefix to avoid conflicts with other views
    >
      <TaskCard
        task={task}
        index={taskIndex}
        onEdit={onEditTask}
        onDelete={onDeleteTask}
        onToggleTimer={onToggleTimer}
        onStatusChange={onStatusChange}
        onToggleFavorite={onToggleFavorite}
        currentUser={currentUser}
        celebratingTaskId={celebratingTaskId}
        isSelected={false} // Selection not supported in calendar view
        onSelect={() => {}} // No-op
        view="calendar"
      />
    </motion.div>
  );
};

export default TaskGrid;