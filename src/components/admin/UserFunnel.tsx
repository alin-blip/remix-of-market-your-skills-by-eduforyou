import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingDown } from 'lucide-react';

interface FunnelStep {
  label: string;
  count: number;
  color: string;
}

export function UserFunnel() {
  const [steps, setSteps] = useState<FunnelStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFunnel = async () => {
      try {
        const [
          totalRes,
          onboardingRes,
          aiUsersRes,
          offersRes,
          dreamRes,
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('onboarding_completed', true),
          supabase.from('ai_outputs').select('user_id'),
          supabase.from('offers').select('user_id'),
          supabase.from('dream100_targets').select('user_id'),
        ]);

        const uniqueAI = new Set(aiUsersRes.data?.map(r => r.user_id).filter(Boolean)).size;
        const uniqueOffers = new Set(offersRes.data?.map(r => r.user_id).filter(Boolean)).size;
        const uniqueDream = new Set(dreamRes.data?.map(r => r.user_id).filter(Boolean)).size;

        setSteps([
          { label: 'Registered', count: totalRes.count || 0, color: 'hsl(var(--primary))' },
          { label: 'Onboarding Done', count: onboardingRes.count || 0, color: 'hsl(var(--primary) / 0.8)' },
          { label: 'Used AI Tool', count: uniqueAI, color: 'hsl(var(--primary) / 0.6)' },
          { label: 'Created Offer', count: uniqueOffers, color: 'hsl(var(--primary) / 0.4)' },
          { label: 'Dream 100 Started', count: uniqueDream, color: 'hsl(var(--primary) / 0.3)' },
        ]);
      } catch (err) {
        console.error('UserFunnel error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFunnel();
  }, []);

  const maxCount = steps[0]?.count || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          User Activity Funnel
        </CardTitle>
        <CardDescription>Progresul utilizatorilor prin platformă</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64" />
        ) : (
          <div className="space-y-3">
            {steps.map((step, i) => {
              const widthPercent = Math.max((step.count / maxCount) * 100, 8);
              const dropoff = i > 0 ? Math.round(((steps[i - 1].count - step.count) / Math.max(steps[i - 1].count, 1)) * 100) : 0;
              return (
                <div key={step.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{step.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{step.count}</span>
                      {i > 0 && dropoff > 0 && (
                        <span className="text-xs text-destructive">-{dropoff}%</span>
                      )}
                    </div>
                  </div>
                  <div className="h-8 rounded-md overflow-hidden bg-muted">
                    <div
                      className="h-full rounded-md transition-all duration-500"
                      style={{ width: `${widthPercent}%`, backgroundColor: step.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
