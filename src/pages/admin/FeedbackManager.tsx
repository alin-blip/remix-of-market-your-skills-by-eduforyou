import { useEffect, useState } from 'react';
import { Star, MessageSquare, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/admin/StatsCard';

interface FeedbackRow {
  id: string;
  step_key: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
}

const STEP_LABELS: Record<string, string> = {
  'skill-scanner': 'Skill Scanner',
  'ikigai-builder': 'Ikigai Builder',
  'offer-builder': 'Offer Builder',
  'profile-builder': 'Profile Builder',
  'outreach-generator': 'Outreach Generator',
  'freedom-plan': 'Freedom Plan',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
}

export default function FeedbackManager() {
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stepFilter, setStepFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    const { data, error } = await supabase
      .from('step_feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      // Fetch profiles for all user_ids
      const userIds = [...new Set(data.map((f) => f.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      setFeedback(
        data.map((f) => ({
          ...f,
          user_name: profileMap.get(f.user_id)?.full_name || undefined,
          user_email: profileMap.get(f.user_id)?.email || undefined,
        }))
      );
    }
    setLoading(false);
  };

  const filtered = feedback.filter((f) => {
    if (stepFilter !== 'all' && f.step_key !== stepFilter) return false;
    if (ratingFilter !== 'all' && f.rating !== Number(ratingFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = f.user_name?.toLowerCase() || '';
      const email = f.user_email?.toLowerCase() || '';
      if (!name.includes(q) && !email.includes(q)) return false;
    }
    return true;
  });

  const avgRating = filtered.length
    ? (filtered.reduce((s, f) => s + f.rating, 0) / filtered.length).toFixed(1)
    : '0';

  const positiveCount = filtered.filter((f) => f.rating >= 4).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            Feedback Manager
          </h1>
          <p className="text-muted-foreground">Toate feedback-urile utilizatorilor din wizard</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard title="Total Feedback" value={filtered.length} icon={<MessageSquare className="h-6 w-6" />} />
          <StatsCard title="Rating Mediu" value={avgRating} icon={<Star className="h-6 w-6" />} />
          <StatsCard
            title="Feedback Pozitiv (4-5★)"
            value={positiveCount}
            icon={<Star className="h-6 w-6" />}
            description={filtered.length ? `${Math.round((positiveCount / filtered.length) * 100)}%` : '0%'}
          />
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" /> Filtre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Input
                placeholder="Caută după nume sau email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
              <Select value={stepFilter} onValueChange={setStepFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Toate etapele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate etapele</SelectItem>
                  {Object.entries(STEP_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Toate ratingurile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate</SelectItem>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <SelectItem key={r} value={String(r)}>{r} ★</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilizator</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comentariu</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nu există feedback-uri.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{f.profiles?.full_name || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{f.profiles?.email || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{STEP_LABELS[f.step_key] || f.step_key}</Badge>
                        </TableCell>
                        <TableCell><StarRating rating={f.rating} /></TableCell>
                        <TableCell className="max-w-xs truncate">{f.comment || '—'}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(f.created_at).toLocaleDateString('ro-RO')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
