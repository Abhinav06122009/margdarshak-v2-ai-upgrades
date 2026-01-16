
import React from 'react';
import { BookOpen } from 'lucide-react';
import { Note } from './types';
import { CalendarWeek } from './CalendarWeek';

interface RecentNotesProps {
  notes: Note[];
  onEdit: (note: Note) => void;
}

export const RecentNotes = ({ notes, onEdit }: RecentNotesProps) => {
  return (
    <div className="px-6 mb-8">
      <h2 className="text-lg font-semibold mb-4 text-white">RECENT NOTES</h2>
      
      <CalendarWeek />

      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => onEdit(note)}
            className="flex items-center space-x-3 bg-transparent border border-white rounded-lg p-4 hover:bg-transparent transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 bg-transparent rounded flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white">{note.title}</h3>
              <p className="text-xs text-white">
                @{new Date(note.updated_at).toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
