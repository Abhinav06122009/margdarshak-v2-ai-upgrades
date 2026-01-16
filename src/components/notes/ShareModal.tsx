import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Note } from './types';
import { Send, Users, X } from 'lucide-react';

interface ShareModalProps {
  note: Note | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ note, onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  if (!note) return null;

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call a backend service to handle sharing logic
    // (e.g., create a sharing record, send an email notification).
    alert(`Sharing "${note.title}" with ${email}.\n\n(This is a demo. No email will be sent.)`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-black backdrop-blur-lg rounded-2xl border border-white/20 p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-green-400" />
            Share Note
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">✕</button>
        </div>
        <p className="text-white/70 mb-6">Share "{note.title}" with others for collaboration or peer review.</p>

        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Recipient's Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="colleague@example.com" required />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors font-semibold">Cancel</button>
            <button type="submit" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity font-semibold flex items-center gap-2">
              <Send className="w-4 h-4" />
              Share
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};