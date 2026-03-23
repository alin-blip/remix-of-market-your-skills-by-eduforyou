import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Trophy,
  RotateCcw,
  ChevronRight 
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  position: number;
}

interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  passing_score: number;
}

interface QuizAttempt {
  id: string;
  quiz_id: string;
  score: number;
  passed: boolean;
  completed_at: string;
}

interface LessonQuizProps {
  lessonId: string;
}

export function LessonQuiz({ lessonId }: LessonQuizProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [lastResult, setLastResult] = useState<{ score: number; passed: boolean; correct_count: number; total_count: number } | null>(null);

  // Fetch quiz for this lesson
  const { data: quiz, isLoading: quizLoading } = useQuery({
    queryKey: ['lesson-quiz', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .maybeSingle();
      if (error) throw error;
      return data as Quiz | null;
    },
    enabled: !!lessonId,
  });

  // Fetch quiz questions from SAFE view (no correct_option exposed)
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['quiz-questions-safe', quiz?.id],
    queryFn: async () => {
      if (!quiz?.id) return [];
      const { data, error } = await supabase
        .from('quiz_questions_safe' as any)
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('position', { ascending: true });
      if (error) throw error;
      return (data as any[])?.map(q => ({
        id: q.id,
        quiz_id: q.quiz_id,
        question: q.question,
        options: q.options,
        position: q.position,
      })) as QuizQuestion[];
    },
    enabled: !!quiz?.id,
  });

  // Fetch best attempt
  const { data: bestAttempt } = useQuery({
    queryKey: ['quiz-best-attempt', user?.id, quiz?.id],
    queryFn: async () => {
      if (!user?.id || !quiz?.id) return null;
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('quiz_id', quiz.id)
        .order('score', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as QuizAttempt | null;
    },
    enabled: !!user?.id && !!quiz?.id,
  });

  // Submit quiz via secure server-side function
  const submitQuizMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !quiz?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('submit_quiz', {
        p_quiz_id: quiz.id,
        p_answers: selectedAnswers,
      });

      if (error) throw error;
      return data as { score: number; passed: boolean; correct_count: number; total_count: number };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['quiz-best-attempt'] });
      setLastResult(result);
      setShowResults(true);
      if (result.passed) {
        toast.success(`Felicitări! Ai trecut quiz-ul cu ${result.score}%`);
      } else {
        toast.error(`Nu ai trecut. Scor: ${result.score}%. Încearcă din nou!`);
      }
    },
    onError: () => {
      toast.error('Eroare la trimiterea quiz-ului');
    }
  });

  if (quizLoading || questionsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!quiz || questions.length === 0) {
    return null;
  }

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    submitQuizMutation.mutate();
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setLastResult(null);
    setQuizStarted(true);
  };

  const allAnswered = questions.every(q => selectedAnswers[q.id] !== undefined);

  // Show start screen
  if (!quizStarted && !showResults) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{quiz.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Quiz disponibil</h3>
              <p className="text-muted-foreground mt-1">
                {questions.length} întrebări • Scor minim: {quiz.passing_score}%
              </p>
            </div>
            {bestAttempt && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                bestAttempt.passed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {bestAttempt.passed ? (
                  <Trophy className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Cel mai bun scor: {bestAttempt.score}%
              </div>
            )}
            <Button onClick={() => setQuizStarted(true)} className="mt-4">
              Începe Quiz-ul
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show results screen (server-side results, no correct answers exposed)
  if (showResults && lastResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rezultate Quiz</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6"
          >
            <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center ${
              lastResult.passed ? 'bg-green-100' : 'bg-orange-100'
            }`}>
              {lastResult.passed ? (
                <Trophy className="h-12 w-12 text-green-600" />
              ) : (
                <XCircle className="h-12 w-12 text-orange-600" />
              )}
            </div>
            <div>
              <h3 className={`text-3xl font-bold ${lastResult.passed ? 'text-green-600' : 'text-orange-600'}`}>
                {lastResult.score}%
              </h3>
              <p className="text-muted-foreground mt-1">
                {lastResult.correct_count} din {lastResult.total_count} răspunsuri corecte
              </p>
            </div>
            <Badge className={lastResult.passed ? 'bg-green-500' : 'bg-orange-500'}>
              {lastResult.passed ? 'Ai trecut!' : 'Mai încearcă'}
            </Badge>
          </motion.div>
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={handleRetry} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Încearcă din nou
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Quiz in progress
  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{quiz.title}</CardTitle>
          </div>
          <Badge variant="outline">
            {currentQuestion + 1} / {questions.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 mt-4" />
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-lg">{currentQ.question}</h3>
            <div className="space-y-2">
              {(currentQ.options as string[]).map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(currentQ.id, idx)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedAnswers[currentQ.id] === idx
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/20 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedAnswers[currentQ.id] === idx
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/40'
                    }`}>
                      {selectedAnswers[currentQ.id] === idx && (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevQuestion}
          disabled={currentQuestion === 0}
        >
          Înapoi
        </Button>
        
        {currentQuestion < questions.length - 1 ? (
          <Button
            onClick={handleNextQuestion}
            disabled={selectedAnswers[currentQ.id] === undefined}
            className="gap-2"
          >
            Următoarea
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || submitQuizMutation.isPending}
            className="gap-2"
          >
            {submitQuizMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Finalizează Quiz
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
