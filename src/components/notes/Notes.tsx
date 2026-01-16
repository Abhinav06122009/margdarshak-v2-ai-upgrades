import React from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import logo from "@/components/logo/logo.png";
import { NotesProps } from './types';
import { useSecureNotes } from './useSecureNotes.tsx';
import { NotesDashboard } from './NotesDashboard';
import { NotesFolderView } from './NotesFolderView';
import { NoteSheet } from './NoteSheet.tsx';
import { ShareModal } from './ShareModal.tsx';
import { CommandMenu } from './CommandMenu.tsx';

const Notes: React.FC<NotesProps> = ({ onBack }) => {
  const hookProps = useSecureNotes();
  const { loading, securityVerified, currentUser, currentView, showShareModal, noteToShare, closeShareModal, openShareModal, isSheetOpen, setIsSheetOpen, notes, folders, handleEdit, handleFolderSelect, handleCreateNote, hasPremiumAccess } = hookProps;

  if (loading || !securityVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 border border-white/20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Initializing secure notes system...</p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-green-300 text-sm">Maximum Security Active</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <CommandMenu 
        notes={notes}
        folders={folders}
        onSelectNote={handleEdit}
        onSelectFolder={handleFolderSelect}
        onCreateNew={handleCreateNote}
      />
      {
        !currentUser ? (
          <div className="flex items-center justify-center h-screen">
            <div className="glass-morphism rounded-2xl p-8 border border-white/20 text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-4">Authentication Required</h2>
              <p className="text-white/70 mb-6">Please log in to access your private notes.</p>
            </div>
          </div>
        ) : currentView === 'main' ? (
          <NotesDashboard {...hookProps} onBack={onBack} openShareModal={openShareModal} />
        ) : (
          <NotesFolderView {...hookProps} openShareModal={openShareModal} />
        )
      }
      <NoteSheet 
        {...hookProps} 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
        hasPremiumAccess={hasPremiumAccess} 
      />
      {showShareModal && <ShareModal note={noteToShare} onClose={closeShareModal} />}
      <Footer />
    </div>
  );
};

const Footer = () => (
  <footer className="mt-12 py-6 border-t border-white/20 text-sm select-none flex items-center justify-center gap-4 text-white/70">
    <img src={logo} alt="MARGDARSHAK Logo" className="w-15 h-14 object-contain mr-4 bg-white" draggable={false} style={{ minWidth: 48 }} />
    <div className="text-center">
      Maintained by <span className="font-semibold text-emerald-400">VSAV GYANTAPA</span><br />
      Developed &amp; Maintained by <span className="font-semibold text-emerald-400">VSAV GYANTAPA</span><br />
      © 2025 VSAV GYANTAPA. All Rights Reserved
    </div>
  </footer>
);

export default Notes;
