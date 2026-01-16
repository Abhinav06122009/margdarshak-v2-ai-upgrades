import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, Zap, BarChart, BookOpen, Calendar, Shield, 
  Clock, Target, CheckCircle2, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AdSenseScript from "@/components/AdSenseScript"; // Ensure ads run here

const FeaturesPage = () => {
  const features = [
    {
      id: "dashboard",
      title: "AI-Powered Student Dashboard",
      description: "Your academic command center. Get a bird's-eye view of your progress, upcoming deadlines, and performance metrics in one intuitive interface.",
      icon: Cpu,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      details: [
        "Real-time GPA calculation and prediction.",
        "Daily task summary and priority alerts.",
        "Personalized study recommendations based on your habits."
      ]
    },
    {
      id: "tasks",
      title: "Advanced Task Management",
      description: "Stop procrastinating. Our task manager is built specifically for students to handle assignments, projects, and daily chores effectively.",
      icon: Zap,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      details: [
        "Kanban board view for project stages.",
        "Recurring tasks for weekly homework.",
        "Smart reminders before deadlines."
      ]
    },
    {
      id: "grades",
      title: "Comprehensive Grade Analytics",
      description: "Visualize your academic journey. Identify your strong subjects and areas that need improvement with detailed charts and graphs.",
      icon: BarChart,
      color: "text-green-400",
      bg: "bg-green-400/10",
      details: [
        "Subject-wise performance tracking.",
        "Historical grade trends over semesters.",
        "Goal setting and achievement tracking."
      ]
    },
    {
      id: "resources",
      title: "Digital Resource Library",
      description: "Access a vast collection of study materials. From lecture notes to past exam papers, everything you need is just a click away.",
      icon: BookOpen,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      details: [
        "Upload and organize your own notes.",
        "Access public resources shared by the community.",
        "Support for PDF, DOCX, and image formats."
      ]
    },
    {
      id: "timetable",
      title: "Smart Timetable Scheduler",
      description: "Never miss a class again. Our intelligent timetable adapts to your schedule and helps you manage your time efficiently.",
      icon: Calendar,
      color: "text-red-400",
      bg: "bg-red-400/10",
      details: [
        "Color-coded class schedules.",
        "Exam conflict detection.",
        "Integration with personal calendar events."
      ]
    },
    {
      id: "security",
      title: "Enterprise-Grade Security",
      description: "Your data privacy is our top priority. We use advanced encryption and security protocols to keep your information safe.",
      icon: Shield,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      details: [
        "End-to-end encryption for sensitive data.",
        "Secure cloud storage with regular backups.",
        "GDPR and privacy law compliance."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans pt-20 pb-12">
      <AdSenseScript />
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Powerful Features for Modern Students
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover the tools that will transform your academic life. MARGDARSHAK is more than just a planner; it's your personal academic assistant.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-colors"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                {feature.description}
              </p>
              <ul className="space-y-3">
                {feature.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <CheckCircle2 className={`w-5 h-5 ${feature.color} flex-shrink-0`} />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Additional Tools Section (AdSense Value) */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-12 text-center mb-20">
          <h2 className="text-3xl font-bold text-white mb-6">Beyond the Basics</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10">
            We also offer a suite of free public tools designed to help every student, regardless of whether they have an account.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/calculator">
              <Button variant="outline" className="h-12 px-8 border-white/20 hover:bg-white/10 text-white">
                Scientific Calculator
              </Button>
            </Link>
            <Link to="/resources">
              <Button variant="outline" className="h-12 px-8 border-white/20 hover:bg-white/10 text-white">
                Resource Library
              </Button>
            </Link>
            <Link to="/career">
              <Button variant="outline" className="h-12 px-8 border-white/20 hover:bg-white/10 text-white">
                Career Roadmaps
              </Button>
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to get organized?</h2>
          <Link to="/auth">
            <Button className="h-14 px-10 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg shadow-emerald-900/20">
              Start Your Free Journey <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default FeaturesPage;
