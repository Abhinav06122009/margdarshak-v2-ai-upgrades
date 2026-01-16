import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface DataPoint {
  x: number;
  y: number;
}

export const TrendChart = ({ data }: { data: DataPoint[] }) => {
  if (!data || data.length < 2) return null;

  // Configuration
  const width = 500; 
  const height = 250; 
  const padding = 20;
  
  const { pathData, minX, maxX, minY, maxY } = useMemo(() => {
    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);
    
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    const scaleX = (x: number) => padding + ((x - minX) / (maxX - minX || 1)) * (width - 2 * padding);
    const scaleY = (y: number) => height - padding - ((y - minY) / (maxY - minY || 1)) * (height - 2 * padding);
    
    const d = data.map((point, i) => 
      `${i === 0 ? 'M' : 'L'} ${scaleX(point.x).toFixed(1)} ${scaleY(point.y).toFixed(1)}`
    ).join(' ');

    return { pathData: d, minX, maxX, minY, maxY };
  }, [data]);

  return (
    <div className="w-full bg-zinc-900/50 rounded-xl border border-white/5 p-6">
      <div className="flex justify-between items-baseline mb-4">
        <h4 className="text-sm font-medium text-zinc-400">Performance Trend</h4>
        <span className="text-xs text-zinc-600 font-mono">
          Last 30 Days
        </span>
      </div>

      <div className="relative aspect-[2/1] w-full">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full overflow-visible"
        >
          {/* Grid Lines */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#3f3f46" strokeWidth="1" strokeOpacity="0.5" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#3f3f46" strokeWidth="1" strokeOpacity="0.5" />

          {/* Data Line */}
          <motion.path 
            d={pathData} 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }} 
            animate={{ pathLength: 1, opacity: 1 }} 
            transition={{ duration: 1, ease: "easeOut" }}
          />
          
          {/* Gradient Fill (Optional, subtle) */}
          <motion.path 
            d={`${pathData} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`} 
            fill="url(#gradient)" 
            opacity="0.2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ delay: 0.5 }}
          />
          
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};