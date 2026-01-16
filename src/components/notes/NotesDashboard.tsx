import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, Eye, FileText, Folder, Heart, Plus, Shield, Star, Search, Filter, Trash2, X, Download, GraduationCap, Lightbulb, User, Home } from 'lucide-react';
import { Note, NoteFolder, NoteStats, SecureUser } from './types';
import { NoteCard } from './NoteCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface NotesDashboardProps {
    onBack: () => void;
    currentUser: SecureUser;
    notes: Note[];
    folders: NoteFolder[];
    noteStats: NoteStats | null;
    onAddFolder: (folderName: string) => void;
    handleCreateNote: () => void;
    handleFolderSelect: (folderId: string) => void;
    handleEdit: (note: Note) => void;
    handleDelete: (id: string, title: string) => void;
    handleBulkDelete: () => void;
    handleExportCSV: () => void;
    handleExportPDF: () => void;
    handleToggleFavorite: (id: string, isFavorite: boolean) => void;
    openShareModal: (note: Note) => void;
    getRecentNotes: () => Note[];
    getHighlightedNotes: () => Note[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedNotes: string[];
    handleSelectNote: (id: string) => void;
    handleSelectAllNotes: () => void;
}

const iconMap: { [key: string]: React.ElementType } = {
    'book-open': BookOpen,
    'graduation-cap': GraduationCap,
    'search': Search,
    'user': User,
    'lightbulb': Lightbulb,
    'home': Home,
    'default': Folder,
};

const getFolderIcon = (iconName?: string) => {
    return iconMap[iconName || 'default'] || Folder;
};

