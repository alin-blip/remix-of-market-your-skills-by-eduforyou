import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
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
  GraduationCap
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  platform: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  lessons: number;
  completed?: number;
  thumbnail?: string;
  externalUrl?: string;
  free: boolean;
}

const courses: Course[] = [
  {
    id: '1',
    title: 'Cum să obții primul client pe Fiverr',
    description: 'Ghid complet pentru a-ți crea un profil care vinde și a obține primele recenzii.',
    platform: 'fiverr',
    duration: '45 min',
    level: 'beginner',
    lessons: 6,
    completed: 3,
    free: true,
  },
  {
    id: '2',
    title: 'Upwork Proposal Masterclass',
    description: 'Învață să scrii propuneri care câștigă proiecte, chiar și fără experiență.',
    platform: 'upwork',
    duration: '1h 20min',
    level: 'beginner',
    lessons: 8,
    free: true,
  },
  {
    id: '3',
    title: 'Pricing Strategy for Freelancers',
    description: 'Cum să-ți stabilești prețurile și să negociezi cu clienții.',
    platform: 'general',
    duration: '55 min',
    level: 'intermediate',
    lessons: 5,
    free: true,
  },
  {
    id: '4',
    title: 'Building a Portfolio from Scratch',
    description: 'Creează un portofoliu impresionant chiar dacă nu ai încă clienți.',
    platform: 'general',
    duration: '40 min',
    level: 'beginner',
    lessons: 4,
    free: true,
  },
  {
    id: '5',
    title: 'Client Communication Mastery',
    description: 'Templates și tehnici pentru comunicare profesională cu clienții.',
    platform: 'general',
    duration: '1h 10min',
    level: 'intermediate',
    lessons: 7,
    free: false,
  },
  {
    id: '6',
    title: 'Advanced Fiverr SEO',
    description: 'Optimizează-ți gig-urile pentru a apărea în topul căutărilor.',
    platform: 'fiverr',
    duration: '35 min',
    level: 'advanced',
    lessons: 4,
    free: false,
  },
];

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

export default function LearningHub() {
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
              Tutoriale, ghiduri și certificări pentru freelanceri
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-2 py-1.5 px-3">
              <Trophy className="h-4 w-4 text-amber-500" />
              3 cursuri completate
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
                  Ai completat 3 din 6 cursuri disponibile
                </p>
                <div className="flex items-center gap-4">
                  <Progress value={50} className="flex-1 h-2" />
                  <span className="text-sm font-medium">50%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="courses" className="gap-2">
              <Play className="h-4 w-4" />
              Cursuri
            </TabsTrigger>
            <TabsTrigger value="certifications" className="gap-2">
              <Trophy className="h-4 w-4" />
              Certificări
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                    {/* Thumbnail placeholder */}
                    <div className="h-32 bg-gradient-to-br from-muted to-muted/50 relative">
                      <div className={`absolute top-3 left-3 w-2 h-2 rounded-full ${platformColors[course.platform]}`} />
                      {!course.free && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="gap-1 bg-amber-500/20 text-amber-500 border-amber-500/30">
                            <Lock className="h-3 w-3" />
                            Pro
                          </Badge>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                          <Play className="h-5 w-5 text-foreground" />
                        </div>
                      </div>
                    </div>

                    <CardContent className="flex-1 flex flex-col p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`${levelColors[course.level].bg} ${levelColors[course.level].text} border-0 text-xs`}>
                          {course.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.duration}
                        </span>
                      </div>

                      <h3 className="font-semibold mb-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 flex-1">
                        {course.description}
                      </p>

                      {course.completed !== undefined ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {course.completed}/{course.lessons} lecții
                            </span>
                            <span className="font-medium">
                              {Math.round((course.completed / course.lessons) * 100)}%
                            </span>
                          </div>
                          <Progress value={(course.completed / course.lessons) * 100} className="h-1.5" />
                        </div>
                      ) : (
                        <Button variant="secondary" className="w-full gap-2">
                          <Play className="h-4 w-4" />
                          Începe cursul
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
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
      </div>
    </MainLayout>
  );
}
