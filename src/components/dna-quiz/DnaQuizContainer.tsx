import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { DnaQuizQuestion } from './DnaQuizQuestion';
import { DnaQuizLeadCapture } from './DnaQuizLeadCapture';
import { DnaQuizResult } from './DnaQuizResult';
import { quizTranslations, calculateResult, type QuizLang, type DnaProfile, type QuizOption } from './quizData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface DnaQuizContainerProps {
  lang: QuizLang;
  isPublic: boolean;
  onComplete?: (resultType: DnaProfile) => void;
  onNavigate: (path: string) => void;
}

type Phase = 'quiz' | 'email' | 'result';

export function DnaQuizContainer({ lang, isPublic, onComplete, onNavigate }: DnaQuizContainerProps) {
  const t = quizTranslations[lang] || quizTranslations.ro;
  const { user } = useAuth();
  
  const [phase, setPhase] = useState<Phase>('quiz');
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<Record<DnaProfile, number>>({ employee: 0, freelancer: 0, startup: 0 });
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<{ primary: DnaProfile; secondary?: DnaProfile } | null>(null);
  const [saving, setSaving] = useState(false);

  const totalQ = t.questions.length;

  const handleAnswer = useCallback((option: QuizOption, index: number) => {
    setSelectedIndex(index);
    
    setTimeout(() => {
      const newScores = { ...scores };
      (Object.keys(option.scores) as DnaProfile[]).forEach((k) => {
        newScores[k] += option.scores[k];
      });
      setScores(newScores);
      setAnswers([...answers, index]);

      if (currentQ < totalQ - 1) {
        setCurrentQ(currentQ + 1);
        setSelectedIndex(null);
      } else {
        // Quiz done
        const res = calculateResult(newScores);
        setResult(res);
        if (isPublic) {
          setPhase('email');
        } else {
          // Authenticated: save directly
          saveResult(newScores, res, null);
        }
      }
    }, 300);
  }, [scores, answers, currentQ, totalQ, isPublic]);

  const saveResult = async (
    finalScores: Record<DnaProfile, number>,
    res: { primary: DnaProfile; secondary?: DnaProfile },
    email: string | null
  ) => {
    setSaving(true);
    try {
      // Save to dna_quiz_results
      await supabase.from('dna_quiz_results' as any).insert({
        user_id: user?.id || null,
        email: email,
        lang,
        answers: answers,
        scores: finalScores,
        result_type: res.primary,
      });

      // If public, also save to leads and send result email
      if (isPublic && email) {
        await supabase.from('leads').insert({
          email,
          source: 'dna_quiz',
          name: null,
        });

        // Send result email via edge function (fire and forget)
        supabase.functions.invoke('dna-quiz-email', {
          body: { email, result_type: res.primary, lang },
        }).catch((err) => console.error('Email send error:', err));
      }

      // If authenticated, update profile
      if (user?.id) {
        await supabase.from('profiles').update({
          execution_dna: res.primary,
        } as any).eq('id', user.id);
        onComplete?.(res.primary);
      }

      setPhase('result');
    } catch (err) {
      console.error('Error saving quiz result:', err);
      toast.error('Error saving result');
      setPhase('result');
    } finally {
      setSaving(false);
    }
  };

  const handleEmailSubmit = (email: string) => {
    if (result) {
      saveResult(scores, result, email);
    }
  };

  const handleRetake = () => {
    setPhase('quiz');
    setCurrentQ(0);
    setScores({ employee: 0, freelancer: 0, startup: 0 });
    setAnswers([]);
    setSelectedIndex(null);
    setResult(null);
  };

  const progressPct = phase === 'result' ? 100 : phase === 'email' ? 100 : ((currentQ) / totalQ) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Progress value={progressPct} className="h-2" />

      <AnimatePresence mode="wait">
        {phase === 'quiz' && (
          <DnaQuizQuestion
            key={`q-${currentQ}`}
            question={t.questions[currentQ]}
            questionIndex={currentQ}
            totalQuestions={totalQ}
            questionOfLabel={t.questionOf}
            onAnswer={(option) => {
              const idx = t.questions[currentQ].options.indexOf(option);
              handleAnswer(option, idx);
            }}
            selectedIndex={selectedIndex}
          />
        )}
        {phase === 'email' && (
          <DnaQuizLeadCapture
            key="email"
            t={t}
            onSubmit={handleEmailSubmit}
            isLoading={saving}
          />
        )}
        {phase === 'result' && result && (
          <DnaQuizResult
            key="result"
            primary={result.primary}
            secondary={result.secondary}
            scores={scores}
            t={t}
            isPublic={isPublic}
            onRetake={handleRetake}
            onCta={onNavigate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
