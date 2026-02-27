import { Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SessionItem {
  id: string;
  device: string;
  location?: string | null;
  lastActive: string;
  isCurrent?: boolean;
}

interface SessionManagerProps {
  sessions: SessionItem[];
  onTerminate?: (id: string) => void;
}

export const SessionManager = ({ sessions, onTerminate }: SessionManagerProps) => {
  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div key={session.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              {session.device.toLowerCase().includes('mobile') ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-sm text-zinc-200">{session.device}</p>
              <p className="text-xs text-zinc-500">{session.location || 'Unknown location'} • {session.lastActive}</p>
            </div>
          </div>
          {session.isCurrent ? (
            <span className="text-xs text-emerald-400">Current</span>
          ) : (
            <Button variant="outline" size="sm" onClick={() => onTerminate?.(session.id)}>
              Terminate
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};
