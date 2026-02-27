import { Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface ActivityItem {
  id: string;
  created_at: string;
  activity_type: string;
  metadata?: Record<string, any> | null;
}

interface ActivityTimelineProps {
  items: ActivityItem[];
}

export const ActivityTimeline = ({ items }: ActivityTimelineProps) => {
  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-sm text-zinc-500">No recent activity logged.</div>
      ) : (
        items.map((item) => (
          <div key={item.id} className="flex items-start gap-3 rounded-xl border border-white/5 bg-zinc-900/40 p-4">
            <div className="mt-1 rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <Activity className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm text-zinc-300">
                <span className="capitalize">{item.activity_type.replace(/_/g, ' ')}</span>
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </span>
              </div>
              {item.metadata?.summary && (
                <p className="mt-2 text-xs text-zinc-500">{item.metadata.summary}</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
