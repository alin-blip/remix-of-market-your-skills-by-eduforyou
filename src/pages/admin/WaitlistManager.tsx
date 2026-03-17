import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Clock, Search, Eye } from 'lucide-react';
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

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: typeof Clock }> = {
  pending: { label: 'În așteptare', variant: 'secondary', icon: Clock },
  approved: { label: 'Aprobat', variant: 'default', icon: CheckCircle2 },
  rejected: { label: 'Respins', variant: 'destructive', icon: XCircle },
};

export default function WaitlistManager() {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<WaitlistApp | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['waitlist', filter, search],
    queryFn: async () => {
      let query = supabase
        .from('waitlist_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as WaitlistApp[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from('waitlist_applications')
        .update({
          status,
          admin_notes: notes || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      toast.success('Status actualizat cu succes!');
      setSelectedApp(null);
    },
    onError: () => {
      toast.error('Eroare la actualizarea statusului.');
    },
  });

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  const openDetail = (app: WaitlistApp) => {
    setSelectedApp(app);
    setAdminNotes(app.admin_notes || '');
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold mb-2">Waitlist Manager</h1>
          <p className="text-muted-foreground">Gestionează aplicațiile din waitlist</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`p-4 rounded-xl border transition-colors text-left ${
                filter === key ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <p className="text-2xl font-bold">{counts[key]}</p>
              <p className="text-sm text-muted-foreground capitalize">
                {key === 'all' ? 'Total' : STATUS_CONFIG[key]?.label}
              </p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută după nume sau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
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
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Se încarcă...
                  </TableCell>
                </TableRow>
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nicio aplicație găsită.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => {
                  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                  return (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.full_name}</TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell>{app.domain || '—'}</TableCell>
                      <TableCell>
                        {app.is_eduforyou_member ? (
                          <Badge variant="default">Da</Badge>
                        ) : (
                          <span className="text-muted-foreground">Nu</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString('ro-RO')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openDetail(app)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {app.status === 'pending' && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-green-500 hover:text-green-400"
                                onClick={() => updateStatus.mutate({ id: app.id, status: 'approved' })}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:text-destructive/80"
                                onClick={() => updateStatus.mutate({ id: app.id, status: 'rejected' })}
                              >
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

        {/* Detail Dialog */}
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalii aplicație</DialogTitle>
            </DialogHeader>
            {selectedApp && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nume</p>
                    <p className="font-medium">{selectedApp.full_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedApp.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Telefon</p>
                    <p className="font-medium">{selectedApp.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Domeniu</p>
                    <p className="font-medium">{selectedApp.domain || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Freelancing</p>
                    <p className="font-medium">{selectedApp.freelance_experience || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Țara</p>
                    <p className="font-medium">{selectedApp.country || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sursă</p>
                    <p className="font-medium">{selectedApp.how_heard || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Eduforyou</p>
                    <p className="font-medium">{selectedApp.is_eduforyou_member ? 'Da' : 'Nu'}</p>
                  </div>
                </div>

                {selectedApp.objective && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Obiectiv</p>
                    <p className="text-sm bg-secondary p-3 rounded-lg">{selectedApp.objective}</p>
                  </div>
                )}

                <div>
                  <p className="text-muted-foreground text-sm mb-1">Note admin</p>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Adaugă note..."
                    className="bg-secondary"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    variant="default"
                    onClick={() =>
                      updateStatus.mutate({
                        id: selectedApp.id,
                        status: 'approved',
                        notes: adminNotes,
                      })
                    }
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Aprobă
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() =>
                      updateStatus.mutate({
                        id: selectedApp.id,
                        status: 'rejected',
                        notes: adminNotes,
                      })
                    }
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Respinge
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
