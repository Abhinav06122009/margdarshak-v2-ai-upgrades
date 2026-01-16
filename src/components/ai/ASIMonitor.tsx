import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, Wifi } from 'lucide-react';

export const SystemMonitor = ({ isProcessing }: { isProcessing: boolean }) => {
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    if (isProcessing) {
      const start = Date.now();
      const interval = setInterval(() => {
        setLatency(Date.now() - start);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setLatency(0);
    }
  }, [isProcessing]);

  return (
    <div className="flex items-center gap-6 px-6 py-2 bg-emerald-500/5 border-t border-white/5 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Activity size={12} className={isProcessing ? "text-emerald-500 animate-pulse" : "text-slate-600"} />
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          Latency: <span className="text-emerald-500 font-mono">{latency}ms</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ShieldCheck size={12} className="text-emerald-500" />
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Gate: Secure</span>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Wifi size={12} className="text-emerald-500" />
        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 animate-pulse">System Link: Online</span>
      </div>
    </div>
  );
};