import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PROFILE_SYNCED_KEY = "swipehire_profile_synced";
const SERVICES_SYNCED_KEY = "swipehire_services_synced";

export interface ProfilePayload {
  profile?: {
    full_name?: string;
    email?: string;
    bio?: string;
    headline?: string;
    location?: string;
  };
  student_profile?: {
    university?: string;
    skills?: string[];
    graduation_year?: number;
    degree?: string;
    field_of_study?: string;
  };
  portfolio?: {
    title: string;
    description?: string;
    technologies?: string[];
    project_url?: string;
  }[];
  services?: {
    service_name: string;
    price_type?: string;
    price_amount?: number;
  }[];
  values?: {
    value_name: string;
    priority?: number;
  }[];
}

export interface GigPayload {
  external_id: string;
  title: string;
  description: string;
  category?: string;
  skills?: string[];
  price_type?: "fixed" | "hourly";
  price_amount?: number;
  currency?: string;
  location_type?: "remote" | "onsite" | "hybrid";
}

export interface JobPayload {
  external_id: string;
  title: string;
  description: string;
  category?: string;
  skills?: string[];
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  location_type?: "remote" | "onsite" | "hybrid";
  location?: string;
}

export const useSwipeHireIntegration = () => {
  const [isPublishing, setIsPublishing] = useState(false);

  // Integration is always connected at the application level
  const isConnected = true;

  const isProfileSynced = useCallback((): boolean => {
    return localStorage.getItem(PROFILE_SYNCED_KEY) === "true";
  }, []);

  const markProfileSynced = useCallback(() => {
    localStorage.setItem(PROFILE_SYNCED_KEY, "true");
  }, []);

  const clearProfileSynced = useCallback(() => {
    localStorage.removeItem(PROFILE_SYNCED_KEY);
  }, []);

  const isServicesSynced = useCallback((): boolean => {
    return localStorage.getItem(SERVICES_SYNCED_KEY) === "true";
  }, []);

  const markServicesSynced = useCallback(() => {
    localStorage.setItem(SERVICES_SYNCED_KEY, "true");
  }, []);

  const clearServicesSynced = useCallback(() => {
    localStorage.removeItem(SERVICES_SYNCED_KEY);
  }, []);

  const getAuthToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  const callSwipeHireSync = async (action: string, payload: Record<string, unknown>) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/swipehire-sync`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ action, ...payload }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to sync with SwipeHire");
    }

    return data;
  };

  const publishProfile = useCallback(async (payload: ProfilePayload) => {
    setIsPublishing(true);
    try {
      const result = await callSwipeHireSync("sync-profile", { profile: payload });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(message);
    } finally {
      setIsPublishing(false);
    }
  }, []);

  const publishGig = useCallback(async (payload: GigPayload) => {
    setIsPublishing(true);
    try {
      const result = await callSwipeHireSync("sync-gig", { gig: payload });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(message);
    } finally {
      setIsPublishing(false);
    }
  }, []);

  const publishJob = useCallback(async (payload: JobPayload) => {
    setIsPublishing(true);
    try {
      // Jobs use the same sync-gig endpoint with different structure
      const result = await callSwipeHireSync("sync-gig", { gig: payload });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(message);
    } finally {
      setIsPublishing(false);
    }
  }, []);

  const registerUser = useCallback(async (email: string, fullName: string) => {
    setIsPublishing(true);
    try {
      const result = await callSwipeHireSync("register-user", { email, full_name: fullName });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`SwipeHire registration failed: ${message}`);
      throw new Error(message);
    } finally {
      setIsPublishing(false);
    }
  }, []);

  return {
    isPublishing,
    isConnected,
    isProfileSynced,
    markProfileSynced,
    clearProfileSynced,
    isServicesSynced,
    markServicesSynced,
    clearServicesSynced,
    publishProfile,
    publishGig,
    publishJob,
    registerUser,
  };
};
