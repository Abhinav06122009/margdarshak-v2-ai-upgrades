import React from 'react';
import { motion } from 'framer-motion';

export const QuantumGraph = ({ data }: { data: any[] }) => {
  if (!data || data.length < 2) return null;
  const width = 500; const height = 250; const padding = 40;
  
  // Calculate scaling based on data range
  const minX = Math.min(...data.map(d => d.x)); const maxX = Math.max(...data.map(d => d.x));
  const minY = Math.min(...data.map(d => d.y)); const maxY = Math.max(...data.map(d => d.y));
  const scaleX = (x: number) => padding + ((x - minX) / (maxX - minX || 1)) * (width - 2 * padding);
  const scaleY = (y: number) => height - padding - ((y - minY) / (maxY - minY || 1)) * (height - 2 * padding);
  
  // Create SVG path
  const pathData = data.map((d, i) => `${i===0?'M':'L'} ${scaleX(d.x).toFixed(1)} ${scaleY(d.y).toFixed(1)}`).join(' ');

  return (
    <div className="my-4 p-4 bg-black/40 rounded-3xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] backdrop-blur-md relative overflow-hidden group">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
      <div className="flex justify-between text-[9px] font-black text-emerald-500/60 uppercase tracking-widest mb-4 relative z-10">
        <span>Quantum Plotter v2.1</span><span>Range: Y[{minY.toFixed(1)}, {maxY.toFixed(1)}]</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible relative z-20">
        {/* Axes */}
        <line x1={padding} y1={scaleY(0)} x2={width-padding} y2={scaleY(0)} stroke="white" strokeOpacity="0.1" strokeDasharray="4" />
        <line x1={scaleX(0)} y1={padding} x2={scaleX(0)} y2={height-padding} stroke="white" strokeOpacity="0.1" strokeDasharray="4" />
        {/* The Data Line */}
        <motion.path d={pathData} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }}
          className="group-hover:stroke-emerald-400 transition-colors" filter="url(#glow)"
        />
        <defs><filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      </svg>
    </div>
  );
};