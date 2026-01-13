import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Plus,
  Trash2,
  Loader2,
  Edit,
  Save,
  X,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  position: number;
}

interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  passing_score: number;
}

interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_option: number;
  position: number;
}

interface QuizManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: Lesson | null;
}

export function QuizManagerDialog({ open, onOpenChange, lesson }: QuizManagerDialogProps) {
  const queryClient = useQueryClient();
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_option: 0,
  });

  // Fetch quiz for this lesson
  const { data: quiz, isLoading: quizLoading } = useQuery({
    queryKey: ['lesson-quiz-admin', lesson?.id],
    queryFn: async () => {
      if (!lesson?.id) return null;
      const { data, error } = await supabase
        .from('lesson_quizzes')
        .select('*')
        .eq('lesson_id', lesson.id)
        .maybeSingle();
      if (error) throw error;
      return data as Quiz | null;
    },
    enabled: !!lesson?.id && open,
  });

  // Fetch questions for this quiz
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['quiz-questions-admin', quiz?.id],
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

  // Create quiz mutation
  const createQuizMutation = useMutation({
    mutationFn: async () => {
      if (!lesson?.id) throw new Error('No lesson');
      const { data, error } = await supabase
        .from('lesson_quizzes')
        .insert({
          lesson_id: lesson.id,
          title: `Quiz - ${lesson.title}`,
          passing_score: 70,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-quiz-admin', lesson?.id] });
      toast.success('Quiz creat!');
    },
    onError: () => toast.error('Eroare la crearea quiz-ului'),
  });

  // Add question mutation
  const addQuestionMutation = useMutation({
    mutationFn: async () => {
      if (!quiz?.id) throw new Error('No quiz');
      const { error } = await supabase
        .from('quiz_questions')
        .insert({
          quiz_id: quiz.id,
          question: newQuestion.question,
          options: newQuestion.options.filter(o => o.trim()),
          correct_option: newQuestion.correct_option,
          position: questions.length + 1,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions-admin', quiz?.id] });
      toast.success('Întrebare adăugată!');
      setNewQuestion({
        question: '',
        options: ['', '', '', ''],
        correct_option: 0,
      });
    },
    onError: () => toast.error('Eroare la adăugarea întrebării'),
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async (data: { id: string; question: string; options: string[]; correct_option: number }) => {
      const { error } = await supabase
        .from('quiz_questions')
        .update({
          question: data.question,
          options: data.options,
          correct_option: data.correct_option,
        })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions-admin', quiz?.id] });
      toast.success('Întrebare actualizată!');
      setEditingQuestionId(null);
    },
    onError: () => toast.error('Eroare la actualizare'),
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', questionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions-admin', quiz?.id] });
      toast.success('Întrebare ștearsă!');
    },
    onError: () => toast.error('Eroare la ștergere'),
  });

  // Delete quiz mutation
  const deleteQuizMutation = useMutation({
    mutationFn: async () => {
      if (!quiz?.id) return;
      const { error } = await supabase
        .from('lesson_quizzes')
        .delete()
        .eq('id', quiz.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-quiz-admin', lesson?.id] });
      toast.success('Quiz șters!');
    },
    onError: () => toast.error('Eroare la ștergerea quiz-ului'),
  });

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim()) return;
    const validOptions = newQuestion.options.filter(o => o.trim());
    if (validOptions.length < 2) {
      toast.error('Trebuie cel puțin 2 opțiuni');
      return;
    }
    addQuestionMutation.mutate();
  };

  if (!lesson) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Quiz Manager: {lesson.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {quizLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : !quiz ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-semibold mb-2">Niciun quiz pentru această lecție</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Creează un quiz pentru a evalua înțelegerea studenților
                </p>
                <Button onClick={() => createQuizMutation.mutate()} disabled={createQuizMutation.isPending}>
                  {createQuizMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Creează Quiz
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Quiz Info */}
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                <div>
                  <h4 className="font-semibold">{quiz.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Scor minim: {quiz.passing_score}% • {questions.length} întrebări
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm('Sigur vrei să ștergi quiz-ul și toate întrebările?')) {
                      deleteQuizMutation.mutate();
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Șterge Quiz
                </Button>
              </div>

              <Separator />

              {/* Add Question Form */}
              <Card className="border-dashed border-primary/50 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Adaugă Întrebare
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label>Întrebare</Label>
                      <Input
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                        placeholder="Scrie întrebarea..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Opțiuni de răspuns (selectează răspunsul corect)</Label>
                      {newQuestion.options.map((option, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setNewQuestion({ ...newQuestion, correct_option: idx })}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              newQuestion.correct_option === idx
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-muted-foreground/30 hover:border-green-500/50'
                            }`}
                          >
                            {newQuestion.correct_option === idx && <CheckCircle2 className="h-4 w-4" />}
                          </button>
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...newQuestion.options];
                              newOptions[idx] = e.target.value;
                              setNewQuestion({ ...newQuestion, options: newOptions });
                            }}
                            placeholder={`Opțiunea ${idx + 1}`}
                          />
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={handleAddQuestion}
                      disabled={!newQuestion.question.trim() || addQuestionMutation.isPending}
                      className="w-full"
                    >
                      {addQuestionMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Adaugă Întrebare
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* Questions List */}
              <div className="flex-1 overflow-hidden">
                <h4 className="font-semibold mb-2">Întrebări ({questions.length})</h4>
                
                <ScrollArea className="h-[250px]">
                  {questionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : questions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nicio întrebare adăugată</p>
                    </div>
                  ) : (
                    <div className="space-y-2 pr-4">
                      {questions.map((q, idx) => (
                        <Card key={q.id} className="bg-muted/50">
                          <CardContent className="py-3 px-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                                {idx + 1}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm mb-2">{q.question}</p>
                                <div className="flex flex-wrap gap-1">
                                  {(q.options as string[]).map((opt, optIdx) => (
                                    <Badge
                                      key={optIdx}
                                      variant={optIdx === q.correct_option ? 'default' : 'outline'}
                                      className={`text-xs ${optIdx === q.correct_option ? 'bg-green-500' : ''}`}
                                    >
                                      {opt}
                                      {optIdx === q.correct_option && (
                                        <CheckCircle2 className="h-3 w-3 ml-1" />
                                      )}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (confirm('Ștergi această întrebare?')) {
                                    deleteQuestionMutation.mutate(q.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
