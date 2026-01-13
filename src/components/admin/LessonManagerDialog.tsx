import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  GripVertical,
  Video,
  Clock,
  Loader2,
  Edit,
  Check,
  X,
  PlayCircle,
  Save,
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url?: string;
  duration_minutes?: number;
  position: number;
  is_free: boolean;
}

interface LessonManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
}

// Helper to extract YouTube embed URL
const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return '';
  
  // Handle various YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  
  // If already an embed URL, return as is
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  return url;
};

export function LessonManagerDialog({ open, onOpenChange, course }: LessonManagerDialogProps) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Lesson>>({});
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    video_url: '',
    duration_minutes: 10,
    is_free: false,
  });
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Fetch lessons
  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['course-lessons-admin', course?.id],
    queryFn: async () => {
      if (!course?.id) return [];
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('course_id', course.id)
        .order('position', { ascending: true });
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!course?.id && open,
  });

  // Add lesson mutation
  const addMutation = useMutation({
    mutationFn: async (lessonData: Omit<Lesson, 'id'>) => {
      const { error } = await supabase.from('course_lessons').insert(lessonData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-lessons-admin', course?.id] });
      queryClient.invalidateQueries({ queryKey: ['course-lessons', course?.id] });
      toast.success('Lecție adăugată!');
      setNewLesson({
        title: '',
        description: '',
        video_url: '',
        duration_minutes: 10,
        is_free: false,
      });
    },
    onError: () => toast.error('Eroare la adăugarea lecției'),
  });

  // Update lesson mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Lesson> & { id: string }) => {
      const { error } = await supabase
        .from('course_lessons')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-lessons-admin', course?.id] });
      queryClient.invalidateQueries({ queryKey: ['course-lessons', course?.id] });
      toast.success('Lecție actualizată!');
      setEditingId(null);
      setEditForm({});
    },
    onError: () => toast.error('Eroare la actualizare'),
  });

  // Delete lesson mutation
  const deleteMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase
        .from('course_lessons')
        .delete()
        .eq('id', lessonId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-lessons-admin', course?.id] });
      queryClient.invalidateQueries({ queryKey: ['course-lessons', course?.id] });
      toast.success('Lecție ștearsă!');
    },
    onError: () => toast.error('Eroare la ștergere'),
  });

  const handleAddLesson = () => {
    if (!newLesson.title || !course?.id) return;
    
    addMutation.mutate({
      course_id: course.id,
      title: newLesson.title,
      description: newLesson.description || null,
      video_url: getYouTubeEmbedUrl(newLesson.video_url) || null,
      duration_minutes: newLesson.duration_minutes || null,
      position: lessons.length + 1,
      is_free: newLesson.is_free,
    });
  };

  const handleStartEdit = (lesson: Lesson) => {
    setEditingId(lesson.id);
    setEditForm(lesson);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editForm.title) return;
    updateMutation.mutate({
      id: editingId,
      title: editForm.title,
      description: editForm.description,
      video_url: getYouTubeEmbedUrl(editForm.video_url || ''),
      duration_minutes: editForm.duration_minutes,
      is_free: editForm.is_free,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Gestionare Lecții: {course.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Add New Lesson Form */}
          <Card className="border-dashed border-primary/50 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adaugă Lecție Nouă
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Titlu</Label>
                    <Input
                      value={newLesson.title}
                      onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                      placeholder="Titlul lecției"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL Video YouTube</Label>
                    <Input
                      value={newLesson.video_url}
                      onChange={(e) => setNewLesson({ ...newLesson, video_url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Descriere</Label>
                    <Input
                      value={newLesson.description}
                      onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                      placeholder="Scurtă descriere"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Durată (min)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newLesson.duration_minutes}
                      onChange={(e) => setNewLesson({ ...newLesson, duration_minutes: parseInt(e.target.value) || 10 })}
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-7">
                    <Switch
                      checked={newLesson.is_free}
                      onCheckedChange={(checked) => setNewLesson({ ...newLesson, is_free: checked })}
                    />
                    <Label>Lecție gratuită</Label>
                  </div>
                </div>

                <Button
                  onClick={handleAddLesson}
                  disabled={!newLesson.title || addMutation.isPending}
                  className="w-full"
                >
                  {addMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Adaugă Lecție
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Lessons List */}
          <div className="flex-1 overflow-hidden">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              Lecții existente ({lessons.length})
            </h4>
            
            <ScrollArea className="h-[350px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : lessons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Video className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nicio lecție adăugată încă</p>
                </div>
              ) : (
                <div className="space-y-2 pr-4">
                  {lessons.map((lesson) => (
                    <Card key={lesson.id} className="bg-muted/50">
                      <CardContent className="py-3 px-4">
                        {editingId === lesson.id ? (
                          // Edit mode
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                value={editForm.title || ''}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                placeholder="Titlu"
                              />
                              <Input
                                value={editForm.video_url || ''}
                                onChange={(e) => setEditForm({ ...editForm, video_url: e.target.value })}
                                placeholder="URL Video YouTube"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <Input
                                value={editForm.description || ''}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                placeholder="Descriere"
                              />
                              <Input
                                type="number"
                                value={editForm.duration_minutes || 10}
                                onChange={(e) => setEditForm({ ...editForm, duration_minutes: parseInt(e.target.value) })}
                                placeholder="Durată (min)"
                              />
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={editForm.is_free || false}
                                  onCheckedChange={(checked) => setEditForm({ ...editForm, is_free: checked })}
                                />
                                <Label className="text-sm">Gratuită</Label>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                                <X className="h-4 w-4 mr-1" />
                                Anulează
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={handleSaveEdit}
                                disabled={updateMutation.isPending}
                              >
                                {updateMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4 mr-1" />
                                )}
                                Salvează
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                              {lesson.position}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{lesson.title}</span>
                                {lesson.is_free && (
                                  <Badge variant="secondary" className="text-xs">Gratis</Badge>
                                )}
                                {lesson.video_url && (
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <PlayCircle className="h-3 w-3" />
                                    Video
                                  </Badge>
                                )}
                              </div>
                              {lesson.description && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {lesson.description}
                                </p>
                              )}
                            </div>

                            {lesson.duration_minutes && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {lesson.duration_minutes} min
                              </div>
                            )}

                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setPreviewUrl(lesson.video_url || '')}
                                disabled={!lesson.video_url}
                              >
                                <PlayCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStartEdit(lesson)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (confirm('Sigur vrei să ștergi această lecție?')) {
                                    deleteMutation.mutate(lesson.id);
                                  }
                                }}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Video Preview */}
          {previewUrl && (
            <Card className="mt-2">
              <CardHeader className="py-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Preview Video</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setPreviewUrl('')}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <iframe
                    src={getYouTubeEmbedUrl(previewUrl)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
