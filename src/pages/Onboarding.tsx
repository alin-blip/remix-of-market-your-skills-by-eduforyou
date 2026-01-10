import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingStep1 from '@/components/onboarding/OnboardingStep1';
import OnboardingStep2 from '@/components/onboarding/OnboardingStep2';
import OnboardingStep3 from '@/components/onboarding/OnboardingStep3';
import OnboardingStep4 from '@/components/onboarding/OnboardingStep4';
import OnboardingStep5 from '@/components/onboarding/OnboardingStep5';
import OnboardingStep6Skills from '@/components/onboarding/OnboardingStep6Skills';
import OnboardingStep7Ikigai from '@/components/onboarding/OnboardingStep7Ikigai';
import OnboardingStep8Offer from '@/components/onboarding/OnboardingStep8Offer';

interface OnboardingData {
  full_name: string;
  date_of_birth: string;
  study_field: string;
  other_course?: string;
  interests: string[];
  projects_experience: string;
  goals: string[];
  values: string[];
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSkills, setHasSkills] = useState(false);
  const [hasIkigai, setHasIkigai] = useState(false);
  const [hasOffer, setHasOffer] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    full_name: '',
    date_of_birth: '',
    study_field: '',
    other_course: '',
    interests: [],
    projects_experience: '',
    goals: [],
    values: [],
  });

  const steps = t.onboarding.steps;

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const saveProfileData = async () => {
    if (!user) return;
    
    const studyField = data.study_field === t.onboardingStep1.otherCourse && data.other_course 
      ? data.other_course 
      : data.study_field;

    await supabase
      .from('profiles')
      .update({
        full_name: data.full_name,
        date_of_birth: data.date_of_birth || null,
        study_field: studyField,
        interests: data.interests,
        projects_experience: data.projects_experience,
        goals: data.goals,
        values: data.values,
      })
      .eq('id', user.id);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        const hasValidCourse = data.study_field === t.onboardingStep1.otherCourse 
          ? (data.other_course?.trim() ?? '') !== ''
          : data.study_field.trim() !== '';
        return data.full_name.trim() !== '' && hasValidCourse;
      case 1:
        return data.interests.length > 0;
      case 2:
        return data.projects_experience.trim() !== '';
      case 3:
        return data.goals.length > 0;
      case 4:
        return data.values.length > 0;
      case 5:
        return hasSkills;
      case 6:
        return hasIkigai;
      case 7:
        return hasOffer;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    // Save profile data after step 5 (before AI steps)
    if (currentStep === 4) {
      await saveProfileData();
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const studyField = data.study_field === t.onboardingStep1.otherCourse && data.other_course 
        ? data.other_course 
        : data.study_field;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          date_of_birth: data.date_of_birth || null,
          study_field: studyField,
          interests: data.interests,
          projects_experience: data.projects_experience,
          goals: data.goals,
          values: data.values,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success(t.onboarding.completeSuccess);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(t.onboarding.saveError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <OnboardingStep1 data={data} updateData={updateData} />;
      case 1:
        return <OnboardingStep2 data={data} updateData={updateData} />;
      case 2:
        return <OnboardingStep3 data={data} updateData={updateData} />;
      case 3:
        return <OnboardingStep4 data={data} updateData={updateData} />;
      case 4:
        return <OnboardingStep5 data={data} updateData={updateData} />;
      case 5:
        return <OnboardingStep6Skills data={data} onSkillsGenerated={setHasSkills} />;
      case 6:
        return <OnboardingStep7Ikigai data={data} onIkigaiGenerated={setHasIkigai} />;
      case 7:
        return <OnboardingStep8Offer onOfferGenerated={setHasOffer} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 container max-w-3xl mx-auto px-4 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-shrink-0">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                    index < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : index === currentStep
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/30'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:block w-8 lg:w-12 h-1 mx-1 rounded-full transition-all duration-300 ${
                      index < currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground">{steps[currentStep].description}</p>
          </div>
        </div>

        {/* Step content */}
        <Card className="glass border-white/10 p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.common.back}
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.common.saving}
                </>
              ) : (
                <>
                  {t.common.finish}
                  <Check className="w-4 h-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
            >
              {t.common.next}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
