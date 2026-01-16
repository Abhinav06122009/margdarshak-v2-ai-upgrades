import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, Pause, RotateCcw, CheckCircle, XCircle, 
  Brain, Clock, Target, Award, Users, Lightbulb,
  ArrowLeft, ArrowRight, Volume2, VolumeX, Languages,
  Star, TrendingUp, BookOpen, MessageSquare
} from 'lucide-react';

interface InterviewPrepProps {
  onBack: () => void;
}

const interviewCategories = [
  {
    id: 'technical',
    title: 'Technical Interviews',
    icon: Brain,
    color: 'from-blue-500 to-purple-600',
    questions: 150,
    difficulty: 'Mixed',
    topics: ['Data Structures', 'Algorithms', 'System Design', 'Coding'],
  },
  {
    id: 'hr',
    title: 'HR & Behavioral',
    icon: Users,
    color: 'from-green-500 to-teal-600',
    questions: 100,
    difficulty: 'Easy-Medium',
    topics: ['Communication', 'Leadership', 'Teamwork', 'Problem Solving'],
  },
  {
    id: 'aptitude',
    title: 'Aptitude & Reasoning',
    icon: Target,
    color: 'from-orange-500 to-red-600',
    questions: 200,
    difficulty: 'Easy-Hard',
    topics: ['Logical Reasoning', 'Quantitative', 'Verbal', 'Analytical'],
  },
  {
    id: 'group-discussion',
    title: 'Group Discussion',
    icon: MessageSquare,
    color: 'from-pink-500 to-purple-600',
    questions: 50,
    difficulty: 'Medium',
    topics: ['Current Affairs', 'Technology', 'Social Issues', 'Business'],
  },
];

const sampleQuestions = {
  technical: [
    {
      id: 1,
      question: "Explain the difference between var, let, and const in JavaScript.",
      difficulty: "Medium",
      category: "JavaScript",
      tips: "Focus on scope, hoisting, and reassignment differences",
      answer: "var has function scope and is hoisted, let has block scope, const has block scope and cannot be reassigned.",
    },
    {
      id: 2,
      question: "Design a URL shortener like bit.ly. What are the key components?",
      difficulty: "Hard",
      category: "System Design",
      tips: "Think about database design, encoding algorithms, caching, and scalability",
      answer: "Key components include URL encoding service, database for mappings, cache layer, analytics, and load balancers.",
    },
  ],
  hr: [
    {
      id: 1,
      question: "Tell me about yourself.",
      difficulty: "Easy",
      category: "Introduction",
      tips: "Keep it professional, relevant, and concise. Follow the present-past-future format.",
      answer: "Structure: Current role/studies → Past experience → Future goals, all relevant to the position.",
    },
    {
      id: 2,
      question: "Describe a time when you faced a difficult challenge at work/study.",
      difficulty: "Medium",
      category: "Behavioral",
      tips: "Use the STAR method: Situation, Task, Action, Result",
      answer: "Focus on problem-solving skills, learning from failure, and positive outcomes.",
    },
  ],
  aptitude: [
    {
      id: 1,
      question: "If a train travels 300 km in 4 hours, what is its average speed?",
      difficulty: "Easy",
      category: "Mathematics",
      tips: "Speed = Distance / Time",
      answer: "75 km/h (300 ÷ 4 = 75)",
    },
    {
      id: 2,
      question: "Find the next number in the sequence: 2, 6, 12, 20, 30, ?",
      difficulty: "Medium",
      category: "Patterns",
      tips: "Look for the pattern in differences between consecutive numbers",
      answer: "42 (differences are 4, 6, 8, 10, 12 - arithmetic progression)",
    },
  ],
};

const mockInterviewScenarios = [
  {
    id: 'fresher-tech',
    title: 'Fresher Software Developer',
    duration: '45 mins',
    rounds: ['Technical Screening', 'Coding Round', 'HR Round'],
    companies: ['TCS', 'Infosys', 'Wipro', 'Accenture'],
  },
  {
    id: 'experienced-tech',
    title: 'Senior Developer (3-5 years)',
    duration: '60 mins',
    rounds: ['System Design', 'Technical Deep Dive', 'Leadership Questions'],
    companies: ['Google', 'Microsoft', 'Amazon', 'Flipkart'],
  },
  {
    id: 'mba-management',
    title: 'Management Trainee',
    duration: '90 mins',
    rounds: ['Case Study', 'Group Discussion', 'Personal Interview'],
    companies: ['ITC', 'Unilever', 'P&G', 'Tata Group'],
  },
];

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
];

