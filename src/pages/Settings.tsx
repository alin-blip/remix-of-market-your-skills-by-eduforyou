import { MainLayout } from "@/components/layout/MainLayout";
import { SwipeHireSettings } from "@/components/integrations/SwipeHireSettings";
import { AutoSyncSettings } from "@/components/integrations/AutoSyncSettings";
import { useI18n } from "@/lib/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plug, User, CreditCard, Crown, Loader2, ExternalLink } from "lucide-react";
import { useSubscription, PLAN_LIMITS } from "@/hooks/useSubscription";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { plan, subscribed, subscriptionEnd, isLoading, openCustomerPortal } = useSubscription();

  const planDetails = {
    free: { name: 'Free', color: 'bg-gray-500', icon: '🆓' },
    starter: { name: 'Starter', color: 'bg-blue-500', icon: '⭐' },
    pro: { name: 'Pro', color: 'bg-purple-500', icon: '👑' },
    founder: { name: 'Founder Accelerator', color: 'bg-amber-500', icon: '🚀' },
  };

  const currentPlan = planDetails[plan];

  return (
    <MainLayout>
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-8">{t.settings?.title || "Settings"}</h1>

        <Tabs defaultValue="account">
          <TabsList className="mb-6">
            <TabsTrigger value="account" className="gap-2">
              <User className="h-4 w-4" />
              {t.settings?.account || "Account"}
            </TabsTrigger>
            <TabsTrigger value="subscription" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Subscripție
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Plug className="h-4 w-4" />
              {t.settings?.integrations || "Integrations"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Contul tău</CardTitle>
                <CardDescription>Informații despre contul tău</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="font-medium">{user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">ID Utilizator</label>
                    <p className="font-mono text-sm">{user?.id?.slice(0, 8)}...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            {/* Current Plan Card */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${currentPlan.color} flex items-center justify-center text-2xl`}>
                      {currentPlan.icon}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {currentPlan.name}
                        {subscribed && (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                            Activ
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {subscriptionEnd && plan !== 'founder' ? (
                          `Se reînnoiește: ${new Date(subscriptionEnd).toLocaleDateString('ro-RO')}`
                        ) : plan === 'founder' ? (
                          'Acces pe viață'
                        ) : (
                          'Plan gratuit'
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">
                      {PLAN_LIMITS[plan].platforms === Infinity ? '∞' : PLAN_LIMITS[plan].platforms}
                    </div>
                    <div className="text-xs text-muted-foreground">Platforme</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">
                      {PLAN_LIMITS[plan].gigs === Infinity ? '∞' : PLAN_LIMITS[plan].gigs}
                    </div>
                    <div className="text-xs text-muted-foreground">Gig-uri</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">
                      {PLAN_LIMITS[plan].aiGenerations === Infinity ? '∞' : PLAN_LIMITS[plan].aiGenerations}
                    </div>
                    <div className="text-xs text-muted-foreground">AI/lună</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">
                      {PLAN_LIMITS[plan].hasAllCourses ? '✓' : '✗'}
                    </div>
                    <div className="text-xs text-muted-foreground">Toate cursurile</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {subscribed && plan !== 'free' ? (
                <Button variant="outline" className="gap-2" onClick={openCustomerPortal}>
                  <ExternalLink className="h-4 w-4" />
                  Gestionează Subscripția
                </Button>
              ) : null}
              
              {plan !== 'founder' && (
                <Button 
                  className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  onClick={() => navigate('/pricing')}
                >
                  <Crown className="h-4 w-4" />
                  {plan === 'free' ? 'Upgrade' : 'Schimbă Planul'}
                </Button>
              )}
            </div>

            {/* Manage Subscription Note */}
            {subscribed && plan !== 'free' && (
              <Card className="bg-muted/30">
                <CardContent className="py-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Notă:</strong> Pentru a anula, schimba metoda de plată sau actualiza subscripția, 
                    apasă pe "Gestionează Subscripția" pentru a accesa portalul Stripe.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <SwipeHireSettings />
            <AutoSyncSettings />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}