import { Badge } from '@/components/ui/badge';
import { Target, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n';

interface Props {
  data: { goals: string[] };
  updateData: (updates: { goals: string[] }) => void;
}

export default function OnboardingStep4({ data, updateData }: Props) {
  const { t } = useI18n();
  const [customGoal, setCustomGoal] = useState('');

  const suggestedGoals = t.onboardingStep4.suggestedGoals;

  const toggleGoal = (goal: string) => {
    const newGoals = data.goals.includes(goal)
      ? data.goals.filter(g => g !== goal)
      : [...data.goals, goal];
    updateData({ goals: newGoals });
  };

  const addCustomGoal = () => {
    const trimmed = customGoal.trim();
    if (trimmed && !data.goals.includes(trimmed)) {
      updateData({ goals: [...data.goals, trimmed] });
      setCustomGoal('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomGoal();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
          <Target className="w-8 h-8 text-accent" />
        </div>
        <p className="text-muted-foreground">
          {t.onboardingStep4.description}
        </p>
      </div>

      {/* Selected goals */}
      {data.goals.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{t.onboardingStep4.yourGoals} ({data.goals.length}):</p>
          <div className="flex flex-wrap gap-2">
            {data.goals.map((goal) => (
              <Badge
                key={goal}
                variant="default"
                className="bg-accent/20 text-accent hover:bg-accent/30 cursor-pointer gap-1 py-1.5 px-3"
                onClick={() => toggleGoal(goal)}
              >
                {goal}
                <X className="w-3 h-3" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Custom goal input */}
      <div className="flex gap-2">
        <Input
          placeholder={t.onboardingStep4.addPlaceholder}
          value={customGoal}
          onChange={(e) => setCustomGoal(e.target.value)}
          onKeyPress={handleKeyPress}
          className="bg-background/50 border-white/10 focus:border-primary"
        />
        <button
          onClick={addCustomGoal}
          disabled={!customGoal.trim()}
          className="px-4 py-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested goals */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{t.onboardingStep4.commonGoals}</p>
        <div className="flex flex-wrap gap-2">
          {suggestedGoals.map((goal) => (
            <Badge
              key={goal}
              variant="outline"
              className={`cursor-pointer py-1.5 px-3 transition-all ${
                data.goals.includes(goal)
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'border-white/10 text-muted-foreground hover:border-accent/50 hover:text-foreground'
              }`}
              onClick={() => toggleGoal(goal)}
            >
              {goal}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
