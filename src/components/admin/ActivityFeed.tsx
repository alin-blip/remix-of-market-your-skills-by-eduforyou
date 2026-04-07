import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Activity, Cpu } from 'lucide-react';

interface ActivityItem {
  id: string;
  tool: string;
  created_at: string;
  user_name: string;
  user_email: string;
}

const TOOL_LABELS: Record<string, string> = {
  'offer-builder': 'Offer Builder',
  'profile-builder': 'Profile Builder',
  'ikigai-builder': 'Ikigai Builder',
  'skill-scanner': 'Skill Scanner',
  'life-os-wizard': 'Life OS',
  'outreach-generator': 'Outreach',
  'gig-generator': 'Gig Generator',
  'cv-generator': 'CV Generator',
  'dream100-analyzer': 'Dream 100',
};

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data: outputs } = await supabase
          .from('ai_outputs')
          .select('id, tool, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(20);

        if (!outputs?.length) { setActivities([]); setLoading(false); return; }

        const userIds = [...new Set(outputs.map(o => o.user_id).filter(Boolean))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        setActivities(outputs.map(o => {
          const profile = profileMap.get(o.user_id || '');
          return {
            id: o.id,
            tool: o.tool,
            created_at: o.created_at || '',
            user_name: profile?.full_name || 'Unknown',
            user_email: profile?.email || '',
          };
        }));
      } catch (err) {
        console.error('ActivityFeed error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity Feed
        </CardTitle>
        <CardDescription>Ultimele 20 acțiuni AI pe platformă</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nicio activitate recentă</p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {activities.map(a => (
              <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <Cpu className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium truncate">{a.user_name}</span>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {TOOL_LABELS[a.tool] || a.tool}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">{timeAgo(a.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
