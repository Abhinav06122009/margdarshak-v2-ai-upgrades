import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, Palette, Globe, Smartphone, Database, 
  Cpu, PenTool, Camera, TrendingUp, GamepadIcon,
  Clock, Star, Trophy, Users, ArrowRight, ExternalLink,
  GitBranch, Play, CheckCircle, Award, Target
} from 'lucide-react';

interface ProjectChallengesProps {
  onBack: () => void;
}

const challengeCategories = [
  {
    id: 'web-development',
    title: 'Web Development',
    icon: Globe,
    color: 'from-blue-500 to-cyan-600',
    description: 'Build modern web applications',
    projects: 15,
    difficulty: 'Beginner to Advanced',
  },
  {
    id: 'mobile-apps',
    title: 'Mobile Apps',
    icon: Smartphone,
    color: 'from-green-500 to-emerald-600',
    description: 'Create mobile applications',
    projects: 12,
    difficulty: 'Intermediate to Advanced',
  },
  {
    id: 'data-science',
    title: 'Data Science',
    icon: TrendingUp,
    color: 'from-purple-500 to-pink-600',
    description: 'Analyze data and build ML models',
    projects: 10,
    difficulty: 'Intermediate to Expert',
  },
  {
    id: 'game-development',
    title: 'Game Development',
    icon: GamepadIcon,
    color: 'from-orange-500 to-red-600',
    description: 'Create interactive games',
    projects: 8,
    difficulty: 'Beginner to Advanced',
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design',
    icon: Palette,
    color: 'from-pink-500 to-purple-600',
    description: 'Design user experiences',
    projects: 12,
    difficulty: 'Beginner to Advanced',
  },
  {
    id: 'backend-apis',
    title: 'Backend & APIs',
    icon: Database,
    color: 'from-indigo-500 to-blue-600',
    description: 'Build scalable backend systems',
    projects: 14,
    difficulty: 'Intermediate to Expert',
  },
];

const projectTemplates = {
  'web-development': [
    {
      id: 'portfolio-website',
      title: 'Personal Portfolio Website',
      difficulty: 'Beginner',
      duration: '1-2 weeks',
      description: 'Create a stunning personal portfolio to showcase your skills and projects.',
      techStack: ['HTML', 'CSS', 'JavaScript', 'React'],
      features: [
        'Responsive design',
        'Project showcase',
        'Contact form',
        'Dark/light mode',
        'Smooth animations'
      ],
      learningGoals: [
        'Modern CSS and responsive design',
        'React components and hooks',
        'Form handling and validation',
        'Deployment and hosting'
      ],
      resources: [
        'Figma design templates',
        'Code starter pack',
        'Deployment guide',
        'SEO optimization tips'
      ],
      githubTemplate: 'https://github.com/portfolio-template',
      liveDemo: 'https://portfolio-demo.vercel.app',
    },
    {
      id: 'ecommerce-app',
      title: 'E-commerce Web Application',
      difficulty: 'Advanced',
      duration: '4-6 weeks',
      description: 'Build a full-featured e-commerce platform with payment integration.',
      techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      features: [
        'Product catalog',
        'Shopping cart',
        'User authentication',
        'Payment processing',
        'Order management',
        'Admin dashboard'
      ],
      learningGoals: [
        'Full-stack development',
        'Database design and operations',
        'Payment gateway integration',
        'Security best practices'
      ],
      resources: [
        'Database schema design',
        'API documentation',
        'Payment integration guide',
        'Security checklist'
      ],
      githubTemplate: 'https://github.com/ecommerce-template',
      liveDemo: 'https://ecommerce-demo.vercel.app',
    },
  ],
  'mobile-apps': [
    {
      id: 'fitness-tracker',
      title: 'Fitness Tracking App',
      difficulty: 'Intermediate',
      duration: '3-4 weeks',
      description: 'Create a mobile app to track workouts, nutrition, and fitness goals.',
      techStack: ['React Native', 'Firebase', 'Redux'],
      features: [
        'Workout logging',
        'Progress tracking',
        'Goal setting',
        'Social features',
        'Nutrition tracker'
      ],
      learningGoals: [
        'React Native development',
        'Mobile UI/UX patterns',
        'Real-time data sync',
        'Mobile app deployment'
      ],
      resources: [
        'UI kit for fitness apps',
        'Firebase setup guide',
        'App store submission guide',
        'Testing best practices'
      ],
      githubTemplate: 'https://github.com/fitness-app-template',
      liveDemo: 'https://fitness-app-demo.com',
    },
  ],
  'data-science': [
    {
      id: 'stock-predictor',
      title: 'Stock Price Prediction Model',
      difficulty: 'Advanced',
      duration: '3-5 weeks',
      description: 'Build a machine learning model to predict stock prices using historical data.',
      techStack: ['Python', 'Pandas', 'Scikit-learn', 'TensorFlow'],
      features: [
        'Data collection and cleaning',
        'Feature engineering',
        'Model training and evaluation',
        'Prediction visualization',
        'Performance metrics'
      ],
      learningGoals: [
        'Time series analysis',
        'Machine learning algorithms',
        'Data visualization',
        'Model evaluation techniques'
      ],
      resources: [
        'Dataset sources',
        'Jupyter notebook templates',
        'ML algorithm explanations',
        'Visualization libraries guide'
      ],
      githubTemplate: 'https://github.com/stock-predictor-template',
      liveDemo: 'https://stock-predictor-demo.herokuapp.com',
    },
  ],
};

