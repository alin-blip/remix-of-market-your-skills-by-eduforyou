import { Badge } from '@/components/ui/badge';
import { Heart, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface Props {
  data: { interests: string[] };
  updateData: (updates: { interests: string[] }) => void;
}

const suggestedInterests = [
  'Programare',
  'Design grafic',
  'Scriere creativă',
  'Video editing',
  'Social media',
  'Marketing digital',
  'Fotografie',
  'Muzică',
  'Gaming',
  'Blogging',
  'Podcasting',
  'Ilustrație',
  'Animație',
  'Web development',
  'Copywriting',
  'SEO',
  'Data analysis',
  'Traduceri',
  'Tutoring',
  'Public speaking',
];

export default function OnboardingStep2({ data, updateData }: Props) {
  const [customInterest, setCustomInterest] = useState('');

  const toggleInterest = (interest: string) => {
    const newInterests = data.interests.includes(interest)
      ? data.interests.filter(i => i !== interest)
      : [...data.interests, interest];
    updateData({ interests: newInterests });
  };

  const addCustomInterest = () => {
    const trimmed = customInterest.trim();
    if (trimmed && !data.interests.includes(trimmed)) {
      updateData({ interests: [...data.interests, trimmed] });
      setCustomInterest('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomInterest();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
          <Heart className="w-8 h-8 text-accent" />
        </div>
        <p className="text-muted-foreground">
          Selectează sau adaugă activitățile care îți plac. Cu cât ești mai specific, cu atât mai bine!
        </p>
      </div>

      {/* Selected interests */}
      {data.interests.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Selectate ({data.interests.length}):</p>
          <div className="flex flex-wrap gap-2">
            {data.interests.map((interest) => (
              <Badge
                key={interest}
                variant="default"
                className="bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer gap-1 py-1.5 px-3"
                onClick={() => toggleInterest(interest)}
              >
                {interest}
                <X className="w-3 h-3" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Custom interest input */}
      <div className="flex gap-2">
        <Input
          placeholder="Adaugă alt interes..."
          value={customInterest}
          onChange={(e) => setCustomInterest(e.target.value)}
          onKeyPress={handleKeyPress}
          className="bg-background/50 border-white/10 focus:border-primary"
        />
        <button
          onClick={addCustomInterest}
          disabled={!customInterest.trim()}
          className="px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested interests */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Sugestii populare:</p>
        <div className="flex flex-wrap gap-2">
          {suggestedInterests.map((interest) => (
            <Badge
              key={interest}
              variant="outline"
              className={`cursor-pointer py-1.5 px-3 transition-all ${
                data.interests.includes(interest)
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'border-white/10 text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
