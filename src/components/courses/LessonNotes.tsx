import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Loader2, StickyNote, Save } from 'lucide-react';

interface LessonNotesProps {
  lessonId: string;
}

export function LessonNotes({ lessonId }: LessonNotesProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch existing notes
  const { data: notes, isLoading } = useQuery({
    queryKey: ['lesson-notes', user?.id, lessonId],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('lesson_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!lessonId,
  });

  // Update content when notes load
  useEffect(() => {
    if (notes?.content) {
      setContent(notes.content);
      setHasChanges(false);
    } else {
      setContent('');
      setHasChanges(false);
    }
  }, [notes, lessonId]);

  // Save notes mutation
  const saveNotesMutation = useMutation({
    mutationFn: async (noteContent: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('lesson_notes')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          content: noteContent,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-notes', user?.id, lessonId] });
      setHasChanges(false);
      toast.success('Notițe salvate!');
    },
    onError: () => {
      toast.error('Eroare la salvarea notițelor');
    }
  });

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasChanges(value !== (notes?.content || ''));
  };

  const handleSave = () => {
    saveNotesMutation.mutate(content);
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Notițele Tale</CardTitle>
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || saveNotesMutation.isPending}
            className="gap-2"
          >
            {saveNotesMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvează
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Textarea
            placeholder="Scrie notițele tale aici... Acestea vor fi salvate automat pentru fiecare lecție."
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="min-h-[150px] resize-none"
          />
        )}
        {hasChanges && (
          <p className="text-xs text-muted-foreground mt-2">
            * Ai modificări nesalvate
          </p>
        )}
      </CardContent>
    </Card>
  );
}
