import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, CheckSquare, BookOpen, Calendar as CalendarIcon, 
  GraduationCap, Settings, Plus, LogOut, Search 
} from 'lucide-react';

const CommandPalette = ({ isOpen, onClose, onAction }: { isOpen: boolean, onClose: () => void, onAction: (action: string) => Promise<void> | void }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = useMemo(() => [
    { name: 'Go to Dashboard', action: () => onAction('navigate:dashboard'), icon: <BarChart3 size={18} /> },
    { name: 'Go to Tasks', action: () => onAction('navigate:tasks'), icon: <CheckSquare size={18} /> },
    { name: 'Go to Notes', action: () => onAction('navigate:notes'), icon: <BookOpen size={18} /> },
    { name: 'Go to Schedule', action: () => onAction('navigate:timetable'), icon: <CalendarIcon size={18} /> },
    { name: 'Go to Courses', action: () => onAction('navigate:courses'), icon: <GraduationCap size={18} /> },
    { name: 'Go to Settings', action: () => onAction('navigate:settings'), icon: <Settings size={18} /> },
    { name: 'Add New Task', action: () => onAction('createTask'), icon: <Plus size={18} /> },
    { name: 'Logout', action: () => onAction('logout'), icon: <LogOut size={18} /> },
  ], [onAction]);

  const filteredCommands = useMemo(() =>
    commands.filter(cmd => cmd.name.toLowerCase().includes(search.toLowerCase())),
    [search, commands]
  );

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 pt-24" onClick={onClose}>
          <motion.div initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} className="bg-black/50 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10 flex items-center gap-4">
              <Search className="text-white/50" />
              <input type="text" placeholder="Type a command or search..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleKeyDown} className="w-full bg-transparent text-white placeholder:text-white/50 focus:outline-none text-lg" autoFocus />
            </div>
            <div className="p-2 max-h-96 overflow-y-auto">
              {filteredCommands.map((cmd, index) => (
                <div key={cmd.name} onClick={() => { cmd.action(); onClose(); }} className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${selectedIndex === index ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                  <div className="text-white/70">{cmd.icon}</div>
                  <span className="text-white/90">{cmd.name}</span>
                </div>
              ))}
              {filteredCommands.length === 0 && <div className="p-8 text-center text-white/50">No results found.</div>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;