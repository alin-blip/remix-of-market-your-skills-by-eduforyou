import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Music2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  RefreshCw,
  Save,
  User
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

type Platform = 'facebook' | 'instagram' | 'linkedin' | 'tiktok';

interface SocialProfile {
  id?: string;
  platform: Platform;
  bio: string;
  headline: string;
  about: string;
  hashtags: string[];
  content_pillars: string[];
  cta: string;
  username_suggestions: string[];
}

interface Offer {
  smv: string;
  target_market: string;
  starter_package: any;
  standard_package: any;
  premium_package: any;
}

interface IkigaiData {
  what_you_love: string[];
  what_youre_good_at: string[];
  what_world_needs: string[];
  what_you_can_be_paid_for: string[];
  ikigai_statements: string[];
  service_angles: string[];
}

const platformConfig = {
  facebook: {
    icon: Facebook,
    name: 'Facebook',
    color: 'bg-blue-600',
    description: 'Pagină de business sau profil profesional',
    fields: ['bio', 'about', 'cta']
  },
  instagram: {
    icon: Instagram,
    name: 'Instagram',
    color: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
    description: 'Bio optimizat pentru conversii',
    fields: ['bio', 'hashtags', 'content_pillars', 'cta']
  },
  linkedin: {
    icon: Linkedin,
    name: 'LinkedIn',
    color: 'bg-blue-700',
    description: 'Profil profesional complet',
    fields: ['headline', 'about', 'cta']
  },
  tiktok: {
    icon: Music2,
    name: 'TikTok',
    color: 'bg-black',
    description: 'Bio scurt și catchy',
    fields: ['bio', 'hashtags', 'content_pillars', 'cta']
  }
};

