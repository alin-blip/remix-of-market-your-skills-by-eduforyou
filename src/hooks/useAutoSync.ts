import { useCallback, useRef, useEffect, useState } from "react";
import { useSwipeHireIntegration, ProfilePayload, GigPayload } from "./useSwipeHireIntegration";
import { toast } from "sonner";

interface AutoSyncConfig {
  enabled: boolean;
  debounceMs: number;
  showNotifications: boolean;
}

const AUTO_SYNC_CONFIG_KEY = "swipehire_auto_sync_config";

const defaultConfig: AutoSyncConfig = {
  enabled: true,
  debounceMs: 2000,
  showNotifications: true,
};

export function useAutoSync() {
  const { isConnected, publishProfile, publishGig } = useSwipeHireIntegration();
  
  const [config, setConfig] = useState<AutoSyncConfig>(() => {
    try {
      const saved = localStorage.getItem(AUTO_SYNC_CONFIG_KEY);
      return saved ? JSON.parse(saved) : defaultConfig;
    } catch {
      return defaultConfig;
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Save config to localStorage
  useEffect(() => {
    localStorage.setItem(AUTO_SYNC_CONFIG_KEY, JSON.stringify(config));
  }, [config]);

  // Sync profile with debounce
  const syncProfile = useCallback(
    async (profileData: ProfilePayload) => {
      if (!isConnected || !config.enabled) return;

      // Clear previous timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Debounce sync
      debounceRef.current = setTimeout(async () => {
        setIsSyncing(true);
        try {
          await publishProfile(profileData);
          setLastSyncedAt(new Date());

          if (config.showNotifications) {
            toast.success("Profile synced to SwipeHire", {
              description: "Your changes are now visible to employers",
              duration: 3000,
            });
          }
        } catch (error) {
          if (config.showNotifications) {
            toast.error("Sync failed", {
              description: error instanceof Error ? error.message : "Unknown error",
            });
          }
        } finally {
          setIsSyncing(false);
        }
      }, config.debounceMs);
    },
    [isConnected, config, publishProfile]
  );

  // Sync gig with debounce
  const syncGig = useCallback(
    async (gigData: GigPayload) => {
      if (!isConnected || !config.enabled) return;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        setIsSyncing(true);
        try {
          await publishGig(gigData);
          setLastSyncedAt(new Date());

          if (config.showNotifications) {
            toast.success("Gig synced to SwipeHire", {
              description: `"${gigData.title}" updated successfully`,
              duration: 3000,
            });
          }
        } catch (error) {
          if (config.showNotifications) {
            toast.error("Gig sync failed", {
              description: error instanceof Error ? error.message : "Unknown error",
            });
          }
        } finally {
          setIsSyncing(false);
        }
      }, config.debounceMs);
    },
    [isConnected, config, publishGig]
  );

  // Toggle auto-sync
  const toggleAutoSync = useCallback((enabled: boolean) => {
    setConfig((prev) => ({ ...prev, enabled }));
  }, []);

  // Toggle notifications
  const toggleNotifications = useCallback((show: boolean) => {
    setConfig((prev) => ({ ...prev, showNotifications: show }));
  }, []);

  // Force immediate sync (skip debounce)
  const forceSyncNow = useCallback(
    async (data: { profile?: ProfilePayload; gig?: GigPayload }) => {
      if (!isConnected) {
        toast.error("Not connected to SwipeHire");
        return;
      }

      setIsSyncing(true);
      try {
        if (data.profile) await publishProfile(data.profile);
        if (data.gig) await publishGig(data.gig);
        setLastSyncedAt(new Date());
        toast.success("Synced successfully");
      } catch (error) {
        toast.error("Sync failed", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setIsSyncing(false);
      }
    },
    [isConnected, publishProfile, publishGig]
  );

  return {
    // State
    isConnected,
    isSyncing,
    lastSyncedAt,
    config,

    // Auto-sync functions (with debounce)
    syncProfile,
    syncGig,

    // Manual sync
    forceSyncNow,

    // Config
    toggleAutoSync,
    toggleNotifications,
  };
}
