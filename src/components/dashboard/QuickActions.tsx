import React from 'react';
import { 
  Calendar, 
  FileText, 
  Book, 
  Calculator, 
  Settings,
  ChevronRight,
  BrainCircuit,
  GraduationCap,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  stats: any;
  onNavigate: (path: string) => void;
}

const ActionCard = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  onClick, 
  color,
  badge
}: { 
  icon: any, 
  title: string, 
  subtitle: string, 
  onClick: () => void, 
  color: string,
  badge?: string
}) => (
  <button 
    onClick={onClick}
    className="group relative flex items-center p-4 w-full bg-[#0F0F0F] border border-white/5 rounded-2xl hover:bg-[#161616] transition-all duration-300 hover:scale-[1.02] active:scale-95 text-left shadow-lg"
  >
    <div className={`p-3 rounded-xl bg-opacity-10 ${color} mr-4 border border-white/5 group-hover:scale-110 transition-transform`}>
      <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-bold text-gray-100 truncate flex items-center gap-2">
        {title}
        {badge && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wide">
            {badge}
          </span>
        )}
      </h4>
      <p className="text-[10px] text-gray-500 font-medium truncate">{subtitle}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
  </button>
);

const QuickActions: React.FC<QuickActionsProps> = ({ stats, onNavigate }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
          Quick Access
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        
        <ActionCard 
          icon={BrainCircuit}
          title="AI Tutor"
          subtitle="Ask any academic question"
          color="bg-amber-500"
          onClick={() => navigate('/ai-chat')}
        />

        <ActionCard 
          icon={GraduationCap}
          title="Quiz Generator"
          subtitle="Test your knowledge with AI"
          color="bg-purple-500"
          badge="New"
          onClick={() => navigate('/quiz')}
        />

        <ActionCard 
          icon={FileText}
          title="Essay Helper"
          subtitle="AI writing assistance"
          color="bg-blue-500"
          badge="New"
          onClick={() => navigate('/essay-helper')}
        />

        <ActionCard 
          icon={Sparkles}
          title="Study Planner"
          subtitle="AI-generated schedules"
          color="bg-emerald-500"
          badge="New"
          onClick={() => navigate('/study-planner')}
        />

        <ActionCard 
          icon={BarChart3}
          title="AI Analytics"
          subtitle="Performance insights"
          color="bg-indigo-500"
          badge="New"
          onClick={() => navigate('/ai-analytics')}
        />

        <ActionCard 
          icon={Calendar}
          title="Schedule"
          subtitle="Timetable & events"
          color="bg-cyan-500"
          onClick={() => onNavigate('timetable')}
        />

        <ActionCard 
          icon={Book}
          title="Courses"
          subtitle="Manage your courses"
          color="bg-pink-500"
          onClick={() => onNavigate('courses')}
        />

        <ActionCard 
          icon={Settings}
          title="Settings"
          subtitle="Account & preferences"
          color="bg-gray-500"
          onClick={() => navigate('/settings')}
        />

      </div>
    </div>
  );
};

export default QuickActions;
