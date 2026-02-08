import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface EDUPhaseBadgeProps {
  phase: 'evaluate' | 'deliver' | 'unlock';
  isActive: boolean;
  isCompleted: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const phaseConfig = {
  evaluate: { letter: 'E', label: 'EVALUATE', color: 'from-blue-500 to-cyan-400' },
  deliver: { letter: 'D', label: 'DELIVER', color: 'from-primary to-purple-500' },
  unlock: { letter: 'U', label: 'UNLOCK', color: 'from-accent to-lime-400' },
};

export function EDUPhaseBadge({ phase, isActive, isCompleted, size = 'md' }: EDUPhaseBadgeProps) {
  const config = phaseConfig[phase];
  
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-12 w-12 text-lg',
    lg: 'h-16 w-16 text-2xl',
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'rounded-xl flex items-center justify-center font-bold transition-all',
          sizeClasses[size],
          isCompleted && `bg-gradient-to-br ${config.color} text-white shadow-lg`,
          isActive && !isCompleted && `bg-gradient-to-br ${config.color} text-white shadow-lg animate-pulse-soft`,
          !isActive && !isCompleted && 'bg-muted text-muted-foreground'
        )}
      >
        {isCompleted ? (
          <CheckCircle2 className={cn(size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8')} />
        ) : isActive ? (
          config.letter
        ) : (
          config.letter
        )}
      </div>
      {size !== 'sm' && (
        <span className={cn(
          'text-[10px] font-bold uppercase tracking-wider',
          isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
        )}>
          {config.label}
        </span>
      )}
    </div>
  );
}