export default function ProfileBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [step, setStep] = useState<'loading' | 'ready' | 'generating' | 'results'>('loading');
  const [offer, setOffer] = useState<Offer | null>(null);
  const [ikigaiData, setIkigaiData] = useState<IkigaiData | null>(null);
  const [profiles, setProfiles] = useState<Record<Platform, SocialProfile | null>>({
    facebook: null,
    instagram: null,
    linkedin: null,
    tiktok: null
  });
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [generatingPlatform, setGeneratingPlatform] = useState<Platform | null>(null);
  const [progress, setProgress] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load offer
      const { data: offerData } = await supabase
        .from('offers')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      // Load ikigai data
      const { data: ikigaiResult } = await supabase
        .from('ikigai_results')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      // Load existing profiles
      const { data: existingProfiles } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('user_id', user?.id);

      if (offerData) {
        setOffer(offerData as Offer);
      }

      if (ikigaiResult) {
        setIkigaiData({
          what_you_love: Array.isArray(ikigaiResult.what_you_love) ? ikigaiResult.what_you_love as string[] : [],
          what_youre_good_at: Array.isArray(ikigaiResult.what_youre_good_at) ? ikigaiResult.what_youre_good_at as string[] : [],
          what_world_needs: Array.isArray(ikigaiResult.what_world_needs) ? ikigaiResult.what_world_needs as string[] : [],
          what_you_can_be_paid_for: Array.isArray(ikigaiResult.what_you_can_be_paid_for) ? ikigaiResult.what_you_can_be_paid_for as string[] : [],
          ikigai_statements: Array.isArray(ikigaiResult.ikigai_statements) ? ikigaiResult.ikigai_statements as string[] : [],
          service_angles: Array.isArray(ikigaiResult.service_angles) ? ikigaiResult.service_angles as string[] : []
        });
      }

      if (existingProfiles && existingProfiles.length > 0) {
        const profilesMap: Record<Platform, SocialProfile | null> = {
          facebook: null,
          instagram: null,
          linkedin: null,
          tiktok: null
        };
        
        existingProfiles.forEach((p) => {
          const platform = p.platform as Platform;
          profilesMap[platform] = {
            id: p.id,
            platform,
            bio: p.bio || '',
            headline: p.headline || '',
            about: p.about || '',
            hashtags: Array.isArray(p.hashtags) ? p.hashtags as string[] : [],
            content_pillars: Array.isArray(p.content_pillars) ? p.content_pillars as string[] : [],
            cta: p.cta || '',
            username_suggestions: Array.isArray(p.username_suggestions) ? p.username_suggestions as string[] : []
          };
        });
        
        setProfiles(profilesMap);
      }

      setStep('ready');
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut încărca datele necesare.",
        variant: "destructive"
      });
      setStep('ready');
    }
  };

  const handleGenerate = async (platform: Platform) => {
    if (!offer || !ikigaiData) {
      toast({
        title: "Date incomplete",
        description: "Trebuie să completezi Offer Builder și Ikigai Builder mai întâi.",
        variant: "destructive"
      });
      return;
    }

    setGeneratingPlatform(platform);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 15, 90));
    }, 500);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('locale, full_name')
        .eq('id', user?.id)
        .single();

      const { data, error } = await supabase.functions.invoke('profile-builder', {
        body: {
          offer,
          ikigaiResult: ikigaiData,
          platform,
          locale: profile?.locale || 'ro',
          userName: profile?.full_name || ''
        }
      });

      clearInterval(progressInterval);

      if (error) throw error;

      setProgress(100);
      
      const generatedProfile: SocialProfile = {
        platform,
        bio: data.bio || '',
        headline: data.headline || '',
        about: data.about || '',
        hashtags: data.hashtags || [],
        content_pillars: data.content_pillars || [],
        cta: data.cta || '',
        username_suggestions: data.username_suggestions || []
      };

      setProfiles(prev => ({
        ...prev,
        [platform]: generatedProfile
      }));

      setTimeout(() => {
        setGeneratingPlatform(null);
        setSelectedPlatform(platform);
        setStep('results');
      }, 500);

    } catch (error: any) {
      clearInterval(progressInterval);
      console.error('Generation error:', error);
      toast({
        title: "Eroare la generare",
        description: error.message || "A apărut o eroare la generarea profilului.",
        variant: "destructive"
      });
      setGeneratingPlatform(null);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast({
      title: "Copiat!",
      description: "Textul a fost copiat în clipboard."
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const profilesToSave = Object.values(profiles).filter(p => p !== null) as SocialProfile[];
      
      for (const profile of profilesToSave) {
        const { error } = await supabase
          .from('social_profiles')
          .upsert({
            user_id: user?.id,
            platform: profile.platform,
            bio: profile.bio,
            headline: profile.headline,
            about: profile.about,
            hashtags: profile.hashtags,
            content_pillars: profile.content_pillars,
            cta: profile.cta,
            username_suggestions: profile.username_suggestions
          }, {
            onConflict: 'user_id,platform'
          });

        if (error) throw error;
      }

      toast({
        title: "Salvat cu succes!",
        description: "Profilurile tale au fost salvate."
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Eroare la salvare",
        description: error.message || "A apărut o eroare la salvarea profilurilor.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasAnyProfile = Object.values(profiles).some(p => p !== null);
  const completedPlatforms = Object.values(profiles).filter(p => p !== null).length;

  const renderProfileContent = (profile: SocialProfile) => {
    const config = platformConfig[profile.platform];

    return (
      <div className="space-y-6">
        {profile.headline && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-muted-foreground">Headline</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(profile.headline, `${profile.platform}-headline`)}
              >
                {copiedId === `${profile.platform}-headline` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-foreground bg-muted/50 p-3 rounded-lg">{profile.headline}</p>
          </div>
        )}

        {profile.bio && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-muted-foreground">Bio</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(profile.bio, `${profile.platform}-bio`)}
              >
                {copiedId === `${profile.platform}-bio` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-foreground bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {profile.about && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-muted-foreground">Despre / About</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(profile.about, `${profile.platform}-about`)}
              >
                {copiedId === `${profile.platform}-about` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-foreground bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">{profile.about}</p>
          </div>
        )}

        {profile.cta && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-muted-foreground">Call to Action</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(profile.cta, `${profile.platform}-cta`)}
              >
                {copiedId === `${profile.platform}-cta` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-foreground bg-muted/50 p-3 rounded-lg">{profile.cta}</p>
          </div>
        )}

        {profile.hashtags && profile.hashtags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-muted-foreground">Hashtag-uri Recomandate</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(profile.hashtags.join(' '), `${profile.platform}-hashtags`)}
              >
                {copiedId === `${profile.platform}-hashtags` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.hashtags.map((tag, idx) => (
                <Badge key={idx} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {profile.content_pillars && profile.content_pillars.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Piloni de Conținut</h4>
            <div className="grid gap-2">
              {profile.content_pillars.map((pillar, idx) => (
                <div key={idx} className="bg-muted/50 p-3 rounded-lg flex items-start gap-2">
                  <span className="text-primary font-medium">{idx + 1}.</span>
                  <span>{pillar}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {profile.username_suggestions && profile.username_suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Sugestii Username</h4>
            <div className="flex flex-wrap gap-2">
              {profile.username_suggestions.map((username, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleCopy(username, `${profile.platform}-username-${idx}`)}
                >
                  @{username}
                  {copiedId === `${profile.platform}-username-${idx}` && <Check className="h-3 w-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (step === 'loading') {
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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl font-bold">Profile Builder</h1>
          </div>
          <p className="text-muted-foreground">
            Generează profiluri optimizate pentru fiecare platformă de social media
          </p>
        </div>

        {/* Progress */}
        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Profiluri completate</span>
              <span className="font-medium">{completedPlatforms}/4</span>
            </div>
            <Progress value={(completedPlatforms / 4) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* Platform Selection */}
        {step === 'ready' && !generatingPlatform && (
          <div className="grid md:grid-cols-2 gap-4">
            {(Object.keys(platformConfig) as Platform[]).map((platform) => {
              const config = platformConfig[platform];
              const Icon = config.icon;
              const hasProfile = profiles[platform] !== null;

              return (
                <motion.div
                  key={platform}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-lg ${hasProfile ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => hasProfile ? (setSelectedPlatform(platform), setStep('results')) : handleGenerate(platform)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${config.color} text-white`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{config.name}</h3>
                            {hasProfile && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                <Check className="h-3 w-3 mr-1" />
                                Generat
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
                        </div>
                        <Button variant={hasProfile ? "outline" : "default"} size="sm">
                          {hasProfile ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Regenerează
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-1" />
                              Generează
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Generating State */}
        {generatingPlatform && (
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center space-y-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                <Sparkles className="h-12 w-12 text-primary" />
              </motion.div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Generez profilul {platformConfig[generatingPlatform].name}...</h3>
                <p className="text-sm text-muted-foreground">
                  Analizez oferta și Ikigai-ul tău pentru a crea conținut personalizat
                </p>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {step === 'results' && hasAnyProfile && !generatingPlatform && (
          <Card>
            <CardHeader>
              <CardTitle>Profilurile Tale</CardTitle>
              <CardDescription>Vizualizează și copiază conținutul pentru fiecare platformă</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedPlatform || 'facebook'} onValueChange={(v) => setSelectedPlatform(v as Platform)}>
                <TabsList className="grid w-full grid-cols-4">
                  {(Object.keys(platformConfig) as Platform[]).map((platform) => {
                    const config = platformConfig[platform];
                    const Icon = config.icon;
                    const hasProfile = profiles[platform] !== null;

                    return (
                      <TabsTrigger 
                        key={platform} 
                        value={platform}
                        disabled={!hasProfile}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{config.name}</span>
                        {hasProfile && <Check className="h-3 w-3 text-primary" />}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {(Object.keys(platformConfig) as Platform[]).map((platform) => (
                  <TabsContent key={platform} value={platform} className="mt-6">
                    {profiles[platform] ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${platformConfig[platform].color} text-white`}>
                              {(() => {
                                const Icon = platformConfig[platform].icon;
                                return <Icon className="h-5 w-5" />;
                              })()}
                            </div>
                            <div>
                              <h3 className="font-semibold">{platformConfig[platform].name}</h3>
                              <p className="text-sm text-muted-foreground">{platformConfig[platform].description}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleGenerate(platform)}>
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Regenerează
                          </Button>
                        </div>
                        {renderProfileContent(profiles[platform]!)}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">Profilul pentru {platformConfig[platform].name} nu a fost încă generat.</p>
                        <Button onClick={() => handleGenerate(platform)}>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generează acum
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => navigate('/wizard/offer')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi la Offer Builder
          </Button>

          <div className="flex gap-3">
            {hasAnyProfile && (
              <>
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvează
                </Button>
                <Button onClick={() => navigate('/wizard/outreach')}>
                  Continuă la Outreach
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
