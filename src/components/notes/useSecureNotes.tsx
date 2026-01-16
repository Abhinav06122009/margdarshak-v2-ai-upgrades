import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Note, NoteFolder, NoteStats, SecureUser, FormData } from './types';
import { Edit, Plus, Shield, Sparkles, Trash2, X } from 'lucide-react';
import React from 'react';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Secure helper functions for Notes
const notesHelpers = {
  getCurrentUser: async (): Promise<SecureUser | null> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id) // Ensure this matches your profiles table schema
        .single();

      return {
        id: user.id,
        email: user.email || '',
        profile: profile ? {
          full_name: profile.full_name || 'User',
          role: profile.role || 'student', // Using 'role' for consistency
          student_id: profile.student_id
        } : undefined
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  fetchUserNotes: async (userId: string, folder?: string) => {
    try {
      let query = supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('last_accessed', { ascending: false });

      if (folder && folder !== 'all') {
        query = query.eq('folder', folder);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user notes:', error);
      return [];
    }
  },

  fetchUserFolders: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('note_folders')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user folders:', error);
      return [];
    }
  },

  getNotesStatistics: async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_notes_statistics');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching notes statistics:', error);
      return null;
    }
  },

  searchNotes: async (query: string, folder?: string, tags?: string[]) => {
    try {
      const { data, error } = await supabase
        .rpc('search_notes', {
          p_query: query || null,
          p_folder: folder || null,
          p_tags: tags || null,
          p_limit: 50
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching notes:', error);
      return [];
    }
  },

  createNote: async (noteData: any, userId: string) => {
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        ...noteData,
        user_id: userId,
        tags: noteData.tags ? noteData.tags.split(',').map((tag: string) => tag.trim()) : []
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateNote: async (noteId: string, noteData: any, userId: string) => {
    const { data, error } = await supabase
      .from('notes')
      .update({
        ...noteData,
        tags: noteData.tags ? noteData.tags.split(',').map((tag: string) => tag.trim()) : [],
        last_accessed: new Date().toISOString()
      })
      .eq('id', noteId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteNote: async (noteId: string, userId: string) => {
    const { error } = await supabase
      .from('notes')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', noteId)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  },

  bulkDeleteNotes: async (noteIds: string[], userId: string) => {
    const { error } = await supabase
      .from('notes')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .in('id', noteIds)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  },

  toggleNoteFavorite: async (noteId: string, isFavorite: boolean, userId: string) => {
    const { error } = await supabase
      .from('notes')
      .update({ 
        is_favorite: !isFavorite,
        last_accessed: new Date().toISOString()
      })
      .eq('id', noteId)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  }
};

// Default folders
const defaultFolders: NoteFolder[] = [
  { id: 'study-notes', name: 'Study Notes', color: '#3B82F6', icon: 'book-open' },
  { id: 'lecture-notes', name: 'Lecture Notes', color: '#10B981', icon: 'graduation-cap' },
  { id: 'research', name: 'Research', color: '#8B5CF6', icon: 'search' },
  { id: 'personal', name: 'Personal', color: '#F59E0B', icon: 'user' },
  { id: 'ideas', name: 'Ideas', color: '#EF4444', icon: 'lightbulb' }
];

export const useSecureNotes = () => {
  const [currentUser, setCurrentUser] = useState<SecureUser | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<NoteFolder[]>(defaultFolders);
  const [noteStats, setNoteStats] = useState<NoteStats | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [noteToShare, setNoteToShare] = useState<Note | null>(null);
  const [isProcessingSummary, setIsProcessingSummary] = useState(false);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'main' | 'folder' | 'search'>('main');
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    tags: '',
    folder: 'study-notes',
    is_highlighted: false,
    is_favorite: false,
    color: '#3B82F6'
  });

  const showSecureToast = useCallback((title: string, description: string, icon: React.ReactNode) => {
    toast({
      title: <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">{title}</span>,
      description: <span className="text-white font-medium">{description}</span>,
      icon,
      className: "relative bg-black border border-emerald-400/70 shadow-xl px-6 py-4 pr-12 rounded-lg max-w-sm",
      action: (
        <button onClick={() => toast.dismiss()} aria-label="Close" className="absolute top-2 right-2 p-1 rounded-full text-emerald-400 hover:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 transition-colors duration-300 shadow-md hover:shadow-lg">
          <X className="w-5 h-5" />
        </button>
      ),
    });
  }, [toast]);

  const refreshNotes = useCallback(async () => {
    if (!currentUser) return;
    const userNotes = await notesHelpers.fetchUserNotes(currentUser.id, selectedFolder !== 'all' ? selectedFolder : undefined);
    setNotes(userNotes);
  }, [currentUser, selectedFolder]);

  const initializeSecureNotes = useCallback(async () => {
    try {
      setLoading(true);
      const user = await notesHelpers.getCurrentUser();
      if (!user) {
        toast({ title: "Authentication Required", description: "Please log in to access your notes.", variant: "destructive" });
        setSecurityVerified(true); setLoading(false); return;
      }
      setCurrentUser(user);
      setSecurityVerified(true);

      const premiumRoles = ['premium', 'bdo', 'admin', 'superadmin'];
      const userRole = user.profile?.role || 'student';
      setHasPremiumAccess(premiumRoles.includes(userRole));

      const [userNotes, userFolders, stats] = await Promise.all([
        notesHelpers.fetchUserNotes(user.id),
        notesHelpers.fetchUserFolders(user.id),
        notesHelpers.getNotesStatistics()
      ]);
      setNotes(userNotes);
      if (userFolders.length > 0) setFolders(userFolders);
      setNoteStats(stats);
      showSecureToast("Secure Access Verified", `Welcome ${user.profile?.full_name || 'User'}! Your notes are private and secure.`, <Shield className="text-emerald-400" />);
    } catch (error) {
      console.error('Error initializing secure notes:', error);
      toast({ title: "Initialization Error", description: "Failed to initialize secure notes system.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast, showSecureToast]);

  useEffect(() => {
    initializeSecureNotes();
  }, [initializeSecureNotes]);

  const resetForm = () => setFormData({ title: '', content: '', tags: '', folder: 'study-notes', is_highlighted: false, is_favorite: false, color: '#3B82F6' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { toast({ title: 'Authentication Required', description: 'Please log in to manage notes.', variant: 'destructive' }); return; }
    setIsSubmitting(true);
    try {
      if (editingNote) {
        await notesHelpers.updateNote(editingNote.id, formData, currentUser.id);
        showSecureToast("Note Updated!", `"${formData.title}" has been updated.`, <Edit className="text-emerald-400" />);
      } else {
        await notesHelpers.createNote(formData, currentUser.id);
        showSecureToast("Note Created!", `"${formData.title}" has been added.`, <Plus className="text-emerald-400" />);
      }
      setIsSheetOpen(false); setEditingNote(null); resetForm();
      refreshNotes();
    } catch (error: any) {
      toast({ title: 'Error Saving Note', description: `Failed to save note: ${error.message || 'Please try again.'}`, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({ title: note.title, content: note.content || '', tags: note.tags?.join(', ') || '', folder: note.folder || 'study-notes', is_highlighted: note.is_highlighted || false, is_favorite: note.is_favorite || false, color: note.color || '#3B82F6' });
    setIsSheetOpen(true);
  };

  const handleDelete = async (noteId: string, noteTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${noteTitle}"?`)) return;
    if (!currentUser) return;
    try {
      await notesHelpers.deleteNote(noteId, currentUser.id);
      showSecureToast("Note Deleted", `"${noteTitle}" has been moved to trash.`, <Trash2 className="text-emerald-400" />);
      refreshNotes();
    } catch (error: any) {
      toast({ title: "Error Deleting Note", description: `Failed to delete note: ${error.message || 'Please try again.'}`, variant: "destructive" });
    }
  };

  const handleBulkDelete = async () => {
    if (!currentUser || selectedNotes.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedNotes.length} selected notes?`)) {
      try {
        await notesHelpers.bulkDeleteNotes(selectedNotes, currentUser.id);
        showSecureToast("Notes Deleted", `${selectedNotes.length} notes have been moved to trash.`, <Trash2 className="text-emerald-400" />);
        setSelectedNotes([]);
        refreshNotes();
      } catch (error: any) {
        toast({ title: "Error Deleting Notes", description: `Failed to delete notes: ${error.message || 'Please try again.'}`, variant: "destructive" });
      }
    }
  };

  const handleExportCSV = () => {
    const notesToExport = notes.filter(note => selectedNotes.includes(note.id));
    const csv = Papa.unparse(notesToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'notes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const notesToExport = notes.filter(note => selectedNotes.includes(note.id));
    const doc = new jsPDF();
    doc.text("Your Notes", 20, 10);
    autoTable(doc, {
      head: [['Title', 'Content', 'Tags', 'Folder']],
      body: notesToExport.map(note => [
        note.title,
        note.content || '',
        note.tags?.join(', ') || '',
        note.folder
      ]),
    });
    doc.save('notes.pdf');
  };

  const handleToggleFavorite = async (noteId: string, isFavorite: boolean) => {
    if (!currentUser) return;
    try {
      await notesHelpers.toggleNoteFavorite(noteId, isFavorite, currentUser.id);
      refreshNotes();
    } catch (error) { console.error('Error toggling favorite:', error); }
  };

  const openShareModal = (note: Note) => {
    setNoteToShare(note);
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setNoteToShare(null);
    setShowShareModal(false);
  };

  const getSmartSummary = async (content: string): Promise<string | null> => {
    if (!content) {
      toast({ title: "Content required", description: "Please provide content to summarize.", variant: "destructive" });
      return null;
    }
    setIsProcessingSummary(true);
    try {
      const { data, error } = await supabase.functions.invoke('summarize-note', {
        body: { content },
      });
      if (error) throw error;
      showSecureToast("Summary Generated!", "Smart summary generated.", <Sparkles className="text-emerald-400" />);
      return data.summary;
    } catch (error: any) {
      toast({ title: "Summary Generation Failed", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setIsProcessingSummary(false);
    }
  };

  const handleSearch = async () => {
    if (!currentUser || !searchTerm.trim()) return;
    const results = await notesHelpers.searchNotes(searchTerm, selectedFolder !== 'all' ? selectedFolder : undefined);
    setNotes(results);
    setCurrentView('search');
  };

  const handleFolderSelect = async (folderId: string) => {
    if (!currentUser) return;
    setSelectedFolder(folderId);
    setCurrentView(folderId === 'all' ? 'main' : 'folder');
    const userNotes = await notesHelpers.fetchUserNotes(currentUser.id, folderId !== 'all' ? folderId : undefined);
    setNotes(userNotes);
  };

  const handleCreateNote = () => { resetForm(); setEditingNote(null); setIsSheetOpen(true); };

  const handleSelectNote = (noteId: string) => {
    setSelectedNotes(prev =>
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleSelectAllNotes = () => {
    if (selectedNotes.length === notes.length) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(notes.map(note => note.id));
    }
  };

  const getRecentNotes = () => notes.slice(0, 5);
  const getHighlightedNotes = () => notes.filter(note => note.is_highlighted);

  return { currentUser, notes, folders, noteStats, isSheetOpen, setIsSheetOpen, editingNote, loading, securityVerified, isProcessingSummary, getSmartSummary, searchTerm, setSearchTerm, selectedFolder, selectedNotes, currentView, setCurrentView, formData, setFormData, handleSubmit, handleEdit, handleDelete, handleBulkDelete, handleToggleFavorite, handleSearch, handleFolderSelect, handleCreateNote, getRecentNotes, getHighlightedNotes, refreshNotes, showShareModal, noteToShare, openShareModal, closeShareModal, isSubmitting, handleSelectNote, handleSelectAllNotes, handleExportCSV, handleExportPDF, hasPremiumAccess };
};