import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, X, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { modelRouter } from '@/lib/ai/modelRouter';
import { useAI } from '@/contexts/AIContext';

interface NoteSummarizerProps {
  noteContent: string;
  noteTitle: string;
}

const NoteSummarizer: React.FC<NoteSummarizerProps> = ({ noteContent, noteTitle }) => {
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { isAIReady } = useAI();
  const { toast } = useToast();

  const truncatedContent = noteContent.substring(0, 3000);

  const generate = async () => {
    if (!isAIReady) {
      toast({ title: 'AI not ready', variant: 'destructive' });
      return;
    }
    if (!noteContent.trim() || noteContent.length < 50) {
      toast({ title: 'Note too short', description: 'Add more content to your note for a summary.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setIsExpanded(true);

    try {
      const prompt = `Analyze this note titled "${noteTitle}" and provide:
1. A concise summary (2-3 sentences)
2. 3-5 key points as bullet points

Note content:
${truncatedContent}

Return ONLY valid JSON:
{
  "summary": "...",
  "keyPoints": ["point 1", "point 2", "point 3"]
}`;

      const result = await modelRouter.generateJSON<{ summary: string; keyPoints: string[] }>(prompt, {
        useCache: true,
        cacheKey: `note_summary_${noteTitle}_${noteContent.substring(0, 100)}`,
      });

      if (result) {
        setSummary(result.summary || '');
        setKeyPoints(result.keyPoints || []);
        setHasGenerated(true);
      }
    } catch {
      toast({ title: 'Summary failed', description: 'Could not summarize note.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    const text = `Summary:\n${summary}\n\nKey Points:\n${keyPoints.map(p => `• ${p}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
      <button
        onClick={() => {
          if (!hasGenerated) generate();
          else setIsExpanded(prev => !prev);
        }}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">AI Summary</span>
          {loading && <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin ml-1" />}
        </div>
        {hasGenerated && (
          isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />
        )}
        {!hasGenerated && !loading && (
          <span className="text-xs text-amber-400 font-medium">Generate →</span>
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (loading || hasGenerated) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/5">
              {loading && (
                <div className="flex items-center gap-2 py-3 text-zinc-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  Generating summary...
                </div>
              )}

              {!loading && summary && (
                <>
                  <div className="pt-3">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Summary</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">{summary}</p>
                  </div>

                  {keyPoints.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Key Points</p>
                      <ul className="space-y-1">
                        {keyPoints.map((point, i) => (
                          <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                            <span className="text-amber-400 mt-1 flex-shrink-0">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="ghost" onClick={copyAll} className="text-xs text-zinc-400 hover:text-white h-7 px-2">
                      <Copy className="w-3 h-3 mr-1" />Copy
                    </Button>
                    <Button size="sm" variant="ghost" onClick={generate} className="text-xs text-zinc-400 hover:text-white h-7 px-2">
                      <Sparkles className="w-3 h-3 mr-1" />Regenerate
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NoteSummarizer;
