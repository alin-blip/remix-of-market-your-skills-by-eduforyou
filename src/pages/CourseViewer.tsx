import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { pdf } from '@react-pdf/renderer';
import { CourseCertificatePDF } from '@/components/pdf/CourseCertificatePDF';
import { CourseRating } from '@/components/courses/CourseRating';
import { LessonNotes } from '@/components/courses/LessonNotes';
import { LessonQuiz } from '@/components/courses/LessonQuiz';
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Clock,
  Lock,
  PlayCircle,
  BookOpen,
  Trophy,
  ChevronRight,
  Loader2,
  Download,
  Award
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  platform: string;
  duration_minutes: number;
  level: string;
  price: number;
  lessons_count: number;
  thumbnail_url?: string;
  video_url?: string;
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

interface LessonProgress {
  lesson_id: string;
  progress_percent: number;
  completed_at?: string;
}

export default function CourseViewer() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isDownloadingCertificate, setIsDownloadingCertificate] = useState(false);

  // Fetch course details
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      if (error) throw error;
      return data as Course;
    },
    enabled: !!courseId,
  });

  // Check access
  const { hasAccess, isFounder, isLoading: accessLoading } = useCourseAccess(
    courseId || '', 
    course?.price || 0
  );

  // Fetch user profile for certificate
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch lessons
  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['course-lessons', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('position', { ascending: true });
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!courseId,
  });

  // Fetch lesson progress
  const { data: lessonProgress = [] } = useQuery({
    queryKey: ['lesson-progress', user?.id, courseId],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('lesson_id, progress_percent, completed_at')
        .eq('user_id', user.id)
        .eq('course_id', courseId);
      if (error) throw error;
      return data as LessonProgress[];
    },
    enabled: !!user?.id && !!courseId,
  });

  // Mark lesson complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      if (!user?.id || !courseId) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          lesson_id: lessonId,
          progress_percent: 100,
          completed_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id,course_id,lesson_id' 
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress'] });
      queryClient.invalidateQueries({ queryKey: ['course-progress'] });
      toast.success('Lecție completată!');
    },
    onError: () => {
      toast.error('Eroare la marcarea lecției');
    }
  });

  // Set first lesson as selected on load
  useEffect(() => {
    if (lessons.length > 0 && !selectedLesson) {
      setSelectedLesson(lessons[0]);
    }
  }, [lessons, selectedLesson]);

  const isLessonCompleted = (lessonId: string) => {
    const progress = lessonProgress.find(p => p.lesson_id === lessonId);
    return progress?.progress_percent === 100;
  };

  const completedLessonsCount = lessonProgress.filter(p => p.progress_percent === 100).length;
  const overallProgress = lessons.length > 0 
    ? Math.round((completedLessonsCount / lessons.length) * 100) 
    : 0;

  const canAccessLesson = (lesson: Lesson) => {
    return hasAccess || lesson.is_free;
  };

  const handleSelectLesson = (lesson: Lesson) => {
    if (!canAccessLesson(lesson)) {
      toast.error('Trebuie să cumperi cursul pentru a accesa această lecție');
      return;
    }
    setSelectedLesson(lesson);
  };

  const handleMarkComplete = () => {
    if (selectedLesson) {
      markCompleteMutation.mutate(selectedLesson.id);
    }
  };

  const handleNextLesson = () => {
    if (!selectedLesson) return;
    const currentIndex = lessons.findIndex(l => l.id === selectedLesson.id);
    if (currentIndex < lessons.length - 1) {
      const nextLesson = lessons[currentIndex + 1];
      if (canAccessLesson(nextLesson)) {
        setSelectedLesson(nextLesson);
      } else {
        toast.error('Trebuie să cumperi cursul pentru a continua');
      }
    }
  };

  // Format duration helper
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  // Download certificate function
  const handleDownloadCertificate = async () => {
    if (!course || !userProfile || overallProgress < 100) return;
    
    setIsDownloadingCertificate(true);
    try {
      const certificateId = `FL-${course.id.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      const completedDate = new Date().toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const blob = await pdf(
        <CourseCertificatePDF
          userName={userProfile.full_name || 'Student'}
          courseTitle={course.title}
          completedDate={completedDate}
          courseDuration={formatDuration(course.duration_minutes || 0)}
          lessonsCount={lessons.length}
          certificateId={certificateId}
        />
      ).toBlob();

      // Download the PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificat-${course.title.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Certificat descărcat cu succes!');

      // Send completion notification email
      if (userProfile.email) {
        await supabase.functions.invoke('course-notifications', {
          body: {
            type: 'course_completed',
            user_id: user?.id,
            course_id: courseId,
            user_email: userProfile.email,
            user_name: userProfile.full_name || 'Student',
            course_title: course.title,
          },
        });
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Eroare la generarea certificatului');
    } finally {
      setIsDownloadingCertificate(false);
    }
  };

  if (courseLoading || accessLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Cursul nu a fost găsit</h1>
          <Button onClick={() => navigate('/learning')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi la cursuri
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (!hasAccess && course.price > 0) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <Button variant="ghost" onClick={() => navigate('/learning')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi la cursuri
          </Button>
          
          <Card className="max-w-lg mx-auto text-center p-8">
            <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Curs Premium</h2>
            <p className="text-muted-foreground mb-6">
              Acest curs necesită achiziție pentru a fi accesat.
            </p>
            <div className="text-3xl font-bold text-primary mb-4">
              £{course.price}
            </div>
            <Button 
              className="w-full gap-2"
              onClick={() => navigate('/learning')}
            >
              Cumpără Cursul
            </Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/learning')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi la cursuri
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Progres curs</div>
              <div className="font-semibold">{completedLessonsCount}/{lessons.length} lecții</div>
            </div>
            <div className="w-32">
              <Progress value={overallProgress} className="h-2" />
            </div>
            {overallProgress === 100 && (
              <>
                <Badge className="gap-1 bg-green-500">
                  <Trophy className="h-3 w-3" />
                  Completat
                </Badge>
                <Button 
                  onClick={handleDownloadCertificate}
                  disabled={isDownloadingCertificate}
                  className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  {isDownloadingCertificate ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Certificat PDF
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Player / Content Area */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {selectedLesson?.video_url ? (
                  <iframe
                    src={selectedLesson.video_url}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <PlayCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {selectedLesson ? 'Video indisponibil' : 'Selectează o lecție'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {selectedLesson && (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        Lecția {selectedLesson.position}
                      </Badge>
                      <CardTitle className="text-xl">{selectedLesson.title}</CardTitle>
                      {selectedLesson.duration_minutes && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {selectedLesson.duration_minutes} minute
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {!isLessonCompleted(selectedLesson.id) ? (
                        <Button 
                          onClick={handleMarkComplete}
                          disabled={markCompleteMutation.isPending}
                          className="gap-2"
                        >
                          {markCompleteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Marchează ca completată
                        </Button>
                      ) : (
                        <Badge className="gap-1 bg-green-500 py-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Completată
                        </Badge>
                      )}
                      
                      <Button variant="outline" onClick={handleNextLesson}>
                        Lecția următoare
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {selectedLesson.description && (
                  <CardContent>
                    <p className="text-muted-foreground">{selectedLesson.description}</p>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Lesson Notes */}
            {selectedLesson && (
              <LessonNotes lessonId={selectedLesson.id} />
            )}

            {/* Lesson Quiz */}
            {selectedLesson && (
              <LessonQuiz lessonId={selectedLesson.id} />
            )}

            {/* Course Rating Section */}
            <CourseRating courseId={courseId!} hasAccess={hasAccess} />
          </div>

          {/* Lessons Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {lessons.length} lecții • {course.duration_minutes} minute total
                </p>
              </CardHeader>
              
              <Separator />
              
              <ScrollArea className="h-[calc(100vh-350px)]">
                <div className="p-4 space-y-2">
                  <AnimatePresence>
                    {lessons.map((lesson, index) => {
                      const isCompleted = isLessonCompleted(lesson.id);
                      const isSelected = selectedLesson?.id === lesson.id;
                      const canAccess = canAccessLesson(lesson);
                      
                      return (
                        <motion.div
                          key={lesson.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <button
                            onClick={() => handleSelectLesson(lesson)}
                            disabled={!canAccess}
                            className={`w-full text-left p-3 rounded-lg transition-all ${
                              isSelected 
                                ? 'bg-primary/10 border-2 border-primary' 
                                : 'bg-muted/50 hover:bg-muted border-2 border-transparent'
                            } ${!canAccess ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : isSelected 
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted-foreground/20'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : !canAccess ? (
                                  <Lock className="h-4 w-4" />
                                ) : (
                                  <span className="text-sm font-medium">{lesson.position}</span>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium text-sm truncate ${
                                    isSelected ? 'text-primary' : ''
                                  }`}>
                                    {lesson.title}
                                  </span>
                                  {lesson.is_free && (
                                    <Badge variant="secondary" className="text-xs">
                                      Gratis
                                    </Badge>
                                  )}
                                </div>
                                {lesson.duration_minutes && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <Clock className="h-3 w-3" />
                                    {lesson.duration_minutes} min
                                  </div>
                                )}
                              </div>
                              
                              {isSelected && canAccess && (
                                <Play className="h-4 w-4 text-primary flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  
                  {lessons.length === 0 && !lessonsLoading && (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nicio lecție disponibilă încă</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
