import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSwipeHireIntegration } from "@/hooks/useSwipeHireIntegration";
import { Link2, Unlink, Eye, EyeOff, ExternalLink, User, CheckCircle, Package } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function SwipeHireSettings() {
  const { t } = useI18n();
  const { isConnected, saveApiKey, clearApiKey, getApiKey, isProfileSynced, isServicesSynced } = useSwipeHireIntegration();
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    if (apiKeyInput.trim()) {
      saveApiKey(apiKeyInput.trim());
      setApiKeyInput("");
    }
  };

  const maskedKey = () => {
    const key = getApiKey();
    if (!key) return "";
    return showKey ? key : `${key.slice(0, 8)}${"•".repeat(24)}${key.slice(-4)}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {t.integrations?.swipehire?.title || "SwipeHire Integration"}
            </CardTitle>
            <CardDescription>{t.integrations?.swipehire?.description || "Connect your profile to SwipeHire job platform"}</CardDescription>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? (t.integrations?.swipehire?.connected || "Connected") : (t.integrations?.swipehire?.notConnected || "Not Connected")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input type="text" value={maskedKey()} readOnly className="font-mono text-sm" />
              <Button variant="ghost" size="icon" onClick={() => setShowKey(!showKey)}>
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                {isProfileSynced() ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{t.integrations?.swipehire?.profileSynced || "Profile synced"}</span>
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{t.integrations?.swipehire?.profileNotSynced || "Profile not synced yet"}</span>
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
                    <span className="text-sm text-muted-foreground">{t.integrations?.swipehire?.servicesNotSynced || "Services not synced yet"}</span>
                  </>
                )}
              </div>
            </div>
            <Button variant="destructive" onClick={clearApiKey} className="w-full">
              <Unlink className="mr-2 h-4 w-4" />
              {t.integrations?.swipehire?.disconnect || "Disconnect"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              {t.integrations?.swipehire?.apiKeyHint || "Get your API key from SwipeHire → Settings → Integrations"}
              <a href="https://swipehire.lovable.app/settings/integrations" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
            <Input
              type="password"
              placeholder={t.integrations?.swipehire?.apiKeyPlaceholder || "Enter your SwipeHire API key"}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <Button onClick={handleSave} disabled={!apiKeyInput.trim()} className="w-full">
              <Link2 className="mr-2 h-4 w-4" />
              {t.integrations?.swipehire?.connect || "Connect"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
