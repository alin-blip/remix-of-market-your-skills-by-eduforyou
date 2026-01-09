import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileDown, 
  Loader2, 
  Check, 
  Sparkles,
  Target,
  Package,
  User,
  MessageSquare,
  AlertCircle,
  ArrowLeft,
  Download
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { FreedomPlanPDF, type FreedomPlanData } from '@/components/pdf/FreedomPlanPDF';

interface ModuleStatus {
  name: string;
  icon: React.ElementType;
  completed: boolean;
  route: string;
  data: any;
}

export default function FreedomPlanExport() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [planData, setPlanData] = useState<FreedomPlanData | null>(null);
  const [moduleStatuses, setModuleStatuses] = useState<ModuleStatus[]>([
    { name: 'Skill Scanner', icon: Sparkles, completed: false, route: '/wizard/skill-scanner', data: null },
    { name: 'Ikigai Builder', icon: Target, completed: false, route: '/wizard/ikigai', data: null },
    { name: 'Offer Builder', icon: Package, completed: false, route: '/wizard/offer', data: null },
    { name: 'Profile Builder', icon: User, completed: false, route: '/wizard/profile', data: null },
    { name: 'Outreach Generator', icon: MessageSquare, completed: false, route: '/wizard/outreach', data: null },
  ]);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      // Load skills
      const { data: skills } = await supabase
        .from('skill_entries')
        .select('*')
        .eq('user_id', user?.id);

      // Load ikigai
      const { data: ikigai } = await supabase
        .from('ikigai_results')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      // Load offer
      const { data: offer } = await supabase
        .from('offers')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      // Load social profiles
      const { data: socialProfiles } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('user_id', user?.id);

      // Load outreach templates
      const { data: outreachTemplates } = await supabase
        .from('outreach_templates')
        .select('*')
        .eq('user_id', user?.id);

      // Update module statuses
      const updatedStatuses = [...moduleStatuses];
      
      updatedStatuses[0].completed = skills && skills.length > 0;
      updatedStatuses[0].data = skills || [];
      
      updatedStatuses[1].completed = !!ikigai;
      updatedStatuses[1].data = ikigai;
      
      updatedStatuses[2].completed = !!offer;
      updatedStatuses[2].data = offer;
      
      updatedStatuses[3].completed = socialProfiles && socialProfiles.length > 0;
      updatedStatuses[3].data = socialProfiles || [];
      
      updatedStatuses[4].completed = outreachTemplates && outreachTemplates.length > 0;
      updatedStatuses[4].data = outreachTemplates || [];

      setModuleStatuses(updatedStatuses);

      // Prepare plan data
      const freedomPlanData: FreedomPlanData = {
        profile: {
          fullName: profile?.full_name || 'Freelancer',
          email: profile?.email || '',
          studyField: profile?.study_field || '',
          goals: Array.isArray(profile?.goals) ? profile.goals as string[] : [],
          values: Array.isArray(profile?.values) ? profile.values as string[] : [],
          interests: Array.isArray(profile?.interests) ? profile.interests as string[] : [],
        },
        skills: (skills || []).map((s: any) => ({
          skill: s.skill,
          category: s.category,
          confidence: s.confidence,
          description: s.description,
        })),
        ikigai: ikigai ? {
          whatYouLove: Array.isArray(ikigai.what_you_love) ? ikigai.what_you_love as string[] : [],
          whatYoureGoodAt: Array.isArray(ikigai.what_youre_good_at) ? ikigai.what_youre_good_at as string[] : [],
          whatWorldNeeds: Array.isArray(ikigai.what_world_needs) ? ikigai.what_world_needs as string[] : [],
          whatYouCanBePaidFor: Array.isArray(ikigai.what_you_can_be_paid_for) ? ikigai.what_you_can_be_paid_for as string[] : [],
          ikigaiStatements: Array.isArray(ikigai.ikigai_statements) ? ikigai.ikigai_statements as string[] : [],
          serviceAngles: Array.isArray(ikigai.service_angles) ? ikigai.service_angles as string[] : [],
        } : null,
        offer: offer ? {
          smv: offer.smv || '',
          targetMarket: offer.target_market || '',
          starterPackage: offer.starter_package as any,
          standardPackage: offer.standard_package as any,
          premiumPackage: offer.premium_package as any,
          pricingJustification: offer.pricing_justification || '',
        } : null,
        socialProfiles: (socialProfiles || []).map((sp: any) => ({
          platform: sp.platform,
          bio: sp.bio || '',
          headline: sp.headline || '',
          about: sp.about || '',
          hashtags: Array.isArray(sp.hashtags) ? sp.hashtags as string[] : [],
          contentPillars: Array.isArray(sp.content_pillars) ? sp.content_pillars as string[] : [],
          cta: sp.cta || '',
        })),
        outreachTemplates: (outreachTemplates || []).map((ot: any) => ({
          platform: ot.platform,
          type: ot.template_type,
          subject: ot.subject || '',
          content: ot.content,
        })),
        generatedAt: new Date().toLocaleDateString('ro-RO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
      };

      setPlanData(freedomPlanData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut încărca datele.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completedCount = moduleStatuses.filter(m => m.completed).length;
  const allCompleted = completedCount === moduleStatuses.length;
  const progressPercentage = (completedCount / moduleStatuses.length) * 100;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileDown className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl font-bold">Freedom Plan Export</h1>
          </div>
          <p className="text-muted-foreground">
            Exportă planul tău complet de freelancing într-un document PDF profesional
          </p>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Progres General</span>
              <Badge variant={allCompleted ? "default" : "secondary"}>
                {completedCount}/{moduleStatuses.length} module completate
              </Badge>
            </CardTitle>
            <CardDescription>
              {allCompleted 
                ? "Felicitări! Ai completat toate modulele și poți exporta planul tău."
                : "Completează toate modulele pentru a genera planul complet."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-3 mb-6" />
            
            <div className="grid gap-3">
              {moduleStatuses.map((module, index) => (
                <motion.div
                  key={module.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div 
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      module.completed 
                        ? 'bg-primary/5 border-primary/20' 
                        : 'bg-muted/30 border-border hover:bg-muted/50 cursor-pointer'
                    }`}
                    onClick={() => !module.completed && navigate(module.route)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${module.completed ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <module.icon className="h-4 w-4" />
                      </div>
                      <span className={module.completed ? 'font-medium' : 'text-muted-foreground'}>
                        {module.name}
                      </span>
                    </div>
                    {module.completed ? (
                      <Check className="h-5 w-5 text-primary" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card className={!allCompleted ? 'opacity-60' : ''}>
          <CardHeader>
            <CardTitle>Exportă Freedom Plan</CardTitle>
            <CardDescription>
              {allCompleted
                ? "Descarcă documentul PDF cu planul tău complet de freelancing."
                : "Completează toate modulele pentru a putea exporta planul."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center text-center space-y-6 py-6">
              <motion.div
                animate={allCompleted ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className={`p-6 rounded-full ${allCompleted ? 'bg-primary/10' : 'bg-muted'}`}
              >
                <FileDown className={`h-12 w-12 ${allCompleted ? 'text-primary' : 'text-muted-foreground'}`} />
              </motion.div>

              {allCompleted && planData ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Planul tău este gata!</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Documentul include toate informațiile din cele 5 module: competențe, Ikigai, 
                    oferte de servicii, profiluri sociale și template-uri de outreach.
                  </p>
                  <PDFDownloadLink
                    document={<FreedomPlanPDF data={planData} />}
                    fileName={`freedom-plan-${planData.profile.fullName.replace(/\s+/g, '-').toLowerCase()}.pdf`}
                  >
                    {({ loading }) => (
                      <Button size="lg" disabled={loading} className="gap-2">
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Se generează PDF-ul...
                          </>
                        ) : (
                          <>
                            <Download className="h-5 w-5" />
                            Descarcă Freedom Plan (PDF)
                          </>
                        )}
                      </Button>
                    )}
                  </PDFDownloadLink>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-muted-foreground">
                    Mai ai {moduleStatuses.length - completedCount} module de completat
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Apasă pe modulele necompletate de mai sus pentru a le finaliza.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => navigate('/wizard/outreach')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi la Outreach
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Înapoi la Dashboard
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
