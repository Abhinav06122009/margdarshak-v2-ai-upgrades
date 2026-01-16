// src/components/progress/GoalFocusView.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, List } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Goal, ProgressEntry } from './ProgressTracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GoalFocusViewProps {
  goal: Goal;
  entries: ProgressEntry[];
  onClose: () => void;
}

const GoalFocusView: React.FC<GoalFocusViewProps> = ({ goal, entries, onClose }) => {
  const chartData = entries
    .sort((a, b) => new Date(a.date_recorded).getTime() - new Date(b.date_recorded).getTime())
    .map(entry => ({
      date: new Date(entry.date_recorded).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      progress: entry.value,
      notes: entry.notes,
    }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="relative w-full max-w-4xl h-[90vh] bg-black/50 border border-white/20 rounded-3xl shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-3xl font-bold text-white">{goal.title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Chart */}
          <div className="lg:col-span-2">
            <Card className="glass-card h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2"><TrendingUp className="text-green-400" /> Progress Over Time</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="date" stroke="#ffffff80" />
                    <YAxis stroke="#ffffff80" />
                    <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', borderColor: '#ffffff30', color: '#fff' }} />
                    <Legend />
                    <Line type="monotone" dataKey="progress" name={`Progress (${goal.unit})`} stroke="#38ef7d" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: History */}
          <div className="lg:col-span-1">
            <Card className="glass-card h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2"><List className="text-blue-400" /> Progress Log</CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
                <div className="space-y-4">
                  {entries.length > 0 ? (
                    entries.map(entry => (
                      <div key={entry.id} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-green-400">+{entry.value} {goal.unit}</span>
                          <span className="text-xs text-white/60">{new Date(entry.date_recorded).toLocaleDateString()}</span>
                        </div>
                        {entry.notes && <p className="text-sm text-white/80 mt-1">{entry.notes}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-white/60 text-center py-8">No progress entries logged yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GoalFocusView;