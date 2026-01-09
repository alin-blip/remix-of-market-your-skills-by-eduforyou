import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  ArrowRight, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Star,
  Clock,
  Users,
  Zap,
  Crown,
  Target,
  TrendingUp
} from 'lucide-react';

interface PackageData {
  name: string;
  tagline: string;
  price: number;
  currency: string;
  delivery_time: string;
  deliverables: string[];
  ideal_for: string;
  popular?: boolean;
  includes_support?: boolean;
}

interface OfferResult {
  smv: string;
  target_market: string;
  pricing_justification: string;
  starter_package: PackageData;
  standard_package: PackageData;
  premium_package: PackageData;
}

interface Skill {
  id: string;
  skill: string;
  category: string;
  confidence: number;
}

interface IkigaiData {
  service_angles: { title: string; description: string }[];
  core_positioning: string;
  what_you_can_be_paid_for: string[];
}

export default function OfferBuilder() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'loading' | 'ready' | 'generating' | 'results'>('loading');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [ikigaiData, setIkigaiData] = useState<IkigaiData | null>(null);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [result, setResult] = useState<OfferResult | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<'starter' | 'standard' | 'premium'>('standard');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    // Load skills and ikigai in parallel
    const [skillsResponse, ikigaiResponse] = await Promise.all([
      supabase.from('skill_entries').select('*').eq('user_id', user.id),
      supabase.from('ikigai_results').select('*').eq('user_id', user.id).maybeSingle()
    ]);

    if (skillsResponse.error) {
      console.error('Error loading skills:', skillsResponse.error);
    }

    if (ikigaiResponse.error) {
      console.error('Error loading ikigai:', ikigaiResponse.error);
    }

    const loadedSkills = skillsResponse.data || [];
    setSkills(loadedSkills);

    if (ikigaiResponse.data) {
      setIkigaiData({
        service_angles: (ikigaiResponse.data.service_angles as any) || [],
        core_positioning: (ikigaiResponse.data.ikigai_statements as any)?.[0]?.statement || '',
        what_you_can_be_paid_for: (ikigaiResponse.data.what_you_can_be_paid_for as any) || []
      });
    }

    // Check if we have enough data
    if (loadedSkills.length > 0 && ikigaiResponse.data) {
      setStep('ready');
    } else {
      setStep('loading');
    }
  };

  const handleGenerate = async () => {
    if (skills.length === 0) {
      toast.error('Trebuie să ai competențe scanate înainte');
      navigate('/wizard/skill-scanner');
      return;
    }

    if (!ikigaiData) {
      toast.error('Trebuie să ai Ikigai-ul generat înainte');
      navigate('/wizard/ikigai');
      return;
    }

    setStep('generating');
    setGenerateProgress(0);

    const progressInterval = setInterval(() => {
      setGenerateProgress(prev => Math.min(prev + Math.random() * 10, 90));
    }, 500);

    try {
      // Get the user's session token for authenticated requests
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/offer-builder`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            skills,
            ikigaiResult: ikigaiData,
            studyField: profile?.study_field || '',
            locale: profile?.locale || 'ro',
          }),
        }
      );

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eroare la generare');
      }

      const data: OfferResult = await response.json();
      setGenerateProgress(100);
      
      setTimeout(() => {
        setResult(data);
        setStep('results');
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Generate error:', error);
      toast.error(error instanceof Error ? error.message : 'Eroare la generare');
      setStep('ready');
    }
  };

  const handleSave = async () => {
    if (!result || !user) return;

    try {
      // Check if user already has an offer
      const { data: existing } = await supabase
        .from('offers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('offers')
          .update({
            smv: result.smv,
            target_market: result.target_market,
            pricing_justification: result.pricing_justification,
            starter_package: result.starter_package as unknown as null,
            standard_package: result.standard_package as unknown as null,
            premium_package: result.premium_package as unknown as null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('offers')
          .insert([{
            user_id: user.id,
            smv: result.smv,
            target_market: result.target_market,
            pricing_justification: result.pricing_justification,
            starter_package: result.starter_package as unknown as null,
            standard_package: result.standard_package as unknown as null,
            premium_package: result.premium_package as unknown as null,
          }]);

        if (error) throw error;
      }

      // Update freedom score
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ freedom_score: 60 })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success('Oferta salvată cu succes!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Eroare la salvare');
    }
  };

  const packageConfig = [
    { key: 'starter', icon: Zap, label: 'Starter', color: 'from-blue-500 to-cyan-500' },
    { key: 'standard', icon: Star, label: 'Standard', color: 'from-primary to-accent', popular: true },
    { key: 'premium', icon: Crown, label: 'Premium', color: 'from-amber-500 to-orange-500' },
  ];

  const getPackageData = (key: string): PackageData | null => {
    if (!result) return null;
    switch (key) {
      case 'starter': return result.starter_package;
      case 'standard': return result.standard_package;
      case 'premium': return result.premium_package;
      default: return null;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Loading/Missing Data State */}
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/20 mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Date lipsă
              </h1>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Trebuie să completezi Skill Scanner și Ikigai Builder înainte de a crea oferta ta.
              </p>
              <div className="flex gap-3 justify-center">
                {skills.length === 0 && (
                  <Button 
                    onClick={() => navigate('/wizard/skill-scanner')}
                    className="gap-2"
                    variant="outline"
                  >
                    <Sparkles className="w-5 h-5" />
                    Skill Scanner
                  </Button>
                )}
                {skills.length > 0 && !ikigaiData && (
                  <Button 
                    onClick={() => navigate('/wizard/ikigai')}
                    className="gap-2 bg-gradient-to-r from-primary to-accent"
                  >
                    <Target className="w-5 h-5" />
                    Ikigai Builder
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Ready State */}
          {step === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-4">
                  <Package className="w-8 h-8 text-accent" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Offer Builder AI
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  Generează pachete de servicii cu prețuri strategice bazate pe competențele și Ikigai-ul tău
                </p>
              </div>

              {/* Data Preview */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="glass border-white/10 p-5">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Competențe ({skills.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.slice(0, 6).map(skill => (
                      <Badge 
                        key={skill.id} 
                        variant="outline"
                        className="border-primary/30 text-primary"
                      >
                        {skill.skill}
                      </Badge>
                    ))}
                    {skills.length > 6 && (
                      <Badge variant="secondary">+{skills.length - 6} more</Badge>
                    )}
                  </div>
                </Card>

                <Card className="glass border-white/10 p-5">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent" />
                    Poziționare Ikigai
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {ikigaiData?.core_positioning || 'Poziționare generată'}
                  </p>
                </Card>
              </div>

              {/* What we'll generate */}
              <Card className="glass border-primary/20 p-6 bg-gradient-to-r from-primary/5 to-accent/5">
                <h3 className="font-semibold text-foreground mb-3">Ce vei primi</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { icon: Package, label: '3 Pachete de servicii', desc: 'Starter, Standard, Premium' },
                    { icon: TrendingUp, label: 'Prețuri strategice', desc: 'Adaptate pentru piața ta' },
                    { icon: Users, label: 'Piață țintă', desc: 'Client ideal identificat' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex justify-center">
                <Button 
                  onClick={handleGenerate}
                  className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  size="lg"
                >
                  <Package className="w-5 h-5" />
                  Generează Oferta mea
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Generating State */}
          {step === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 mb-6 animate-pulse">
                <Loader2 className="w-10 h-10 text-accent animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Construiesc oferta ta...
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                AI-ul analizează competențele și Ikigai-ul pentru a crea pachete de servicii personalizate.
              </p>
              <div className="max-w-md mx-auto">
                <Progress value={generateProgress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">{Math.round(generateProgress)}%</p>
              </div>
            </motion.div>
          )}

          {/* Results State */}
          {step === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-accent" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Oferta ta
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {result.smv}
                </p>
              </div>

              {/* Target Market & Justification */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="glass border-white/10 p-5">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Piața țintă
                  </h3>
                  <p className="text-sm text-muted-foreground">{result.target_market}</p>
                </Card>
                <Card className="glass border-white/10 p-5">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    Justificare prețuri
                  </h3>
                  <p className="text-sm text-muted-foreground">{result.pricing_justification}</p>
                </Card>
              </div>

              {/* Package Cards */}
              <div className="grid gap-6 md:grid-cols-3">
                {packageConfig.map((pkg, index) => {
                  const data = getPackageData(pkg.key);
                  if (!data) return null;

                  const isSelected = selectedPackage === pkg.key;
                  const isPopular = pkg.popular;

                  return (
                    <motion.div
                      key={pkg.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedPackage(pkg.key as any)}
                      className="cursor-pointer"
                    >
                      <Card className={`relative glass border-2 p-6 h-full transition-all hover-lift ${
                        isSelected 
                          ? 'border-primary shadow-lg shadow-primary/20' 
                          : 'border-white/10 hover:border-white/20'
                      }`}>
                        {isPopular && (
                          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent">
                            Popular
                          </Badge>
                        )}

                        <div className="text-center mb-4">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${pkg.color} mb-3`}>
                            <pkg.icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-bold text-xl text-foreground">{data.name}</h3>
                          <p className="text-sm text-muted-foreground">{data.tagline}</p>
                        </div>

                        <div className="text-center mb-4">
                          <span className="text-4xl font-bold text-foreground">{data.price}</span>
                          <span className="text-muted-foreground ml-1">{data.currency}</span>
                        </div>

                        <div className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {data.delivery_time}
                        </div>

                        <ul className="space-y-2 mb-4">
                          {data.deliverables.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="pt-4 border-t border-white/10">
                          <p className="text-xs text-muted-foreground">
                            <span className="text-foreground font-medium">Ideal pentru:</span>{' '}
                            {data.ideal_for}
                          </p>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline"
                  onClick={handleGenerate}
                  className="gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Regenerează
                </Button>
                <Button 
                  onClick={handleSave}
                  className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Salvează Oferta
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
