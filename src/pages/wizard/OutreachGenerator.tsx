import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/lib/i18n';
import { useFeatureGating } from '@/hooks/useFeatureGating';
import { UpgradeModal } from '@/components/upgrade/UpgradeModal';
import { OutputLanguageSelect } from '@/components/shared/OutputLanguageSelect';
import { 
  Linkedin, 
  Mail, 
  MessageCircle, 
  Sparkles, 
  Copy, 
  Check, 
  Clock, 
  Lightbulb,
  ArrowLeft,
  Save,
  RefreshCw,
  Target,
  Zap
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Template {
  name: string;
  type: 'connection' | 'intro' | 'follow_up' | 'value_add';
  subject?: string;
  content: string;
  tips: string[];
  best_time?: string;
}

interface OutreachResult {
  platform: string;
  templates: Template[];
  sequence_suggestion: string;
  response_rate_tips: string[];
}

interface Offer {
  smv: string;
  target_market: string;
  starter_package: any;
}

interface IkigaiData {
  service_angles: { title: string }[];
  core_positioning: string;
}

type Platform = 'linkedin' | 'email' | 'dm';

export default function OutreachGenerator() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { gatingState, checkPlanAccess, closeUpgradeModal } = useFeatureGating();
  
  const [step, setStep] = useState<'loading' | 'ready' | 'generating' | 'results'>('loading');
  const [offer, setOffer] = useState<Offer | null>(null);
  const [ikigaiData, setIkigaiData] = useState<IkigaiData | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('linkedin');
  const [generateProgress, setGenerateProgress] = useState(0);
  const [results, setResults] = useState<Record<Platform, OutreachResult | null>>({
    linkedin: null,
    email: null,
    dm: null
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [outputLang, setOutputLang] = useState(profile?.locale || 'ro');

  // Check feature access on mount - Outreach requires Pro plan
  useEffect(() => {
    checkPlanAccess('pro', 'Outreach Generator', 'Generează mesaje personalizate de outreach pentru LinkedIn, Email și DM.');
  }, []);

  const platformConfig = {
    linkedin: {
      icon: Linkedin,
      name: t.outreachGenerator.platforms.linkedin.name,
      color: 'bg-blue-500',
      description: t.outreachGenerator.platforms.linkedin.description
    },
    email: {
      icon: Mail,
      name: t.outreachGenerator.platforms.email.name,
      color: 'bg-amber-500',
      description: t.outreachGenerator.platforms.email.description
    },
    dm: {
      icon: MessageCircle,
      name: t.outreachGenerator.platforms.dm.name,
      color: 'bg-pink-500',
      description: t.outreachGenerator.platforms.dm.description
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [offerRes, ikigaiRes] = await Promise.all([
        supabase
          .from('offers')
          .select('*')
          .eq('user_id', user!.id)
          .maybeSingle(),
        supabase
          .from('ikigai_results')
          .select('*')
          .eq('user_id', user!.id)
          .maybeSingle()
      ]);

      if (offerRes.data) {
        setOffer({
          smv: offerRes.data.smv || '',
          target_market: offerRes.data.target_market || '',
          starter_package: offerRes.data.starter_package
        });
      }

      if (ikigaiRes.data) {
        setIkigaiData({
          service_angles: (ikigaiRes.data.service_angles as any[]) || [],
          core_positioning: (ikigaiRes.data.ikigai_statements as any)?.[0]?.statement || ''
        });
      }

      setStep(offerRes.data ? 'ready' : 'loading');
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: t.common.error,
        description: t.outreachGenerator.generateError,
        variant: "destructive"
      });
    }
  };

  const handleGenerate = async (platform: Platform) => {
    if (!offer) {
      toast({
        title: t.outreachGenerator.completeOfferFirst,
        description: t.outreachGenerator.completeOfferDescription,
        variant: "destructive"
      });
      navigate('/wizard/offer');
      return;
    }

    setSelectedPlatform(platform);
    setStep('generating');
    setGenerateProgress(0);

    const progressInterval = setInterval(() => {
      setGenerateProgress(prev => Math.min(prev + Math.random() * 15, 90));
    }, 500);

    try {
      const response = await supabase.functions.invoke('outreach-generator', {
        body: {
          offer,
          ikigaiResult: ikigaiData,
          platform,
          locale: outputLang
        }
      });

      clearInterval(progressInterval);

      if (response.error) {
        throw new Error(response.error.message);
      }

      setGenerateProgress(100);
      
      await new Promise(resolve => setTimeout(resolve, 500));

      setResults(prev => ({
        ...prev,
        [platform]: response.data
      }));
      
      setStep('results');
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Generation error:', error);
      toast({
        title: t.common.error,
        description: error instanceof Error ? error.message : t.outreachGenerator.generateError,
        variant: "destructive"
      });
      setStep('ready');
    }
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast({
      title: t.outreachGenerator.copied,
      description: t.outreachGenerator.copiedDescription
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveTemplates = async () => {
    if (!user) return;

    try {
      // Delete existing templates for user
      await supabase
        .from('outreach_templates')
        .delete()
        .eq('user_id', user.id);

      // Insert all templates
      const templatesToInsert: any[] = [];
      
      Object.entries(results).forEach(([platform, result]) => {
        if (result?.templates) {
          result.templates.forEach((template, index) => {
            templatesToInsert.push({
              user_id: user.id,
              platform,
              template_type: template.type,
              subject: template.subject || null,
              content: template.content,
              sequence_order: index + 1
            });
          });
        }
      });

      if (templatesToInsert.length > 0) {
        const { error } = await supabase
          .from('outreach_templates')
          .insert(templatesToInsert);

        if (error) throw error;
      }

      // Update freedom score
      await supabase
        .from('profiles')
        .update({ freedom_score: 80 })
        .eq('id', user.id);

      toast({
        title: t.outreachGenerator.templatesSaved,
        description: t.outreachGenerator.templatesSavedDescription
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: t.common.error,
        description: t.outreachGenerator.saveError,
        variant: "destructive"
      });
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      connection: t.outreachGenerator.templateTypes.connection,
      intro: t.outreachGenerator.templateTypes.intro,
      follow_up: t.outreachGenerator.templateTypes.follow_up,
      value_add: t.outreachGenerator.templateTypes.value_add
    };
    return labels[type] || type;
  };

  if (step === 'loading' && !offer) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Target className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-4">{t.outreachGenerator.createOfferFirst}</h1>
            <p className="text-muted-foreground mb-8">
              {t.outreachGenerator.createOfferDescription}
            </p>
            <Button onClick={() => navigate('/wizard/offer')}>
              {t.outreachGenerator.goToOfferBuilder}
            </Button>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <UpgradeModal 
        open={gatingState.showUpgradeModal} 
        onOpenChange={closeUpgradeModal}
        requiredPlan={gatingState.requiredPlan}
        featureName={gatingState.featureName}
        featureDescription={gatingState.featureDescription}
      />
      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold">{t.outreachGenerator.title}</h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  {t.outreachGenerator.subtitle}
                </p>
                <OutputLanguageSelect value={outputLang} onChange={setOutputLang} className="flex flex-col items-center" />
              </div>

              {/* Offer Preview */}
              {offer && (
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Sparkles className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{t.outreachGenerator.yourValueProposition}</h3>
                        <p className="text-muted-foreground">{offer.smv}</p>
                        <Badge variant="outline" className="mt-2">
                          {t.outreachGenerator.market}: {offer.target_market}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Platform Selection */}
              <div className="grid md:grid-cols-3 gap-4">
                {(Object.keys(platformConfig) as Platform[]).map((platform) => {
                  const config = platformConfig[platform];
                  const Icon = config.icon;
                  const hasResult = results[platform] !== null;
                  
                  return (
                    <Card 
                      key={platform}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        hasResult ? 'ring-2 ring-primary/50' : ''
                      }`}
                      onClick={() => hasResult ? setStep('results') : handleGenerate(platform)}
                    >
                      <CardContent className="pt-6 text-center">
                        <div className={`w-14 h-14 rounded-2xl ${config.color} mx-auto mb-4 flex items-center justify-center`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">{config.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{config.description}</p>
                        <Button 
                          className="w-full" 
                          variant={hasResult ? "outline" : "default"}
                        >
                          {hasResult ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              {t.outreachGenerator.viewTemplates}
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              {t.outreachGenerator.generateButton}
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Show results button if any exist */}
              {Object.values(results).some(r => r !== null) && (
                <div className="text-center">
                  <Button variant="outline" onClick={() => setStep('results')}>
                    {t.outreachGenerator.viewAllTemplates}
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {step === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto py-20 text-center"
            >
              <div className="relative mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 mx-auto"
                >
                  <div className={`w-full h-full rounded-2xl ${platformConfig[selectedPlatform].color} flex items-center justify-center`}>
                    {(() => {
                      const Icon = platformConfig[selectedPlatform].icon;
                      return <Icon className="w-10 h-10 text-white" />;
                    })()}
                  </div>
                </motion.div>
              </div>

              <h2 className="text-xl font-bold mb-2">
                {t.outreachGenerator.generating.replace('{platform}', platformConfig[selectedPlatform].name)}
              </h2>
              <p className="text-muted-foreground mb-8">
                {t.outreachGenerator.creatingMessages}
              </p>

              <Progress value={generateProgress} className="mb-4" />
              <p className="text-sm text-muted-foreground">
                {generateProgress < 30 && t.outreachGenerator.analyzing}
                {generateProgress >= 30 && generateProgress < 60 && t.outreachGenerator.creatingPersuasive}
                {generateProgress >= 60 && generateProgress < 90 && t.outreachGenerator.optimizing}
                {generateProgress >= 90 && t.outreachGenerator.finalizing}
              </p>
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Back Button */}
              <Button 
                variant="ghost" 
                onClick={() => setStep('ready')}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.outreachGenerator.backToPlatforms}
              </Button>

              {/* Tabs for platforms */}
              <Tabs 
                defaultValue={selectedPlatform} 
                onValueChange={(v) => setSelectedPlatform(v as Platform)}
              >
                <TabsList className="grid w-full grid-cols-3">
                  {(Object.keys(platformConfig) as Platform[]).map((platform) => {
                    const config = platformConfig[platform];
                    const Icon = config.icon;
                    const hasResult = results[platform] !== null;
                    
                    return (
                      <TabsTrigger 
                        key={platform} 
                        value={platform}
                        disabled={!hasResult}
                        className="gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        {config.name}
                        {hasResult && <Check className="w-3 h-3 text-green-500" />}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {(Object.keys(platformConfig) as Platform[]).map((platform) => {
                  const result = results[platform];
                  if (!result) return null;
                  
                  return (
                    <TabsContent key={platform} value={platform} className="space-y-6 mt-6">
                      {/* Sequence Suggestion */}
                      <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <h4 className="font-medium mb-1">{t.outreachGenerator.recommendedSequence}</h4>
                              <p className="text-sm text-muted-foreground">
                                {result.sequence_suggestion}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Templates */}
                      <div className="space-y-4">
                        {result.templates.map((template, index) => (
                          <Card key={index}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Badge variant="secondary">
                                    {getTypeLabel(template.type)}
                                  </Badge>
                                  <CardTitle className="text-lg">{template.name}</CardTitle>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCopy(
                                    template.subject 
                                      ? `Subject: ${template.subject}\n\n${template.content}`
                                      : template.content,
                                    `${platform}-${index}`
                                  )}
                                >
                                  {copiedId === `${platform}-${index}` ? (
                                    <>
                                      <Check className="w-4 h-4 mr-1" />
                                      {t.outreachGenerator.copied}
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-4 h-4 mr-1" />
                                      {t.common.save}
                                    </>
                                  )}
                                </Button>
                              </div>
                              {template.best_time && (
                                <CardDescription className="flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />
                                  {template.best_time}
                                </CardDescription>
                              )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {template.subject && (
                                <div className="p-3 bg-muted rounded-lg">
                                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Subject</span>
                                  <p className="font-medium">{template.subject}</p>
                                </div>
                              )}
                              
                              <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap font-mono text-sm">
                                {template.content}
                              </div>

                              {template.tips.length > 0 && (
                                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                                  <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                  <div className="text-sm">
                                    <span className="font-medium text-amber-800 dark:text-amber-200">{t.outreachGenerator.responseRateTips}:</span>
                                    <ul className="mt-1 space-y-1 text-amber-700 dark:text-amber-300">
                                      {template.tips.map((tip, i) => (
                                        <li key={i}>• {tip}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Response Rate Tips */}
                      {result.response_rate_tips?.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Target className="w-5 h-5 text-primary" />
                              {t.outreachGenerator.responseRateTips}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {result.response_rate_tips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {/* Generate more for this platform */}
                      <div className="text-center">
                        <Button 
                          variant="outline" 
                          onClick={() => handleGenerate(platform)}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          {t.outreachGenerator.regenerate} {platformConfig[platform].name}
                        </Button>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>

              {/* Save All Button */}
              <div className="flex justify-center gap-4 pt-6 border-t">
                <Button variant="outline" onClick={() => setStep('ready')}>
                  {t.outreachGenerator.backToPlatforms}
                </Button>
                <Button onClick={handleSaveTemplates}>
                  <Save className="w-4 h-4 mr-2" />
                  {t.outreachGenerator.saveTemplates}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
