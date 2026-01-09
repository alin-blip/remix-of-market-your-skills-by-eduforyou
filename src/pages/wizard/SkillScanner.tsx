import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  Brain, 
  Zap, 
  Star,
  TrendingUp,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  Edit3,
  Trash2
} from 'lucide-react';

interface Skill {
  name: string;
  category: 'technical' | 'soft' | 'hidden';
  confidence: number;
  description: string;
  monetization_potential: 'low' | 'medium' | 'high';
}

interface SavedSkill {
  id: string;
  skill: string;
  category: string;
  confidence: number;
  description: string | null;
}

interface ScanResult {
  skills: Skill[];
  summary: string;
  top_recommendation: string;
}

export default function SkillScanner() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'loading' | 'saved' | 'input' | 'scanning' | 'results'>('loading');
  const [experiences, setExperiences] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [savedSkills, setSavedSkills] = useState<SavedSkill[]>([]);

  useEffect(() => {
    loadSavedSkills();
  }, [user]);

  const loadSavedSkills = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('skill_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading skills:', error);
      setStep('input');
      return;
    }

    if (data && data.length > 0) {
      setSavedSkills(data);
      setStep('saved');
    } else {
      setStep('input');
    }
  };

  const handleScan = async () => {
    if (!experiences.trim()) {
      toast.error('Adaugă cel puțin o experiență sau proiect');
      return;
    }

    setStep('scanning');
    setScanProgress(0);

    // Simulate progress while waiting for AI
    const progressInterval = setInterval(() => {
      setScanProgress(prev => Math.min(prev + Math.random() * 15, 90));
    }, 500);

    try {
      // Get the user's session token for authenticated requests
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/skill-scanner`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            experiences,
            interests: profile?.interests || [],
            studyField: profile?.study_field || '',
          }),
        }
      );

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eroare la scanare');
      }

      const data: ScanResult = await response.json();
      setScanProgress(100);
      
      setTimeout(() => {
        setResult(data);
        setSelectedSkills(data.skills.map(s => s.name));
        setStep('results');
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Scan error:', error);
      toast.error(error instanceof Error ? error.message : 'Eroare la scanare');
      setStep('input');
    }
  };

  const toggleSkill = (skillName: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillName) 
        ? prev.filter(s => s !== skillName)
        : [...prev, skillName]
    );
  };

  const handleSave = async () => {
    if (!result || !user) return;

    const skillsToSave = result.skills.filter(s => selectedSkills.includes(s.name));
    
    try {
      // Save skills to database
      const { error: skillsError } = await supabase
        .from('skill_entries')
        .insert(
          skillsToSave.map(skill => ({
            user_id: user.id,
            skill: skill.name,
            category: skill.category,
            confidence: skill.confidence,
            description: skill.description,
          }))
        );

      if (skillsError) throw skillsError;

      // Update freedom score
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ freedom_score: 20 })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success('Competențele au fost salvate!');
      // Reload saved skills instead of navigating away
      await loadSavedSkills();
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMessage = error?.message || error?.details || 'Eroare la salvarea competențelor';
      toast.error(errorMessage);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      const { error } = await supabase
        .from('skill_entries')
        .delete()
        .eq('id', skillId);

      if (error) throw error;

      toast.success('Competența a fost ștearsă');
      await loadSavedSkills();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Eroare la ștergere');
    }
  };

  const handleDeleteAll = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('skill_entries')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Toate competențele au fost șterse');
      setSavedSkills([]);
      setStep('input');
    } catch (error) {
      console.error('Delete all error:', error);
      toast.error('Eroare la ștergere');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Zap className="w-4 h-4" />;
      case 'soft': return <Brain className="w-4 h-4" />;
      case 'hidden': return <Lightbulb className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'technical': return 'Tehnică';
      case 'soft': return 'Soft Skill';
      case 'hidden': return 'Potențial ascuns';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-500/20 text-blue-400';
      case 'soft': return 'bg-purple-500/20 text-purple-400';
      case 'hidden': return 'bg-amber-500/20 text-amber-400';
      default: return 'bg-muted';
    }
  };

  const getPotentialColor = (potential: string) => {
    switch (potential) {
      case 'high': return 'bg-accent text-accent-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
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
              <p className="text-muted-foreground mt-4">Se încarcă...</p>
            </motion.div>
          )}

          {/* Saved Skills View */}
          {step === 'saved' && savedSkills.length > 0 && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-accent" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Competențele tale salvate
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  Ai <span className="text-primary font-semibold">{savedSkills.length} competențe</span> în profilul tău. Poți adăuga mai multe sau edita.
                </p>
              </div>

              {/* Saved Skills Grid */}
              <div className="grid gap-3">
                {savedSkills.map((skill, index) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="glass border-white/10 p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(skill.category)}`}>
                          {getCategoryIcon(skill.category)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{skill.skill}</h4>
                            <Badge variant="outline" className="text-xs">
                              {getCategoryLabel(skill.category)}
                            </Badge>
                          </div>
                          {skill.description && (
                            <p className="text-sm text-muted-foreground">{skill.description}</p>
                          )}
                          <div className="flex items-center gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map(level => (
                              <Star
                                key={level}
                                className={`w-3 h-3 ${
                                  level <= skill.confidence ? 'text-primary fill-primary' : 'text-muted'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">
                              Încredere {skill.confidence}/5
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteSkill(skill.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setStep('input')}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Scanează din nou
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={handleDeleteAll}
                  >
                    <Trash2 className="w-4 h-4" />
                    Șterge tot
                  </Button>
                </div>
                <Button
                  onClick={() => navigate('/wizard/ikigai')}
                  className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  size="lg"
                >
                  Continuă la Ikigai
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Input Step */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Skill Scanner AI
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  Descoperă-ți competențele monetizabile folosind inteligența artificială
                </p>
              </div>

              {savedSkills.length > 0 && (
                <Card className="glass border-primary/20 p-4 bg-primary/5">
                  <p className="text-sm text-muted-foreground">
                    Ai deja {savedSkills.length} competențe salvate. Noile competențe vor fi adăugate la cele existente.
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary"
                    onClick={() => setStep('saved')}
                  >
                    Vezi competențele salvate →
                  </Button>
                </Card>
              )}

              <Card className="glass border-white/10 p-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Experiențe, proiecte și realizări
                </label>
                <Textarea
                  value={experiences}
                  onChange={(e) => setExperiences(e.target.value)}
                  placeholder="Descrie experiențele tale:&#10;- Proiecte personale sau de facultate&#10;- Activități extracurriculare&#10;- Joburi, internship-uri&#10;- Hobby-uri și pasiuni&#10;- Orice ai realizat și te mândrești"
                  className="min-h-[200px] bg-background/50 border-white/10 resize-none"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Cu cât oferi mai multe detalii, cu atât analiza va fi mai precisă.
                </p>
              </Card>

              <div className="flex justify-between">
                {savedSkills.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep('saved')}
                  >
                    Înapoi la competențe
                  </Button>
                )}
                <div className={savedSkills.length === 0 ? 'ml-auto' : ''}>
                  <Button 
                    onClick={handleScan}
                    disabled={!experiences.trim()}
                    className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    size="lg"
                  >
                    <Sparkles className="w-5 h-5" />
                    Analizează competențele
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Scanning Step */}
          {step === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6 animate-pulse">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Analizez competențele tale...
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                AI-ul nostru identifică abilități tehnice, soft skills și potențial ascuns din experiențele tale.
              </p>
              <div className="max-w-md mx-auto">
                <Progress value={scanProgress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">{Math.round(scanProgress)}%</p>
              </div>
            </motion.div>
          )}

          {/* Results Step */}
          {step === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-accent" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Scanare completă!
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  Am identificat <span className="text-primary font-semibold">{result.skills.length} competențe</span> din profilul tău.
                </p>
              </div>

              {/* Summary Card */}
              <Card className="glass border-primary/20 p-6 bg-gradient-to-r from-primary/5 to-accent/5">
                <h3 className="font-semibold text-foreground mb-2">Rezumat</h3>
                <p className="text-muted-foreground">{result.summary}</p>
                <div className="mt-4 p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Recomandare principală</p>
                      <p className="text-sm text-muted-foreground">{result.top_recommendation}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Skills Grid */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">
                  Competențe identificate
                </h3>
                <p className="text-sm text-muted-foreground">
                  Selectează competențele pe care vrei să le salvezi în profilul tău.
                </p>
                
                <div className="grid gap-3">
                  {result.skills.map((skill, index) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={`glass p-4 cursor-pointer transition-all ${
                          selectedSkills.includes(skill.name)
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                        onClick={() => toggleSkill(skill.name)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            skill.category === 'technical' ? 'bg-blue-500/20 text-blue-400' :
                            skill.category === 'soft' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {getCategoryIcon(skill.category)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground">{skill.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {getCategoryLabel(skill.category)}
                              </Badge>
                              <Badge className={`text-xs ${getPotentialColor(skill.monetization_potential)}`}>
                                {skill.monetization_potential === 'high' ? '🔥 Înalt' : 
                                 skill.monetization_potential === 'medium' ? 'Mediu' : 'Scăzut'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{skill.description}</p>
                            <div className="flex items-center gap-1 mt-2">
                              {[1, 2, 3, 4, 5].map(level => (
                                <Star
                                  key={level}
                                  className={`w-3 h-3 ${
                                    level <= skill.confidence ? 'text-primary fill-primary' : 'text-muted'
                                  }`}
                                />
                              ))}
                              <span className="text-xs text-muted-foreground ml-1">
                                Încredere {skill.confidence}/5
                              </span>
                            </div>
                          </div>

                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            selectedSkills.includes(skill.name)
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground'
                          }`}>
                            {selectedSkills.includes(skill.name) && (
                              <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('input');
                    setResult(null);
                    setScanProgress(0);
                  }}
                >
                  Scanează din nou
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={selectedSkills.length === 0}
                  className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  size="lg"
                >
                  Salvează {selectedSkills.length} competențe
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
