import { motion } from 'framer-motion';
import { Briefcase, Laptop, Rocket, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { DnaProfile, QuizTranslation } from './quizData';

const profileIcons: Record<DnaProfile, typeof Briefcase> = {
  employee: Briefcase,
  freelancer: Laptop,
  startup: Rocket,
};

const profileColors: Record<DnaProfile, string> = {
  employee: 'from-blue-500 to-blue-700',
  freelancer: 'from-emerald-500 to-emerald-700',
  startup: 'from-orange-500 to-amber-600',
};

interface DnaQuizResultProps {
  primary: DnaProfile;
  secondary?: DnaProfile;
  scores: Record<DnaProfile, number>;
  t: QuizTranslation;
  isPublic: boolean;
  onRetake: () => void;
  onCta: (path: string) => void;
}

export function DnaQuizResult({ primary, secondary, scores, t, isPublic, onRetake, onCta }: DnaQuizResultProps) {
  const result = t.results[primary];
  const Icon = profileIcons[primary];
  const gradient = profileColors[primary];
  const maxScore = 20;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-lg mx-auto"
    >
      {/* Profile badge */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto shadow-lg`}
        >
          <Icon className="h-10 w-10 text-white" />
        </motion.div>
        <div>
          <p className="text-4xl mb-2">{result.emoji}</p>
          <h2 className="text-2xl font-bold text-foreground">{result.title}</h2>
          {secondary && (
            <p className="text-sm text-muted-foreground mt-1">
              {t.tieText} {t.results[secondary].title}
            </p>
          )}
        </div>
      </div>

      {/* Score bars */}
      <Card className="p-4 space-y-3">
        {(['employee', 'freelancer', 'startup'] as DnaProfile[]).map((profile) => {
          const PIcon = profileIcons[profile];
          const pct = Math.round((scores[profile] / maxScore) * 100);
          return (
            <div key={profile} className="flex items-center gap-3">
              <PIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className={`h-full rounded-full bg-gradient-to-r ${profileColors[profile]}`}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
            </div>
          );
        })}
      </Card>

      {/* Description */}
      <p className="text-muted-foreground leading-relaxed">{result.description}</p>

      {/* CTA */}
      <div className="space-y-3">
        {isPublic ? (
          <Button
            size="lg"
            className="w-full"
            onClick={() => onCta(`/auth/register?dna=${primary}`)}
          >
            {t.registerCta}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full"
            onClick={() => onCta(result.ctaModule)}
          >
            {result.cta}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
        {isPublic && (
          <p className="text-xs text-muted-foreground text-center">{t.registerCtaDesc}</p>
        )}
        <Button variant="ghost" size="sm" className="w-full" onClick={onRetake}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {t.retakeButton}
        </Button>
      </div>
    </motion.div>
  );
}
