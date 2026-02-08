import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface StudentApplication {
  id: string;
  user_id: string;
  current_phase: 'evaluate' | 'deliver' | 'unlock';
  current_step: string;
  assigned_consultant: string | null;
  university_choice: string | null;
  course_choice: string | null;
  application_status: string;
  documents_status: string | null;
  finance_status: string | null;
  eligibility_status: string | null;
  course_match_status: string | null;
  test_prep_status: string | null;
  cv_status: string | null;
  university_response: string | null;
  offer_status: string | null;
  enrollment_confirmed: boolean | null;
  started_at: string;
  updated_at: string;
  created_at: string;
}

export interface ApplicationStep {
  id: string;
  application_id: string;
  step_key: string;
  step_label: string;
  phase: 'evaluate' | 'deliver' | 'unlock';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completed_at: string | null;
  notes: string | null;
}

// E.D.U Method step definitions
export const EDU_STEPS = {
  evaluate: [
    { key: 'eligibility_check', label: 'Eligibility Check', statusField: 'eligibility_status' as const },
    { key: 'course_matching', label: 'Course Matching', statusField: 'course_match_status' as const },
    { key: 'edu_plan', label: 'E.D.U Plan', statusField: null },
    { key: 'test_prep', label: 'Test Preparation', statusField: 'test_prep_status' as const },
  ],
  deliver: [
    { key: 'documents', label: 'Documents', statusField: 'documents_status' as const },
    { key: 'cv_builder', label: 'CV & Personal Statement', statusField: 'cv_status' as const },
    { key: 'university_response', label: 'University Response', statusField: null },
    { key: 'offer_accept', label: 'Offer Accept', statusField: null },
  ],
  unlock: [
    { key: 'student_finance', label: 'Student Finance', statusField: 'finance_status' as const },
    { key: 'bonuses', label: '10 Bonuses (£9k value)', statusField: null },
    { key: 'enrollment', label: 'Enrollment Confirmed', statusField: null },
    { key: 'freedom_circle', label: 'Freedom Circle™', statusField: null },
  ],
} as const;

export function useStudentApplication() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: application, isLoading, error } = useQuery({
    queryKey: ['student-application', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('student_applications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as StudentApplication | null;
    },
    enabled: !!user,
  });

  const createApplication = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('student_applications')
        .insert({ user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-application'] });
    },
  });

  const updateApplication = useMutation({
    mutationFn: async (updates: Partial<StudentApplication>) => {
      if (!application) throw new Error('No application found');
      const { data, error } = await supabase
        .from('student_applications')
        .update(updates)
        .eq('id', application.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-application'] });
    },
  });

  // Calculate overall progress
  const getProgress = () => {
    if (!application) return { phase: 'evaluate' as const, percentage: 0, completedSteps: 0, totalSteps: 12 };

    const statusFields = [
      application.eligibility_status,
      application.course_match_status,
      application.test_prep_status,
      application.documents_status,
      application.cv_status,
      application.finance_status,
    ];

    const completedSteps = statusFields.filter(s => s === 'completed').length;
    const totalSteps = 12;
    const percentage = Math.round((completedSteps / totalSteps) * 100);

    return {
      phase: application.current_phase,
      percentage,
      completedSteps,
      totalSteps,
    };
  };

  return {
    application,
    isLoading,
    error,
    createApplication,
    updateApplication,
    getProgress,
  };
}
