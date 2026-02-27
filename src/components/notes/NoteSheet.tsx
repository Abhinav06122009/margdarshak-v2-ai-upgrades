import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, StickyNote, Sparkles, BrainCircuit, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Note, NoteFolder, FormData } from './types';
import NoteSummarizer from './ai/NoteSummarizer';

interface NoteSheetProps {
  isOpen: boolean;
  onClose: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
  editingNote: Note | null;
  folders: NoteFolder[];
  isProcessingAI: boolean;
  hasPremiumAccess: boolean;
  getAISummary: (content: string) => Promise<string | null>;
  isSubmitting: boolean;
}

export const NoteSheet: React.FC<NoteSheetProps> = ({
  isOpen,
  onClose,
  handleSubmit,
  formData,
  setFormData,
  editingNote,
  folders,
  isProcessingAI,
  hasPremiumAccess,
  getAISummary,
  isSubmitting
}) => {

  const handleSummarize = async () => {
    const summary = await getAISummary(formData.content);
    if (summary) {
      const newContent = `${formData.content}\n\n---\n\n**AI Summary:**\n${summary}`;
      setFormData({ ...formData, content: newContent });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-black/80 backdrop-blur-2xl border-l border-white/20 shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">{editingNote ? 'Edit Note' : 'Create Note'}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-grow overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">

                <div>
                  <Label htmlFor="title" className="text-base font-semibold text-white/90">Title *</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter note title..." required className="text-base bg-black/30 border-2 border-white/15 text-white"/>
                </div>
                <div>
                  <Label htmlFor="folder" className="text-base font-semibold text-white/90">Folder</Label>
                  <Select value={formData.folder} onValueChange={(v) => setFormData({...formData, folder: v})}>
                    <SelectTrigger className="text-base bg-black/30 border-2 border-white/15 text-white"><SelectValue/></SelectTrigger>
                    <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white">
                      {folders.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <Label htmlFor="content" className="text-base font-semibold text-white/90">Content</Label>
                  <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Write your note here..." className="min-h-[250px] text-base bg-black/30 border-2 border-white/15 text-white"/>
                  <div className="absolute top-8 right-2 flex gap-2">
                    <Button type="button" size="icon" variant="ghost" onClick={handleSummarize} disabled={!hasPremiumAccess || isProcessingAI} className="text-white/70 hover:text-white disabled:text-white/30 disabled:cursor-not-allowed" title={hasPremiumAccess ? "Summarize with AI" : "AI Summary (Premium Only)"}>
                      {isProcessingAI 
                        ? <Loader2 className="w-4 h-4 animate-spin" /> 
                        : hasPremiumAccess 
                          ? <Sparkles className="w-4 h-4 text-yellow-400" /> 
                          : <Lock className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags" className="text-base font-semibold text-white/90">Tags</Label>
                  <Input id="tags" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="e.g. chemistry, chapter-5, important" className="text-base bg-black/30 border-2 border-white/15 text-white"/>
                  <p className="text-gray-500 text-xs mt-1">Separate tags with commas.</p>
                </div>
                {formData.content && formData.content.length >= 50 && (
                  <NoteSummarizer
                    noteContent={formData.content}
                    noteTitle={formData.title || 'Note'}
                  />
                )}

                <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-white/10">
                  <Button type="button" variant="ghost" onClick={onClose} className="px-8 py-3 text-base text-white/80 hover:bg-white/10">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="px-8 py-3 text-base bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl disabled:opacity-50">
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Saving...' : (editingNote ? 'Update Note' : 'Create Note')}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
