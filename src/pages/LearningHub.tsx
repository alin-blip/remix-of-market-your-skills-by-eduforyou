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
  // External course fields
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

const categoryColors: Record<string, { bg: string; text: string; icon: any }> = {
  skills: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: Wrench },
  improvement: { bg: 'bg-purple-500/10', text: 'text-purple-500', icon: Brain },
  certification: { bg: 'bg-green-500/10', text: 'text-green-500', icon: Award },
  partner: { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: Globe },
  general: { bg: 'bg-muted', text: 'text-muted-foreground', icon: BookOpen },
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
  const [skillsSubFilter, setSkillsSubFilter] = useState<string>('all');
  const [improvementSubFilter, setImprovementSubFilter] = useState<string>('all');

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

  // Filter courses by category
  const skillsCourses = courses.filter(c => c.category === 'skills');
  const improvementCourses = courses.filter(c => c.category === 'improvement');
  const certificationCourses = courses.filter(c => c.category === 'certification' || (c.certificate === 'Yes' || c.certificate === 'Badges'));
  const partnerCourses = courses.filter(c => c.category === 'partner' || c.course_type === 'external');

  // Sub-filters for skills tab
  const filteredSkillsCourses = skillsSubFilter === 'all' 
    ? skillsCourses 
    : skillsCourses.filter(c => c.platform === skillsSubFilter || c.recommended_for === skillsSubFilter);

  // Sub-filters for improvement tab
  const filteredImprovementCourses = improvementSubFilter === 'all'
    ? improvementCourses
    : improvementCourses.filter(c => c.recommended_for === improvementSubFilter);

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

  // Fetch learning path courses count
  const { data: pathCourseCounts = {} } = useQuery({
    queryKey: ['learning-path-courses-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_path_courses')
        .select('path_id, course_id');
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach((item: any) => {
        counts[item.path_id] = (counts[item.path_id] || 0) + 1;
      });
      return counts;
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
          status: 'completed',
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
      setSelectedCourse(course);
    } else {
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
    await purchaseMutation.mutateAsync(course);
    setPurchasingCourseId(null);
  };

  // Render course card
  const renderCourseCard = (course: Course, index: number) => {
    const courseProgress = getCourseProgress(course.id);
    const hasAccess = checkAccess(course.id, course.price);
    const isFree = course.price === 0;
    const categoryInfo = categoryColors[course.category || 'general'] || categoryColors.general;

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
            
            {/* Category badge */}
            <div className="absolute top-3 left-8">
              <Badge className={`${categoryInfo.bg} ${categoryInfo.text} border-0 text-xs`}>
                {course.category === 'skills' ? 'Skills' : 
                 course.category === 'improvement' ? 'Improvement' :
                 course.category === 'certification' ? 'Certificare' :
                 course.category === 'partner' ? 'Partner' : 'General'}
              </Badge>
            </div>
            
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
              {t.learningHub?.subtitle || 'Cursuri de Skills, Dezvoltare Personală și Certificări'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-2 py-1.5 px-3">
              <Trophy className="h-4 w-4 text-amber-500" />
              {completedCourses} {t.learningHub?.coursesCompleted || 'cursuri completate'}
            </Badge>
            {isAdmin && (
              <Button onClick={() => { setEditingCourse(null); setShowCourseDialog(true); }} className="gap-2">
                <Plus className="h-4 w-4" /> Adaugă Curs
              </Button>
            )}
          </div>
        </div>

        {/* AI Course Recommendations */}
        <CourseRecommendations />

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

        <Tabs defaultValue="skills" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="skills" className="gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Cursuri Skills</span>
              <span className="sm:hidden">Skills</span>
              <Badge variant="secondary" className="ml-1 text-xs">{skillsCourses.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="improvement" className="gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Improvement</span>
              <span className="sm:hidden">Growth</span>
              <Badge variant="secondary" className="ml-1 text-xs">{improvementCourses.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="certifications" className="gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Certificări</span>
              <span className="sm:hidden">Cert.</span>
              <Badge className="ml-1 text-xs bg-green-500/20 text-green-500 border-0">{certificationCourses.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pro-courses" className="gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Cursuri Pro</span>
              <span className="sm:hidden">Pro</span>
              <Badge className="ml-1 text-xs bg-amber-500/20 text-amber-500 border-0">{partnerCourses.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-500" />
                  Cursuri de Skills
                </h2>
                <p className="text-sm text-muted-foreground">
                  Dezvoltă abilități practice: copywriting, design, programare, marketing
                </p>
              </div>
            </div>

            {/* Sub-filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground mr-2">Filtrează:</span>
              {[
                { value: 'all', label: 'Toate' },
                { value: 'marketing', label: 'Marketing' },
                { value: 'tech', label: 'Tech' },
                { value: 'design', label: 'Design' },
                { value: 'business', label: 'Business' },
              ].map((cat) => (
                <Button
                  key={cat.value}
                  variant={skillsSubFilter === cat.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSkillsSubFilter(cat.value)}
                  className="h-8"
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Courses Grid */}
            {isLoadingCourses ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-80 animate-pulse bg-muted/50" />
                ))}
              </div>
            ) : filteredSkillsCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSkillsCourses.map((course, index) => renderCourseCard(course, index))}
              </div>
            ) : (
              <Card className="bg-muted/30">
                <CardContent className="py-8 text-center">
                  <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Nu există cursuri de skills încă</h3>
                  <p className="text-sm text-muted-foreground">
                    Cursurile de skills vor fi adăugate în curând.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Improvement Tab */}
          <TabsContent value="improvement" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Cursuri de Dezvoltare Personală
                </h2>
                <p className="text-sm text-muted-foreground">
                  Productivitate, mindset, leadership, comunicare și dezvoltare personală
                </p>
              </div>
            </div>

            {/* Sub-filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground mr-2">Filtrează:</span>
              {[
                { value: 'all', label: 'Toate' },
                { value: 'productivity', label: 'Productivitate' },
                { value: 'mindset', label: 'Mindset' },
                { value: 'leadership', label: 'Leadership' },
                { value: 'communication', label: 'Comunicare' },
              ].map((cat) => (
                <Button
                  key={cat.value}
                  variant={improvementSubFilter === cat.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setImprovementSubFilter(cat.value)}
                  className="h-8"
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Courses Grid */}
            {isLoadingCourses ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-80 animate-pulse bg-muted/50" />
                ))}
              </div>
            ) : filteredImprovementCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredImprovementCourses.map((course, index) => renderCourseCard(course, index))}
              </div>
            ) : (
              <Card className="bg-muted/30">
                <CardContent className="py-8 text-center">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Nu există cursuri de improvement încă</h3>
                  <p className="text-sm text-muted-foreground">
                    Cursurile de dezvoltare personală vor fi adăugate în curând.
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

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="space-y-6">
            {/* Partnership Info */}
            <Card className="bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-background border-green-500/20">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <GraduationCap className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Certificări Gratuite și Premium</h3>
                    <p className="text-sm text-muted-foreground">
                      Obține certificări recunoscute de la Google, Microsoft, HubSpot și alții
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Internal Courses with Certificates */}
            {certificationCourses.filter(c => c.course_type !== 'external').length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-500" />
                  Cursuri cu Certificare Internă
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificationCourses
                    .filter(c => c.course_type !== 'external')
                    .map((course, index) => renderCourseCard(course, index))}
                </div>
              </div>
            )}

            {/* External Courses with Certificates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Cursuri cu Certificări de la Parteneri
                <Badge variant="secondary">{certificationCourses.filter(c => c.course_type === 'external').length}</Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificationCourses
                  .filter(c => c.course_type === 'external')
                  .map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-md transition-shadow hover:border-green-500/30">
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center shrink-0">
                                <GraduationCap className="h-6 w-6 text-green-500" />
                              </div>
                              <div>
                                <h3 className="font-medium mb-1">{course.title}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-foreground">{course.provider}</span>
                                  <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-0 text-xs">
                                    {course.certificate === 'Badges' ? 'Badges' : 'Certificat'}
                                  </Badge>
                                  {course.level && (
                                    <Badge variant="outline" className="text-xs">
                                      {course.level}
                                    </Badge>
                                  )}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" asChild>
                              <a href={course.external_url || '#'} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </div>

            {/* Legacy Certifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Alte Certificări Recomandate
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

          {/* Pro Courses Tab */}
          <TabsContent value="pro-courses" className="space-y-6">
            {/* Partnership Banner */}
            <PartnershipBanner />

            {/* Header with PRO Badge */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold">Cursuri Pro</h2>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    {plan === 'pro' || plan === 'founder' ? 'Acces Complet' : 'PRO'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  În parteneriat cu Google, Microsoft, AWS, Harvard și alți provideri de top
                </p>
              </div>
              {plan !== 'pro' && plan !== 'founder' && (
                <Button 
                  className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  onClick={() => navigate('/pricing')}
                >
                  <Crown className="h-4 w-4" />
                  Upgrade la Pro
                </Button>
              )}
            </div>

            {/* Learning Paths */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Trasee de Învățare
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {learningPaths.map((path, index) => (
                  <LearningPathCard 
                    key={path.id} 
                    path={{
                      ...path,
                      coursesCount: pathCourseCounts[path.id] || 0,
                    }} 
                    index={index} 
                  />
                ))}
              </div>
            </div>

            {/* External Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partnerCourses.map((course, index) => (
                <ExternalCourseCard 
                  key={course.id} 
                  course={{
                    ...course,
                    tags: Array.isArray(course.tags) ? course.tags : [],
                  } as any} 
                  index={index} 
                />
              ))}
            </div>

            {partnerCourses.length === 0 && (
              <Card className="bg-muted/30">
                <CardContent className="py-8 text-center">
                  <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Nu există cursuri Pro încă</h3>
                  <p className="text-sm text-muted-foreground">
                    Cursurile de la parteneri vor fi adăugate în curând.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Upgrade CTA for non-Pro users */}
            {plan !== 'pro' && plan !== 'founder' && (
              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
                <CardContent className="py-8 text-center">
                  <Globe className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Deblochează Toate Cursurile Pro</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Obține acces la 20+ cursuri de la Google, Microsoft, AWS, Harvard și alți provideri de top cu abonamentul Pro.
                  </p>
                  <Button 
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    onClick={() => navigate('/pricing')}
                  >
                    <Rocket className="h-5 w-5" />
                    Upgrade la Pro
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            )}
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
        
        <LessonManagerDialog
          open={showLessonManager}
          onOpenChange={setShowLessonManager}
          course={lessonManagerCourse}
        />
      </div>
    </MainLayout>
  );
}
