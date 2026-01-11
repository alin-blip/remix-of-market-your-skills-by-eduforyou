import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Star, 
  ExternalLink,
  CheckCircle2,
  Lock,
  Sparkles,
  Trophy,
  GraduationCap,
  ShoppingCart,
  PlayCircle,
  Video
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

interface CourseProgress {
  course_id: string;
  progress_percent: number;
  completed_at?: string;
}

interface CoursePurchase {
  course_id: string;
  status: string;
}

const certifications = [
  { name: 'Google Digital Marketing', provider: 'Google', free: true, url: 'https://grow.google/certificates/digital-marketing-ecommerce/' },
  { name: 'HubSpot Content Marketing', provider: 'HubSpot', free: true, url: 'https://academy.hubspot.com/courses/content-marketing' },
  { name: 'Meta Social Media Marketing', provider: 'Meta', free: true, url: 'https://www.facebook.com/business/learn' },
  { name: 'Google Analytics', provider: 'Google', free: true, url: 'https://skillshop.exceedlms.com/student/catalog/list?category_ids=6431-google-analytics-4' },
  { name: 'Semrush SEO Toolkit', provider: 'Semrush', free: true, url: 'https://www.semrush.com/academy/' },
];

const platformColors: Record<string, string> = {
  fiverr: 'bg-green-500',
  upwork: 'bg-emerald-500',
  freelancer: 'bg-blue-500',
  general: 'bg-purple-500',
};

const levelColors: Record<string, { bg: string; text: string }> = {
  beginner: { bg: 'bg-green-500/10', text: 'text-green-500' },
  intermediate: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
  advanced: { bg: 'bg-red-500/10', text: 'text-red-500' },
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
};

