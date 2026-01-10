import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Check } from "lucide-react";
import { useAutoSync } from "@/hooks/useAutoSync";
import { useI18n } from "@/lib/i18n";
import { formatDistanceToNow } from "date-fns";
import { ro, enUS } from "date-fns/locale";

interface AutoSyncSettingsProps {
  onSyncNow?: () => Promise<void>;
}

export function AutoSyncSettings({ onSyncNow }: AutoSyncSettingsProps) {
  const { t, locale } = useI18n();
  const { isConnected, isSyncing, lastSyncedAt, config, toggleAutoSync, toggleNotifications } = useAutoSync();

  const dateLocale = locale === "ro" ? ro : enUS;

  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Connect to SwipeHire to enable auto-sync
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{t.integrations?.autoSync?.title || "Auto-Sync Settings"}</CardTitle>
          {isSyncing ? (
            <Badge variant="secondary" className="gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              {t.integrations?.autoSync?.syncing || "Syncing..."}
            </Badge>
          ) : config.enabled ? (
            <Badge variant="default" className="gap-1 bg-green-600">
              <Check className="h-3 w-3" />
              {t.integrations?.autoSync?.active || "Active"}
            </Badge>
          ) : (
            <Badge variant="secondary">{t.integrations?.autoSync?.disabled || "Disabled"}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-sync">{t.integrations?.autoSync?.toggle || "Auto-sync changes"}</Label>
            <p className="text-xs text-muted-foreground">{t.integrations?.autoSync?.toggleDescription || "Automatically sync when you save changes"}</p>
          </div>
          <Switch id="auto-sync" checked={config.enabled} onCheckedChange={toggleAutoSync} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications">{t.integrations?.autoSync?.notifications || "Show notifications"}</Label>
            <p className="text-xs text-muted-foreground">{t.integrations?.autoSync?.notificationsDescription || "Display toast when sync completes"}</p>
          </div>
          <Switch id="notifications" checked={config.showNotifications} onCheckedChange={toggleNotifications} />
        </div>

        {lastSyncedAt && (
          <p className="text-xs text-muted-foreground">
            {t.integrations?.autoSync?.lastSynced || "Last synced"}: {formatDistanceToNow(lastSyncedAt, { addSuffix: true, locale: dateLocale })}
          </p>
        )}

        {onSyncNow && (
          <Button variant="outline" size="sm" onClick={onSyncNow} disabled={isSyncing} className="w-full">
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            {t.integrations?.autoSync?.syncNow || "Sync Now"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
