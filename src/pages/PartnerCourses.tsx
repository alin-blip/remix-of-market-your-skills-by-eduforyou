import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  ExternalLink, 
  Award, 
  Clock, 
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Star
} from "lucide-react";
import { motion } from "framer-motion";

interface PartnerInfo {
  id: string;
  name: string;
  fullName: string;
  description: string;
  logo: string;
  color: string;
  bgGradient: string;
  website: string;
}

const partners: Record<string, PartnerInfo> = {
  google: {
    id: 'google',
    name: 'Google',
    fullName: 'Google Digital Academy',
    description: 'Cursuri și certificări gratuite de la Google în marketing digital, analytics, machine learning și cloud computing.',
    logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
    color: '#4285F4',
    bgGradient: 'from-blue-500/20 via-red-500/10 to-yellow-500/20',
    website: 'https://grow.google'
  },
  microsoft: {
    id: 'microsoft',
    name: 'Microsoft',
    fullName: 'Microsoft Learn',
    description: 'Platformă de învățare gratuită cu certificări în Azure, AI, dezvoltare software și productivitate.',
    logo: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31',
    color: '#00A4EF',
    bgGradient: 'from-blue-600/20 via-green-500/10 to-yellow-500/20',
    website: 'https://learn.microsoft.com'
  },
  aws: {
    id: 'aws',
    name: 'AWS',
    fullName: 'Amazon Web Services Training',
    description: 'Training gratuit în cloud computing, arhitectură AWS, machine learning și securitate.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/1024px-Amazon_Web_Services_Logo.svg.png',
    color: '#FF9900',
    bgGradient: 'from-orange-500/20 via-yellow-500/10 to-orange-600/20',
    website: 'https://aws.training'
  },
  hubspot: {
    id: 'hubspot',
    name: 'HubSpot',
    fullName: 'HubSpot Academy',
    description: 'Certificări gratuite în inbound marketing, sales, customer service și CRM.',
    logo: 'https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png',
    color: '#FF7A59',
    bgGradient: 'from-orange-500/20 via-red-500/10 to-pink-500/20',
    website: 'https://academy.hubspot.com'
  },
  harvard: {
    id: 'harvard',
    name: 'Harvard',
    fullName: 'Harvard University Online',
    description: 'Cursuri gratuite de la una dintre cele mai prestigioase universități din lume.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Harvard_University_coat_of_arms.svg/1200px-Harvard_University_coat_of_arms.svg.png',
    color: '#A51C30',
    bgGradient: 'from-red-800/20 via-red-600/10 to-red-900/20',
    website: 'https://online-learning.harvard.edu'
  },
  freecodecamp: {
    id: 'freecodecamp',
    name: 'freeCodeCamp',
    fullName: 'freeCodeCamp',
    description: 'Platformă open-source cu certificări gratuite în web development, data science și machine learning.',
    logo: 'https://design-style-guide.freecodecamp.org/downloads/fcc_primary_small.svg',
    color: '#0A0A23',
    bgGradient: 'from-slate-800/20 via-slate-600/10 to-slate-900/20',
    website: 'https://www.freecodecamp.org'
  },
  coursera: {
    id: 'coursera',
    name: 'Coursera',
    fullName: 'Coursera',
    description: 'Parteneriate cu universități de top pentru cursuri și specializări în diverse domenii.',
    logo: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera_assets.s3.amazonaws.com/images/5d78ba3c21a50e71f0fc1c4a7c2de8a7.png',
    color: '#0056D2',
    bgGradient: 'from-blue-600/20 via-blue-400/10 to-blue-700/20',
    website: 'https://www.coursera.org'
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    fullName: 'OpenAI Developer Platform',
    description: 'Resurse și documentație pentru dezvoltarea aplicațiilor cu inteligență artificială.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/1024px-OpenAI_Logo.svg.png',
    color: '#412991',
    bgGradient: 'from-purple-600/20 via-pink-500/10 to-purple-700/20',
    website: 'https://platform.openai.com'
  },
  deeplearning: {
    id: 'deeplearning',
    name: 'DeepLearning.AI',
    fullName: 'DeepLearning.AI',
    description: 'Cursuri de specialitate în deep learning și AI de la Andrew Ng.',
    logo: 'https://assets-global.website-files.com/6203daf47137054c031fa0e6/63e4c9a9e0f1b13671d9a96c_dlai-logo.png',
    color: '#F05A28',
    bgGradient: 'from-orange-500/20 via-red-500/10 to-orange-600/20',
    website: 'https://www.deeplearning.ai'
  },
  fastai: {
    id: 'fastai',
    name: 'fast.ai',
    fullName: 'fast.ai',
    description: 'Cursuri practice gratuite în deep learning pentru programatori.',
    logo: 'https://www.fast.ai/images/fast_ai_logo.png',
    color: '#00B4D8',
    bgGradient: 'from-cyan-500/20 via-blue-500/10 to-cyan-600/20',
    website: 'https://www.fast.ai'
  },
  github: {
    id: 'github',
    name: 'GitHub',
    fullName: 'GitHub Learning Lab',
    description: 'Învață Git, GitHub și dezvoltare colaborativă prin proiecte practice.',
    logo: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    color: '#24292F',
    bgGradient: 'from-slate-700/20 via-slate-500/10 to-slate-800/20',
    website: 'https://lab.github.com'
  },
  tryhackme: {
    id: 'tryhackme',
    name: 'TryHackMe',
    fullName: 'TryHackMe',
    description: 'Platformă de învățare în cybersecurity cu laboratoare practice.',
    logo: 'https://tryhackme.com/img/THMlogo.png',
    color: '#212C42',
    bgGradient: 'from-slate-800/20 via-red-500/10 to-slate-900/20',
    website: 'https://tryhackme.com'
  },
  hackthebox: {
    id: 'hackthebox',
    name: 'Hack The Box',
    fullName: 'Hack The Box Academy',
    description: 'Training avansat în penetration testing și cybersecurity.',
    logo: 'https://www.hackthebox.com/images/htb-logo.svg',
    color: '#9FEF00',
    bgGradient: 'from-green-500/20 via-lime-500/10 to-green-600/20',
    website: 'https://www.hackthebox.com'
  },
  tensorflow: {
    id: 'tensorflow',
    name: 'TensorFlow',
    fullName: 'TensorFlow Tutorials',
    description: 'Tutoriale oficiale pentru machine learning cu TensorFlow.',
    logo: 'https://www.tensorflow.org/images/tf_logo_social.png',
    color: '#FF6F00',
    bgGradient: 'from-orange-500/20 via-yellow-500/10 to-orange-600/20',
    website: 'https://www.tensorflow.org/tutorials'
  },
  codecademy: {
    id: 'codecademy',
    name: 'Codecademy',
    fullName: 'Codecademy',
    description: 'Cursuri interactive de programare pentru începători și avansați.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Codecademy.svg',
    color: '#1F4056',
    bgGradient: 'from-slate-700/20 via-blue-500/10 to-slate-800/20',
    website: 'https://www.codecademy.com'
  },
  mdn: {
    id: 'mdn',
    name: 'MDN',
    fullName: 'MDN Web Docs',
    description: 'Documentație și tutoriale pentru dezvoltare web de la Mozilla.',
    logo: 'https://developer.mozilla.org/mdn-social-share.png',
    color: '#83D0F2',
    bgGradient: 'from-cyan-500/20 via-blue-500/10 to-cyan-600/20',
    website: 'https://developer.mozilla.org'
  }
};