export default function LearningHub() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('price', { ascending: true });
      if (error) throw error;
      return data as Course[];
    },
  });

  // Fetch user progress
  const { data: progress = [] } = useQuery({
    queryKey: ['course-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('course_id, progress_percent, completed_at')
        .eq('user_id', user.id);
      if (error) throw error;
      return data as CourseProgress[];
    },
    enabled: !!user?.id,
  });

  // Fetch user purchases
  const { data: purchases = [] } = useQuery({
    queryKey: ['course-purchases', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('course_purchases')
        .select('course_id, status')
        .eq('user_id', user.id)
        .eq('status', 'completed');
      if (error) throw error;
      return data as CoursePurchase[];
    },
    enabled: !!user?.id,
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (course: Course) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('course_purchases')
        .insert({
          user_id: user.id,
          course_id: course.id,
          amount: course.price,
          currency: 'EUR',
          status: 'completed', // Simplified for demo
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-purchases'] });
      toast.success('Curs cumpărat cu succes!');
      setSelectedCourse(null);
    },
    onError: () => {
      toast.error('Eroare la achiziție');
    },
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ courseId, percent }: { courseId: string; percent: number }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          progress_percent: percent,
          completed_at: percent >= 100 ? new Date().toISOString() : null,
        }, { onConflict: 'user_id,course_id,lesson_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-progress'] });
    },
  });

  const getCourseProgress = (courseId: string) => {
    const p = progress.find(p => p.course_id === courseId);
    return p?.progress_percent || 0;
  };

  const hasPurchased = (courseId: string) => {
    return purchases.some(p => p.course_id === courseId);
  };

  const completedCourses = progress.filter(p => p.progress_percent >= 100).length;
  const totalProgress = courses.length > 0 
    ? Math.round(progress.reduce((sum, p) => sum + p.progress_percent, 0) / courses.length) 
    : 0;

  const handleStartCourse = (course: Course) => {
    if (course.price > 0 && !hasPurchased(course.id)) {
      setSelectedCourse(course);
    } else {
      // Simulate starting course and updating progress
      const currentProgress = getCourseProgress(course.id);
      if (currentProgress < 100) {
        updateProgressMutation.mutate({ 
          courseId: course.id, 
          percent: Math.min(currentProgress + 25, 100) 
        });
        toast.success(`Progres actualizat: ${Math.min(currentProgress + 25, 100)}%`);
      }
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                <BookOpen className="h-7 w-7 text-amber-500" />
              </div>
              Learning Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Cursuri premium pentru freelanceri • Prețuri de la 49€ la 499€
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-2 py-1.5 px-3">
              <Trophy className="h-4 w-4 text-amber-500" />
              {completedCourses} cursuri completate
            </Badge>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-background border-amber-500/20">
          <CardContent className="py-6">
            <div className="flex items-center gap-6">
              <div className="hidden md:flex h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 items-center justify-center">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Progresul tău de învățare</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Ai completat {completedCourses} din {courses.length} cursuri disponibile
                </p>
                <div className="flex items-center gap-4">
                  <Progress value={totalProgress} className="flex-1 h-2" />
                  <span className="text-sm font-medium">{totalProgress}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="courses" className="gap-2">
              <Play className="h-4 w-4" />
              Cursuri ({courses.length})
            </TabsTrigger>
            <TabsTrigger value="certifications" className="gap-2">
              <Trophy className="h-4 w-4" />
              Certificări
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            {/* Courses Grid */}
            {isLoadingCourses ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-80 animate-pulse bg-muted/50" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => {
                  const courseProgress = getCourseProgress(course.id);
                  const isPurchased = hasPurchased(course.id);
                  const isFree = course.price === 0;

                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow group">
                        {/* Thumbnail */}
                        <div className="h-40 bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                          <div className={`absolute top-3 left-3 w-2 h-2 rounded-full ${platformColors[course.platform]}`} />
                          
                          {/* Price badge */}
                          <div className="absolute top-3 right-3">
                            {isFree ? (
                              <Badge className="bg-green-500/90 text-white border-0">
                                Gratuit
                              </Badge>
                            ) : (
                              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-sm font-bold">
                                {course.price}€
                              </Badge>
                            )}
                          </div>

                          {/* Play button overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="h-14 w-14 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                              <PlayCircle className="h-8 w-8 text-primary" />
                            </div>
                          </div>

                          {/* Video icon */}
                          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs text-muted-foreground bg-background/80 rounded-full px-2 py-1">
                            <Video className="h-3 w-3" />
                            {course.lessons_count} lecții
                          </div>

                          {isPurchased && (
                            <div className="absolute bottom-3 right-3">
                              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-0 gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Achiziționat
                              </Badge>
                            </div>
                          )}
                        </div>

                        <CardContent className="flex-1 flex flex-col p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={`${levelColors[course.level]?.bg || ''} ${levelColors[course.level]?.text || ''} border-0 text-xs`}>
                              {course.level}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(course.duration_minutes)}
                            </span>
                          </div>

                          <h3 className="font-semibold mb-2 line-clamp-2">{course.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
                            {course.description}
                          </p>

                          {courseProgress > 0 ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Progres
                                </span>
                                <span className="font-medium">
                                  {courseProgress}%
                                </span>
                              </div>
                              <Progress value={courseProgress} className="h-1.5" />
                              <Button 
                                variant="secondary" 
                                className="w-full gap-2 mt-2"
                                onClick={() => handleStartCourse(course)}
                              >
                                <Play className="h-4 w-4" />
                                Continuă
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              className="w-full gap-2"
                              variant={isPurchased || isFree ? "secondary" : "default"}
                              onClick={() => handleStartCourse(course)}
                            >
                              {isPurchased || isFree ? (
                                <>
                                  <Play className="h-4 w-4" />
                                  Începe cursul
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="h-4 w-4" />
                                  Cumpără - {course.price}€
                                </>
                              )}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="certifications" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{cert.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            {cert.provider}
                            {cert.free && (
                              <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-0 text-xs">
                                Gratuit
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={cert.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="bg-muted/30">
              <CardContent className="py-6 text-center">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Mai multe certificări în curând!</h3>
                <p className="text-sm text-muted-foreground">
                  Adăugăm constant noi certificări gratuite pentru studenți.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Purchase Dialog */}
        <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <ShoppingCart className="h-5 w-5 text-amber-500" />
                </div>
                Achiziționează curs
              </DialogTitle>
            </DialogHeader>
            
            {selectedCourse && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-1">{selectedCourse.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{selectedCourse.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(selectedCourse.duration_minutes)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      {selectedCourse.lessons_count} lecții
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg">
                  <span className="font-medium">Total</span>
                  <span className="text-2xl font-bold text-amber-500">{selectedCourse.price}€</span>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedCourse(null)}>
                    Anulează
                  </Button>
                  <Button 
                    className="flex-1 gap-2"
                    onClick={() => purchaseMutation.mutate(selectedCourse)}
                    disabled={purchaseMutation.isPending}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {purchaseMutation.isPending ? 'Se procesează...' : 'Cumpără acum'}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  * Acesta este un demo. În producție, va fi integrat Stripe.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}