import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity } from 'lucide-react';

interface DataPoint {
  x: number;
  y: number;
}

export const TrendChart = ({ data }: { data?: DataPoint[] }) => {
  // 1. Fallback Data: Shows a nice curve if real data is missing/empty
  const chartData = useMemo(() => {
    if (data && data.length > 1) return data;
    return [
      { x: 1, y: 20 }, { x: 2, y: 45 }, { x: 3, y: 35 }, 
      { x: 4, y: 80 }, { x: 5, y: 65 }, { x: 6, y: 85 }, { x: 7, y: 95 }
    ];
  }, [data]);

  // Chart Dimensions
  const width = 500; 
  const height = 250; 
  const padding = 20;
  
  const { pathData, areaPath } = useMemo(() => {
    const xValues = chartData.map(d => d.x);
    const yValues = chartData.map(d => d.y);
    
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    const scaleX = (x: number) => padding + ((x - minX) / (maxX - minX || 1)) * (width - 2 * padding);
    const scaleY = (y: number) => height - padding - ((y - minY) / (maxY - minY || 1)) * (height - 2 * padding);
    
    // Create the smooth line path
    const lineCommands = chartData.map((point, i) => 
      `${i === 0 ? 'M' : 'L'} ${scaleX(point.x).toFixed(1)} ${scaleY(point.y).toFixed(1)}`
    ).join(' ');

    // Create the fill area path (closes the loop at the bottom)
    const areaCommands = `${lineCommands} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;

    return { pathData: lineCommands, areaPath: areaCommands };
  }, [chartData]);

  return (
    <div className="w-full h-full bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-white/5 p-6 relative overflow-hidden group">
      
      {/* Background Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
           <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
             <Activity size={16} className="text-emerald-500" />
             Productivity Flow
           </h4>
           <p className="text-xs text-zinc-500 mt-1 ml-6">Real-time performance metrics</p>
        </div>
        <div className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
           <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             Live
           </span>
        </div>
      </div>

      {/* The Chart SVG */}
      <div className="relative aspect-[2/1] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          
          {/* Definitions for Gradients & Glows */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
             <line 
               key={i}
               x1={padding} 
               y1={padding + tick * (height - 2 * padding)} 
               x2={width - padding} 
               y2={padding + tick * (height - 2 * padding)} 
               stroke="#3f3f46" 
               strokeWidth="1" 
               strokeOpacity="0.1" 
               strokeDasharray="4 4"
             />
          ))}

          {/* Area Fill */}
          <motion.path 
            d={areaPath} 
            fill="url(#chartGradient)" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          />
          
          {/* Line Path */}
          <motion.path 
            d={pathData} 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }} 
            animate={{ pathLength: 1, opacity: 1 }} 
            transition={{ duration: 2, ease: "easeOut" }}
          />
        </svg>
      </div>
    </div>
  );
};