// Map provider names to partner IDs
const providerToPartnerId: Record<string, string> = {
  'Google': 'google',
  'Google Cloud': 'google',
  'Microsoft': 'microsoft',
  'AWS': 'aws',
  'HubSpot': 'hubspot',
  'Harvard': 'harvard',
  'freeCodeCamp': 'freecodecamp',
  'Coursera': 'coursera',
  'OpenAI': 'openai',
  'DeepLearning.AI': 'deeplearning',
  'fast.ai': 'fastai',
  'GitHub': 'github',
  'TryHackMe': 'tryhackme',
  'Hack The Box': 'hackthebox',
  'TensorFlow': 'tensorflow',
  'Codecademy': 'codecademy',
  'MDN': 'mdn'
};

const formatDuration = (minutes: number | null) => {
  if (!minutes) return null;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  }
  return `${minutes}min`;
};

export default function PartnerCourses() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  
  const partner = partnerId ? partners[partnerId] : null;

  const { data: courses, isLoading } = useQuery({
    queryKey: ['partner-courses', partnerId],
    queryFn: async () => {
      // Find all provider names that map to this partner
      const providerNames = Object.entries(providerToPartnerId)
        .filter(([_, id]) => id === partnerId)
        .map(([name]) => name);

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .eq('course_type', 'external')
        .in('provider', providerNames);

      if (error) throw error;
      return data || [];
    },
    enabled: !!partnerId && !!partner
  });

  if (!partner) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Partener negăsit</h1>
          <Button onClick={() => navigate('/learning-hub')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi la Learning Hub
          </Button>
        </div>
      </MainLayout>
    );
  }

  const coursesWithCerts = courses?.filter(c => c.certificate === 'Yes' || c.certificate === 'Badges') || [];
  const coursesWithoutCerts = courses?.filter(c => c.certificate !== 'Yes' && c.certificate !== 'Badges') || [];

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/learning-hub')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Înapoi la Learning Hub
        </Button>

        {/* Partner Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative rounded-2xl bg-gradient-to-r ${partner.bgGradient} border p-8 overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <img 
              src={partner.logo} 
              alt={partner.name}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div 
              className="w-20 h-20 rounded-xl bg-background/80 backdrop-blur flex items-center justify-center p-3 shadow-lg"
              style={{ borderColor: partner.color, borderWidth: 2 }}
            >
              <img 
                src={partner.logo} 
                alt={partner.name}
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                Certificări {partner.name}
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                {partner.description}
              </p>
            </div>

            <Button 
              variant="outline" 
              className="shrink-0"
              onClick={() => window.open(partner.website, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Vizitează {partner.name}
            </Button>
          </div>

          {/* Stats */}
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-background/60 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: partner.color }}>
                {courses?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Cursuri Disponibile</div>
            </div>
            <div className="bg-background/60 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: partner.color }}>
                {coursesWithCerts.length}
              </div>
              <div className="text-sm text-muted-foreground">Cu Certificări</div>
            </div>
            <div className="bg-background/60 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-500">
                100%
              </div>
              <div className="text-sm text-muted-foreground">Gratuite</div>
            </div>
            <div className="bg-background/60 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-amber-500">
                <Star className="w-6 h-6 inline" />
              </div>
              <div className="text-sm text-muted-foreground">Partener Oficial</div>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : courses?.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Niciun curs disponibil</h3>
              <p className="text-muted-foreground">
                Cursurile de la {partner.name} vor fi adăugate în curând.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Courses with Certifications */}
            {coursesWithCerts.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${partner.color}20` }}
                  >
                    <Award className="w-5 h-5" style={{ color: partner.color }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Cursuri cu Certificări</h2>
                    <p className="text-muted-foreground">
                      Obține certificări oficiale recunoscute în industrie
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coursesWithCerts.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-all duration-300 group overflow-hidden">
                        <div 
                          className="h-2"
                          style={{ backgroundColor: partner.color }}
                        />
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <Badge 
                              variant="secondary"
                              className="bg-green-500/10 text-green-600 border-green-500/20"
                            >
                              <Award className="w-3 h-3 mr-1" />
                              {course.certificate === 'Badges' ? 'Badges' : 'Certificat'}
                            </Badge>
                            {course.duration_minutes && (
                              <Badge variant="outline" className="shrink-0">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDuration(course.duration_minutes)}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                            {course.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-3">
                            {course.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="outline" className="text-xs">
                              {course.level}
                            </Badge>
                            {course.language && (
                              <Badge variant="outline" className="text-xs">
                                {course.language}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>Certificare gratuită inclusă</span>
                          </div>

                          <Button 
                            className="w-full"
                            onClick={() => course.external_url && window.open(course.external_url, '_blank')}
                          >
                            <GraduationCap className="w-4 h-4 mr-2" />
                            Începe Cursul
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Other Courses */}
            {coursesWithoutCerts.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${partner.color}20` }}
                  >
                    <BookOpen className="w-5 h-5" style={{ color: partner.color }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Alte Cursuri</h2>
                    <p className="text-muted-foreground">
                      Resurse și tutoriale gratuite
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coursesWithoutCerts.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-all duration-300 group">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <Badge variant="outline">
                              {course.level}
                            </Badge>
                            {course.duration_minutes && (
                              <Badge variant="outline" className="shrink-0">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDuration(course.duration_minutes)}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                            {course.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-3">
                            {course.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <Button 
                            variant="outline"
                            className="w-full"
                            onClick={() => course.external_url && window.open(course.external_url, '_blank')}
                          >
                            Accesează Cursul
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
