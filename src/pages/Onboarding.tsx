import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import OnboardingStep1 from '@/components/onboarding/OnboardingStep1';
import OnboardingStepCompany, { CompanyData } from '@/components/onboarding/OnboardingStepCompany';
import { Progress } from '@/components/ui/progress';

interface OnboardingData extends CompanyData {
  full_name: string;
  date_of_birth: string;
  study_field: string;
  other_course?: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { t } = useI18n();
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    full_name: '',
    date_of_birth: '',
    study_field: '',
    other_course: '',
    company_name: '',
    company_industry: '',
    company_size: '',
    company_country: '',
    company_website: '',
    company_sells: '',
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const canContinueStep1 = () => {
    const hasValidCourse = data.study_field === t.onboardingStep1.otherCourse
      ? (data.other_course?.trim() ?? '') !== ''
      : data.study_field.trim() !== '';
    return data.full_name.trim() !== '' && hasValidCourse;
  };

  const canSubmitStep2 = () => {
    return (data.company_name?.trim() ?? '') !== '' && (data.company_sells?.trim() ?? '') !== '';
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
          company_name: data.company_name?.trim() || null,
          company_industry: data.company_industry || null,
          company_size: data.company_size || null,
          company_country: data.company_country?.trim() || null,
          company_website: data.company_website?.trim() || null,
          company_sells: data.company_sells?.trim() || null,
          onboarding_completed: true,
        } as any)
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10 container max-w-lg mx-auto px-4 py-8">
        <Card className="glass border-white/10 p-6 md:p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Step {step} of 2</span>
              <span>{step === 1 ? 'About you' : 'Your company'}</span>
            </div>
            <Progress value={step === 1 ? 50 : 100} className="h-1.5" />
          </div>

          {step === 1 && <OnboardingStep1 data={data} updateData={updateData} />}
          {step === 2 && <OnboardingStepCompany data={data} updateData={updateData} />}

          <div className="mt-8 flex gap-3">
            {step === 2 && (
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            )}

            {step === 1 ? (
              <Button
                onClick={() => setStep(2)}
                disabled={!canContinueStep1()}
                className="flex-1 gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                size="lg"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmitStep2() || isSubmitting}
                className="flex-1 gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                size="lg"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {t.common.saving}</>
                ) : (
                  <>{t.common.finish} <Check className="w-4 h-4" /></>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