export const NotesDashboard: React.FC<NotesDashboardProps> = (props) => {
    const {
        onBack, currentUser, notes, folders, noteStats, onAddFolder, handleCreateNote,
        handleFolderSelect, handleEdit, handleDelete, handleBulkDelete, handleExportCSV, handleExportPDF, handleToggleFavorite, openShareModal,
        getRecentNotes, getHighlightedNotes, searchTerm, setSearchTerm, selectedNotes, handleSelectNote, handleSelectAllNotes
    } = props;

    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isAllNotesSelected = filteredNotes.length > 0 && selectedNotes.length === filteredNotes.length;
    const [newFolderName, setNewFolderName] = useState('');
    const [isAddingFolder, setIsAddingFolder] = useState(false);

    const handleAddNewFolder = () => {
        if (newFolderName.trim()) {
            onAddFolder(newFolderName.trim());
            setNewFolderName('');
            setIsAddingFolder(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center relative overflow-hidden">
            <AnimatePresence>
                {selectedNotes.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-auto bg-black/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-2 flex items-center gap-2 z-50"
                    >
                        <span className="text-white font-semibold px-3 text-sm">{selectedNotes.length} selected</span>
                        <div className="h-6 w-px bg-white/20" />
                        <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-sm" onClick={handleExportCSV}><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
                        <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-sm" onClick={handleExportPDF}><Download className="w-4 h-4 mr-2" /> Export PDF</Button>
                        <div className="h-6 w-px bg-white/20" />
                        <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm" onClick={handleBulkDelete}><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
                        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white" onClick={() => handleSelectAllNotes()}><X className="w-4 h-4" /></Button>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 z-10">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between my-8">
                    <div className="flex items-center space-x-4">
                        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">My Private Notes <Shield className="w-8 h-8 text-green-400" /></h1>
                            <p className="text-white/80">Welcome back, {currentUser.profile?.full_name}! Your notes are completely secure.</p>
                        </div>
                    </div>
                    <motion.button
                      onClick={handleCreateNote}
                      className="group relative inline-flex w-full sm:w-auto h-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 px-8 py-4 font-bold text-lg text-white shadow-lg transition-all duration-300 ease-out hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:shadow-blue-500/50 active:scale-95"
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="absolute inset-0 flex h-full w-full justify-center [transform:skewX(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skewX(-12deg)_translateX(100%)] bg-white/30" />
                      <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180 mr-3 z-10" />
                      <span className="relative z-10">Create Note</span>
                    </motion.button>
                </motion.div>

                {noteStats && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <StatCard icon={<FileText className="w-8 h-8 text-blue-400" />} label="Total Notes" value={noteStats.total_notes} />
                        <StatCard icon={<Star className="w-8 h-8 text-yellow-400" />} label="Highlighted" value={noteStats.highlighted_notes} />
                        <StatCard icon={<Heart className="w-8 h-8 text-red-400" />} label="Favorites" value={noteStats.favorite_notes} />
                        <StatCard icon={<Clock className="w-8 h-8 text-green-400" />} label="Reading Time" value={`${noteStats.total_reading_time} min`} />
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
                    <div className="lg:col-span-3">
                        <div className="sticky top-6 space-y-8">
                            <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Search className="w-5 h-5 text-blue-400" />
                                        Search Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Input
                                        placeholder="Type to search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-black/30 border-2 border-white/15 rounded-xl text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg"
                                    />
                                </CardContent>
                            </Card>
                            <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Folder className="w-5 h-5 text-blue-400" />
                                        Folders
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1">
                                    <motion.button whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }} onClick={() => handleFolderSelect('all')} className="w-full flex items-center gap-3 text-left p-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200">
                                        <Home className="w-5 h-5 text-gray-400" />
                                        <span className="font-medium">All Notes</span>
                                    </motion.button>
                                    {folders.map(folder => {
                                        const Icon = getFolderIcon(folder.icon);
                                        return (
                                            <motion.button key={folder.id} whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }} onClick={() => handleFolderSelect(folder.id)} className="w-full flex items-center gap-3 text-left p-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200">
                                                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                                    <Icon className="w-5 h-5" style={{ color: folder.color || '#A3A3A3' }} />
                                                </div>
                                                <span className="font-medium flex-grow truncate">{folder.name}</span>
                                                {noteStats?.notes_in_folder?.[folder.id] > 0 && (
                                                    <span className="text-xs bg-white/10 text-white/70 rounded-full px-2 py-0.5">
                                                        {noteStats.notes_in_folder[folder.id]}
                                                    </span>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </CardContent>
                                <CardFooter className="pt-4 border-t border-white/10">
                                    {isAddingFolder ? (
                                        <div className="w-full space-y-2">
                                            <Input autoFocus value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNewFolder()} placeholder="New folder name..." className="bg-black/30 border-white/20 text-white" />
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={handleAddNewFolder} className="w-full bg-blue-600 hover:bg-blue-700">Add</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setIsAddingFolder(false)} className="w-full">Cancel</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button variant="ghost" onClick={() => setIsAddingFolder(true)} className="w-full justify-center text-white/70 hover:text-white hover:bg-white/10">
                                            <Plus className="w-4 h-4 mr-2" /> Add Folder
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        </div>
                    </div>

                    <div className="lg:col-span-9">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Checkbox id="select-all" checked={isAllNotesSelected} onCheckedChange={handleSelectAllNotes} />
                                <label htmlFor="select-all" className="text-white">Select All</label>
                            </div>
                        </div>
                        {filteredNotes.length > 0 ? (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredNotes.map((note, index) => (
                                    <NoteCard key={note.id} note={note} index={index} onEdit={handleEdit} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} onShare={openShareModal} isSelected={selectedNotes.includes(note.id)} onSelectNote={handleSelectNote} />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                                <div className="glass-morphism rounded-2xl p-8 border border-white/20 inline-block">
                                    <BookOpen className="w-16 h-16 mx-auto text-white/30 mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">No notes found</h3>
                                    <p className="text-white/60 mb-6">Create a new note or try a different search term.</p>
                                    <Button onClick={handleCreateNote} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity font-semibold flex items-center gap-2 mx-auto">
                                        <Plus className="w-5 h-5" /> Create Note
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
    <div className="glass-morphism p-6 rounded-2xl border border-white/20">
        <div className="flex items-center justify-between mb-4">
            {icon}
            <span className="text-3xl font-bold text-white">{value}</span>
        </div>
        <h3 className="text-white font-semibold">{label}</h3>
    </div>
);