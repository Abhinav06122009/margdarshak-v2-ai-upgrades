
import React from 'react';
import { BookOpen, Star } from 'lucide-react';
import { Note } from './types';

interface HighlightedNotesProps {
  notes: Note[];
  onEdit: (note: Note) => void;
}

export const HighlightedNotes = ({ notes, onEdit }: HighlightedNotesProps) => {
  if (notes.length === 0) return null;

  return (
    <div className="px-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-300">HIGHLIGHTED NOTES</h2>
      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => onEdit(note)}
            className="flex items-center space-x-3 bg-gray-900 border border-gray-700 rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white">{note.title}</h3>
              <p className="text-xs text-gray-400">
                @{new Date(note.updated_at).toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
          </div>
        ))}
      </div>
    </div>
  );
};
