import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  onBack?: () => void;
}

const Calendar = ({ onBack }: CalendarProps) => {
  const [date, setDate] = useState(new Date());

  const year = date.getFullYear();
  const month = date.getMonth();

  const prevMonth = () => setDate(new Date(year, month - 1, 1));
  const nextMonth = () => setDate(new Date(year, month + 1, 1));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Create the grid: empty slots for offset + actual days
  const calendarDays = [
    ...Array(firstDayIndex).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date();

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getDate() === d2.getDate() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getFullYear() === d2.getFullYear();

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 mb-8 rounded-lg bg-emerald-600/20 text-emerald-300 font-semibold hover:bg-emerald-600/30 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
      )}

      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg mx-auto border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">{monthLabel}</h2>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600 mb-2">
          {daysOfWeek.map((day) => <div key={day}>{day}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, i) => {
            if (!day) return <div key={i} className="p-2" />;

            const isToday = isSameDay(day, today);
            
            return (
              <div
                key={i}
                className={`p-2 rounded-md flex items-center justify-center text-sm aspect-square cursor-pointer transition-colors
                  ${isToday ? 'bg-blue-500 text-white font-bold' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                {day.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;