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
import { useI18n } from '@/lib/i18n';
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
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { OutputLanguageSelect } from '@/components/shared/OutputLanguageSelect';

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
  const { t } = useI18n();
  
  const [step, setStep] = useState<'loading' | 'missing-data' | 'ready' | 'generating' | 'results'>('loading');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [ikigaiData, setIkigaiData] = useState<IkigaiData | null>(null);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [result, setResult] = useState<OfferResult | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<'starter' | 'standard' | 'premium'>('standard');
  const [hasSavedResult, setHasSavedResult] = useState(false);
  const [outputLang, setOutputLang] = useState(profile?.locale || 'ro');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    const [skillsResponse, ikigaiResponse, offerResponse] = await Promise.all([
      supabase.from('skill_entries').select('*').eq('user_id', user.id),
      supabase.from('ikigai_results').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('offers').select('*').eq('user_id', user.id).maybeSingle()
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

    if (offerResponse.data) {
      const savedOffer: OfferResult = {
        smv: offerResponse.data.smv || '',
        target_market: offerResponse.data.target_market || '',
        pricing_justification: offerResponse.data.pricing_justification || '',
        starter_package: (offerResponse.data.starter_package as unknown as PackageData) || {} as PackageData,
        standard_package: (offerResponse.data.standard_package as unknown as PackageData) || {} as PackageData,
        premium_package: (offerResponse.data.premium_package as unknown as PackageData) || {} as PackageData,
      };
      setResult(savedOffer);
      setHasSavedResult(true);
      setStep('results');
    } else if (loadedSkills.length > 0 && ikigaiResponse.data) {
      setStep('ready');
    } else {
      setStep('missing-data');
    }
  };

  const handleGenerate = async () => {
    if (skills.length === 0) {
      toast.error(t.offerBuilder.needSkillsFirst);
      navigate('/wizard/skill-scanner');
      return;
    }

    if (!ikigaiData) {
      toast.error(t.offerBuilder.needIkigaiFirst);
      navigate('/wizard/ikigai');
      return;
    }

    setStep('generating');
    setGenerateProgress(0);

    const progressInterval = setInterval(() => {
      setGenerateProgress(prev => Math.min(prev + Math.random() * 10, 90));
    }, 500);

    try {
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
            locale: outputLang,
          }),
        }
      );

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t.offerBuilder.generateError);
      }

      const data: OfferResult = await response.json();
      setGenerateProgress(100);
      
      setTimeout(() => {
        setResult(data);
        setHasSavedResult(false);
        setStep('results');
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Generate error:', error);
      toast.error(error instanceof Error ? error.message : t.offerBuilder.generateError);
      setStep('ready');
    }
  };

  const handleSave = async () => {
    if (!result || !user) return;

    try {
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

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ freedom_score: 60 })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success(t.offerBuilder.offerSaved);
      setHasSavedResult(true);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t.offerBuilder.saveError);
    }
  };

  const packageConfig = [
    { key: 'starter', icon: Zap, label: t.offerBuilder.starter, color: 'from-blue-500 to-cyan-500' },
    { key: 'standard', icon: Star, label: t.offerBuilder.standard, color: 'from-primary to-accent', popular: true },
    { key: 'premium', icon: Crown, label: t.offerBuilder.premium, color: 'from-amber-500 to-orange-500' },
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
          {/* Loading State */}
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
              <p className="text-muted-foreground mt-4">{t.common.loading}</p>
            </motion.div>
          )}

          {/* Missing Data State */}
          {step === 'missing-data' && (
            <motion.div
              key="missing-data"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/20 mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {t.offerBuilder.missingDataTitle}
              </h1>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t.offerBuilder.missingDataDescription}
              </p>
              <div className="flex gap-3 justify-center">
                {skills.length === 0 && (
                  <Button 
                    onClick={() => navigate('/wizard/skill-scanner')}
                    className="gap-2"
                    variant="outline"
                  >
                    <Sparkles className="w-5 h-5" />
                    {t.wizard.skillScanner}
                  </Button>
                )}
                {skills.length > 0 && !ikigaiData && (
                  <Button 
                    onClick={() => navigate('/wizard/ikigai')}
                    className="gap-2 bg-gradient-to-r from-primary to-accent"
                  >
                    <Target className="w-5 h-5" />
                    {t.wizard.ikigaiBuilder}
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
                  {t.offerBuilder.title}
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  {t.offerBuilder.subtitle}
                </p>
              </div>

              {/* Data Preview */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="glass border-white/10 p-5">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    {t.offerBuilder.skills} ({skills.length})
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
                      <Badge variant="secondary">{t.offerBuilder.more.replace('{count}', String(skills.length - 6))}</Badge>
                    )}
                  </div>
                </Card>

                <Card className="glass border-white/10 p-5">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent" />
                    {t.offerBuilder.ikigaiPosition}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {ikigaiData?.core_positioning || t.offerBuilder.positionGenerated}
                  </p>
                </Card>
              </div>

              {/* What we'll generate */}
              <Card className="glass border-primary/20 p-6 bg-gradient-to-r from-primary/5 to-accent/5">
                <h3 className="font-semibold text-foreground mb-3">{t.offerBuilder.whatYouGet}</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { icon: Package, label: t.offerBuilder.servicePackages, desc: t.offerBuilder.servicePackagesDesc },
                    { icon: TrendingUp, label: t.offerBuilder.strategicPricing, desc: t.offerBuilder.strategicPricingDesc },
                    { icon: Users, label: t.offerBuilder.targetMarketTitle, desc: t.offerBuilder.targetMarketDesc },
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
                  {t.offerBuilder.generateButton}
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
                {t.offerBuilder.generating}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {t.offerBuilder.generatingDescription}
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
                  {hasSavedResult ? t.offerBuilder.resultsSavedTitle : t.offerBuilder.resultsTitle}
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {result.smv}
                </p>
                
                {/* Regenerate Button */}
                <Button
                  onClick={() => {
                    setResult(null);
                    setHasSavedResult(false);
                    setStep('ready');
                  }}
                  variant="outline"
                  className="mt-4 gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t.offerBuilder.regenerate || 'Generează ofertă nouă'}
                </Button>
              </div>

              {/* Target Market & Justification */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="glass border-white/10 p-5">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    {t.offerBuilder.targetMarket}
                  </h3>
                  <p className="text-sm text-muted-foreground">{result.target_market}</p>
                </Card>
                <Card className="glass border-white/10 p-5">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    {t.offerBuilder.pricingJustification}
                  </h3>
                  <p className="text-sm text-muted-foreground">{result.pricing_justification}</p>
                </Card>
              </div>

              {/* Package Cards */}
              <div className="grid gap-6 md:grid-cols-3">
                {packageConfig.map((config, index) => {
                  const pkg = getPackageData(config.key);
                  if (!pkg) return null;
                  
                  const isSelected = selectedPackage === config.key;
                  
                  return (
                    <motion.div
                      key={config.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className={`glass relative overflow-hidden cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary/50 ring-2 ring-primary/20'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                        onClick={() => setSelectedPackage(config.key as any)}
                      >
                        {config.popular && (
                          <div className="absolute top-0 right-0">
                            <Badge className="rounded-none rounded-bl-lg bg-primary">
                              {t.offerBuilder.popular}
                            </Badge>
                          </div>
                        )}
                        
                        <div className="p-6">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center mb-4`}>
                            <config.icon className="w-6 h-6 text-white" />
                          </div>
                          
                          <h3 className="text-xl font-bold text-foreground mb-1">{pkg.name || config.label}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{pkg.tagline}</p>
                          
                          <div className="mb-6">
                            <span className="text-3xl font-bold text-foreground">{pkg.currency || '£'}{pkg.price}</span>
                          </div>
                          
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{t.offerBuilder.deliveryTime}: {pkg.delivery_time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="w-4 h-4" />
                              <span>{t.offerBuilder.idealFor}: {pkg.ideal_for}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">{t.offerBuilder.deliverables}:</p>
                            <ul className="space-y-1">
                              {pkg.deliverables?.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      setStep('ready');
                      setHasSavedResult(false);
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />
                    {t.offerBuilder.regenerate}
                  </Button>
                  {!hasSavedResult && (
                    <Button
                      variant="outline"
                      onClick={handleSave}
                      className="gap-2"
                    >
                      {t.offerBuilder.saveButton}
                    </Button>
                  )}
                </div>
                <Button
                  onClick={() => navigate('/wizard/profile')}
                  className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  size="lg"
                >
                  {t.offerBuilder.continueToProfile}
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
