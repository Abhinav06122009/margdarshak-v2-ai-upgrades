
import React from 'react';
import { getCurrentWeekDays } from './utils';

export const CalendarWeek = () => {
  const weekDays = getCurrentWeekDays();

  return (
    <div className="flex justify-between mb-4">
      {weekDays.map((day, index) => (
        <div
          key={index}
          className={`text-center ${
            day.date === new Date().getDate() 
              ? 'bg-orange-500 text-white rounded-lg' 
              : 'text-gray-400'
          } p-2 min-w-[40px]`}
        >
          <div className="text-xs">{day.date}</div>
          <div className="text-xs">{day.day}</div>
        </div>
      ))}
    </div>
  );
};
