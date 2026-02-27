import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  hint?: string;
}

const StatCard = ({ title, value, icon, hint }: StatCardProps) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500">{title}</p>
          <p className="text-2xl font-semibold text-white mt-2">{value}</p>
        </div>
        {icon && <div className="text-indigo-400">{icon}</div>}
      </div>
      {hint && <p className="mt-3 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
};

export default StatCard;
