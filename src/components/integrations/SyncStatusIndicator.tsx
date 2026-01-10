import { useAutoSync } from "@/hooks/useAutoSync";
import { Loader2, Cloud, CloudOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n";

export function SyncStatusIndicator() {
  const { t } = useI18n();
  const { isConnected, isSyncing, config } = useAutoSync();

  if (!isConnected) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-muted/50 cursor-default">
          {isSyncing ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="hidden sm:inline">{t.integrations?.autoSync?.syncing || "Syncing..."}</span>
            </>
          ) : config.enabled ? (
            <>
              <Cloud className="h-3 w-3 text-green-500" />
              <span className="hidden sm:inline">Auto-sync</span>
            </>
          ) : (
            <>
              <CloudOff className="h-3 w-3 text-muted-foreground" />
              <span className="hidden sm:inline">Sync off</span>
            </>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {isSyncing
          ? (t.integrations?.autoSync?.syncing || "Syncing...")
          : config.enabled
          ? (t.integrations?.autoSync?.active || "Active")
          : (t.integrations?.autoSync?.disabled || "Disabled")}
      </TooltipContent>
    </Tooltip>
  );
}
