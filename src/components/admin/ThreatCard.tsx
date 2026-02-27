import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ThreatCardProps {
  title: string;
  level: string;
  score: number;
  summary?: string | null;
  ip?: string | null;
}

const ThreatCard = ({ title, level, score, summary, ip }: ThreatCardProps) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-white">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          {title}
        </div>
        <Badge variant="outline" className="uppercase text-[10px]">
          {level}
        </Badge>
      </div>
      <p className="mt-2 text-xs text-zinc-500">Score: {score}</p>
      {summary && <p className="mt-3 text-xs text-zinc-400">{summary}</p>}
      {ip && <p className="mt-3 text-[10px] text-zinc-600">IP: {ip}</p>}
    </div>
  );
};

export default ThreatCard;
