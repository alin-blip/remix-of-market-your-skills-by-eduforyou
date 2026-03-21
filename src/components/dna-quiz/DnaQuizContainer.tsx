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

type Phase = 'quiz' | 'signup' | 'result';

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
  const [signedUpUserId, setSignedUpUserId] = useState<string | null>(null);

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
        const res = calculateResult(newScores);
        setResult(res);
        if (isPublic) {
          setPhase('signup');
        } else {
          saveResult(newScores, res, null, user?.id || null);
        }
      }
    }, 300);
  }, [scores, answers, currentQ, totalQ, isPublic]);

  const saveResult = async (
    finalScores: Record<DnaProfile, number>,
    res: { primary: DnaProfile; secondary?: DnaProfile },
    email: string | null,
    userId: string | null
  ) => {
    setSaving(true);
    try {
      await supabase.from('dna_quiz_results' as any).insert({
        user_id: userId || null,
        email: email,
        lang,
        answers: answers,
        scores: finalScores,
        result_type: res.primary,
      });

      if (isPublic && email) {
        await supabase.from('leads').insert({
          email,
          source: 'dna_quiz',
          name: null,
        });

        supabase.functions.invoke('dna-quiz-email', {
          body: { email, result_type: res.primary, lang },
        }).catch((err) => console.error('Email send error:', err));
      }

      if (userId) {
        await supabase.from('profiles').update({
          execution_dna: res.primary,
        } as any).eq('id', userId);
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

  const handleSignup = (userId: string, email: string) => {
    setSignedUpUserId(userId);
    if (result) {
      saveResult(scores, result, email, userId);
    }
  };

  const handleEmailSubmit = (email: string) => {
    if (result) {
      saveResult(scores, result, email, null);
    }
  };

  const handleRetake = () => {
    setPhase('quiz');
    setCurrentQ(0);
    setScores({ employee: 0, freelancer: 0, startup: 0 });
    setAnswers([]);
    setSelectedIndex(null);
    setResult(null);
    setSignedUpUserId(null);
  };

  const progressPct = phase === 'result' ? 100 : phase === 'signup' ? 100 : ((currentQ) / totalQ) * 100;

  const isAuthenticated = !!user || !!signedUpUserId;

  return (
    <div className="space-y-6">
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
        {phase === 'signup' && (
          <DnaQuizLeadCapture
            key="signup"
            t={t}
            onSubmit={handleEmailSubmit}
            onSignup={handleSignup}
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
            isAuthenticated={isAuthenticated}
            onRetake={handleRetake}
            onCta={onNavigate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
