import { Badge } from '@/components/ui/badge';
import { Target, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface Props {
  data: { goals: string[] };
  updateData: (updates: { goals: string[] }) => void;
}

const suggestedGoals = [
  'Venit extra în timpul facultății',
  'Experiență practică pentru CV',
  'Construirea unui portofoliu',
  'Libertate financiară',
  'Lucru remote de oriunde',
  'Dezvoltare personală',
  'Networking profesional',
  'Lansarea unei afaceri',
  'Independență față de părinți',
  'Plata unei chirie proprii',
  'Economii pentru călătorii',
  'Achiziții personale',
];

export default function OnboardingStep4({ data, updateData }: Props) {
  const [customGoal, setCustomGoal] = useState('');

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
          Ce vrei să obții? Selectează sau adaugă obiectivele tale.
        </p>
      </div>

      {/* Selected goals */}
      {data.goals.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Obiectivele tale ({data.goals.length}):</p>
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
          placeholder="Adaugă alt obiectiv..."
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
        <p className="text-sm text-muted-foreground">Obiective comune:</p>
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
