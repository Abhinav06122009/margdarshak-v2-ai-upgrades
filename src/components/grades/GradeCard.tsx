import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar, MoreVertical, BookOpen, Award, TrendingUp, Percent } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { gradeService } from './gradeService';
import type { Grade } from './types';

const GlareEffect = () => (
  <motion.div
    className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl pointer-events-none"
    style={{ transform: "translateZ(50px)" }}
  >
    <motion.div 
      className="absolute w-96 h-96 bg-white/10 -top-1/4 -left-1/4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        transform: 'rotate(45deg)',
        filter: 'blur(50px)',
        mixBlendMode: 'overlay'
      }}
    />
  </motion.div>
);

interface GradeCardProps {
  grade: Grade;
  index: number;
  onEdit: (grade: Grade) => void;
  onDelete: (id: string, name: string) => void;
  isSelected: boolean;
  onSelect: (gradeId: string) => void;
}

const GradeCard: React.FC<GradeCardProps> = ({ grade, index, onEdit, onDelete, isSelected, onSelect }) => {
  const percentage = (grade.grade / grade.total_points) * 100;
  const letterGrade = gradeService.getLetterGrade(percentage);
  const gradeColor = gradeService.getGradeColor(percentage);

  const [isInteractionHovered, setIsInteractionHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12.5deg", "-12.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12.5deg", "12.5deg"]);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isInteractionHovered) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const { width, height } = rect;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  const handleInteractionEnter = () => setIsInteractionHovered(true);
  const handleInteractionLeave = () => setIsInteractionHovered(false);

  return (
    <motion.div
      key={grade.id}
      initial={{ opacity: 0, y: 50, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      exit={{ opacity: 0, y: -20, rotateX: -10 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 100, damping: 10 }}
      className="group h-full"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.98, rotateX: 2 }}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} whileHover={{ scale: 1.03 }}>
        <Card 
          className={`relative bg-gradient-to-br from-black/60 to-black/60 backdrop-blur-xl border border-white/10 rounded-3xl transition-all duration-500 shadow-2xl group-hover:shadow-cyan-500/40 h-full overflow-hidden flex flex-col transform-gpu`}
          style={{ transform: "translateZ(20px)" }}
        >
          <GlareEffect />
          <div
            className="absolute top-4 right-4 z-30"
            onMouseEnter={handleInteractionEnter}
            onMouseLeave={handleInteractionLeave}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(grade.id)}
              className="h-6 w-6 bg-black/50 border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-400 transition-all"
            />
          </div>
          <div className={`h-3 w-full flex-shrink-0 bg-gradient-to-r ${gradeColor}`} />

          <CardHeader className="pb-4 relative z-20">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-grow min-w-0">
                <motion.div
                  className={`p-3 rounded-xl shadow-neumorphic-light-sm bg-gradient-to-br ${gradeColor}`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <Award className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <CardTitle className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300 group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300 drop-shadow-md">
                    {grade.assignment_name}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className={`mt-2 text-white border-white/30 text-sm px-3 py-1 rounded-full shadow-neumorphic-inset-sm bg-gradient-to-r ${gradeColor}`}
                  >
                    {grade.subject}
                  </Badge>
                </div>
              </div>

              <div 
                className="flex items-center gap-1 flex-shrink-0"
                onMouseEnter={handleInteractionEnter}
                onMouseLeave={handleInteractionLeave}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 p-0 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" asChild>
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="bg-black/60 backdrop-blur-xl border-white/20 text-white"
                    >
                      <DropdownMenuItem onSelect={() => onEdit(grade)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onDelete(grade.id, grade.assignment_name)} className="text-red-400 focus:bg-red-500/20 focus:text-red-300">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </motion.div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 flex-grow flex flex-col justify-between relative z-20">
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="text-sm border-white/30 text-white bg-white/10 px-3 py-1 rounded-full shadow-neumorphic-inset-xs">
                <Calendar className="h-4 w-4 mr-2 text-green-300" />
                {new Date(grade.date_recorded).toLocaleDateString()}
              </Badge>
              <Badge variant="outline" className="text-sm border-white/30 text-white bg-white/10 px-3 py-1 rounded-full shadow-neumorphic-inset-xs">
                <BookOpen className="h-4 w-4 mr-2 text-purple-300" />
                {grade.grade_type}
              </Badge>
            </div>

            {grade.notes && (
              <p className="text-base text-white/80 line-clamp-3 leading-relaxed">
                {grade.notes}
              </p>
            )}
            
            <div>
              <div className="flex justify-between text-sm text-white/70">
                <span>Grade</span>
                <span>{grade.grade} / {grade.total_points}</span>
              </div>
              <div className="w-full bg-black/30 rounded-full h-2.5 mt-1 overflow-hidden border border-white/10 shadow-inner">
                <motion.div 
                  className={`bg-gradient-to-r ${gradeColor} h-full rounded-full relative`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: 'circOut' }}
                />
              </div>
            </div>

            <div
              className="pt-4 border-t border-white/15 mt-auto"
              onMouseEnter={handleInteractionEnter}
              onMouseLeave={handleInteractionLeave}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${gradeColor}`}>
                    {letterGrade}
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">{percentage.toFixed(1)}%</div>
                    <div className="text-xs text-white/60">Overall Percentage</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br ${gradeColor} text-white font-bold text-lg`}>
                        {letterGrade}
                    </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default GradeCard;