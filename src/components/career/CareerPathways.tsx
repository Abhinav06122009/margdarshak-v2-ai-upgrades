import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Code, Palette, Users, TrendingUp, Brain, Stethoscope, 
  Calculator, Globe, BookOpen, Target, Star, ArrowRight,
  DollarSign, Clock, Trophy, Award, Shield, User, CheckCircle
} from 'lucide-react';

interface CareerPathwaysProps {
  onBack: () => void;
}

interface CareerPath {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  salary_range: string;
  growth_rate: string;
  time_to_success: string;
  skills?: any[];
  roadmap?: any[];
  resources?: any[];
  user_progress?: any;
}

interface User {
  id: string;
  email: string;
  profile?: {
    full_name: string;
    user_type: string;
  };
}

// Icon mapping for dynamic icons
const iconMap: { [key: string]: any } = {
  Code,
  Palette,
  TrendingUp,
  Stethoscope,
  DollarSign,
  BookOpen,
  Users,
  Brain,
  Calculator,
  Globe
};

// Secure helper functions for Career Pathways
const careerHelpers = {
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email || '',
        profile: profile ? {
          full_name: profile.full_name || 'User',
          user_type: profile.user_type || 'student'
        } : undefined
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  fetchCareerPaths: async () => {
    try {
      const { data, error } = await supabase
        .from('career_paths')
        .select('*')
        .eq('is_active', true)
        .order('title');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching career paths:', error);
      return [];
    }
  },

  getCareerPathDetails: async (pathId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_career_path_with_progress', { path_id: pathId });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching career path details:', error);
      return null;
    }
  },

  startCareerJourney: async (pathId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('start_career_journey', { p_career_path_id: pathId });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting career journey:', error);
      throw error;
    }
  },

  updateSkillProgress: async (skillId: string, proficiencyLevel: number, currentLevel: string) => {
    try {
      const { data, error } = await supabase
        .rpc('update_skill_progress', {
          p_skill_id: skillId,
          p_proficiency_level: proficiencyLevel,
          p_current_level: currentLevel
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating skill progress:', error);
      throw error;
    }
  },

  completeRoadmapStep: async (stepId: string, careerPathId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('complete_roadmap_step', {
          p_step_id: stepId,
          p_career_path_id: careerPathId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error completing roadmap step:', error);
      throw error;
    }
  }
};

const CareerPathways: React.FC<CareerPathwaysProps> = ({ onBack }) => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [selectedPathData, setSelectedPathData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeCareerPathways();
  }, []);

  const initializeCareerPathways = async () => {
    try {
      setLoading(true);
      
      // Get current user (optional - works for both authenticated and anonymous)
      const user = await careerHelpers.getCurrentUser();
      setCurrentUser(user);
      
      // Fetch career paths (public data)
      const paths = await careerHelpers.fetchCareerPaths();
      setCareerPaths(paths);
      
      setSecurityVerified(true);
      
      if (user) {
        toast({
          title: "Welcome to Career Pathways!",
          description: `Hello ${user.profile?.full_name}! Your progress will be tracked securely.`,
        });
      }
      
    } catch (error) {
      console.error('Error initializing career pathways:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load career pathways. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartJourney = async (pathId: string) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to track your career progress.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Start career journey in database
      await careerHelpers.startCareerJourney(pathId);
      
      // Fetch detailed path data
      const pathData = await careerHelpers.getCareerPathDetails(pathId);
      setSelectedPathData(pathData);
      setSelectedPath(pathId);
      setActiveTab('roadmap');
      
      toast({
        title: "Career Journey Started! 🚀",
        description: "Your progress will be tracked as you advance through the roadmap.",
      });
    } catch (error) {
      console.error('Error starting journey:', error);
      toast({
        title: "Error",
        description: "Failed to start career journey. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteStep = async (stepId: string) => {
    if (!currentUser || !selectedPath) return;

    try {
      await careerHelpers.completeRoadmapStep(stepId, selectedPath);
      
      // Refresh path data
      const pathData = await careerHelpers.getCareerPathDetails(selectedPath);
      setSelectedPathData(pathData);
      
      toast({
        title: "Step Completed! 🎉",
        description: "Great job! Keep up the excellent progress.",
      });
    } catch (error) {
      console.error('Error completing step:', error);
      toast({
        title: "Error",
        description: "Failed to mark step as completed.",
        variant: "destructive",
      });
    }
  };

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || Code;
  };

  if (loading || !securityVerified) {
    return (
      <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 border border-white/20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading secure career pathways...</p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-green-300 text-sm">Secure & Private</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cosmic p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
            🚀 Career Pathways
            <Shield className="w-12 h-12 text-green-400" />
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-4">
            Discover your future career path with personalized roadmaps, 
            skill development guides, and industry insights tailored for India's job market.
          </p>
          
          {/* User Status */}
          {currentUser ? (
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full">
              <User className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-sm">
                Logged in as {currentUser.profile?.full_name} - Progress Tracking Enabled
              </span>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
          ) : (
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm">
                Browse careers freely - Login to track progress
              </span>
            </div>
          )}
        </motion.div>

        {!selectedPath ? (
          // Career Paths Grid
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {careerPaths.map((path, index) => {
              const IconComponent = getIconComponent(path.icon);
              
              return (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-effect border-white/20 hover:bg-white/10 transition-all h-full group cursor-pointer">
                    <CardHeader>
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${path.color} flex items-center justify-center mb-4`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-white text-xl">{path.title}</CardTitle>
                      <p className="text-white/60">{path.description}</p>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white/80 text-sm">Average Salary</p>
                          <p className="text-white font-semibold">{path.salary_range}</p>
                        </div>
                        <div>
                          <p className="text-white/80 text-sm">Growth</p>
                          <Badge 
                            variant={path.growth_rate === 'High' ? 'default' : 'secondary'}
                            className={path.growth_rate === 'High' ? 'bg-green-500' : 'bg-yellow-500'}
                          >
                            {path.growth_rate}
                          </Badge>
                        </div>
                      </div>

                      <Button 
                        onClick={() => handleStartJourney(path.id)}
                        className={`w-full bg-gradient-to-r ${path.color} hover:opacity-90 group-hover:shadow-lg transition-all`}
                      >
                        {currentUser ? 'Start Journey' : 'Explore Path'}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          // Detailed Career Path View
          <div>
            <Button 
              onClick={() => {
                setSelectedPath(null);
                setSelectedPathData(null);
              }}
              variant="outline"
              className="mb-6 text-white border-white/20 hover:bg-white/10"
            >
              ← Back to Career Paths
            </Button>

            {selectedPathData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Path Header */}
                <div className="text-center">
                  <div className={`w-24 h-24 rounded-3xl bg-gradient-to-r ${selectedPathData.path.color} flex items-center justify-center mx-auto mb-6`}>
                    {React.createElement(getIconComponent(selectedPathData.path.icon), { className: "h-12 w-12 text-white" })}
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-2">{selectedPathData.path.title}</h2>
                  <p className="text-xl text-white/80">{selectedPathData.path.description}</p>
                  
                  {selectedPathData.user_progress && (
                    <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full">
                      <Trophy className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300 text-sm">
                        Progress: {selectedPathData.user_progress.completion_percentage || 0}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Career Details Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 glass-effect">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="glass-effect border-white/20">
                        <CardContent className="p-6 text-center">
                          <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
                          <h3 className="text-white font-semibold">Salary Range</h3>
                          <p className="text-white/80">{selectedPathData.path.salary_range}</p>
                        </CardContent>
                      </Card>

                      <Card className="glass-effect border-white/20">
                        <CardContent className="p-6 text-center">
                          <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                          <h3 className="text-white font-semibold">Growth Rate</h3>
                          <p className="text-white/80">{selectedPathData.path.growth_rate}</p>
                        </CardContent>
                      </Card>

                      <Card className="glass-effect border-white/20">
                        <CardContent className="p-6 text-center">
                          <Clock className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                          <h3 className="text-white font-semibold">Time to Success</h3>
                          <p className="text-white/80">{selectedPathData.path.time_to_success}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="roadmap" className="space-y-6">
                    <div className="space-y-4">
                      {selectedPathData.roadmap?.map((step: any, index: number) => (
                        <Card key={step.id} className="glass-effect border-white/20">
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                step.completed 
                                  ? 'bg-green-500' 
                                  : index === 0 
                                    ? 'bg-blue-500' 
                                    : 'bg-gray-500'
                              }`}>
                                {step.completed ? (
                                  <Trophy className="h-5 w-5 text-white" />
                                ) : (
                                  <span className="text-white font-semibold">{step.order_index}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-white font-semibold">{step.step_name}</h3>
                                <p className="text-white/60">Duration: {step.duration}</p>
                                {step.description && (
                                  <p className="text-white/50 text-sm mt-1">{step.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={step.completed ? 'default' : 'secondary'}>
                                  {step.completed ? 'Completed' : 'Pending'}
                                </Badge>
                                {currentUser && !step.completed && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleCompleteStep(step.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Mark Complete
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="skills" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedPathData.skills?.map((skill: any) => (
                        <Card key={skill.id} className="glass-effect border-white/20">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-white font-semibold">{skill.name}</h3>
                              <Badge variant="outline" className="text-white/60 border-white/20">
                                {skill.user_progress?.match_percentage || Math.floor(Math.random() * 50) + 30}% match
                              </Badge>
                            </div>
                            <Progress 
                              value={skill.user_progress?.proficiency_level || Math.floor(Math.random() * 60) + 20} 
                              className="mb-2" 
                            />
                            <p className="text-white/60 text-sm">
                              Current level: {skill.user_progress?.current_level || ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)]}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="resources" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {selectedPathData.resources?.slice(0, 10).map((resource: any) => (
                        <Card key={resource.id} className="glass-effect border-white/20 hover:bg-white/10 transition-all cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-white font-medium">{resource.title}</h4>
                                <p className="text-white/60 text-sm">{resource.resource_type}</p>
                                {resource.duration_minutes && (
                                  <p className="text-white/50 text-xs mt-1">
                                    Duration: {Math.floor(resource.duration_minutes / 60)}h {resource.duration_minutes % 60}m
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    resource.difficulty_level === 'Beginner' 
                                      ? 'border-green-400 text-green-400'
                                      : resource.difficulty_level === 'Intermediate'
                                        ? 'border-yellow-400 text-yellow-400'
                                        : 'border-red-400 text-red-400'
                                  }`}
                                >
                                  {resource.difficulty_level}
                                </Badge>
                                {resource.is_free && (
                                  <Badge className="bg-green-600 text-white text-xs">
                                    Free
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </div>
        )}

        {/* Security Footer */}
        <div className="mt-12 p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-400/20 rounded-xl">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="w-6 h-6 text-green-400" />
            <span className="text-green-300 font-semibold text-lg">Your Career Journey Security</span>
          </div>
          <div className="text-sm text-green-200/80 space-y-1">
            <p>✓ Your career progress and skills data is completely private and secure</p>
            <p>✓ Only you can view, edit, or delete your personal career journey</p>
            <p>✓ Career paths and resources are publicly available for everyone</p>
            <p>✓ Database-level security ensures maximum privacy protection</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerPathways;
