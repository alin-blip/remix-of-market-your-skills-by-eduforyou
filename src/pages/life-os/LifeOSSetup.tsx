import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Heart, 
  Brain, 
  Users, 
  Sparkles, 
  Wallet, 
  Gamepad2,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Target,
  Rocket,
  RefreshCw,
  MessageSquare,
  X,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useSaveLifeAreas, useSaveLifeGoals } from '@/hooks/useLifeOS';
import { 
  LifeAreaKey, 
  LIFE_AREAS, 
  LifeOSContext,
} from '@/types/lifeOS';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const AREA_ICONS = {
  business: Briefcase,
  body: Heart,
  mind: Brain,
  relationships: Users,
  spirituality: Sparkles,
  finance: Wallet,
  fun: Gamepad2,
};

const STEPS = [
  { id: 'areas', title: 'Select Areas' },
  { id: 'vision', title: 'Annual Vision' },
  { id: 'quarterly', title: '90-Day Milestones' },
  { id: 'monthly', title: 'Monthly Goals' },
  { id: 'complete', title: 'Complete' },
];

export default function LifeOSSetup() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(0);
  const [selectedAreas, setSelectedAreas] = useState<LifeAreaKey[]>(['business', 'mind', 'body']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [annualVision, setAnnualVision] = useState<Record<string, { title: string; description: string; measurable_result: string }>>({});
  const [quarterlyMilestones, setQuarterlyMilestones] = useState<Array<{ area_key: string; title: string; measurable_result: string }>>([]);
  const [monthlyGoals, setMonthlyGoals] = useState<Array<{ area_key: string; title: string; measurable_result: string }>>([]);
  const [regenerateInstructions, setRegenerateInstructions] = useState('');
  const [showInstructionsPopover, setShowInstructionsPopover] = useState(false);
  
  const saveAreas = useSaveLifeAreas();
  const saveGoals = useSaveLifeGoals();
  
  const toggleArea = (area: LifeAreaKey) => {
    setSelectedAreas(prev => 
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };
  
  const loadUserContext = async (): Promise<LifeOSContext> => {
    if (!user?.id) return { profile: { goals: [], values: [], interests: [] }, skills: [] };
    
    const [profileRes, skillsRes, ikigaiRes, offersRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('skill_entries').select('*').eq('user_id', user.id),
      supabase.from('ikigai_results').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('offers').select('*').eq('user_id', user.id).maybeSingle(),
    ]);
    
    const profile = profileRes.data;
    const skills = skillsRes.data || [];
    const ikigai = ikigaiRes.data;
    const offers = offersRes.data;
    
    return {
      profile: {
        goals: Array.isArray(profile?.goals) ? profile.goals as string[] : [],
        values: Array.isArray(profile?.values) ? profile.values as string[] : [],
        interests: Array.isArray(profile?.interests) ? profile.interests as string[] : [],
        study_field: profile?.study_field || undefined,
      },
      skills: skills.map(s => ({
        skill: s.skill,
        category: s.category,
        confidence: s.confidence || 50,
      })),
      ikigai: ikigai ? {
        statements: Array.isArray(ikigai.ikigai_statements) ? ikigai.ikigai_statements as string[] : [],
        service_angles: Array.isArray(ikigai.service_angles) ? ikigai.service_angles as string[] : [],
      } : undefined,
      offers: offers ? {
        smv: offers.smv || undefined,
        target_market: offers.target_market || undefined,
        packages: [
          offers.starter_package ? { name: 'Starter', price: (offers.starter_package as any)?.price || '' } : null,
          offers.standard_package ? { name: 'Standard', price: (offers.standard_package as any)?.price || '' } : null,
          offers.premium_package ? { name: 'Premium', price: (offers.premium_package as any)?.price || '' } : null,
        ].filter(Boolean) as Array<{ name: string; price: string }>,
      } : undefined,
    };
  };
  
  const generateWithAI = async (action: string, existingGoals?: any, customInstructions?: string) => {
    setIsGenerating(true);
    try {
      const context = await loadUserContext();
      const currentYear = new Date().getFullYear();
      const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}-${currentYear}`;
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const { data, error } = await supabase.functions.invoke('life-os-wizard', {
        body: {
          action,
          areas: selectedAreas,
          context,
          existingGoals,
          currentPeriod: action === 'quarterly_milestones' ? currentQuarter : 
                         action === 'monthly_goals' ? currentMonth : currentYear.toString(),
          customInstructions,
        },
      });
      
      if (error) throw error;
      return data.data;
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error(t.common?.error || 'Error generating content');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleRegenerate = async () => {
    setShowInstructionsPopover(false);
    const instructions = regenerateInstructions.trim() || undefined;
    setRegenerateInstructions('');
    
    if (step === 1) {
      const vision = await generateWithAI('annual_vision', undefined, instructions);
      if (vision) setAnnualVision(vision);
    } else if (step === 2) {
      const milestones = await generateWithAI('quarterly_milestones', annualVision, instructions);
      if (milestones) setQuarterlyMilestones(milestones);
    } else if (step === 3) {
      const goals = await generateWithAI('monthly_goals', quarterlyMilestones, instructions);
      if (goals) setMonthlyGoals(goals);
    }
  };
  
  const handleNext = async () => {
    if (step === 0) {
      if (selectedAreas.length < 2) {
        toast.error('Select at least 2 areas');
        return;
      }
      // Generate annual vision
      const vision = await generateWithAI('annual_vision');
      if (vision) {
        setAnnualVision(vision);
        setStep(1);
      }
    } else if (step === 1) {
      // Generate quarterly milestones
      const milestones = await generateWithAI('quarterly_milestones', annualVision);
      if (milestones) {
        setQuarterlyMilestones(milestones);
        setStep(2);
      }
    } else if (step === 2) {
      // Generate monthly goals
      const goals = await generateWithAI('monthly_goals', quarterlyMilestones);
      if (goals) {
        setMonthlyGoals(goals);
        setStep(3);
      }
    } else if (step === 3) {
      // Save everything
      try {
        // Save areas
        await saveAreas.mutateAsync(selectedAreas);
        
        const currentYear = new Date().getFullYear();
        const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}-${currentYear}`;
        const currentMonth = new Date().toISOString().slice(0, 7);
        
        // Prepare goals
        const allGoals = [
          // Annual goals
          ...Object.entries(annualVision).map(([area_key, goal], index) => ({
            area_key: area_key as LifeAreaKey,
            goal_type: 'annual' as const,
            period: currentYear.toString(),
            title: goal.title,
            description: goal.description,
            measurable_result: goal.measurable_result,
            status: 'active' as const,
            progress: 0,
            position: index,
          })),
          // Quarterly milestones
          ...quarterlyMilestones.map((milestone, index) => ({
            area_key: milestone.area_key as LifeAreaKey,
            goal_type: 'quarterly' as const,
            period: currentQuarter,
            title: milestone.title,
            measurable_result: milestone.measurable_result,
            status: 'active' as const,
            progress: 0,
            position: index,
          })),
          // Monthly goals
          ...monthlyGoals.map((goal, index) => ({
            area_key: goal.area_key as LifeAreaKey,
            goal_type: 'monthly' as const,
            period: currentMonth,
            title: goal.title,
            measurable_result: goal.measurable_result,
            status: 'active' as const,
            progress: 0,
            position: index,
          })),
        ];
        
        await saveGoals.mutateAsync(allGoals);
        
        setStep(4);
        toast.success(t.common?.success || 'Setup complete!');
      } catch (error) {
        console.error('Save error:', error);
        toast.error(t.common?.error || 'Error saving');
      }
    } else {
      navigate('/life-os');
    }
  };
  
  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };
  
  const progressPercentage = ((step + 1) / STEPS.length) * 100;
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display">
                {t.lifeOS?.setup || 'Life OS Setup'}
              </h1>
              <p className="text-muted-foreground">
                {STEPS[step].title}
              </p>
            </div>
            <Badge variant="outline">
              {step + 1} / {STEPS.length}
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <AnimatePresence mode="wait">
          {/* Step 0: Select Areas */}
          {step === 0 && (
            <motion.div
              key="areas"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t.lifeOS?.wizard?.selectAreas || 'Select your life areas'}</CardTitle>
                  <CardDescription>
                    Choose 2-5 areas you want to focus on this year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(Object.keys(LIFE_AREAS) as LifeAreaKey[]).map((area) => {
                      const Icon = AREA_ICONS[area];
                      const isSelected = selectedAreas.includes(area);
                      
                      return (
                        <button
                          key={area}
                          onClick={() => toggleArea(area)}
                          className={cn(
                            'p-4 rounded-xl border-2 transition-all text-center',
                            isSelected 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <Icon className={cn(
                            'h-8 w-8 mx-auto mb-2',
                            isSelected ? 'text-primary' : 'text-muted-foreground'
                          )} />
                          <p className="font-medium capitalize">
                            {t.lifeOS?.areas?.[area] || area}
                          </p>
                          {isSelected && (
                            <Check className="h-4 w-4 mx-auto mt-2 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {/* Step 1: Annual Vision */}
          {step === 1 && (
            <motion.div
              key="vision"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle>{t.lifeOS?.wizard?.annualVision || 'Annual Vision'}</CardTitle>
                    <CardDescription>
                      Your goals for {new Date().getFullYear()}. Edit as needed.
                    </CardDescription>
                  </div>
                  <Popover open={showInstructionsPopover} onOpenChange={setShowInstructionsPopover}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={isGenerating}
                        className="flex-shrink-0"
                      >
                        <RefreshCw className={cn("h-4 w-4 mr-2", isGenerating && "animate-spin")} />
                        Regenerate
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Regenerate with instructions</p>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => setShowInstructionsPopover(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="e.g., Focus more on income goals..."
                          value={regenerateInstructions}
                          onChange={(e) => setRegenerateInstructions(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRegenerate()}
                        />
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              setRegenerateInstructions('');
                              handleRegenerate();
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Quick
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={handleRegenerate}
                            disabled={!regenerateInstructions.trim()}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            With Instructions
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(annualVision).map(([area, goal]) => {
                    const Icon = AREA_ICONS[area as LifeAreaKey];
                    return (
                      <div key={area} className="p-4 rounded-lg border space-y-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="font-medium capitalize">
                            {t.lifeOS?.areas?.[area as LifeAreaKey] || area}
                          </span>
                        </div>
                        <Textarea
                          value={goal.title}
                          onChange={(e) => setAnnualVision(prev => ({
                            ...prev,
                            [area]: { ...prev[area], title: e.target.value }
                          }))}
                          placeholder="Goal title"
                          className="resize-none"
                        />
                        <p className="text-sm text-muted-foreground">
                          📊 {goal.measurable_result}
                        </p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {/* Step 2: Quarterly Milestones */}
          {step === 2 && (
            <motion.div
              key="quarterly"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle>{t.lifeOS?.wizard?.quarterlyMilestones || '90-Day Milestones'}</CardTitle>
                    <CardDescription>
                      Focus areas for Q{Math.ceil((new Date().getMonth() + 1) / 3)}
                    </CardDescription>
                  </div>
                  <Popover open={showInstructionsPopover} onOpenChange={setShowInstructionsPopover}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={isGenerating}
                        className="flex-shrink-0"
                      >
                        <RefreshCw className={cn("h-4 w-4 mr-2", isGenerating && "animate-spin")} />
                        Regenerate
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Regenerate with instructions</p>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => setShowInstructionsPopover(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="e.g., More challenging goals..."
                          value={regenerateInstructions}
                          onChange={(e) => setRegenerateInstructions(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRegenerate()}
                        />
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              setRegenerateInstructions('');
                              handleRegenerate();
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Quick
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={handleRegenerate}
                            disabled={!regenerateInstructions.trim()}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            With Instructions
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quarterlyMilestones.map((milestone, index) => {
                    const Icon = AREA_ICONS[milestone.area_key as LifeAreaKey];
                    return (
                      <div key={index} className="p-4 rounded-lg border flex items-start gap-3">
                        <Icon className="h-5 w-5 text-primary mt-1" />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={milestone.title}
                            onChange={(e) => setQuarterlyMilestones(prev => 
                              prev.map((m, i) => i === index ? { ...m, title: e.target.value } : m)
                            )}
                            className="w-full bg-transparent border-none focus:outline-none font-medium"
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            📊 {milestone.measurable_result}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {/* Step 3: Monthly Goals */}
          {step === 3 && (
            <motion.div
              key="monthly"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle>{t.lifeOS?.wizard?.monthlyGoals || 'Monthly Goals'}</CardTitle>
                    <CardDescription>
                      Focus for {new Date().toLocaleDateString(locale, { month: 'long' })}
                    </CardDescription>
                  </div>
                  <Popover open={showInstructionsPopover} onOpenChange={setShowInstructionsPopover}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={isGenerating}
                        className="flex-shrink-0"
                      >
                        <RefreshCw className={cn("h-4 w-4 mr-2", isGenerating && "animate-spin")} />
                        Regenerate
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Regenerate with instructions</p>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => setShowInstructionsPopover(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="e.g., Add more specific tasks..."
                          value={regenerateInstructions}
                          onChange={(e) => setRegenerateInstructions(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRegenerate()}
                        />
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              setRegenerateInstructions('');
                              handleRegenerate();
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Quick
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={handleRegenerate}
                            disabled={!regenerateInstructions.trim()}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            With Instructions
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </CardHeader>
                <CardContent className="space-y-3">
                  {monthlyGoals.map((goal, index) => {
                    const Icon = AREA_ICONS[goal.area_key as LifeAreaKey];
                    return (
                      <div key={index} className="p-4 rounded-lg border flex items-start gap-3">
                        <Icon className="h-5 w-5 text-primary mt-1" />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={goal.title}
                            onChange={(e) => setMonthlyGoals(prev => 
                              prev.map((g, i) => i === index ? { ...g, title: e.target.value } : g)
                            )}
                            className="w-full bg-transparent border-none focus:outline-none font-medium"
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            📊 {goal.measurable_result}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {/* Step 4: Complete */}
          {step === 4 && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <Rocket className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                🎉 {t.lifeOS?.setup || 'Setup Complete!'}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Your Life OS is ready. Start your first weekly sprint to begin executing on your goals.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => navigate('/life-os')}>
                  Go to Dashboard
                </Button>
                <Button onClick={() => navigate('/life-os/sprint')}>
                  <Target className="h-4 w-4 mr-2" />
                  Start Sprint Planning
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={step === 0 || isGenerating}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t.common?.back || 'Back'}
            </Button>
            <Button 
              onClick={handleNext}
              disabled={isGenerating || (step === 0 && selectedAreas.length < 2)}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  {step === 3 ? (t.common?.finish || 'Finish') : (t.common?.next || 'Continue')}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
