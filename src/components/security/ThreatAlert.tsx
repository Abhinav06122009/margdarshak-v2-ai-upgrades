import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ThreatAlertProps {
  title: string;
  summary: string;
  level: 'low' | 'medium' | 'high' | 'critical';
}

const levelStyles: Record<ThreatAlertProps['level'], string> = {
  low: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5',
  medium: 'border-amber-500/20 text-amber-400 bg-amber-500/5',
  high: 'border-orange-500/20 text-orange-400 bg-orange-500/5',
  critical: 'border-red-500/20 text-red-400 bg-red-500/5',
};

export const ThreatAlert = ({ title, summary, level }: ThreatAlertProps) => {
  return (
    <div className={`rounded-2xl border p-4 ${levelStyles[level]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <AlertTriangle className="h-4 w-4" />
          {title}
        </div>
        <Badge variant="outline" className="uppercase text-[10px]">
          {level}
        </Badge>
      </div>
      <p className="mt-3 text-xs text-zinc-300">{summary}</p>
    </div>
  );
};
