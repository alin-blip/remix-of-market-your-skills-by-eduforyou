import { MainLayout } from "@/components/layout/MainLayout";
import { SwipeHireSettings } from "@/components/integrations/SwipeHireSettings";
import { AutoSyncSettings } from "@/components/integrations/AutoSyncSettings";
import { useI18n } from "@/lib/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plug, User } from "lucide-react";

export default function Settings() {
  const { t } = useI18n();

  return (
    <MainLayout>
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-8">{t.settings?.title || "Settings"}</h1>

        <Tabs defaultValue="integrations">
          <TabsList className="mb-6">
            <TabsTrigger value="integrations" className="gap-2">
              <Plug className="h-4 w-4" />
              {t.settings?.integrations || "Integrations"}
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <User className="h-4 w-4" />
              {t.settings?.account || "Account"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="space-y-6">
            <SwipeHireSettings />
            <AutoSyncSettings />
          </TabsContent>

          <TabsContent value="account">
            <div className="text-center py-12 text-muted-foreground">
              Account settings coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
