import React, { useState, useEffect } from 'react';
import { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from '@/components/ui/command';
import { Note, NoteFolder } from './types';
import { File, Folder, Plus } from 'lucide-react';

interface CommandMenuProps {
  notes: Note[];
  folders: NoteFolder[];
  onSelectNote: (note: Note) => void;
  onSelectFolder: (folderId: string) => void;
  onCreateNew: () => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({ notes, folders, onSelectNote, onSelectFolder, onCreateNew }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={onCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Note</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Folders">
          {folders.map(folder => (
            <CommandItem key={folder.id} onSelect={() => onSelectFolder(folder.id)}>
              <Folder className="mr-2 h-4 w-4" />
              <span>{folder.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Notes">
          {notes.map(note => (
            <CommandItem key={note.id} onSelect={() => onSelectNote(note)}>
              <File className="mr-2 h-4 w-4" />
              <span>{note.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};