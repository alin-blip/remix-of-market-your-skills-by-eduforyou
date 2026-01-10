import { useState, useCallback } from "react";
import { toast } from "sonner";

const SWIPEHIRE_API_URL = "https://qqnazmzdzavshmmuycgq.supabase.co/functions/v1";
const API_KEY_STORAGE_KEY = "swipehire_api_key";
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
  external_user_id?: string;
  external_profile_url?: string;
}

export interface GigPayload {
  external_id: string;
  external_user_id: string;
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
  external_user_id: string;
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

  const getApiKey = useCallback((): string | null => {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  }, []);

  const saveApiKey = useCallback((key: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    toast.success("API Key saved successfully");
  }, []);

  const clearApiKey = useCallback(() => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    localStorage.removeItem(PROFILE_SYNCED_KEY);
    localStorage.removeItem(SERVICES_SYNCED_KEY);
    toast.success("API Key removed");
  }, []);

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

  const isConnected = !!getApiKey();

  const publishProfile = useCallback(async (payload: ProfilePayload) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      toast.error("No API key configured. Please add your SwipeHire API key first.");
      return null;
    }

    setIsPublishing(true);
    try {
      const response = await fetch(`${SWIPEHIRE_API_URL}/sync-profile-from-external`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "x-platform-origin": "freedom_os",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync with SwipeHire");
      }

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(message);
    } finally {
      setIsPublishing(false);
    }
  }, [getApiKey]);

  const publishGig = useCallback(async (payload: GigPayload) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      toast.error("No API key configured. Please add your SwipeHire API key first.");
      return null;
    }

    setIsPublishing(true);
    try {
      // SwipeHire expects payload wrapped in a "gig" object
      const wrappedPayload = { gig: payload };
      
      const response = await fetch(`${SWIPEHIRE_API_URL}/sync-gig-from-external`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "x-platform-origin": "freedom_os",
        },
        body: JSON.stringify(wrappedPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to publish gig to SwipeHire");
      }

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(message);
    } finally {
      setIsPublishing(false);
    }
  }, [getApiKey]);

  const publishJob = useCallback(async (payload: JobPayload) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      toast.error("No API key configured. Please add your SwipeHire API key first.");
      return null;
    }

    setIsPublishing(true);
    try {
      // SwipeHire expects payload wrapped in a "job" object
      const wrappedPayload = { job: payload };
      
      const response = await fetch(`${SWIPEHIRE_API_URL}/sync-job-from-external`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "x-platform-origin": "freedom_os",
        },
        body: JSON.stringify(wrappedPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to publish job to SwipeHire");
      }

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(message);
    } finally {
      setIsPublishing(false);
    }
  }, [getApiKey]);

  return {
    isPublishing,
    isConnected,
    getApiKey,
    saveApiKey,
    clearApiKey,
    isProfileSynced,
    markProfileSynced,
    clearProfileSynced,
    isServicesSynced,
    markServicesSynced,
    clearServicesSynced,
    publishProfile,
    publishGig,
    publishJob,
  };
};
