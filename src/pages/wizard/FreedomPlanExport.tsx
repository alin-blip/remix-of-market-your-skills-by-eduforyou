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
  Download,
  FileText,
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
import { PdfHealthCheck } from '@/components/pdf/PdfHealthCheck';
import { generateFreedomPlanDocx } from '@/components/pdf/FreedomPlanDocx';

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

  const safeText = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (typeof val === 'object') {
      const anyVal = val as any;
      if (typeof anyVal.statement === 'string') return anyVal.statement;
      if (typeof anyVal.title === 'string') return anyVal.title;
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    }
    return String(val);
  };

  const safeTextArray = (val: unknown): string[] => {
    if (!Array.isArray(val)) return [];
    return val
      .map((v) => safeText(v).trim())
      .filter(Boolean);
  };

  const formatIkigaiStatements = (val: unknown): string[] => {
    if (!Array.isArray(val)) return [];
    return val
      .map((v) => {
        if (typeof v === 'string') return v;
        if (v && typeof v === 'object') {
          const anyV = v as any;
          const stmt = safeText(anyV.statement || v);
          const expl = typeof anyV.explanation === 'string' ? anyV.explanation : '';
          return expl ? `${stmt} — ${expl}` : stmt;
        }
        return safeText(v);
      })
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const formatServiceAngles = (val: unknown): string[] => {
    if (!Array.isArray(val)) return [];
    return val
      .map((v) => {
        if (typeof v === 'string') return v;
        if (v && typeof v === 'object') {
          const anyV = v as any;
          const title = safeText(anyV.title);
          const desc = safeText(anyV.description);
          const aud = safeText(anyV.target_audience);
          const uv = safeText(anyV.unique_value);

          const core = [title, desc].filter(Boolean).join(': ');
          const meta = [
            aud ? `Audiență: ${aud}` : '',
            uv ? `Valoare unică: ${uv}` : '',
          ]
            .filter(Boolean)
            .join(' • ');

          return meta ? `${core} (${meta})` : core;
        }
        return safeText(v);
      })
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const sanitizePackage = (pkg: any) => {
    if (!pkg || typeof pkg !== 'object') return pkg;
    return {
      ...pkg,
      name: safeText(pkg.name),
      tagline: safeText(pkg.tagline),
      currency: safeText(pkg.currency),
      delivery_time: safeText(pkg.delivery_time),
      ideal_for: safeText(pkg.ideal_for),
      deliverables: safeTextArray(pkg.deliverables),
    };
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const userId = user?.id;
      if (!userId) return;

      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // Load skills
      const { data: skills } = await supabase
        .from('skill_entries')
        .select('*')
        .eq('user_id', userId);

      // Load ikigai
      const { data: ikigai } = await supabase
        .from('ikigai_results')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Load offer
      const { data: offer } = await supabase
        .from('offers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Load social profiles
      const { data: socialProfiles } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('user_id', userId);

      // Load outreach templates
      const { data: outreachTemplates } = await supabase
        .from('outreach_templates')
        .select('*')
        .eq('user_id', userId);

      setModuleStatuses((prev) => {
        const updated = [...prev];

        updated[0] = {
          ...updated[0],
          completed: !!(skills && skills.length > 0),
          data: skills || [],
        };

        updated[1] = {
          ...updated[1],
          completed: !!ikigai,
          data: ikigai,
        };

        updated[2] = {
          ...updated[2],
          completed: !!offer,
          data: offer,
        };

        updated[3] = {
          ...updated[3],
          completed: !!(socialProfiles && socialProfiles.length > 0),
          data: socialProfiles || [],
        };

        updated[4] = {
          ...updated[4],
          completed: !!(outreachTemplates && outreachTemplates.length > 0),
          data: outreachTemplates || [],
        };

        return updated;
      });

      const freedomPlanData: FreedomPlanData = {
        profile: {
          fullName: safeText(profile?.full_name) || 'Freelancer',
          email: safeText(profile?.email),
          studyField: safeText(profile?.study_field),
          goals: safeTextArray(profile?.goals),
          values: safeTextArray(profile?.values),
          interests: safeTextArray(profile?.interests),
        },
        skills: (skills || []).map((s: any) => ({
          skill: safeText(s.skill),
          category: safeText(s.category),
          confidence: typeof s.confidence === 'number' ? s.confidence : 0,
          description: safeText(s.description) || undefined,
        })),
        ikigai: ikigai
          ? {
              whatYouLove: safeTextArray(ikigai.what_you_love),
              whatYoureGoodAt: safeTextArray(ikigai.what_youre_good_at),
              whatWorldNeeds: safeTextArray(ikigai.what_world_needs),
              whatYouCanBePaidFor: safeTextArray(ikigai.what_you_can_be_paid_for),
              ikigaiStatements: formatIkigaiStatements(ikigai.ikigai_statements),
              serviceAngles: formatServiceAngles(ikigai.service_angles),
            }
          : null,
        offer: offer
          ? {
              smv: safeText(offer.smv),
              targetMarket: safeText(offer.target_market),
              starterPackage: sanitizePackage(offer.starter_package),
              standardPackage: sanitizePackage(offer.standard_package),
              premiumPackage: sanitizePackage(offer.premium_package),
              pricingJustification: safeText(offer.pricing_justification),
            }
          : null,
        socialProfiles: (socialProfiles || []).map((sp: any) => ({
          platform: safeText(sp.platform),
          bio: safeText(sp.bio),
          headline: safeText(sp.headline),
          about: safeText(sp.about),
          hashtags: safeTextArray(sp.hashtags),
          contentPillars: safeTextArray(sp.content_pillars),
          cta: safeText(sp.cta),
        })),
        outreachTemplates: (outreachTemplates || []).map((ot: any) => ({
          platform: safeText(ot.platform),
          type: safeText(ot.template_type),
          subject: safeText(ot.subject),
          content: safeText(ot.content),
        })),
        generatedAt: new Date().toLocaleDateString('ro-RO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      };

      setPlanData(freedomPlanData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut încărca datele.',
        variant: 'destructive',
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

        {/* Health Check */}
        <PdfHealthCheck data={planData} />

        {/* Export Section */}
        <Card className={!allCompleted ? 'opacity-60' : ''}>
          <CardHeader>
            <CardTitle>Exportă Freedom Plan</CardTitle>
            <CardDescription>
              {allCompleted
                ? 'Descarcă documentul în formatul preferat.'
                : 'Completează toate modulele pentru a putea exporta planul.'}
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
                  <div className="flex flex-wrap gap-3 justify-center">
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
                              Descarcă PDF
                            </>
                          )}
                        </Button>
                      )}
                    </PDFDownloadLink>

                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2"
                      onClick={() => generateFreedomPlanDocx(planData)}
                    >
                      <FileText className="h-5 w-5" />
                      Descarcă DOCX
                    </Button>
                  </div>
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
