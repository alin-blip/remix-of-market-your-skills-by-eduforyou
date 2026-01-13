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
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { useAdminRole } from '@/hooks/useAdminRole';
import { CourseDialog } from '@/components/courses/CourseDialog';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useCoursesAccess } from '@/hooks/useCourseAccess';
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
  Video,
  Crown,
  Rocket,
  ArrowRight,
  Plus,
  Edit,
  Loader2
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
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAdminRole();
  const { checkoutCourse, isLoading: isCheckoutLoading } = useStripeCheckout();
  const { hasAccessToCourse, isFounder, isLoading: isAccessLoading } = useCoursesAccess();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [purchasingCourseId, setPurchasingCourseId] = useState<string | null>(null);

  // Smart Start-Up modules with translations
  const smartStartupModules = [
    {
      number: 1,
      title: t.learningHub?.modules?.module1?.title || "Deciding to Start a Startup",
      description: t.learningHub?.modules?.module1?.description || "Află dacă antreprenoriatul este pentru tine",
      duration: "2h 30min",
      lessons: 4,
      locked: false
    },
    {
      number: 2,
      title: t.learningHub?.modules?.module2?.title || "Getting & Evaluating Ideas",
      description: t.learningHub?.modules?.module2?.description || "Găsește și validează idei de startup",
      duration: "3h 15min",
      lessons: 5,
      locked: false
    },
    {
      number: 3,
      title: t.learningHub?.modules?.module3?.title || "Building Your Founding Team",
      description: t.learningHub?.modules?.module3?.description || "Găsește co-fondatori și construiește echipa",
      duration: "2h 45min",
      lessons: 4,
      locked: false
    },
    {
      number: 4,
      title: t.learningHub?.modules?.module4?.title || "Planning & Building Your MVP",
      description: t.learningHub?.modules?.module4?.description || "Construiește un MVP care rezolvă probleme reale",
      duration: "4h",
      lessons: 5,
      locked: true
    },
    {
      number: 5,
      title: t.learningHub?.modules?.module5?.title || "Launching & First Customers",
      description: t.learningHub?.modules?.module5?.description || "Strategii pentru a atrage primii clienți",
      duration: "3h",
      lessons: 4,
      locked: true
    },
    {
      number: 6,
      title: t.learningHub?.modules?.module6?.title || "Growth & Monetization",
      description: t.learningHub?.modules?.module6?.description || "Scalează și monetizează startup-ul",
      duration: "4h 30min",
      lessons: 5,
      locked: true
    },
    {
      number: 7,
      title: t.learningHub?.modules?.module7?.title || "Fundraising & Company Building",
      description: t.learningHub?.modules?.module7?.description || "Atrage investiții și construiește compania",
      duration: "3h 30min",
      lessons: 4,
      locked: true
    },
    {
      number: 8,
      title: t.learningHub?.modules?.module8?.title || "Stories from Great Founders",
      description: t.learningHub?.modules?.module8?.description || "Învață de la fondatori de succes",
      duration: "4h",
      lessons: 5,
      locked: true
    }
  ];

  // Fetch courses (admin sees all, users see published only)
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['courses', isAdmin],
    queryFn: async () => {
      let query = supabase.from('courses').select('*').order('price', { ascending: true });
      if (!isAdmin) {
        query = query.eq('is_published', true);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Course[];
    },
  });

  // Save course mutation (admin only)
  const saveCourseM = useMutation({
    mutationFn: async (courseData: Omit<Course, 'id'> & { id?: string }) => {
      if (courseData.id) {
        const { error } = await supabase.from('courses').update(courseData).eq('id', courseData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('courses').insert(courseData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success(editingCourse ? 'Curs actualizat!' : 'Curs adăugat!');
      setShowCourseDialog(false);
      setEditingCourse(null);
    },
    onError: () => toast.error('Eroare la salvarea cursului'),
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
          currency: 'GBP',
          status: 'completed', // Simplified for demo
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-purchases'] });
      toast.success(t.learningHub?.messages?.purchaseSuccess || 'Curs cumpărat cu succes!');
      setSelectedCourse(null);
    },
    onError: () => {
      toast.error(t.learningHub?.messages?.purchaseError || 'Eroare la achiziție');
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

  // Check access using the new hook (includes Founder access)
  const checkAccess = (courseId: string, price: number) => {
    return hasAccessToCourse(courseId, price);
  };

  const completedCourses = progress.filter(p => p.progress_percent >= 100).length;
  const totalProgress = courses.length > 0 
    ? Math.round(progress.reduce((sum, p) => sum + p.progress_percent, 0) / courses.length) 
    : 0;

  const handleStartCourse = async (course: Course) => {
    const hasAccess = checkAccess(course.id, course.price);
    
    if (!hasAccess) {
      // Show purchase dialog
      setSelectedCourse(course);
    } else {
      // Start or continue the course
      const currentProgress = getCourseProgress(course.id);
      if (currentProgress < 100) {
        updateProgressMutation.mutate({ 
          courseId: course.id, 
          percent: Math.min(currentProgress + 25, 100) 
        });
        toast.success(`${t.learningHub?.progress?.updated || 'Progres actualizat'}: ${Math.min(currentProgress + 25, 100)}%`);
      }
    }
  };

  const handleBuyCourse = async (course: Course) => {
    setPurchasingCourseId(course.id);
    // For now, use demo purchase until Stripe price is created
    // In production, call checkoutCourse with the course's Stripe price ID
    await purchaseMutation.mutateAsync(course);
    setPurchasingCourseId(null);
  };

  const handleModuleClick = (module: typeof smartStartupModules[0]) => {
    if (module.locked) {
      navigate('/upgrade');
    } else {
      toast.success(`${t.learningHub?.messages?.startModule || 'Începe modulul'}: ${module.title}`);
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
              {t.learningHub?.title || 'Learning Hub'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t.learningHub?.subtitle || 'Cursuri premium pentru freelanceri • Prețuri de la £49 la £499'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-2 py-1.5 px-3">
              <Trophy className="h-4 w-4 text-amber-500" />
              {completedCourses} {t.learningHub?.coursesCompleted || 'cursuri completate'}
            </Badge>
          </div>
        </div>

        {/* Founder Accelerator Premium Banner */}
        <Card className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border-amber-500/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-2xl" />
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="hidden md:flex h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 items-center justify-center shrink-0">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <Badge className="mb-2 bg-amber-500/20 text-amber-500 border-amber-500/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t.learningHub?.premiumBadge || 'Program Premium'}
                </Badge>
                <h3 className="text-xl font-bold mb-1">{t.learningHub?.founderAccelerator?.title || 'Founder Accelerator'}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.learningHub?.founderAccelerator?.description || 'Programul complet de 8 module pentru a-ți transforma ideea într-un startup de succes. 36+ ore de conținut bazat pe curriculum-ul Y Combinator.'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-500 mb-1">£997</div>
                <p className="text-xs text-muted-foreground mb-2">{t.learningHub?.lifetimeAccess || 'acces pe viață'}</p>
                <Button 
                  className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  onClick={() => navigate('/upgrade')}
                >
                  <Rocket className="h-4 w-4" />
                  {t.learningHub?.viewDetails || 'Vezi Detalii'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-background border-amber-500/20">
          <CardContent className="py-6">
            <div className="flex items-center gap-6">
              <div className="hidden md:flex h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 items-center justify-center">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{t.learningHub?.progress?.title || 'Progresul tău de învățare'}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t.learningHub?.progress?.completed || 'Ai completat'} {completedCourses} {t.learningHub?.progress?.of || 'din'} {courses.length} {t.learningHub?.progress?.available || 'cursuri disponibile'}
                </p>
                <div className="flex items-center gap-4">
                  <Progress value={totalProgress} className="flex-1 h-2" />
                  <span className="text-sm font-medium">{totalProgress}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="smart-startup" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="smart-startup" className="gap-2">
              <Rocket className="h-4 w-4" />
              {t.learningHub?.tabs?.smartStartup || 'Smart Start-Up'}
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-2">
              <Play className="h-4 w-4" />
              {t.learningHub?.tabs?.courses || 'Cursuri'} ({courses.length})
            </TabsTrigger>
            <TabsTrigger value="certifications" className="gap-2">
              <Trophy className="h-4 w-4" />
              {t.learningHub?.tabs?.certifications || 'Certificări'}
            </TabsTrigger>
          </TabsList>

          {/* Smart Start-Up Tab */}
          <TabsContent value="smart-startup" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{t.learningHub?.smartStartup?.title || 'Smart Start-Up Curriculum'}</h2>
                <p className="text-sm text-muted-foreground">
                  {t.learningHub?.smartStartup?.subtitle || 'Module 1-3 gratuite • Module 4-8 disponibile în Founder Accelerator'}
                </p>
              </div>
              <Button 
                variant="outline" 
                className="gap-2 border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                onClick={() => navigate('/upgrade')}
              >
                <Crown className="h-4 w-4" />
                {t.learningHub?.upgradeButton || 'Upgrade la Full Access'}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {smartStartupModules.map((module, index) => (
                <motion.div
                  key={module.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      module.locked 
                        ? 'opacity-75 hover:border-amber-500/50' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleModuleClick(module)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                          module.locked 
                            ? 'bg-muted text-muted-foreground' 
                            : 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
                        }`}>
                          {module.locked ? (
                            <Lock className="h-5 w-5" />
                          ) : (
                            <span className="font-bold">{module.number}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm">{module.title}</h3>
                            {module.locked ? (
                              <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-500 border-0">
                                <Lock className="h-3 w-3 mr-1" />
                                {t.learningHub?.badges?.premium || 'Premium'}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500 border-0">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {t.learningHub?.badges?.free || 'Gratuit'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{module.description}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Play className="h-3 w-3" />
                              {module.lessons} {t.learningHub?.lessons || 'lecții'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {module.duration}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className={`h-5 w-5 shrink-0 ${module.locked ? 'text-amber-500' : 'text-muted-foreground'}`} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Upgrade CTA */}
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <CardContent className="py-8 text-center">
                <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{t.learningHub?.unlockAll?.title || 'Deblochează Toate Modulele'}</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {t.learningHub?.unlockAll?.description || 'Obține acces la toate cele 8 module, comunitatea privată și suport prioritar cu Founder Accelerator.'}
                </p>
                <Button 
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  onClick={() => navigate('/upgrade')}
                >
                  <Rocket className="h-5 w-5" />
                  {t.learningHub?.unlockAll?.button || 'Upgrade Acum - £997'}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            {/* Admin Add Course Button */}
            {isAdmin && (
              <div className="flex justify-end">
                <Button onClick={() => { setEditingCourse(null); setShowCourseDialog(true); }} className="gap-2">
                  <Plus className="h-4 w-4" /> Adaugă Curs
                </Button>
              </div>
            )}
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
                  const hasAccess = checkAccess(course.id, course.price);
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
                                {t.learningHub?.badges?.free || 'Gratuit'}
                              </Badge>
                            ) : hasAccess && !isFree ? (
                              <Badge className="bg-green-500/90 text-white border-0 gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                {isFounder ? 'Founder' : 'Acces'}
                              </Badge>
                            ) : (
                              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-sm font-bold">
                                £{course.price}
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
                            {course.lessons_count} {t.learningHub?.lessons || 'lecții'}
                          </div>
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
                                  {t.learningHub?.progress?.label || 'Progres'}
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
                                {t.learningHub?.buttons?.continue || 'Continuă'}
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              className="w-full gap-2"
                              variant={hasAccess ? "secondary" : "default"}
                              onClick={() => handleStartCourse(course)}
                            >
                              {hasAccess ? (
                                <>
                                  <Play className="h-4 w-4" />
                                  {t.learningHub?.buttons?.startCourse || 'Începe cursul'}
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="h-4 w-4" />
                                  {t.learningHub?.buttons?.buy || 'Cumpără'} - £{course.price}
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
                                {t.learningHub?.badges?.free || 'Gratuit'}
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
                <h3 className="font-semibold mb-1">{t.learningHub?.moreCertifications?.title || 'Mai multe certificări în curând!'}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.learningHub?.moreCertifications?.description || 'Adăugăm constant noi certificări gratuite pentru studenți.'}
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
                {t.learningHub?.purchaseDialog?.title || 'Achiziționează curs'}
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
                      {selectedCourse.lessons_count} {t.learningHub?.lessons || 'lecții'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg">
                  <span className="font-medium">{t.learningHub?.purchaseDialog?.total || 'Total'}</span>
                  <span className="text-2xl font-bold text-amber-500">£{selectedCourse.price}</span>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedCourse(null)}>
                    {t.learningHub?.purchaseDialog?.cancel || 'Anulează'}
                  </Button>
                  <Button 
                    className="flex-1 gap-2"
                    onClick={() => handleBuyCourse(selectedCourse)}
                    disabled={purchaseMutation.isPending || purchasingCourseId === selectedCourse.id}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {purchaseMutation.isPending || purchasingCourseId === selectedCourse.id
                      ? (t.learningHub?.purchaseDialog?.processing || 'Se procesează...') 
                      : (t.learningHub?.purchaseDialog?.buyNow || 'Cumpără acum')}
                  </Button>
                </div>

                {isFounder && (
                  <p className="text-xs text-green-500 text-center flex items-center justify-center gap-1">
                    <Crown className="h-3 w-3" />
                    Ca Founder, ai acces gratuit la toate cursurile!
                  </p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Admin Course Dialog */}
        <CourseDialog
          open={showCourseDialog}
          onOpenChange={setShowCourseDialog}
          course={editingCourse}
          onSave={async (data) => {
            await saveCourseM.mutateAsync(editingCourse ? { ...data, id: editingCourse.id } : data);
          }}
          isLoading={saveCourseM.isPending}
        />
      </div>
    </MainLayout>
  );
}
