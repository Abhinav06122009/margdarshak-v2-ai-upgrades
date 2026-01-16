// src/components/tasks/TaskHeader.tsx
import React, { useState } from 'react';
import { Search, Bell, Plus, ChevronLeft, ChevronRight, Filter, MoreHorizontal } from 'lucide-react';

interface TaskHeaderProps {
  onAddTask: () => void;
  currentMonthDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSearch: (term: string) => void;
}

const TaskHeader = ({
  onAddTask,
  currentMonthDate,
  onPreviousMonth,
  onNextMonth,
  onSearch
}: TaskHeaderProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 min-w-[200px] text-center">
              {getMonthYear(currentMonthDate)}
            </h1>
            <button
              onClick={onNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
          
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Filter size={20} className="text-gray-600" />
          </button>
          
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell size={20} className="text-gray-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </button>
          
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskHeader;
