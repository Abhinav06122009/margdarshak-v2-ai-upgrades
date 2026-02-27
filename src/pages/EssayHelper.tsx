import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, Copy, Download, Loader2, ArrowLeft, BookOpen, List, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { modelRouter } from '@/lib/ai/modelRouter';
import { useAI } from '@/contexts/AIContext';
import { jsPDF } from 'jspdf';

type ToolType = 'outline' | 'introduction' | 'thesis' | 'conclusion';

interface EssayConfig {
  topic: string;
  type: string;
  wordCount: string;
  tone: string;
}

const ESSAY_TYPES = ['Argumentative', 'Expository', 'Analytical', 'Compare & Contrast', 'Narrative', 'Research'];
const TONES = ['Academic', 'Formal', 'Conversational', 'Persuasive'];

const EssayHelper: React.FC = () => {
  const [config, setConfig] = useState<EssayConfig>({
    topic: '',
    type: 'Argumentative',
    wordCount: '500',
    tone: 'Academic',
  });
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [outputs, setOutputs] = useState<Partial<Record<ToolType, string>>>({});
  const [loading, setLoading] = useState<ToolType | null>(null);
  const [expandedSection, setExpandedSection] = useState<ToolType | null>(null);
  const { isAIReady } = useAI();
  const { toast } = useToast();

  const generate = useCallback(async (tool: ToolType) => {
    if (!config.topic.trim()) {
      toast({ title: 'Topic required', description: 'Please enter your essay topic first.', variant: 'destructive' });
      return;
    }
    if (!isAIReady) {
      toast({ title: 'AI not ready', description: 'Please wait for AI to initialize.', variant: 'destructive' });
      return;
    }

    setLoading(tool);
    setActiveTool(tool);

    const prompts: Record<ToolType, string> = {
      outline: `Create a detailed essay outline for a ${config.wordCount}-word ${config.type} essay on "${config.topic}" with a ${config.tone} tone.

Format it as:
I. Introduction
   A. Hook
   B. Background
   C. Thesis Statement

II. Body Paragraph 1 - [Topic]
   A. Main Point
   B. Supporting Evidence
   C. Analysis

(continue for 2-3 more body paragraphs)

V. Conclusion
   A. Restatement of thesis
   B. Summary of main points
   C. Closing thought

Keep it structured and specific to the topic.`,

      introduction: `Write a compelling introduction paragraph for a ${config.wordCount}-word ${config.type} essay on "${config.topic}" with a ${config.tone} tone.

Include:
1. An engaging hook (question, statistic, or anecdote)
2. Brief background context (2-3 sentences)
3. A clear thesis statement

Keep it under 150 words. Write the actual paragraph, not instructions.`,

      thesis: `Generate 3 strong thesis statements for a ${config.type} essay on "${config.topic}" with a ${config.tone} tone.

For each thesis:
- Make it specific and arguable
- Keep it to 1-2 sentences
- Ensure it's appropriate for a ${config.wordCount}-word essay

Number them 1, 2, 3 and briefly explain (1 sentence) why each works.`,

      conclusion: `Write a strong conclusion paragraph for a ${config.type} essay on "${config.topic}" with a ${config.tone} tone.

Include:
1. Restatement of thesis (in new words)
2. Brief summary of key arguments
3. Broader significance or call to action
4. Memorable closing sentence

Keep it under 150 words. Write the actual paragraph, not instructions.`,
    };

    try {
      const result = await modelRouter.complete(prompts[tool], {
        systemPrompt: 'You are an expert academic writing assistant. Provide high-quality, structured writing assistance.',
        useCache: true,
        cacheKey: `essay_${tool}_${config.topic}_${config.type}`,
      });
      setOutputs(prev => ({ ...prev, [tool]: result }));
      setExpandedSection(tool);
    } catch {
      toast({ title: 'Generation failed', description: 'Could not generate content. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  }, [config, isAIReady, toast]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Content copied to clipboard.' });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`Essay Helper: ${config.topic}`, margin, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Type: ${config.type} | Tone: ${config.tone} | Word Count: ~${config.wordCount}`, margin, y);
    y += 15;

    (Object.entries(outputs) as [ToolType, string][]).forEach(([tool, content]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(tool.charAt(0).toUpperCase() + tool.slice(1), margin, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(content, pageWidth);
      lines.forEach((line: string) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, margin, y);
        y += 5;
      });
      y += 10;
    });

    doc.save(`essay-helper-${config.topic.substring(0, 20)}.pdf`);
  };

  const tools: { id: ToolType; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'outline', label: 'Essay Outline', icon: <List className="w-4 h-4" />, description: 'Full structured outline' },
    { id: 'thesis', label: 'Thesis Statements', icon: <BookOpen className="w-4 h-4" />, description: '3 strong thesis options' },
    { id: 'introduction', label: 'Introduction', icon: <FileText className="w-4 h-4" />, description: 'Compelling opening paragraph' },
    { id: 'conclusion', label: 'Conclusion', icon: <FileText className="w-4 h-4" />, description: 'Strong closing paragraph' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-xl">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Essay Helper</h1>
              <p className="text-zinc-500 text-sm">AI-powered writing assistance</p>
            </div>
          </div>
          {Object.keys(outputs).length > 0 && (
            <Button
              onClick={exportToPDF}
              variant="outline"
              size="sm"
              className="ml-auto border-white/10 text-zinc-300 hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Essay Details</h2>

              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Topic *</Label>
                <Textarea
                  placeholder="e.g., The impact of social media on mental health..."
                  value={config.topic}
                  onChange={e => setConfig(c => ({ ...c, topic: e.target.value }))}
                  className="bg-black/40 border-white/10 text-white placeholder:text-zinc-600 focus-visible:border-blue-500/50 min-h-[80px] text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Essay Type</Label>
                <Select value={config.type} onValueChange={v => setConfig(c => ({ ...c, type: v }))}>
                  <SelectTrigger className="bg-black/40 border-white/10 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                    {ESSAY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs">Word Count</Label>
                  <Select value={config.wordCount} onValueChange={v => setConfig(c => ({ ...c, wordCount: v }))}>
                    <SelectTrigger className="bg-black/40 border-white/10 text-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {['250', '500', '750', '1000', '1500', '2000'].map(n => (
                        <SelectItem key={n} value={n}>{n} words</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs">Tone</Label>
                  <Select value={config.tone} onValueChange={v => setConfig(c => ({ ...c, tone: v }))}>
                    <SelectTrigger className="bg-black/40 border-white/10 text-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {TONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => generate(tool.id)}
                  disabled={loading !== null}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/60 border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-left disabled:opacity-50 group"
                >
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                    {loading === tool.id ? <Loader2 className="w-4 h-4 animate-spin" /> : tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{tool.label}</p>
                    <p className="text-xs text-zinc-500">{tool.description}</p>
                  </div>
                  {outputs[tool.id] && (
                    <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  )}
                  <Sparkles className="w-3.5 h-3.5 text-zinc-600 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {Object.keys(outputs).length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 bg-zinc-900/30 border border-white/5 rounded-2xl text-center">
                <FileText className="w-12 h-12 text-zinc-700 mb-3" />
                <p className="text-zinc-500 text-sm">Enter your essay topic and click a tool to generate content</p>
              </div>
            )}

            {(Object.entries(outputs) as [ToolType, string][]).map(([tool, content]) => (
              <div key={tool} className="bg-zinc-900/60 border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === tool ? null : tool)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white capitalize">{tool}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">Ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); copyToClipboard(content); }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {expandedSection === tool ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedSection === tool && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-white/5">
                        <pre className="mt-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">
                          {content}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EssayHelper;