const difficultyColors = {
  'Beginner': 'border-green-400 text-green-400',
  'Intermediate': 'border-yellow-400 text-yellow-400',
  'Advanced': 'border-orange-400 text-orange-400',
  'Expert': 'border-red-400 text-red-400',
};

const ProjectChallenges: React.FC<ProjectChallengesProps> = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState({
    completedProjects: 3,
    totalProjects: 25,
    currentStreak: 7,
    skillPoints: 1250,
  });

  const handleStartProject = (projectId: string) => {
    // This would typically redirect to a project workspace or GitHub template
    window.open(`https://github.com/new/import?template=${projectId}`, '_blank');
  };

  if (selectedProject) {
    const category = selectedCategory as keyof typeof projectTemplates;
    const projects = projectTemplates[category] || [];
    const project = projects.find(p => p.id === selectedProject);

    if (!project) return null;

    return (
      <div className="min-h-screen bg-gradient-cosmic p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              onClick={() => setSelectedProject(null)}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10"
            >
              ← Back to Projects
            </Button>
            <div className="flex items-center space-x-4">
              <Badge 
                variant="outline" 
                className={difficultyColors[project.difficulty as keyof typeof difficultyColors]}
              >
                {project.difficulty}
              </Badge>
              <div className="flex items-center text-white/60">
                <Clock className="h-4 w-4 mr-1" />
                {project.duration}
              </div>
            </div>
          </div>

          {/* Project Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">{project.title}</h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">{project.description}</p>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => handleStartProject(project.id)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg"
              >
                <GitBranch className="h-4 w-4 mr-2" />
                Clone Template
              </Button>
              <Button 
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10"
                onClick={() => window.open(project.liveDemo, '_blank')}
              >
                <Play className="h-4 w-4 mr-2" />
                View Demo
              </Button>
              <Button 
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10"
                onClick={() => window.open(project.githubTemplate, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                GitHub
              </Button>
            </div>

            {/* Project Details Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 glass-effect">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="learning">Learning Goals</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="glass-effect border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Code className="h-5 w-5 mr-2" />
                        Tech Stack
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.map((tech, index) => (
                          <Badge key={index} variant="outline" className="text-white/80 border-white/20">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        Project Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-white/60">Difficulty</span>
                        <span className="text-white">{project.difficulty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Duration</span>
                        <span className="text-white">{project.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Features</span>
                        <span className="text-white">{project.features.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.features.map((feature, index) => (
                    <Card key={index} className="glass-effect border-white/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                          <span className="text-white">{feature}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="learning" className="space-y-4">
                <div className="space-y-4">
                  {project.learningGoals.map((goal, index) => (
                    <Card key={index} className="glass-effect border-white/20">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-sm font-semibold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{goal}</p>
                            <p className="text-white/60 text-sm mt-1">
                              Master this skill through hands-on project development
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="resources" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.resources.map((resource, index) => (
                    <Card key={index} className="glass-effect border-white/20 hover:bg-white/10 transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <ExternalLink className="h-5 w-5 text-blue-400 flex-shrink-0" />
                          <span className="text-white">{resource}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    );
  }

  if (selectedCategory) {
    const projects = projectTemplates[selectedCategory as keyof typeof projectTemplates] || [];
    const categoryInfo = challengeCategories.find(cat => cat.id === selectedCategory);

    return (
      <div className="min-h-screen bg-gradient-cosmic p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button 
              onClick={() => setSelectedCategory(null)}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10"
            >
              ← Back to Categories
            </Button>
            {categoryInfo && (
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white">{categoryInfo.title}</h2>
                <p className="text-white/80">{categoryInfo.description}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-effect border-white/20 hover:bg-white/10 transition-all h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        variant="outline" 
                        className={difficultyColors[project.difficulty as keyof typeof difficultyColors]}
                      >
                        {project.difficulty}
                      </Badge>
                      <div className="flex items-center text-white/60 text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        {project.duration}
                      </div>
                    </div>
                    <CardTitle className="text-white text-xl">{project.title}</CardTitle>
                    <p className="text-white/80">{project.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-white/60 text-sm mb-2">Tech Stack</p>
                      <div className="flex flex-wrap gap-1">
                        {project.techStack.map((tech, i) => (
                          <Badge key={i} variant="outline" className="text-xs text-white/60 border-white/20">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-white/60 text-sm mb-2">Key Features</p>
                      <div className="space-y-1">
                        {project.features.slice(0, 3).map((feature, i) => (
                          <div key={i} className="flex items-center text-white/80 text-sm">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2" />
                            {feature}
                          </div>
                        ))}
                        {project.features.length > 3 && (
                          <div className="text-white/60 text-sm">
                            +{project.features.length - 3} more features
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => setSelectedProject(project.id)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
                      >
                        View Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                      <Button 
                        variant="outline"
                        size="icon"
                        className="text-white border-white/20 hover:bg-white/10"
                        onClick={() => window.open(project.liveDemo, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
            ← Back
          </Button>
          
          <h1 className="text-5xl font-bold text-white mb-4">
            🚀 Project Challenges
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Build real-world projects to enhance your skills. From beginner-friendly apps 
            to advanced systems, choose your challenge and start building!
          </p>
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
              <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold">Completed Projects</h3>
              <p className="text-2xl text-white">
                {userProgress.completedProjects}/{userProgress.totalProjects}
              </p>
              <Progress 
                value={(userProgress.completedProjects / userProgress.totalProjects) * 100} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold">Current Streak</h3>
              <p className="text-2xl text-white">{userProgress.currentStreak} days</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold">Skill Points</h3>
              <p className="text-2xl text-white">{userProgress.skillPoints.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold">Next Milestone</h3>
              <p className="text-2xl text-white">Level 5</p>
              <Progress value={75} className="mt-2" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Challenge Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {challengeCategories.map((category, index) => {
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
                    <CardTitle className="text-white text-xl">{category.title}</CardTitle>
                    <p className="text-white/60">{category.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-white/60">Projects</span>
                      <span className="text-white font-semibold">{category.projects}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-white/60">Difficulty</span>
                      <Badge variant="outline" className="text-white/60 border-white/20">
                        {category.difficulty}
                      </Badge>
                    </div>

                    <Button 
                      className={`w-full bg-gradient-to-r ${category.color} hover:opacity-90 group-hover:shadow-lg transition-all`}
                    >
                      Start Building
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectChallenges;