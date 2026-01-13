import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "./useSubscription";

export function useCourseAccess(courseId: string, coursePrice: number) {
  const { user } = useAuth();
  const { plan, isLoading: subLoading } = useSubscription();

  const { data: purchase, isLoading: purchaseLoading } = useQuery({
    queryKey: ["course-purchase", user?.id, courseId],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("course_purchases")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .eq("status", "completed")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!courseId,
  });

  const isFree = coursePrice === 0;
  const isPurchased = !!purchase;
  const isFounder = plan === "founder";
  
  // Founders have access to all courses, or if purchased, or if free
  const hasAccess = isFounder || isPurchased || isFree;

  return {
    hasAccess,
    isPurchased,
    isFounder,
    isFree,
    isLoading: subLoading || purchaseLoading,
  };
}

// Hook to check multiple courses at once
export function useCoursesAccess() {
  const { user } = useAuth();
  const { plan, isLoading: subLoading } = useSubscription();

  const { data: purchases = [], isLoading: purchasesLoading } = useQuery({
    queryKey: ["all-course-purchases", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("course_purchases")
        .select("course_id")
        .eq("user_id", user.id)
        .eq("status", "completed");
      if (error) throw error;
      return data.map(p => p.course_id);
    },
    enabled: !!user?.id,
  });

  const isFounder = plan === "founder";

  const hasAccessToCourse = (courseId: string, coursePrice: number): boolean => {
    if (coursePrice === 0) return true; // Free course
    if (isFounder) return true; // Founders have all access
    return purchases.includes(courseId);
  };

  return {
    hasAccessToCourse,
    isFounder,
    purchasedCourseIds: purchases,
    isLoading: subLoading || purchasesLoading,
  };
}
