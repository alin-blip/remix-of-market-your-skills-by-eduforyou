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
  correct_option: number;
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

  // Fetch quiz questions
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['quiz-questions', quiz?.id],
    queryFn: async () => {
      if (!quiz?.id) return [];
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('position', { ascending: true });
      if (error) throw error;
      return data as QuizQuestion[];
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

  // Submit quiz mutation
  const submitQuizMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !quiz?.id) throw new Error('Not authenticated');

      // Calculate score
      let correctCount = 0;
      questions.forEach(q => {
        if (selectedAnswers[q.id] === q.correct_option) {
          correctCount++;
        }
      });

      const score = Math.round((correctCount / questions.length) * 100);
      const passed = score >= quiz.passing_score;

      const { error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: quiz.id,
          score,
          passed,
          answers: selectedAnswers,
        });

      if (error) throw error;
      return { score, passed, correctCount };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['quiz-best-attempt'] });
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
    setQuizStarted(true);
  };

  const allAnswered = questions.every(q => selectedAnswers[q.id] !== undefined);

  // Calculate results for display
  const calculateResults = () => {
    let correctCount = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correct_option) {
        correctCount++;
      }
    });
    const score = Math.round((correctCount / questions.length) * 100);
    return { correctCount, score, passed: score >= quiz.passing_score };
  };

  // Show start screen if quiz hasn't started
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

  // Show results screen
  if (showResults) {
    const results = calculateResults();
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
              results.passed ? 'bg-green-100' : 'bg-orange-100'
            }`}>
              {results.passed ? (
                <Trophy className="h-12 w-12 text-green-600" />
              ) : (
                <XCircle className="h-12 w-12 text-orange-600" />
              )}
            </div>
            <div>
              <h3 className={`text-3xl font-bold ${results.passed ? 'text-green-600' : 'text-orange-600'}`}>
                {results.score}%
              </h3>
              <p className="text-muted-foreground mt-1">
                {results.correctCount} din {questions.length} răspunsuri corecte
              </p>
            </div>
            <Badge className={results.passed ? 'bg-green-500' : 'bg-orange-500'}>
              {results.passed ? 'Ai trecut!' : 'Mai încearcă'}
            </Badge>
            
            {/* Show answers review */}
            <div className="text-left space-y-3 mt-6">
              <h4 className="font-semibold">Răspunsurile tale:</h4>
              {questions.map((q, idx) => {
                const isCorrect = selectedAnswers[q.id] === q.correct_option;
                return (
                  <div key={q.id} className={`p-3 rounded-lg border ${
                    isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{idx + 1}. {q.question}</p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600 mt-1">
                            Răspuns corect: {q.options[q.correct_option]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
