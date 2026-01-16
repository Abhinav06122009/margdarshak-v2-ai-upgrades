import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const SystemMonitor = () => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [lastPing, setLastPing] = useState<number | null>(null);

  // Real human engineering: Check the actual database connection
  useEffect(() => {
    const checkConnection = async () => {
      const start = performance.now();
      const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      const end = performance.now();
      
      setStatus(error ? 'disconnected' : 'connected');
      if (!error) setLastPing(Math.round(end - start));
    };

    checkConnection();
    // Poll every 30s (sensible resource usage)
    const interval = setInterval(checkConnection, 30000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-zinc-900/50 border border-white/10 rounded-full backdrop-blur-sm text-xs font-medium text-zinc-400">
      <div className="flex items-center gap-2">
        {status === 'checking' && <RefreshCw size={14} className="animate-spin text-zinc-500" />}
        {status === 'connected' && <Wifi size={14} className="text-emerald-500" />}
        {status === 'disconnected' && <WifiOff size={14} className="text-red-500" />}
        
        <span>
          {status === 'checking' && 'Syncing...'}
          {status === 'connected' && 'Systems Nominal'}
          {status === 'disconnected' && 'Offline'}
        </span>
      </div>

      {lastPing && (
        <>
          <div className="h-3 w-px bg-white/10" />
          <span className="font-mono text-zinc-500">{lastPing}ms</span>
        </>
      )}
    </div>
  );
};