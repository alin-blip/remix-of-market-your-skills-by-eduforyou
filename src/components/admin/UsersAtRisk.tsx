import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle } from 'lucide-react';

interface AtRiskUser {
  id: string;
  full_name: string;
  email: string;
  lastActivity: string;
  daysInactive: number;
}

export function UsersAtRisk() {
  const [users, setUsers] = useState<AtRiskUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsersAtRisk = async () => {
      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email, updated_at, created_at');

        if (!profiles?.length) { setLoading(false); return; }

        // Get latest AI activity per user
        const { data: aiOutputs } = await supabase
          .from('ai_outputs')
          .select('user_id, created_at')
          .order('created_at', { ascending: false });

        const latestAI = new Map<string, string>();
        aiOutputs?.forEach(o => {
          if (o.user_id && !latestAI.has(o.user_id)) {
            latestAI.set(o.user_id, o.created_at || '');
          }
        });

        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;

        const atRisk: AtRiskUser[] = profiles
          .map(p => {
            const aiDate = latestAI.get(p.id) || '';
            const profileDate = p.updated_at || p.created_at || '';
            const latest = aiDate > profileDate ? aiDate : profileDate;
            const diff = now - new Date(latest).getTime();
            return {
              id: p.id,
              full_name: p.full_name || 'N/A',
              email: p.email || '',
              lastActivity: latest,
              daysInactive: Math.floor(diff / (24 * 60 * 60 * 1000)),
            };
          })
          .filter(u => u.daysInactive >= 7 && !u.email.includes('@rowarrior') && !u.email.includes('@eduforyou'))
          .sort((a, b) => b.daysInactive - a.daysInactive)
          .slice(0, 15);

        setUsers(atRisk);
      } catch (err) {
        console.error('UsersAtRisk error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsersAtRisk();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Users at Risk
          {users.length > 0 && (
            <Badge variant="outline" className="ml-2 text-orange-500 border-orange-500">
              {users.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Utilizatori inactivi de 7+ zile</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-48" />
        ) : users.length === 0 ? (
          <p className="text-muted-foreground text-sm">Toți utilizatorii sunt activi 🎉</p>
        ) : (
          <div className="max-h-[350px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nume</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ultima activitate</TableHead>
                  <TableHead>Zile inactiv</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="text-sm">
                      {u.lastActivity ? new Date(u.lastActivity).toLocaleDateString('ro-RO') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.daysInactive > 30 ? 'destructive' : 'outline'} className={u.daysInactive > 30 ? '' : 'text-orange-500 border-orange-500'}>
                        {u.daysInactive}d
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
