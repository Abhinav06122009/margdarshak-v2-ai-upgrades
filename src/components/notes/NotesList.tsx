
import React from 'react';
import { Edit, Trash2, Star, BookOpen } from 'lucide-react';
import { Note } from './types';

interface NotesListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
}

export const NotesList = ({ notes, onEdit, onDelete, emptyMessage }: NotesListProps) => {
  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-transparent rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-10 h-10 text-gray-600" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No notes found</h3>
        <p className="text-white">{emptyMessage || "Create your first note to get started!"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div
          key={note.id}
          onClick={() => onEdit(note)}
          className="bg-transparent border border-white rounded-lg p-4 hover:bg-transparent transition-colors cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-white line-clamp-1 flex-1">
              {note.title}
            </h3>
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {note.is_highlighted && (
                <Star className="w-4 h-4 text-white fill-current" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(note);
                }}
                className="p-1 hover:bg-transparent rounded"
              >
                <Edit className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.id);
                }}
                className="p-1 hover:bg-transparent rounded"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {note.content && (
            <p className="text-white text-sm mb-3 line-clamp-2">
              {note.content}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-white">
              @{new Date(note.updated_at).toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </span>
            {note.tags && note.tags.length > 0 && (
              <div className="flex space-x-1">
                {note.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-transparent rounded-full text-xs text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