const InterviewPrep: React.FC<InterviewPrepProps> = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [practiceMode, setPracticeMode] = useState<'questions' | 'mock' | 'tips'>('questions');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [userProgress, setUserProgress] = useState({
    questionsAnswered: 0,
    correctAnswers: 0,
    totalTime: 0,
    streak: 0,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerReveal = () => {
    setShowAnswer(true);
    setIsTimerRunning(false);
    setUserProgress(prev => ({
      ...prev,
      questionsAnswered: prev.questionsAnswered + 1,
      totalTime: prev.totalTime + timer,
    }));
  };

  const handleNextQuestion = () => {
    setCurrentQuestion(prev => prev + 1);
    setShowAnswer(false);
    setTimer(0);
    setIsTimerRunning(true);
  };

  const handleCorrectAnswer = () => {
    setUserProgress(prev => ({
      ...prev,
      correctAnswers: prev.correctAnswers + 1,
      streak: prev.streak + 1,
    }));
    handleNextQuestion();
  };

  const getCurrentQuestions = () => {
    if (!selectedCategory) return [];
    return sampleQuestions[selectedCategory as keyof typeof sampleQuestions] || [];
  };

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-cosmic p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Button 
              onClick={onBack}
              variant="outline"
              className="absolute top-6 left-6 text-white border-white/20 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <h1 className="text-5xl font-bold text-white mb-4">
              🎯 Interview Preparation
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Master your interview skills with practice questions, mock interviews, 
              and personalized feedback in multiple Indian languages.
            </p>
          </motion.div>

          {/* Language Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <div className="flex items-center space-x-4 glass-effect rounded-2xl p-4">
              <Languages className="h-5 w-5 text-white" />
              <span className="text-white">Interview Language:</span>
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  variant={selectedLanguage === lang.code ? "default" : "outline"}
                  size="sm"
                  className={`${selectedLanguage === lang.code 
                    ? 'bg-white text-black' 
                    : 'text-white border-white/20 hover:bg-white/10'}`}
                >
                  {lang.flag} {lang.name}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold">Questions Practiced</h3>
                <p className="text-2xl text-white">{userProgress.questionsAnswered}</p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-white/20">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold">Accuracy</h3>
                <p className="text-2xl text-white">
                  {userProgress.questionsAnswered > 0 
                    ? Math.round((userProgress.correctAnswers / userProgress.questionsAnswered) * 100)
                    : 0}%
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-white/20">
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold">Total Time</h3>
                <p className="text-2xl text-white">{formatTime(userProgress.totalTime)}</p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-white/20">
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold">Current Streak</h3>
                <p className="text-2xl text-white">{userProgress.streak}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Practice Modes */}
          <Tabs value={practiceMode} onValueChange={(value) => setPracticeMode(value as any)} className="mb-12">
            <TabsList className="grid w-full grid-cols-3 glass-effect">
              <TabsTrigger value="questions">Practice Questions</TabsTrigger>
              <TabsTrigger value="mock">Mock Interviews</TabsTrigger>
              <TabsTrigger value="tips">Interview Tips</TabsTrigger>
            </TabsList>

            <TabsContent value="questions">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {interviewCategories.map((category, index) => {
                  const Icon = category.icon;
                  
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className="glass-effect border-white/20 hover:bg-white/10 transition-all h-full cursor-pointer group"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <CardHeader>
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center mb-4`}>
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          <CardTitle className="text-white text-lg">{category.title}</CardTitle>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-white/60">Questions</span>
                            <span className="text-white font-semibold">{category.questions}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-white/60">Difficulty</span>
                            <Badge variant="outline" className="text-white/60 border-white/20">
                              {category.difficulty}
                            </Badge>
                          </div>

                          <div>
                            <p className="text-white/60 text-sm mb-2">Topics</p>
                            <div className="flex flex-wrap gap-1">
                              {category.topics.slice(0, 2).map((topic, i) => (
                                <Badge key={i} variant="outline" className="text-xs text-white/60 border-white/20">
                                  {topic}
                                </Badge>
                              ))}
                              {category.topics.length > 2 && (
                                <Badge variant="outline" className="text-xs text-white/60 border-white/20">
                                  +{category.topics.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Button 
                            className={`w-full bg-gradient-to-r ${category.color} hover:opacity-90 group-hover:shadow-lg transition-all`}
                          >
                            Start Practice
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            </TabsContent>

            <TabsContent value="mock">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {mockInterviewScenarios.map((scenario, index) => (
                  <Card key={scenario.id} className="glass-effect border-white/20 hover:bg-white/10 transition-all">
                    <CardHeader>
                      <CardTitle className="text-white">{scenario.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-white/60">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {scenario.duration}
                        </span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-white/80 text-sm mb-2">Interview Rounds</p>
                        <div className="space-y-1">
                          {scenario.rounds.map((round, i) => (
                            <div key={i} className="flex items-center text-white/60 text-sm">
                              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                              {round}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-white/80 text-sm mb-2">Similar Companies</p>
                        <div className="flex flex-wrap gap-1">
                          {scenario.companies.map((company, i) => (
                            <Badge key={i} variant="outline" className="text-xs text-white/60 border-white/20">
                              {company}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button className="w-full bg-gradient-to-r from-green-500 to-teal-600">
                        Start Mock Interview
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="tips">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                <Card className="glass-effect border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2" />
                      Before the Interview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-white/80">Research the company, role, and interviewer</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-white/80">Prepare your STAR stories for behavioral questions</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-white/80">Practice coding problems on a whiteboard</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-white/80">Prepare thoughtful questions about the role</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      During the Interview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-white/80">Think out loud while solving problems</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-white/80">Ask clarifying questions before starting</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-white/80">Show enthusiasm and genuine interest</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-white/80">Maintain good eye contact and posture</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Question Practice View
  const questions = getCurrentQuestions();
  const currentQ = questions[currentQuestion];

  if (!currentQ) {
    return (
      <div className="min-h-screen bg-gradient-cosmic p-6 flex items-center justify-center">
        <Card className="glass-effect border-white/20 p-8 text-center">
          <h2 className="text-white text-2xl mb-4">No questions available</h2>
          <Button onClick={() => setSelectedCategory(null)} className="bg-gradient-to-r from-blue-500 to-purple-600">
            Back to Categories
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cosmic p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            onClick={() => setSelectedCategory(null)}
            variant="outline"
            className="text-white border-white/20 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="text-white">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div className="text-white font-mono text-xl">
              {formatTime(timer)}
            </div>
            <Button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              variant="outline"
              size="icon"
              className="text-white border-white/20 hover:bg-white/10"
            >
              {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="space-y-6"
        >
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className={`${
                    currentQ.difficulty === 'Easy' 
                      ? 'border-green-400 text-green-400'
                      : currentQ.difficulty === 'Medium'
                        ? 'border-yellow-400 text-yellow-400'
                        : 'border-red-400 text-red-400'
                  }`}
                >
                  {currentQ.difficulty}
                </Badge>
                <Badge variant="outline" className="text-white/60 border-white/20">
                  {currentQ.category}
                </Badge>
              </div>
              <CardTitle className="text-white text-xl">{currentQ.question}</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center text-blue-400 mb-2">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Tip
                </div>
                <p className="text-white/80">{currentQ.tips}</p>
              </div>

              <AnimatePresence>
                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
                  >
                    <div className="flex items-center text-green-400 mb-2">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Answer
                    </div>
                    <p className="text-white/80">{currentQ.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-4">
                {!showAnswer ? (
                  <Button 
                    onClick={handleAnswerReveal}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
                  >
                    Reveal Answer
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleCorrectAnswer}
                      className="flex-1 bg-gradient-to-r from-green-500 to-teal-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Got it Right
                    </Button>
                    <Button 
                      onClick={handleNextQuestion}
                      variant="outline"
                      className="flex-1 text-white border-white/20 hover:bg-white/10"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Need Practice
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default InterviewPrep;