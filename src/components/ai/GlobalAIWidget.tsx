import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, Sparkles, Loader2, X, WandSparkles, Brain, BookOpenCheck } from 'lucide-react';
import { askMargdarshakAI, getSubscriptionTier, resolveAiAuthHeaders, type AIModelRoute, type SubscriptionTier } from '@/lib/aiGateway';

const quickActions: Array<{ label: string; icon: any; prompt: (pathname: string) => string; route: AIModelRoute }> = [
  {
    label: 'Summarize this page',
    icon: WandSparkles,
    route: 'fast',
    prompt: (pathname) => `Summarize what a student should do on the ${pathname} page in 5 bullets.`,
  },
  {
    label: 'Explain key concept',
    icon: Brain,
    route: 'reasoning',
    prompt: (pathname) => `I am on ${pathname}. Explain the most important concept related to this module in easy language.`,
  },
  {
    label: 'Quiz me',
    icon: BookOpenCheck,
    route: 'analysis',
    prompt: (pathname) => `Generate a short 5-question quiz based on the learning context of ${pathname}.`,
  },
];

const GlobalAIWidget = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [answer, setAnswer] = useState('');
  const [input, setInput] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    getSubscriptionTier().then(setTier).catch(() => setTier('free'));
  }, []);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  const keyState = useMemo(() => resolveAiAuthHeaders(tier), [tier]);

  const runPrompt = async (prompt: string, route: AIModelRoute = 'fast') => {
    setLoading(true);
    setAnswer('');

    try {
      if (!keyState.canProceed) {
        setAnswer('Set your BYOK API key from AI Tutor first. Premium+Elite users can also configure VITE_EMERGENT_LLM_KEY.');
        return;
      }

      const { data } = await askMargdarshakAI({
        route,
        tier,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = data?.response || 'No response received.';
      setAnswer(text);
    } catch (error: any) {
      setAnswer(`AI assistant failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (location.pathname === '/auth' || location.pathname.startsWith('/reset-password')) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-emerald-500 text-black p-4 shadow-2xl hover:scale-105 transition"
        aria-label="Open AI Assistant"
      >
        <Bot className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center md:justify-end p-4">
          <div className="w-full md:w-[420px] rounded-2xl border border-white/10 bg-[#0b0b0b] text-white p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-emerald-400" /> Global AI Assistant</p>
                <p className="text-xs text-white/60">Context: {location.pathname} · Ctrl+K</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white"><X className="h-4 w-4" /></button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => runPrompt(action.prompt(location.pathname), action.route)}
                  className="text-left text-sm px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-2"
                >
                  <action.icon className="h-4 w-4 text-emerald-300" />
                  {action.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about this page..."
                className="flex-1 rounded-lg bg-black border border-white/10 px-3 py-2 text-sm"
              />
              <button
                onClick={() => runPrompt(input || `Help me use ${location.pathname} effectively.`, 'reasoning')}
                disabled={loading}
                className="rounded-lg bg-emerald-500 px-3 text-black text-sm font-semibold disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ask'}
              </button>
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 min-h-[120px] p-3 text-sm text-white/85 whitespace-pre-wrap">
              {answer || 'Try a quick action to get instant help for this page.'}
            </div>

            <div className="text-[11px] text-white/50 flex items-center justify-between">
              <span>Key mode: {keyState.source}</span>
              <button onClick={() => navigate('/ai-chat')} className="text-emerald-300 hover:underline">Open full AI Tutor</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalAIWidget;
