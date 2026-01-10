import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Briefcase, Lightbulb } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface Props {
  data: { projects_experience: string };
  updateData: (updates: { projects_experience: string }) => void;
}

export default function OnboardingStep3({ data, updateData }: Props) {
  const { t } = useI18n();

  const examples = t.onboardingStep3.examples;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Briefcase className="w-8 h-8 text-primary" />
        </div>
        <p className="text-muted-foreground">
          {t.onboardingStep3.description}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="experience" className="text-foreground">
            {t.onboardingStep3.experienceLabel}
          </Label>
          <Textarea
            id="experience"
            placeholder={t.onboardingStep3.experiencePlaceholder}
            value={data.projects_experience}
            onChange={(e) => updateData({ projects_experience: e.target.value })}
            className="min-h-[180px] bg-background/50 border-white/10 focus:border-primary resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {t.onboardingStep3.hint}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-accent" />
            <span className="font-medium text-foreground">{t.onboardingStep3.examplesTitle}</span>
          </div>
          <ul className="space-y-2">
            {examples.map((example, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-accent">•</span>
                {example}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
