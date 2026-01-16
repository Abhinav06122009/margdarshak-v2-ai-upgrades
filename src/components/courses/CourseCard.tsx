// src/components/courses/CourseCard.tsx
import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Book, GraduationCap, Calendar, Clock, Star, Users, TrendingUp, Maximize } from 'lucide-react';
import { Course } from '@/components/dashboard/course';
import { courseService } from '@/components/dashboard/courseService';

interface CourseCardProps {
  course: Course;
  index: number;
  onEdit: (course: Course) => void;
  onDelete: (id: string, name: string) => void;
  onFocus: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, index, onEdit, onDelete, onFocus }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12.5deg", "-12.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12.5deg", "12.5deg"]);

  const courseType = courseService.getCourseType(course);
  const backgroundColor = courseService.getCourseBackgroundColor(course);
  const priorityIntensity = courseService.getPriorityColorIntensity(course.priority);
  const difficultyColor = courseService.getDifficultyColor(course.difficulty);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      key={course.id}
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
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="h-full"
      >
        <Card className="relative bg-gradient-to-br from-black/60 to-black/60 backdrop-blur-xl border border-white/10 rounded-3xl transition-all duration-500 shadow-2xl hover:shadow-cyan-500/40 h-full overflow-hidden flex flex-col transform-gpu">
        {/* Dynamic Holographic Overlay */}
        <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '25px 25px',
          backgroundPosition: '0 0, 0 0',
          animation: 'hologram-move 10s infinite linear'
        }}></div>
        {/* Animated Border Glow */}
        <div className="absolute inset-0 rounded-3xl border-4 border-transparent group-hover:border-cyan-400/50 transition-all duration-500 z-10" style={{
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.5), inset 0 0 10px rgba(6, 182, 212, 0.3)'
        }}></div>

        {/* Multi-color header strip */}
        <div className="h-3 flex relative z-20">
          <div
            className="flex-1 h-full"
            style={{ backgroundColor }}
            title={`Course Type: ${courseType}`}
          />
          <div
            className="flex-1 h-full"
            style={{ backgroundColor: difficultyColor }}
            title={`Difficulty: ${course.difficulty}`}
          />
        </div>

        <CardHeader className="pb-4 relative z-20">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                className="p-3 rounded-xl shadow-neumorphic-light-sm"
                style={{
                  backgroundColor,
                  opacity: parseInt(priorityIntensity) / 100
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <Book className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300 group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300 drop-shadow-md">
                  {course.name}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="mt-2 text-white border-white/30 text-sm px-3 py-1 rounded-full shadow-neumorphic-inset-sm"
                  style={{
                    backgroundColor: `${backgroundColor}40`,
                    borderColor: backgroundColor
                  }}
                >
                  {course.code}
                </Badge>
              </div>
            </div>

            <div
              className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-20"
            >
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onFocus(course)}
                className="h-10 w-10 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white shadow-neumorphic-sm hover:shadow-neumorphic-lg transition-all duration-200"
                title="Focus View"
              >
                <Maximize className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onEdit(course)}
                className="h-10 w-10 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white shadow-neumorphic-sm hover:shadow-neumorphic-lg transition-all duration-200"
                title="Edit Course"
              >
                <Edit className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(course.id, course.name)}
                className="h-10 w-10 p-0 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 shadow-neumorphic-sm hover:shadow-neumorphic-lg transition-all duration-200"
                title="Delete Course"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 flex-grow flex flex-col justify-between relative z-20">
          {course.description && (
            <p className="text-base text-white/80 line-clamp-3 leading-relaxed">
              {course.description}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {course.grade_level && (
              <Badge variant="outline" className="text-sm border-white/30 text-white bg-white/10 px-3 py-1 rounded-full shadow-neumorphic-inset-xs">
                <GraduationCap className="h-4 w-4 mr-2 text-blue-300" />
                {course.grade_level}
              </Badge>
            )}
            {course.semester && (
              <Badge variant="outline" className="text-sm border-white/30 text-white bg-white/10 px-3 py-1 rounded-full shadow-neumorphic-inset-xs">
                <Calendar className="h-4 w-4 mr-2 text-green-300" />
                {course.semester}
              </Badge>
            )}
            {course.academic_year && (
              <Badge variant="outline" className="text-sm border-white/30 text-white bg-white/10 px-3 py-1 rounded-full shadow-neumorphic-inset-xs">
                <Clock className="h-4 w-4 mr-2 text-purple-300" />
                {course.academic_year}
              </Badge>
            )}
            {course.credits && (
              <Badge variant="outline" className="text-sm border-white/30 text-white bg-white/10 px-3 py-1 rounded-full shadow-neumorphic-inset-xs">
                <Star className="h-4 w-4 mr-2 text-yellow-300" />
                {course.credits} Credits
              </Badge>
            )}
          </div>

          {/* Enhanced Course Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-white/10 rounded-xl shadow-neumorphic-inset-sm">
            <div className="text-center">
              <div
                className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300"
              >
                {course.difficulty?.charAt(0).toUpperCase() || 'I'}
              </div>
              <div className="text-sm text-white/70 mt-1">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-red-300">
                {course.priority === 'urgent' ? '🔥' :
                  course.priority === 'high' ? '⚡' :
                    course.priority === 'medium' ? '📋' : '📝'}
              </div>
              <div className="text-sm text-white/70 mt-1 capitalize">{course.priority}</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/15">
            <div className="flex items-center space-x-2 text-sm text-white/70">
              <Users className="h-4 w-4 text-emerald-300" />
              <span>{courseType.charAt(0).toUpperCase() + courseType.slice(1)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  );
};

export default CourseCard;