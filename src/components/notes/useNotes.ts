
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Note, FormData } from './types';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, searchTerm, selectedFolder]);

  const fetchNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        setLoading(false);
        return;
      }

      console.log('Fetching notes for user:', user.id);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching notes:', error);
        throw error;
      }
      
      console.log('Fetched notes:', data);
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = notes;

    if (selectedFolder !== 'all') {
      filtered = filtered.filter(note => note.folder === selectedFolder);
    }

    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredNotes(filtered);
  };

  const saveNote = async (formData: FormData, editingNote: Note | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found');
        toast({
          title: "Error",
          description: "You must be logged in to save notes",
          variant: "destructive",
        });
        return false;
      }

      console.log('Saving note for user:', user.id);
      console.log('Form data:', formData);

      const noteData = {
        title: formData.title,
        content: formData.content,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        folder: formData.folder,
        is_highlighted: formData.is_highlighted,
        user_id: user.id,
      };

      console.log('Note data to save:', noteData);

      if (editingNote) {
        const { error } = await supabase
          .from('notes')
          .update(noteData)
          .eq('id', editingNote.id);

        if (error) {
          console.error('Error updating note:', error);
          throw error;
        }
        
        toast({
          title: "Success",
          description: "Note updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('notes')
          .insert([noteData]);

        if (error) {
          console.error('Error creating note:', error);
          throw error;
        }
        
        toast({
          title: "Success",
          description: "Note created successfully",
        });
      }

      fetchNotes();
      return true;
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Error",
        description: `Failed to save note: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  const getRecentNotes = () => {
    return notes.slice(0, 5);
  };

  const getHighlightedNotes = () => {
    return notes.filter(note => note.is_highlighted);
  };

  return {
    notes,
    filteredNotes,
    loading,
    searchTerm,
    setSearchTerm,
    selectedFolder,
    setSelectedFolder,
    saveNote,
    deleteNote,
    getRecentNotes,
    getHighlightedNotes,
    fetchNotes
  };
};
