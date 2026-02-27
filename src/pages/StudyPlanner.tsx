import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Sparkles, Clock, Target, ArrowLeft, Loader2, CheckCircle, Brain, Download } from 'lucide-react';
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

interface StudyPlan {
  overview: string;
  schedule: DaySchedule[];
  tips: string[];
  milestones: string[];
}

interface DaySchedule {
  day: string;
  sessions: StudySession[];
  totalHours: number;
}

interface StudySession {
  time: string;
  subject: string;
  activity: string;
  duration: string;
}

interface PlanConfig {
  subjects: string;
  examDate: string;
  dailyHours: string;
  weakAreas: string;
  studyStyle: string;
}

const StudyPlanner: React.FC = () => {
  const [config, setConfig] = useState<PlanConfig>({
    subjects: '',
    examDate: '',
    dailyHours: '3',
    weakAreas: '',
    studyStyle: 'balanced',
  });
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [completedSessions, setCompletedSessions] = useState<Set<string>>(new Set());
  const { isAIReady } = useAI();
  const { toast } = useToast();

  const daysUntilExam = config.examDate
    ? Math.max(0, Math.ceil((new Date(config.examDate).getTime() - Date.now()) / 86400000))
    : 0;

  const generatePlan = useCallback(async () => {
    if (!config.subjects.trim()) {
      toast({ title: 'Subjects required', description: 'Please enter your subjects/topics.', variant: 'destructive' });
      return;
    }
    if (!isAIReady) {
      toast({ title: 'AI not ready', description: 'Please wait for AI to initialize.', variant: 'destructive' });
      return;
    }

    setLoading(true);

    const daysInfo = config.examDate
      ? `Exam is in ${daysUntilExam} days (${config.examDate})`
      : 'No specific exam date (general study plan for 7 days)';

    const prompt = `Create a detailed study plan for a student.

Subjects/Topics: ${config.subjects}
${daysInfo}
Daily Study Hours Available: ${config.dailyHours} hours
Weak Areas: ${config.weakAreas || 'None specified'}
Study Style Preference: ${config.studyStyle}

Generate a realistic ${config.examDate && daysUntilExam <= 7 ? daysUntilExam : 7}-day study plan.

Return ONLY valid JSON with this exact structure:
{
  "overview": "2-3 sentence summary of the study strategy",
  "schedule": [
    {
      "day": "Monday / Day 1",
      "sessions": [
        {
          "time": "9:00 AM - 10:30 AM",
          "subject": "Subject name",
          "activity": "What to study (e.g., Read chapters 1-3, Practice problems)",
          "duration": "1.5 hours"
        }
      ],
      "totalHours": 3
    }
  ],
  "tips": [
    "Specific study tip 1",
    "Specific study tip 2",
    "Specific study tip 3"
  ],
  "milestones": [
    "Complete X by Day 2",
    "Review Y by Day 4"
  ]
}

Make the schedule realistic, with breaks built in. Focus more time on weak areas.`;

    try {
      const result = await modelRouter.generateJSON<StudyPlan>(prompt);
      if (result && result.schedule && Array.isArray(result.schedule)) {
        setPlan(result);
        setCompletedSessions(new Set());
      } else {
        throw new Error('Invalid plan structure');
      }
    } catch {
      toast({ title: 'Generation failed', description: 'Could not generate study plan. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [config, isAIReady, toast, daysUntilExam]);

  const toggleSession = (sessionKey: string) => {
    setCompletedSessions(prev => {
      const next = new Set(prev);
      if (next.has(sessionKey)) next.delete(sessionKey);
      else next.add(sessionKey);
      return next;
    });
  };

  const totalSessions = plan?.schedule.reduce((sum, day) => sum + day.sessions.length, 0) || 0;
  const completionRate = totalSessions > 0 ? Math.round((completedSessions.size / totalSessions) * 100) : 0;

  const exportToPDF = () => {
    if (!plan) return;
    const doc = new jsPDF();
    const margin = 15;
    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Study Plan', margin, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(plan.overview, margin, y, { maxWidth: doc.internal.pageSize.getWidth() - margin * 2 });
    y += 20;

    plan.schedule.forEach(day => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(day.day, margin, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      day.sessions.forEach(s => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`${s.time} - ${s.subject}: ${s.activity} (${s.duration})`, margin + 5, y);
        y += 5;
      });
      y += 5;
    });

    doc.save('study-plan.pdf');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl">
              <Calendar className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Smart Study Planner</h1>
              <p className="text-zinc-500 text-sm">AI-generated personalized study schedules</p>
            </div>
          </div>
          {plan && (
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
          <div className="space-y-4">
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Plan Details</h2>

              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Subjects / Topics *</Label>
                <Textarea
                  placeholder="e.g., Mathematics (Calculus), Physics (Mechanics), Chemistry (Organic)..."
                  value={config.subjects}
                  onChange={e => setConfig(c => ({ ...c, subjects: e.target.value }))}
                  className="bg-black/40 border-white/10 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 min-h-[80px] text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Exam/Deadline Date</Label>
                <Input
                  type="date"
                  value={config.examDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setConfig(c => ({ ...c, examDate: e.target.value }))}
                  className="bg-black/40 border-white/10 text-white text-sm"
                />
                {config.examDate && (
                  <p className="text-xs text-amber-400">{daysUntilExam} days remaining</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs">Daily Hours</Label>
                  <Select value={config.dailyHours} onValueChange={v => setConfig(c => ({ ...c, dailyHours: v }))}>
                    <SelectTrigger className="bg-black/40 border-white/10 text-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {['1', '2', '3', '4', '5', '6', '8'].map(h => (
                        <SelectItem key={h} value={h}>{h}h/day</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs">Style</Label>
                  <Select value={config.studyStyle} onValueChange={v => setConfig(c => ({ ...c, studyStyle: v }))}>
                    <SelectTrigger className="bg-black/40 border-white/10 text-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="intensive">Intensive</SelectItem>
                      <SelectItem value="spaced">Spaced Repetition</SelectItem>
                      <SelectItem value="pomodoro">Pomodoro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Weak Areas (optional)</Label>
                <Input
                  placeholder="e.g., Integration, Thermodynamics..."
                  value={config.weakAreas}
                  onChange={e => setConfig(c => ({ ...c, weakAreas: e.target.value }))}
                  className="bg-black/40 border-white/10 text-white placeholder:text-zinc-600 text-sm"
                />
              </div>

              <Button
                onClick={generatePlan}
                disabled={loading || !config.subjects.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-11 rounded-xl"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Generate Plan</>
                )}
              </Button>
            </div>

            {plan && (
              <>
                <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Progress</span>
                    <span className="text-sm font-bold text-emerald-400">{completionRate}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500 rounded-full"
                      animate={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">{completedSessions.size} / {totalSessions} sessions done</p>
                </div>

                <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5" />Tips
                  </p>
                  {plan.tips.map((tip, i) => (
                    <p key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>{tip}
                    </p>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-2">
            {!plan && !loading && (
              <div className="flex flex-col items-center justify-center h-64 bg-zinc-900/30 border border-white/5 rounded-2xl text-center">
                <Calendar className="w-12 h-12 text-zinc-700 mb-3" />
                <p className="text-zinc-500 text-sm">Enter your details and generate a personalized study plan</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 animate-ping absolute inset-0" />
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  </div>
                </div>
                <p className="text-zinc-400 text-sm">Building your personalized study plan...</p>
              </div>
            )}

            {plan && (
              <div className="space-y-4">
                <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-4">
                  <p className="text-sm text-zinc-300 leading-relaxed">{plan.overview}</p>
                </div>

                {plan.schedule.map((day, dayIndex) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: dayIndex * 0.05 }}
                    className="bg-zinc-900/60 border border-white/10 rounded-2xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 bg-white/3 border-b border-white/5">
                      <span className="text-sm font-bold text-white">{day.day}</span>
                      <span className="text-xs text-zinc-500">{day.totalHours}h total</span>
                    </div>

                    <div className="p-3 space-y-2">
                      {day.sessions.map((session, sessionIndex) => {
                        const sessionKey = `${dayIndex}-${sessionIndex}`;
                        const isDone = completedSessions.has(sessionKey);

                        return (
                          <button
                            key={sessionIndex}
                            onClick={() => toggleSession(sessionKey)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                              isDone
                                ? 'bg-emerald-500/10 border border-emerald-500/20'
                                : 'bg-white/3 border border-white/5 hover:bg-white/8'
                            }`}
                          >
                            <CheckCircle className={`w-4 h-4 flex-shrink-0 ${isDone ? 'text-emerald-400' : 'text-zinc-700'}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-zinc-500 font-mono">{session.time}</span>
                                <span className={`text-sm font-semibold ${isDone ? 'text-zinc-500 line-through' : 'text-white'}`}>
                                  {session.subject}
                                </span>
                              </div>
                              <p className={`text-xs mt-0.5 ${isDone ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                {session.activity}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Clock className="w-3 h-3 text-zinc-600" />
                              <span className="text-xs text-zinc-500">{session.duration}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}

                {plan.milestones && plan.milestones.length > 0 && (
                  <div className="bg-zinc-900/60 border border-amber-500/20 rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" />Key Milestones
                    </p>
                    {plan.milestones.map((m, i) => (
                      <p key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                        <span className="text-amber-500 font-bold flex-shrink-0">{i + 1}.</span>{m}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;
