import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

const ActionButtons = ({ primaryLabel, secondaryLabel, onPrimary, onSecondary }: ActionButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={onPrimary}>{primaryLabel}</Button>
      {secondaryLabel && (
        <Button variant="outline" onClick={onSecondary}>
          {secondaryLabel}
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
