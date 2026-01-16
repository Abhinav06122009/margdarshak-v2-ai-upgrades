// src/components/Calendar.tsx

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Assuming you have lucide-react installed

interface CalendarProps {
  // You can add props here if you want to pass initial date, onDateSelect, etc.
  // Example: onDateSelect?: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = () => {
  // State to manage the currently displayed month and year
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper function to get the number of days in a month
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper function to get the day of the week for the first day of the month
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  // Generate an array of dates for the current month view
  const generateCalendarDays = (): (Date | null)[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed

    const daysInMonth = getDaysInMonth(year, month);
    const firstDayIndex = getFirstDayOfMonth(year, month);

    const calendarDays: (Date | null)[] = [];

    // Add nulls for the leading empty cells (days from previous month)
    for (let i = 0; i < firstDayIndex; i++) {
      calendarDays.push(null);
    }

    // Add actual days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(new Date(year, month, i));
    }

    // Add nulls for the trailing empty cells (days from next month to complete the week)
    const remainingCells = 42 - calendarDays.length; // 6 weeks * 7 days = 42 cells total
    for (let i = 0; i < remainingCells && calendarDays.length % 7 !== 0; i++) {
        calendarDays.push(null);
    }


    return calendarDays;
  };

  // Navigate to the previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() - 1);
      return newDate;
    });
  };

  // Navigate to the next month
  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + 1);
      return newDate;
    });
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentMonthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const today = new Date(); // To highlight today's date

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg mx-auto my-8 border border-gray-200">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-2xl font-semibold text-gray-800">
          {currentMonthYear}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Days of the Week Header */}
      <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600 mb-2">
        {daysOfWeek.map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {generateCalendarDays().map((day, index) => {
          const isToday = day && day.getDate() === today.getDate() &&
                          day.getMonth() === today.getMonth() &&
                          day.getFullYear() === today.getFullYear();
          const isCurrentMonth = day && day.getMonth() === currentDate.getMonth();

          return (
            <div
              key={index}
              className={`
                p-2 rounded-md flex items-center justify-center text-sm aspect-square
                ${day === null ? 'text-gray-300' : ''}
                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                ${isToday ? 'bg-blue-500 text-white font-bold' : ''}
                ${day !== null && !isToday ? 'hover:bg-gray-100 cursor-pointer' : ''}
              `}
              // Example: Add an onClick handler if you want to select dates
              // onClick={() => day && onDateSelect?.(day)}
            >
              {day ? day.getDate() : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;