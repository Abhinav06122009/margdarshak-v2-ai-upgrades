import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, X, Send, Minimize2, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { modelRouter } from '@/lib/ai/modelRouter';
import { useAI } from '@/contexts/AIContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  'Summarize my current tasks',
  'Give me a study tip',
  'Help me prioritize',
  'Explain a concept',
];

const PAGE_CONTEXT: Record<string, string> = {
  '/dashboard': 'student dashboard',
  '/tasks': 'task management',
  '/grades': 'grade tracking',
  '/notes': 'note taking',
  '/attendance': 'attendance tracking',
  '/timetable': 'timetable planning',
  '/calendar': 'calendar and events',
  '/progress': 'progress tracking',
  '/courses': 'course management',
  '/ai-chat': 'AI tutor chat',
};

const GlobalAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const { isAIReady } = useAI();

  const currentPageContext = PAGE_CONTEXT[location.pathname] || 'student platform';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setIsMinimized(false);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const systemPrompt = `You are MARGDARSHAK, a helpful AI assistant for students. The user is currently on the ${currentPageContext} page. Keep responses concise (2-4 sentences max) and focused on academic help. Be encouraging and practical.`;

      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const allMessages = [...history, { role: 'user', content: text }];

      const response = await modelRouter.chat(allMessages, { systemPrompt });
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'m having trouble connecting right now. Please try the full AI Tutor at /ai-chat.',
      }]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, currentPageContext]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[500px] flex flex-col bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-[1.5rem] shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-transparent">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/20 rounded-lg">
                  <BrainCircuit className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white">AI Assistant</span>
                  <span className="ml-2 text-[10px] text-zinc-400 capitalize">{currentPageContext}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[300px]">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                  <Sparkles className="w-8 h-8 text-amber-500/40 mb-2" />
                  <p className="text-zinc-500 text-xs">Ask me anything about your studies!</p>
                  <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                    {QUICK_PROMPTS.map(p => (
                      <button
                        key={p}
                        onClick={() => sendMessage(p)}
                        className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/30 text-zinc-400 hover:text-amber-300 transition-all"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-amber-500 text-black font-medium rounded-tr-sm'
                        : 'bg-white/5 text-zinc-200 border border-white/10 rounded-tl-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-3 py-2">
                    <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-white/10">
              <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 focus-within:border-amber-500/40 px-3 py-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-zinc-600 text-center mt-1.5">
                Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-zinc-500 font-mono text-[9px]">Ctrl+K</kbd> to toggle
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => {
          setIsOpen(prev => !prev);
          setIsMinimized(false);
        }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="AI Assistant (Ctrl+K)"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative">
              <MessageSquare className="w-6 h-6" />
              {messages.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {isMinimized && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-24 right-6 z-50 px-3 py-1.5 bg-zinc-800 border border-white/10 rounded-full text-xs text-zinc-300 hover:bg-zinc-700 flex items-center gap-1.5 shadow-lg"
        >
          <BrainCircuit className="w-3 h-3 text-amber-500" />
          AI Chat
        </motion.button>
      )}
    </>
  );
};

export default GlobalAIAssistant;
