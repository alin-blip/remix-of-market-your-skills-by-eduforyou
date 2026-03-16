import { useEffect, useState } from 'react';
import { Cpu, Filter, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatsCard } from '@/components/admin/StatsCard';

interface AIOutputRow {
  id: string;
  tool: string;
  created_at: string | null;
  input_json: unknown;
  output_json: unknown;
  user_id: string | null;
  user_name?: string;
  user_email?: string;
}

const TOOL_LABELS: Record<string, string> = {
  'skill-scanner': 'Skill Scanner',
  'ikigai-builder': 'Ikigai Builder',
  'offer-builder': 'Offer Builder',
  'profile-builder': 'Profile Builder',
  'outreach-generator': 'Outreach Generator',
  'cv-generator': 'CV Generator',
  'gig-generator': 'Gig Generator',
  'gig-platform-generator': 'Gig Platform',
  'dream100-analyzer': 'Dream100 Analyzer',
  'dream100-scanner': 'Dream100 Scanner',
  'outreach-sequence': 'Outreach Sequence',
  'life-os-wizard': 'Life OS Wizard',
  'vision-image-generator': 'Vision Image',
};

export default function AIOutputsManager() {
  const [outputs, setOutputs] = useState<AIOutputRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toolFilter, setToolFilter] = useState('all');
  const [selectedOutput, setSelectedOutput] = useState<AIOutputRow | null>(null);

  useEffect(() => {
    fetchOutputs();
  }, []);

  const fetchOutputs = async () => {
    const { data, error } = await supabase
      .from('ai_outputs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (!error && data && data.length > 0) {
      const userIds = [...new Set(data.map((o) => o.user_id).filter(Boolean))] as string[];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      setOutputs(
        data.map((o) => ({
          ...o,
          user_name: o.user_id ? profileMap.get(o.user_id)?.full_name || undefined : undefined,
          user_email: o.user_id ? profileMap.get(o.user_id)?.email || undefined : undefined,
        }))
      );
    }
    setLoading(false);
  };

  const tools = [...new Set(outputs.map((o) => o.tool))].sort();

  const filtered = outputs.filter((o) => {
    if (toolFilter !== 'all' && o.tool !== toolFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = o.user_name?.toLowerCase() || '';
      const email = o.user_email?.toLowerCase() || '';
      if (!name.includes(q) && !email.includes(q)) return false;
    }
    return true;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Cpu className="h-8 w-8 text-primary" />
            AI Outputs Manager
          </h1>
          <p className="text-muted-foreground">Ce a generat fiecare utilizator cu AI</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard title="Total Generări" value={filtered.length} icon={<Cpu className="h-6 w-6" />} />
          <StatsCard title="Unelte Folosite" value={tools.length} icon={<Cpu className="h-6 w-6" />} />
          <StatsCard
            title="Utilizatori Unici"
            value={new Set(filtered.map((o) => o.user_id)).size}
            icon={<Cpu className="h-6 w-6" />}
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
              <Select value={toolFilter} onValueChange={setToolFilter}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Toate uneltele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate uneltele</SelectItem>
                  {tools.map((t) => (
                    <SelectItem key={t} value={t}>{TOOL_LABELS[t] || t}</SelectItem>
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
                    <TableHead>Unealtă</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Nu există generări AI.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium">{o.profiles?.full_name || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{o.profiles?.email || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{TOOL_LABELS[o.tool] || o.tool}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {o.created_at ? new Date(o.created_at).toLocaleDateString('ro-RO') : '—'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedOutput(o)}>
                            <Eye className="h-4 w-4 mr-1" /> Detalii
                          </Button>
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedOutput} onOpenChange={() => setSelectedOutput(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedOutput && (TOOL_LABELS[selectedOutput.tool] || selectedOutput.tool)} — Detalii
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Input</p>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-48">
                  {JSON.stringify(selectedOutput?.input_json, null, 2)}
                </pre>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Output</p>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-48">
                  {JSON.stringify(selectedOutput?.output_json, null, 2)}
                </pre>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
