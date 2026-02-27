import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface UserRowProps {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  risk?: string | null;
  blocked?: boolean | null;
  onAction?: (action: 'block' | 'unblock', userId: string) => void;
}

const UserRow = ({ id, name, email, role, risk, blocked, onAction }: UserRowProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-white/5 bg-zinc-900/40 p-4">
      <div>
        <p className="text-sm font-semibold text-white">{name || 'Unknown User'}</p>
        <p className="text-xs text-zinc-500">{email || 'No email on file'}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="uppercase text-[10px] text-zinc-300 border-white/10">
          {role || 'member'}
        </Badge>
        <Badge variant="outline" className="uppercase text-[10px]">
          {risk || 'low'}
        </Badge>
        <Button
          size="sm"
          variant={blocked ? 'outline' : 'destructive'}
          onClick={() => onAction?.(blocked ? 'unblock' : 'block', id)}
        >
          {blocked ? 'Unblock' : 'Block'}
        </Button>
      </div>
    </div>
  );
};

export default UserRow;
