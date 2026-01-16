// src/components/timetable/TimetableGrid.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/timetable/EventCard';

interface TimetableEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  day: number;
  [key: string]: any;
}

interface TimetableGridProps {
  currentWeekDates: Date[];
  events: TimetableEvent[];
  onEditEvent: (event: TimetableEvent) => void;
  onDeleteEvent: (id: string, title: string) => void;
  onDayClick: (day: number) => void;
  colorHelpers: any;
  onEventDrop: (eventId: string, newDay: number, newStartTime: string) => void;
  draggedEvent: TimetableEvent | null;
  setDraggedEvent: (event: TimetableEvent | null) => void;
  selectedEvents: string[];
  onEventSelect: (id: string) => void;
  hasPremiumAccess: boolean;
}

const TimetableGrid: React.FC<TimetableGridProps> = ({
  currentWeekDates,
  events,
  onEditEvent,
  onDeleteEvent,
  onDayClick,
  colorHelpers,
  onEventDrop,
  draggedEvent,
  setDraggedEvent,
  selectedEvents,
  onEventSelect,
  hasPremiumAccess,
}) => {
  const [dropIndicator, setDropIndicator] = useState<{ day: number; top: number } | null>(null);

  const timeSlots = [];
  for (let hour = 3; hour < 24; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  const handleDragStart = (e: React.DragEvent, event: TimetableEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';

    // Ghost image for drag operation
    const card = e.currentTarget as HTMLElement;
    const ghost = card.cloneNode(true) as HTMLElement;
    ghost.style.opacity = '0.6';
    ghost.style.position = 'absolute';
    ghost.style.left = '-9999px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, card.offsetWidth / 2, 20);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleDragOver = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    if (!draggedEvent || !hasPremiumAccess) return;

    const dayColumn = e.currentTarget as HTMLElement;
    const rect = dayColumn.getBoundingClientRect();
    const dropY = e.clientY - rect.top;

    // Snap to 15-minute intervals. Each hour is 100px.
    const totalMinutesFromTop = (dropY / 100) * 60;
    const snappedMinutes = Math.round(totalMinutesFromTop / 15) * 15;
    const snappedTop = (snappedMinutes / 60) * 100;

    setDropIndicator({ day, top: snappedTop });
  };

  const handleDrop = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    if (!draggedEvent || !dropIndicator || !hasPremiumAccess) return;

    const startHourOffset = 3; // From TimeSlots.tsx
    const totalMinutes = (dropIndicator.top / 100) * 60;
    const newStartHour = Math.floor(totalMinutes / 60) + startHourOffset;
    const newStartMinute = totalMinutes % 60;
    const newStartTime = `${String(newStartHour).padStart(2, '0')}:${String(newStartMinute).padStart(2, '0')}`;

    onEventDrop(draggedEvent.id, day, newStartTime);
    
    if (navigator.vibrate) navigator.vibrate(50);

    setDropIndicator(null);
    setDraggedEvent(null);
  };

  return (
    <div className="flex-1 grid grid-cols-7 relative">
      {/* Day Columns */}
      {currentWeekDates.map((_, dayIndex) => (
        <div
          key={dayIndex}
          className="relative border-l border-white/10"
          onDragOver={(e) => handleDragOver(e, dayIndex)}
          onDrop={(e) => handleDrop(e, dayIndex)}
          onDragLeave={() => setDropIndicator(null)}
        >
          {/* Background Grid Lines & Drop Zones */}
          {timeSlots.map((timeSlot, timeIndex) => (
            <div
              key={timeSlot}
              className={`h-[100px] border-b border-white/5 ${hasPremiumAccess ? 'group cursor-pointer' : 'cursor-default'}`}
              onClick={() => hasPremiumAccess && onDayClick(dayIndex)}
            >
              {hasPremiumAccess && (
                <Button // Add Event Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-neumorphic-sm hover:shadow-neumorphic-lg"
                  onClick={(e) => { e.stopPropagation(); onDayClick(dayIndex); }} // Prevent event propagation to parent div
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}

          {/* Drop Indicator */}
          {dropIndicator && dropIndicator.day === dayIndex && draggedEvent && (
            <div
              className="absolute left-1 right-1 bg-blue-500/20 border-2 border-dashed border-blue-400 rounded-lg z-10 pointer-events-none shadow-lg"
              style={{
                top: `${dropIndicator.top}px`,
                height: `${colorHelpers.getEventHeight(draggedEvent.start_time, draggedEvent.end_time)}px`,
              }}
            />
          )}

          {/* Events for this day */}
          {events
            .filter((event) => event.day === dayIndex)
            .map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={onEditEvent}
                onDelete={onDeleteEvent}
                dayIndex={dayIndex}
                onDragStart={handleDragStart}
                isHighlighted={false}
                isSelected={selectedEvents.includes(event.id)}
                onSelect={onEventSelect}
                hasPremiumAccess={hasPremiumAccess}
              />
            ))}
        </div>
      ))}
    </div>
  );
};

export default TimetableGrid;