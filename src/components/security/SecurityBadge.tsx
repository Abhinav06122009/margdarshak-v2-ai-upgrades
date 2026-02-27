import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SecurityBadgeProps {
  score?: number | null;
  level?: 'low' | 'medium' | 'high' | 'critical';
}

const levelConfig = {
  low: { label: 'Low', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: ShieldCheck },
  medium: { label: 'Medium', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: ShieldAlert },
  high: { label: 'High', className: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: ShieldAlert },
  critical: { label: 'Critical', className: 'bg-red-500/10 text-red-400 border-red-500/20', icon: ShieldAlert },
};

export const SecurityBadge = ({ score, level = 'low' }: SecurityBadgeProps) => {
  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`flex items-center gap-2 ${config.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label} Risk
      {score !== undefined && score !== null ? ` • ${score}` : ''}
    </Badge>
  );
};
