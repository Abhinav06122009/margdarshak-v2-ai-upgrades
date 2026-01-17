import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChartDataPoint {
  label: string;
  value: number;
  date?: string; // Optional full date for tooltip
}

interface TrendChartProps {
  data: ChartDataPoint[];
  color?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ 
  data, 
  color = "#10b981" 
}) => {
  // 1. Error Handling: Graceful fallback for no data
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50 rounded-xl border border-white/5 text-zinc-500">
        <p className="text-sm font-medium">No activity data available yet.</p>
        <p className="text-xs opacity-70">Complete tasks to see your flow.</p>
      </div>
    );
  }

  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  // Configuration
  const width = 500;
  const height = 250;
  const paddingX = 40;
  const paddingY = 40;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  // 2. Data Calculation
  const { pathData, areaPath, points, maxY, yTicks } = useMemo(() => {
    const values = data.map(d => d.value);
    const maxYVal = Math.max(...values, 5); // Ensure at least 5 lines for scale
    
    // Create meaningful Y-axis ticks (integers only)
    const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((maxYVal / 4) * i));
    const normalizedMaxY = yTicks[yTicks.length - 1]; // Use the top tick as max for scaling

    // coordinate scaling functions
    const getX = (index: number) => paddingX + (index / (data.length - 1)) * graphWidth;
    const getY = (value: number) => height - paddingY - (value / normalizedMaxY) * graphHeight;

    // Generate Path (Smooth Curve)
    const points = data.map((d, i) => ({ x: getX(i), y: getY(d.value), ...d }));
    
    // Simple line join (L) or Bezier (C) could be used. Using simple L for accuracy of data points.
    const pathD = points.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
    ).join(' ');

    const areaD = `${pathD} L ${points[points.length-1].x} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;

    return { pathData: pathD, areaPath: areaD, points, maxY: normalizedMaxY, yTicks };
  }, [data, height, paddingX, paddingY, graphWidth, graphHeight]);

  return (
    <div className="w-full h-full bg-zinc-900/50 rounded-xl border border-white/5 p-4 relative group select-none">
      
      {/* Header */}
      <div className="flex justify-between items-baseline mb-2 px-2">
        <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
           Productivity Flow
           <span className="flex h-2 w-2 relative">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
           </span>
        </h4>
        <span className="text-xs text-zinc-500 font-mono">Last 7 Days</span>
      </div>

      {/* SVG Container */}
      <div className="relative w-full h-[220px]"> {/* Fixed height container for SVG */}
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Y-Axis Grid & Labels */}
          {yTicks.map((tick, i) => {
            const y = height - paddingY - (tick / maxY) * graphHeight;
            return (
              <g key={`y-tick-${i}`}>
                <line 
                  x1={paddingX} 
                  y1={y} 
                  x2={width - paddingX} 
                  y2={y} 
                  stroke="#3f3f46" 
                  strokeWidth="1" 
                  strokeOpacity="0.2" 
                  strokeDasharray="4 4"
                />
                <text 
                  x={paddingX - 10} 
                  y={y + 4} 
                  textAnchor="end" 
                  className="fill-zinc-500 text-[10px] font-mono"
                  style={{ fontSize: '10px' }}
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* X-Axis Labels */}
          {points.map((p, i) => (
            <text 
              key={`x-label-${i}`}
              x={p.x} 
              y={height - 10} 
              textAnchor="middle" 
              className="fill-zinc-500 text-[10px] font-medium"
              style={{ fontSize: '10px' }}
            >
              {p.label}
            </text>
          ))}

          {/* The Data Area (Gradient) */}
          <motion.path 
            d={areaPath} 
            fill="url(#chartGradient)" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* The Data Line */}
          <motion.path 
            d={pathData} 
            fill="none" 
            stroke={color} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }} 
            animate={{ pathLength: 1, opacity: 1 }} 
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          {/* Interactive Points (Invisible hit targets + Visible dots on hover) */}
          {points.map((p, i) => (
            <g key={`point-${i}`} 
               onMouseEnter={() => { setHoveredPoint(data[i]); setHoverPos({ x: p.x, y: p.y }); }}
               onMouseLeave={() => setHoveredPoint(null)}
            >
              {/* Invisible Hit Area */}
              <circle cx={p.x} cy={p.y} r="15" fill="transparent" className="cursor-crosshair" />
              
              {/* Visible Dot */}
              <motion.circle 
                cx={p.x} 
                cy={p.y} 
                r="4" 
                fill="#18181b" 
                stroke={color} 
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: hoveredPoint === data[i] ? 1.5 : 1 }}
                transition={{ type: "spring" }}
              />
            </g>
          ))}
        </svg>

        {/* 3. Floating Tooltip */}
        <AnimatePresence>
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ 
                left: `${(hoverPos.x / width) * 100}%`, 
                top: `${(hoverPos.y / height) * 100}%` 
              }}
              className="absolute z-50 transform -translate-x-1/2 -translate-y-full mb-3 pointer-events-none"
            >
              <div className="bg-zinc-900 border border-white/10 shadow-xl rounded-lg p-3 min-w-[120px]">
                <p className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
                  {hoveredPoint.date || hoveredPoint.label}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-white font-bold text-lg">
                    {hoveredPoint.value} <span className="text-zinc-500 text-xs font-normal">Tasks</span>
                  </span>
                </div>
              </div>
              {/* Arrow */}
              <div className="w-3 h-3 bg-zinc-900 border-r border-b border-white/10 transform rotate-45 absolute left-1/2 -ml-1.5 -bottom-1.5"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};