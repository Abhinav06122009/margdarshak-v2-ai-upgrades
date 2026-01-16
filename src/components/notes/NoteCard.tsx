import React from 'react';
import { motion } from 'framer-motion';
import { Note } from './types';
import { Clock, Edit, FileText, Heart, Share, Star, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface NoteCardProps {
  note: Note;
  index: number;
  onEdit: (note: Note) => void;
  onDelete: (id: string, title: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onShare: (note: Note) => void;
  isSelected: boolean;
  onSelectNote: (id: string) => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const NoteCard: React.FC<NoteCardProps> = ({ note, index, onEdit, onDelete, onToggleFavorite, onShare, isSelected, onSelectNote }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ delay: index * 0.05 }}
    >
        <Card className="bg-black/20 backdrop-blur-xl border-white/10 text-white h-full flex flex-col">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Checkbox checked={isSelected} onCheckedChange={() => onSelectNote(note.id)} />
                        <CardTitle className="cursor-pointer" onClick={() => onEdit(note)}>{note.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onToggleFavorite(note.id, note.is_favorite)} className={`h-8 w-8 ${note.is_favorite ? 'text-red-400' : 'text-white/60 hover:text-red-400'}`}>
                            <Heart className={`w-4 h-4 ${note.is_favorite ? 'fill-current' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onEdit(note)} className="h-8 w-8 text-white/60 hover:text-blue-400">
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onShare(note)} className="h-8 w-8 text-white/60 hover:text-green-400">
                            <Share className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow cursor-pointer" onClick={() => onEdit(note)}>
                {note.content && (
                    <p className="text-white/70 text-sm line-clamp-3">
                        {note.content}
                    </p>
                )}
            </CardContent>
            <CardFooter className="flex-col items-start gap-4">
                <div className="flex items-center justify-between w-full text-xs text-white/60">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(note.created_at)}
                    </span>
                    <div className="flex items-center gap-2">
                        {note.is_highlighted && <Star className="w-4 h-4 text-yellow-400 fill-current" title="Highlighted" />}
                        <Button variant="ghost" size="icon" onClick={() => onDelete(note.id, note.title)} className="h-8 w-8 text-white/40 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {note.tags.slice(0, 3).map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary">#{tag}</Badge>
                        ))}
                    </div>
                )}
            </CardFooter>
        </Card>
    </motion.div>
  );
};