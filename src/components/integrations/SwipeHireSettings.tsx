import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSwipeHireIntegration } from "@/hooks/useSwipeHireIntegration";
import { RefreshCw, CheckCircle, User, Package, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export function SwipeHireSettings() {
  const { t } = useI18n();
  const { profile } = useAuth();
  const { 
    isConnected, 
    isProfileSynced, 
    isServicesSynced, 
    registerUser,
    isPublishing,
    markProfileSynced 
  } = useSwipeHireIntegration();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleResync = async () => {
    if (!profile?.email || !profile?.full_name) {
      toast.error("Profile information missing");
      return;
    }

    setIsSyncing(true);
    try {
      await registerUser(profile.email, profile.full_name);
      markProfileSynced();
      toast.success("Profile synced with SwipeHire");
    } catch (error) {
      // Error is already handled in registerUser
    } finally {
      setIsSyncing(false);
    }
  };

  const hasSwipeHireId = !!profile?.swipehire_user_id;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {t.integrations?.swipehire?.title || "SwipeHire Integration"}
            </CardTitle>
            <CardDescription>
              {t.integrations?.swipehire?.autoConfigured || "Automatically configured for all users"}
            </CardDescription>
          </div>
          <Badge variant={hasSwipeHireId ? "default" : "secondary"}>
            {hasSwipeHireId 
              ? (t.integrations?.swipehire?.connected || "Connected") 
              : (t.integrations?.swipehire?.pending || "Pending")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Integration Status */}
        <div className="p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">
              {t.integrations?.swipehire?.autoEnabled || "Integration automatically enabled"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t.integrations?.swipehire?.autoEnabledDesc || 
              "Your profile is automatically synced with SwipeHire when you register. No configuration needed."}
          </p>
        </div>

        {/* Sync Status Indicators */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            {hasSwipeHireId || isProfileSynced() ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{t.integrations?.swipehire?.profileSynced || "Profile synced"}</span>
              </>
            ) : (
              <>
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t.integrations?.swipehire?.profileNotSynced || "Profile not synced yet"}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            {isServicesSynced() ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{t.integrations?.swipehire?.servicesSynced || "Services synced"}</span>
              </>
            ) : (
              <>
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t.integrations?.swipehire?.servicesNotSynced || "Services not synced yet"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Re-sync Button */}
        <Button 
          variant="outline" 
          onClick={handleResync} 
          disabled={isSyncing || isPublishing}
          className="w-full"
        >
          {isSyncing || isPublishing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {t.integrations?.swipehire?.resync || "Re-sync Profile"}
        </Button>
      </CardContent>
    </Card>
  );
}
