import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Mail, CheckCircle, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface EmailStats {
  sent: number;
  failed: number;
  pending: number;
  suppressed: number;
  total: number;
}

export function EmailHealthCard() {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmailStats = async () => {
      try {
        // We need to query via edge function or RPC since email_send_log is service_role only
        // For now, use direct queries which work for admin users with service role
        const [sentRes, failedRes, pendingRes, suppressedRes] = await Promise.all([
          supabase.from('email_send_log').select('id', { count: 'exact', head: true }).eq('status', 'sent'),
          supabase.from('email_send_log').select('id', { count: 'exact', head: true }).in('status', ['failed', 'dlq']),
          supabase.from('email_send_log').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('email_send_log').select('id', { count: 'exact', head: true }).eq('status', 'suppressed'),
        ]);

        const sent = sentRes.count || 0;
        const failed = failedRes.count || 0;
        const pending = pendingRes.count || 0;
        const suppressed = suppressedRes.count || 0;

        setStats({ sent, failed, pending, suppressed, total: sent + failed + pending + suppressed });
      } catch (err) {
        console.error('EmailHealth error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmailStats();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Email Health</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-48" /></CardContent>
      </Card>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Email Health</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Nu sunt date despre emailuri</p></CardContent>
      </Card>
    );
  }

  const failureRate = Math.round((stats.failed / Math.max(stats.total, 1)) * 100);
  const isCritical = failureRate > 30;

  const chartData = [
    { name: 'Sent', value: stats.sent, color: 'hsl(142, 76%, 36%)' },
    { name: 'Failed', value: stats.failed, color: 'hsl(0, 84%, 60%)' },
    { name: 'Pending', value: stats.pending, color: 'hsl(48, 96%, 53%)' },
    { name: 'Suppressed', value: stats.suppressed, color: 'hsl(var(--muted-foreground))' },
  ].filter(d => d.value > 0);

  return (
    <Card className={isCritical ? 'border-destructive/50 bg-destructive/5' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isCritical ? <AlertTriangle className="h-5 w-5 text-destructive" /> : <Mail className="h-5 w-5" />}
          Email Health Monitor
          {isCritical && <Badge variant="destructive" className="ml-2">CRITIC</Badge>}
        </CardTitle>
        <CardDescription>
          {isCritical
            ? `⚠️ Failure rate: ${failureRate}% — necesită atenție imediată!`
            : `Failure rate: ${failureRate}%`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Sent: <strong>{stats.sent}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span>Failed: <strong>{stats.failed}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-yellow-500" />
              <span>Pending: <strong>{stats.pending}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-muted-foreground" />
              <span>Suppressed: <strong>{stats.suppressed}</strong></span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">Total: {stats.total} emailuri</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
