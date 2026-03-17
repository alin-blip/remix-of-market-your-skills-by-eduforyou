import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Clock, Search, Eye, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { toast } from 'sonner';

type WaitlistApp = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  domain: string | null;
  freelance_experience: string | null;
  objective: string | null;
  country: string | null;
  how_heard: string | null;
  is_eduforyou_member: boolean | null;
  status: string;
  admin_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
};

const PAGE_SIZE = 50;

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: typeof Clock }> = {
  pending: { label: 'În așteptare', variant: 'secondary', icon: Clock },
  approved: { label: 'Aprobat', variant: 'default', icon: CheckCircle2 },
  rejected: { label: 'Respins', variant: 'destructive', icon: XCircle },
};

export default function WaitlistManager() {
  const [filter, setFilter] = useState<string>('all');
  const [eduFilter, setEduFilter] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedApp, setSelectedApp] = useState<WaitlistApp | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Count query
  const { data: totalCount = 0 } = useQuery({
    queryKey: ['waitlist-count', filter, search, eduFilter],
    queryFn: async () => {
      let query = supabase
        .from('waitlist_applications')
        .select('*', { count: 'exact', head: true });

      if (filter !== 'all') query = query.eq('status', filter);
      if (eduFilter) query = query.eq('is_eduforyou_member', true);
      if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

      const { count, error } = await query;
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['waitlist', filter, search, page, eduFilter],
    queryFn: async () => {
      let query = supabase
        .from('waitlist_applications')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (filter !== 'all') query = query.eq('status', filter);
      if (eduFilter) query = query.eq('is_eduforyou_member', true);
      if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data as WaitlistApp[];
    },
  });

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from('waitlist_applications')
        .update({ status, admin_notes: notes || null, reviewed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist-count'] });
      toast.success('Status actualizat!');
      setSelectedApp(null);
    },
    onError: () => toast.error('Eroare la actualizare.'),
  });

  const bulkApprove = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('waitlist_applications')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist-count'] });
      setSelectedIds(new Set());
      toast.success('Aplicanții selectați au fost aprobați!');
    },
    onError: () => toast.error('Eroare la aprobare.'),
  });

  const bulkApproveAll = useMutation({
    mutationFn: async () => {
      let query = supabase
        .from('waitlist_applications')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('status', 'pending');
      if (eduFilter) query = query.eq('is_eduforyou_member', true);
      if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist-count'] });
      setSelectedIds(new Set());
      toast.success('Toți aplicanții pending au fost aprobați!');
    },
    onError: () => toast.error('Eroare la aprobare.'),
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === applications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applications.map((a) => a.id)));
    }
  };

  const pendingSelected = applications.filter((a) => selectedIds.has(a.id) && a.status === 'pending');

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold mb-2">Waitlist Manager</h1>
          <p className="text-muted-foreground">
            {totalCount} aplicații totale • Pagina {page + 1} din {totalPages || 1}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((key) => (
            <button
              key={key}
              onClick={() => { setFilter(key); setPage(0); }}
              className={`p-4 rounded-xl border transition-colors text-left ${
                filter === key ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <p className="text-2xl font-bold">
                {key === 'all' ? totalCount : '—'}
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                {key === 'all' ? 'Total' : STATUS_CONFIG[key]?.label}
              </p>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută după nume sau email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-10 bg-secondary"
            />
          </div>
          <Button
            variant={eduFilter ? 'default' : 'outline'}
            onClick={() => { setEduFilter(!eduFilter); setPage(0); }}
            size="sm"
          >
            <Users className="h-4 w-4 mr-1" />
            Eduforyou
          </Button>
          {pendingSelected.length > 0 && (
            <Button
              onClick={() => bulkApprove.mutate(pendingSelected.map((a) => a.id))}
              size="sm"
              className="gradient-accent text-accent-foreground"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Aprobă selectate ({pendingSelected.length})
            </Button>
          )}
          {filter === 'pending' && (
            <Button
              onClick={() => bulkApproveAll.mutate()}
              size="sm"
              variant="outline"
              className="border-primary text-primary"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Aprobă toate pending
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={applications.length > 0 && selectedIds.size === applications.length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Nume</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Domeniu</TableHead>
                <TableHead>Eduforyou</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Se încarcă...</TableCell>
                </TableRow>
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nicio aplicație găsită.</TableCell>
                </TableRow>
              ) : (
                applications.map((app) => {
                  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                  return (
                    <TableRow key={app.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(app.id)}
                          onCheckedChange={() => toggleSelect(app.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{app.full_name}</TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell>{app.domain || '—'}</TableCell>
                      <TableCell>
                        {app.is_eduforyou_member ? <Badge variant="default">Da</Badge> : <span className="text-muted-foreground">Nu</span>}
                      </TableCell>
                      <TableCell><Badge variant={cfg.variant}>{cfg.label}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString('ro-RO')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => { setSelectedApp(app); setAdminNotes(app.admin_notes || ''); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {app.status === 'pending' && (
                            <>
                              <Button size="icon" variant="ghost" className="text-green-500 hover:text-green-400"
                                onClick={() => updateStatus.mutate({ id: app.id, status: 'approved' })}>
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive/80"
                                onClick={() => updateStatus.mutate({ id: app.id, status: 'rejected' })}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} din {totalCount}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalii aplicație</DialogTitle>
            </DialogHeader>
            {selectedApp && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['Nume', selectedApp.full_name],
                    ['Email', selectedApp.email],
                    ['Telefon', selectedApp.phone],
                    ['Domeniu', selectedApp.domain],
                    ['Freelancing', selectedApp.freelance_experience],
                    ['Țara', selectedApp.country],
                    ['Sursă', selectedApp.how_heard],
                    ['Eduforyou', selectedApp.is_eduforyou_member ? 'Da' : 'Nu'],
                  ].map(([label, val]) => (
                    <div key={label as string}>
                      <p className="text-muted-foreground">{label}</p>
                      <p className="font-medium">{(val as string) || '—'}</p>
                    </div>
                  ))}
                </div>

                {selectedApp.objective && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Obiectiv</p>
                    <p className="text-sm bg-secondary p-3 rounded-lg">{selectedApp.objective}</p>
                  </div>
                )}

                <div>
                  <p className="text-muted-foreground text-sm mb-1">Note admin</p>
                  <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Adaugă note..." className="bg-secondary" />
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" variant="default"
                    onClick={() => updateStatus.mutate({ id: selectedApp.id, status: 'approved', notes: adminNotes })}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Aprobă
                  </Button>
                  <Button className="flex-1" variant="destructive"
                    onClick={() => updateStatus.mutate({ id: selectedApp.id, status: 'rejected', notes: adminNotes })}>
                    <XCircle className="h-4 w-4 mr-2" /> Respinge
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
