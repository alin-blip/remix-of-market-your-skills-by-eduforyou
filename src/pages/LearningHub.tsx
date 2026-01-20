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
import { LessonManagerDialog } from '@/components/admin/LessonManagerDialog';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useCoursesAccess } from '@/hooks/useCourseAccess';
import { useSubscription } from '@/hooks/useSubscription';
import { ExternalCourseCard } from '@/components/courses/ExternalCourseCard';
import { LearningPathCard } from '@/components/courses/LearningPathCard';
import { CourseRecommendations } from '@/components/courses/CourseRecommendations';
import { PartnershipBanner, PartnershipLogos } from '@/components/courses/PartnershipBanner';
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
  Loader2,
  Globe,
  Filter,
  Wrench,
  Brain,
  Award,
  Gift,
  FileText,
  Download
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
  slug?: string;
  download_url?: string;
  product_type?: string;
  provider?: string;
  external_url?: string;
  tags?: string[];
  certificate?: string;
  language?: string;
  recommended_for?: string;
  prerequisites?: string;
  course_type?: string;
  requires_pro?: boolean;
  category?: string;
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

interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  position: number;
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
  const { plan } = useSubscription();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [purchasingCourseId, setPurchasingCourseId] = useState<string | null>(null);
  const [showLessonManager, setShowLessonManager] = useState(false);
  const [lessonManagerCourse, setLessonManagerCourse] = useState<Course | null>(null);

  // Fetch courses (admin sees all, users see published only)
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['courses', isAdmin],
    queryFn: async () => {
      let query = supabase.from('courses').select('*').order('created_at', { ascending: false });
      if (!isAdmin) {
        query = query.eq('is_published', true);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Course[];
    },
  });

  // Filter courses by product_type
  const freeReports = courses.filter(c => c.product_type === 'free_report');
  const ebooks = courses.filter(c => c.product_type === 'ebook');
  const premiumCourses = courses.filter(c => c.product_type === 'course' || !c.product_type);
  const certificationCourses = courses.filter(c => c.category === 'certification' || (c.certificate === 'Yes' || c.certificate === 'Badges'));

  // Fetch learning paths
  const { data: learningPaths = [] } = useQuery({
    queryKey: ['learning-paths'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('is_published', true)
        .order('position');
      if (error) throw error;
      return data as LearningPath[];
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
      toast.success(editingCourse ? 'Produs actualizat!' : 'Produs adăugat!');
      setShowCourseDialog(false);
      setEditingCourse(null);
    },
    onError: () => toast.error('Eroare la salvarea produsului'),
  });

  const getCourseProgress = (courseId: string) => {
    const p = progress.find(p => p.course_id === courseId);
    return p?.progress_percent || 0;
  };

  const hasPurchased = (courseId: string) => {
    return purchases.some(p => p.course_id === courseId);
  };

  const checkAccess = (courseId: string, price: number) => {
    return hasAccessToCourse(courseId, price);
  };

  const completedCourses = progress.filter(p => p.progress_percent >= 100).length;
  const totalProgress = premiumCourses.length > 0 
    ? Math.round(progress.reduce((sum, p) => sum + p.progress_percent, 0) / premiumCourses.length) 
    : 0;

  // Render Free Report Card
  const renderFreeReportCard = (product: Course, index: number) => (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow group border-green-500/20 hover:border-green-500/40">
        {/* Thumbnail */}
        <div className="h-48 bg-gradient-to-br from-green-500/10 to-emerald-500/10 relative overflow-hidden">
          {product.thumbnail_url ? (
            <img 
              src={product.thumbnail_url} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Gift className="h-16 w-16 text-green-500/50" />
            </div>
          )}
          
          <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0">
            <Gift className="h-3 w-3 mr-1" />
            GRATUIT
          </Badge>
        </div>

        <CardContent className="flex-1 flex flex-col p-4">
          <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
          <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
            {product.description}
          </p>

          <Button 
            className="w-full gap-2 bg-green-500 hover:bg-green-600"
            onClick={() => navigate(`/free/${product.slug}`)}
          >
            <Download className="h-4 w-4" />
            Descarcă Gratuit
          </Button>
          
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 gap-2"
              onClick={() => {
                setEditingCourse(product);
                setShowCourseDialog(true);
              }}
            >
              <Edit className="h-4 w-4" />
              Editează
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  // Render Ebook Card
  const renderEbookCard = (product: Course, index: number) => {
    const isPurchased = hasPurchased(product.id);
    
    return (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className="h-full flex flex-col hover:shadow-lg transition-shadow group border-amber-500/20 hover:border-amber-500/40">
          {/* Thumbnail */}
          <div className="h-48 bg-gradient-to-br from-amber-500/10 to-orange-500/10 relative overflow-hidden">
            {product.thumbnail_url ? (
              <img 
                src={product.thumbnail_url} 
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="h-16 w-16 text-amber-500/50" />
              </div>
            )}
            
            {isPurchased ? (
              <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Achiziționat
              </Badge>
            ) : (
              <Badge className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-sm font-bold">
                £{product.price}
              </Badge>
            )}
          </div>

          <CardContent className="flex-1 flex flex-col p-4">
            <Badge variant="outline" className="w-fit mb-2 text-amber-500 border-amber-500/30">
              <FileText className="h-3 w-3 mr-1" />
              eBook
            </Badge>
            
            <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
              {product.description}
            </p>

            <Button 
              className="w-full gap-2"
              variant={isPurchased ? "secondary" : "default"}
              onClick={() => navigate(`/ebook/${product.slug}`)}
            >
              {isPurchased ? (
                <>
                  <Download className="h-4 w-4" />
                  Descarcă
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Cumpără - £{product.price}
                </>
              )}
            </Button>
            
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 gap-2"
                onClick={() => {
                  setEditingCourse(product);
                  setShowCourseDialog(true);
                }}
              >
                <Edit className="h-4 w-4" />
                Editează
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Render Premium Course Card
  const renderCourseCard = (course: Course, index: number) => {
    const courseProgress = getCourseProgress(course.id);
    const hasAccess = checkAccess(course.id, course.price);
    const isFree = course.price === 0;

    return (
      <motion.div
        key={course.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
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
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  <Play className="h-4 w-4" />
                  {t.learningHub?.buttons?.continue || 'Continuă'}
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full gap-2"
                variant={hasAccess ? "secondary" : "default"}
                onClick={() => {
                  if (hasAccess) {
                    navigate(`/course/${course.id}`);
                  } else if (course.slug) {
                    navigate(`/courses/${course.slug}`);
                  } else {
                    setSelectedCourse(course);
                  }
                }}
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
            
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 gap-2"
                onClick={() => {
                  setLessonManagerCourse(course);
                  setShowLessonManager(true);
                }}
              >
                <Video className="h-4 w-4" />
                Gestionează Lecții
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
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
              Resurse gratuite, eBooks și cursuri premium
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-2 py-1.5 px-3">
              <Trophy className="h-4 w-4 text-amber-500" />
              {completedCourses} {t.learningHub?.coursesCompleted || 'cursuri completate'}
            </Badge>
            {isAdmin && (
              <Button onClick={() => { setEditingCourse(null); setShowCourseDialog(true); }} className="gap-2">
                <Plus className="h-4 w-4" /> Adaugă Produs
              </Button>
            )}
          </div>
        </div>

        {/* Progress Overview - Only show if has premium courses */}
        {premiumCourses.length > 0 && (
          <Card className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-background border-amber-500/20">
            <CardContent className="py-6">
              <div className="flex items-center gap-6">
                <div className="hidden md:flex h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{t.learningHub?.progress?.title || 'Progresul tău de învățare'}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t.learningHub?.progress?.completed || 'Ai completat'} {completedCourses} {t.learningHub?.progress?.of || 'din'} {premiumCourses.length} {t.learningHub?.progress?.available || 'cursuri disponibile'}
                  </p>
                  <div className="flex items-center gap-4">
                    <Progress value={totalProgress} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{totalProgress}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="gratuite" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="gratuite" className="gap-2">
              <Gift className="h-4 w-4" />
              <span className="hidden sm:inline">Gratuite</span>
              <span className="sm:hidden">Free</span>
              <Badge variant="secondary" className="ml-1 text-xs">{freeReports.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ebooks" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">eBooks</span>
              <span className="sm:hidden">PDF</span>
              <Badge variant="secondary" className="ml-1 text-xs">{ebooks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="cursuri" className="gap-2">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Cursuri</span>
              <span className="sm:hidden">Video</span>
              <Badge variant="secondary" className="ml-1 text-xs">{premiumCourses.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="certificari" className="gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Certificări</span>
              <span className="sm:hidden">Cert.</span>
              <Badge className="ml-1 text-xs bg-green-500/20 text-green-500 border-0">{certifications.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Gratuite Tab */}
          <TabsContent value="gratuite" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Gift className="h-5 w-5 text-green-500" />
                  Resurse Gratuite
                </h2>
                <p className="text-sm text-muted-foreground">
                  Descarcă rapoarte și ghiduri gratuite pentru a începe
                </p>
              </div>
            </div>

            {isLoadingCourses ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-80 animate-pulse bg-muted/50" />
                ))}
              </div>
            ) : freeReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {freeReports.map((product, index) => renderFreeReportCard(product, index))}
              </div>
            ) : (
              <Card className="bg-muted/30">
                <CardContent className="py-8 text-center">
                  <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Nu există resurse gratuite încă</h3>
                  <p className="text-sm text-muted-foreground">
                    Resursele gratuite vor fi adăugate în curând.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* eBooks Tab */}
          <TabsContent value="ebooks" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-500" />
                  eBooks
                </h2>
                <p className="text-sm text-muted-foreground">
                  Ghiduri detaliate în format PDF
                </p>
              </div>
            </div>

            {isLoadingCourses ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-80 animate-pulse bg-muted/50" />
                ))}
              </div>
            ) : ebooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ebooks.map((product, index) => renderEbookCard(product, index))}
              </div>
            ) : (
              <Card className="bg-muted/30">
                <CardContent className="py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Nu există eBooks încă</h3>
                  <p className="text-sm text-muted-foreground">
                    eBooks vor fi adăugate în curând.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Cursuri Premium Tab */}
          <TabsContent value="cursuri" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  Cursuri Video Premium
                </h2>
                <p className="text-sm text-muted-foreground">
                  Cursuri video complete cu lecții și certificare
                </p>
              </div>
            </div>

            {isLoadingCourses ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-80 animate-pulse bg-muted/50" />
                ))}
              </div>
            ) : premiumCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {premiumCourses.map((course, index) => renderCourseCard(course, index))}
              </div>
            ) : (
              <Card className="bg-muted/30">
                <CardContent className="py-8 text-center">
                  <Video className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Nu există cursuri premium încă</h3>
                  <p className="text-sm text-muted-foreground">
                    Cursurile premium vor fi adăugate în curând.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Inspirational Quote */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardContent className="py-6 text-center">
                <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                <p className="text-lg italic text-muted-foreground">
                  "Investiția în cunoaștere plătește cel mai bun dobânda."
                </p>
                <p className="text-sm text-muted-foreground mt-2">— Benjamin Franklin</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificări Tab */}
          <TabsContent value="certificari" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Certificări Recomandate Gratuite
              </h3>
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
            </div>
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
                    onClick={() => {
                      if (selectedCourse.slug) {
                        navigate(`/courses/${selectedCourse.slug}`);
                      }
                      setSelectedCourse(null);
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                    Vezi Detalii
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
        
        <LessonManagerDialog
          open={showLessonManager}
          onOpenChange={setShowLessonManager}
          course={lessonManagerCourse}
        />
      </div>
    </MainLayout>
  );
}
