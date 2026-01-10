import { Badge } from '@/components/ui/badge';
import { Gem, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n';

interface Props {
  data: { values: string[] };
  updateData: (updates: { values: string[] }) => void;
}

export default function OnboardingStep5({ data, updateData }: Props) {
  const { t } = useI18n();
  const [customValue, setCustomValue] = useState('');

  const suggestedValues = t.onboardingStep5.suggestedValues;

  const toggleValue = (value: string) => {
    const newValues = data.values.includes(value)
      ? data.values.filter(v => v !== value)
      : [...data.values, value];
    updateData({ values: newValues });
  };

  const addCustomValue = () => {
    const trimmed = customValue.trim();
    if (trimmed && !data.values.includes(trimmed)) {
      updateData({ values: [...data.values, trimmed] });
      setCustomValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomValue();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Gem className="w-8 h-8 text-primary" />
        </div>
        <p className="text-muted-foreground">
          {t.onboardingStep5.description}
        </p>
      </div>

      {/* Selected values */}
      {data.values.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{t.onboardingStep5.yourValues} ({data.values.length}):</p>
          <div className="flex flex-wrap gap-2">
            {data.values.map((value) => (
              <Badge
                key={value}
                variant="default"
                className="bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer gap-1 py-1.5 px-3"
                onClick={() => toggleValue(value)}
              >
                {value}
                <X className="w-3 h-3" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Custom value input */}
      <div className="flex gap-2">
        <Input
          placeholder={t.onboardingStep5.addPlaceholder}
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="bg-background/50 border-white/10 focus:border-primary"
        />
        <button
          onClick={addCustomValue}
          disabled={!customValue.trim()}
          className="px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested values */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{t.onboardingStep5.popularValues}</p>
        <div className="flex flex-wrap gap-2">
          {suggestedValues.map((value) => (
            <Badge
              key={value}
              variant="outline"
              className={`cursor-pointer py-1.5 px-3 transition-all ${
                data.values.includes(value)
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'border-white/10 text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
              onClick={() => toggleValue(value)}
            >
              {value}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
