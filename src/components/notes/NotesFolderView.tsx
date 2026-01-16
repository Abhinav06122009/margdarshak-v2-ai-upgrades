import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FileText, Plus, Search, Shield } from 'lucide-react';
import { Note, NoteFolder } from './types';
import { NoteCard } from './NoteCard';

interface NotesFolderViewProps {
    notes: Note[];
    folders: NoteFolder[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedFolder: string;
    currentView: 'folder' | 'search';
    handleSearch: () => void;
    handleCreateNote: () => void;
    handleEdit: (note: Note) => void;
    handleDelete: (id: string, title: string) => void;
    handleToggleFavorite: (id: string, isFavorite: boolean) => void;
    openShareModal: (note: Note) => void;
    setCurrentView: (view: 'main' | 'folder' | 'search') => void;
    setSelectedFolder: (folderId: string) => void;
    refreshNotes: () => void;
}

export const NotesFolderView: React.FC<NotesFolderViewProps> = (props) => {
    const {
        notes, folders, searchTerm, setSearchTerm, selectedFolder, currentView,
        handleSearch, handleCreateNote, handleEdit, handleDelete, handleToggleFavorite, openShareModal,
        setCurrentView, setSelectedFolder, refreshNotes
    } = props;

    const handleBack = () => {
        setCurrentView('main');
        setSelectedFolder('all');
        setSearchTerm('');
        refreshNotes();
    };

    const folderName = folders.find(f => f.id === selectedFolder)?.name || 'All Notes';
    const title = currentView === 'search' ? 'Search Results' : folderName;
    const subtitle = currentView === 'search'
        ? `Found ${notes.length} notes matching "${searchTerm}"`
        : `${notes.length} notes in this folder`;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">{title} <Shield className="w-6 h-6 text-green-400" /></h1>
                        <p className="text-white/70">{subtitle}</p>
                    </div>
                </div>
                <button onClick={handleCreateNote} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 p-3 rounded-full transition-colors shadow-lg"><Plus className="w-6 h-6" /></button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input type="text" placeholder="Search notes in this folder..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button onClick={handleSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-colors text-sm font-semibold">Search</button>
                </div>
            </motion.div>

            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {notes.map((note, index) => (
                        <NoteCard key={note.id} note={note} index={index} onEdit={handleEdit} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} onShare={openShareModal} />
                    ))}
                </AnimatePresence>
            </motion.div>

            {notes.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <div className="glass-morphism rounded-2xl p-8 border border-white/20 inline-block">
                        <FileText className="w-16 h-16 mx-auto text-white/30 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">{currentView === 'search' ? 'No notes found' : 'No notes in this folder'}</h3>
                        <p className="text-white/60 mb-6">{currentView === 'search' ? 'Try adjusting your search terms' : 'Start by creating a note'}</p>
                        <button onClick={handleCreateNote} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity font-semibold flex items-center gap-2 mx-auto">
                            <Plus className="w-5 h-5" /> Create Note
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};