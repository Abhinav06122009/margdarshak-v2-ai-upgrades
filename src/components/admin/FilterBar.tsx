import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface FilterBarProps {
  placeholder?: string;
  onChange?: (value: string) => void;
}

const FilterBar = ({ placeholder = 'Search', onChange }: FilterBarProps) => {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-zinc-900/40 px-3 py-2">
      <Search className="h-4 w-4 text-zinc-500" />
      <Input
        className="border-none bg-transparent text-sm text-white focus-visible:ring-0"
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </div>
  );
};

export default FilterBar;
