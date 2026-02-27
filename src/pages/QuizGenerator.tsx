import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Sparkles, RefreshCw, CheckCircle, XCircle, ChevronRight, BookOpen, Target, Trophy, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { modelRouter } from '@/lib/ai/modelRouter';
import { useAI } from '@/contexts/AIContext';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizConfig {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  type: 'mcq' | 'truefalse';
}

type QuizState = 'config' | 'loading' | 'playing' | 'results';

const QuizGenerator: React.FC = () => {
  const [state, setState] = useState<QuizState>('config');
  const [config, setConfig] = useState<QuizConfig>({
    topic: '',
    difficulty: 'medium',
    count: 5,
    type: 'mcq',
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const { isAIReady } = useAI();
  const { toast } = useToast();

  const generateQuiz = useCallback(async () => {
    if (!config.topic.trim()) {
      toast({ title: 'Topic required', description: 'Please enter a topic for your quiz.', variant: 'destructive' });
      return;
    }
    if (!isAIReady) {
      toast({ title: 'AI not ready', description: 'Please wait for AI to initialize.', variant: 'destructive' });
      return;
    }

    setState('loading');

    const prompt = `Generate ${config.count} ${config.type === 'truefalse' ? 'True/False' : 'multiple choice'} quiz questions about "${config.topic}" at ${config.difficulty} difficulty level for a student.

Return ONLY valid JSON array with this exact structure:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Brief explanation of why this answer is correct"
  }
]

For True/False questions, options should be ["True", "False"].
The "correct" field is the index (0-based) of the correct option.
Make questions academically accurate and educational.`;

    try {
      const result = await modelRouter.generateJSON<QuizQuestion[]>(prompt);
      if (result && Array.isArray(result) && result.length > 0) {
        setQuestions(result.slice(0, config.count));
        setCurrentIndex(0);
        setAnswers([]);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setState('playing');
      } else {
        throw new Error('Invalid quiz data returned');
      }
    } catch {
      toast({ title: 'Generation failed', description: 'Could not generate quiz. Please try again.', variant: 'destructive' });
      setState('config');
    }
  }, [config, isAIReady, toast]);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (selectedAnswer === null) return;
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentIndex + 1 >= questions.length) {
      setState('results');
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const score = answers.filter((ans, i) => ans === questions[i]?.correct).length;
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-xl">
              <BrainCircuit className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Quiz Generator</h1>
              <p className="text-zinc-500 text-sm">AI-powered quizzes on any topic</p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {state === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 space-y-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  Configure Your Quiz
                </h2>

                <div className="space-y-2">
                  <Label className="text-zinc-300">Topic *</Label>
                  <Input
                    placeholder="e.g., Photosynthesis, French Revolution, Calculus..."
                    value={config.topic}
                    onChange={e => setConfig(c => ({ ...c, topic: e.target.value }))}
                    className="bg-black/40 border-white/10 text-white placeholder:text-zinc-600 focus-visible:border-amber-500/50"
                    onKeyDown={e => e.key === 'Enter' && generateQuiz()}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Difficulty</Label>
                    <Select value={config.difficulty} onValueChange={(v: 'easy' | 'medium' | 'hard') => setConfig(c => ({ ...c, difficulty: v }))}>
                      <SelectTrigger className="bg-black/40 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white">
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300">Questions</Label>
                    <Select value={String(config.count)} onValueChange={v => setConfig(c => ({ ...c, count: Number(v) }))}>
                      <SelectTrigger className="bg-black/40 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white">
                        {[3, 5, 8, 10].map(n => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300">Type</Label>
                    <Select value={config.type} onValueChange={(v: 'mcq' | 'truefalse') => setConfig(c => ({ ...c, type: v }))}>
                      <SelectTrigger className="bg-black/40 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white">
                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                        <SelectItem value="truefalse">True / False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={generateQuiz}
                  disabled={!config.topic.trim()}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold h-12 rounded-xl"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Quiz
                </Button>
              </div>
            </motion.div>
          )}

          {state === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-4"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-amber-500/20 animate-ping absolute inset-0" />
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
              </div>
              <p className="text-zinc-400 text-sm">Generating your quiz on "{config.topic}"...</p>
            </motion.div>
          )}

          {state === 'playing' && currentQuestion && (
            <motion.div
              key={`question-${currentIndex}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span className="capitalize">{config.difficulty} • {config.topic}</span>
              </div>

              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-amber-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6">
                <p className="text-lg font-semibold text-white leading-relaxed mb-6">
                  {currentQuestion.question}
                </p>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, i) => {
                    const isSelected = selectedAnswer === i;
                    const isCorrect = i === currentQuestion.correct;
                    const showResult = selectedAnswer !== null;

                    let optionClass = 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:border-white/20';
                    if (showResult) {
                      if (isCorrect) optionClass = 'border border-emerald-500/60 bg-emerald-500/10 text-emerald-300';
                      else if (isSelected && !isCorrect) optionClass = 'border border-red-500/60 bg-red-500/10 text-red-300';
                      else optionClass = 'border border-white/5 bg-white/2 text-zinc-600';
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={selectedAnswer !== null}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${optionClass} ${selectedAnswer === null ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        <span className="w-6 h-6 rounded-full border border-current flex-shrink-0 flex items-center justify-center text-xs font-bold">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{option}</span>
                        {showResult && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto flex-shrink-0" />}
                        {showResult && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 ml-auto flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 rounded-xl bg-zinc-800/60 border border-white/10"
                    >
                      <p className="text-xs font-bold text-amber-400 mb-1 uppercase tracking-wider">Explanation</p>
                      <p className="text-sm text-zinc-300">{currentQuestion.explanation}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {selectedAnswer !== null && (
                  <Button
                    onClick={nextQuestion}
                    className="w-full mt-4 bg-amber-500 hover:bg-amber-400 text-black font-bold"
                  >
                    {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {state === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8 text-center">
                <div className="mb-4">
                  {percentage >= 80 ? (
                    <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-3" />
                  ) : percentage >= 60 ? (
                    <Target className="w-16 h-16 text-blue-400 mx-auto mb-3" />
                  ) : (
                    <RefreshCw className="w-16 h-16 text-zinc-400 mx-auto mb-3" />
                  )}
                  <h2 className="text-3xl font-black text-white">{percentage}%</h2>
                  <p className="text-zinc-400 mt-1">
                    {score} out of {questions.length} correct
                  </p>
                </div>

                <p className="text-zinc-300 text-sm mb-6">
                  {percentage >= 80
                    ? 'Excellent work! You have a strong grasp of this topic.'
                    : percentage >= 60
                    ? 'Good effort! Review the missed questions to strengthen your knowledge.'
                    : 'Keep studying! Try again after reviewing the topic.'}
                </p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {questions.map((q, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg border text-xs font-bold ${
                        answers[i] === q.correct
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}
                    >
                      Q{i + 1}: {answers[i] === q.correct ? '✓' : '✗'}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => { setState('config'); setQuestions([]); setAnswers([]); }}
                    variant="outline"
                    className="flex-1 border-white/10 text-zinc-300 hover:bg-white/10"
                  >
                    New Quiz
                  </Button>
                  <Button
                    onClick={() => { setCurrentIndex(0); setAnswers([]); setSelectedAnswer(null); setShowExplanation(false); setState('playing'); }}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizGenerator;
