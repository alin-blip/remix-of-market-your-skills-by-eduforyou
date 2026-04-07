import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, CheckCircle, XCircle, AlertTriangle, Clock, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface EmailStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  dlq: number;
  suppressed: number;
}

interface EmailLogEntry {
  id: string;
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  created_at: string;
  metadata: any;
}

const PAGE_SIZE = 20;

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
  sent: { label: 'Sent', variant: 'default', icon: CheckCircle },
  failed: { label: 'Failed', variant: 'destructive', icon: XCircle },
  dlq: { label: 'DLQ', variant: 'destructive', icon: XCircle },
  pending: { label: 'Pending', variant: 'secondary', icon: Clock },
  suppressed: { label: 'Suppressed', variant: 'outline', icon: AlertTriangle },
  bounced: { label: 'Bounced', variant: 'destructive', icon: XCircle },
  complained: { label: 'Complained', variant: 'destructive', icon: AlertTriangle },
};

export default function EmailAnalytics() {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [templates, setTemplates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);

  // Filters
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [page, setPage] = useState(0);

  const getStartDate = () => {
    const now = new Date();
    switch (timeRange) {
      case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default: return null;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    setPage(0);
    fetchStats();
    fetchLogs(0);
  }, [timeRange, statusFilter, templateFilter]);

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('email_send_log')
      .select('template_name')
      .order('template_name');
    
    if (data) {
      const unique = [...new Set(data.map(d => d.template_name))].filter(Boolean);
      setTemplates(unique);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      let query = supabase.from('email_send_log').select('status, message_id, created_at');
      const startDate = getStartDate();
      if (startDate) query = query.gte('created_at', startDate);
      if (templateFilter !== 'all') query = query.eq('template_name', templateFilter);

      const { data } = await query.order('created_at', { ascending: false });
      
      if (data) {
        // Deduplicate by message_id - keep latest status
        const seen = new Map<string, string>();
        const deduped: { status: string }[] = [];
        
        for (const row of data) {
          const key = row.message_id || row.status + row.created_at;
          if (!seen.has(key)) {
            seen.set(key, row.status);
            deduped.push({ status: row.status });
          }
        }

        const counts: EmailStats = { total: deduped.length, sent: 0, failed: 0, pending: 0, dlq: 0, suppressed: 0 };
        for (const row of deduped) {
          if (row.status === 'sent') counts.sent++;
          else if (row.status === 'failed') counts.failed++;
          else if (row.status === 'pending') counts.pending++;
          else if (row.status === 'dlq') counts.dlq++;
          else if (row.status === 'suppressed') counts.suppressed++;
        }
        setStats(counts);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (pageNum: number) => {
    setLogsLoading(true);
    try {
      let query = supabase
        .from('email_send_log')
        .select('*')
        .order('created_at', { ascending: false });
      
      const startDate = getStartDate();
      if (startDate) query = query.gte('created_at', startDate);
      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      if (templateFilter !== 'all') query = query.eq('template_name', templateFilter);

      query = query.range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      const { data } = await query;

      if (data) {
        // Deduplicate by message_id
        const seen = new Set<string>();
        const deduped = data.filter(row => {
          const key = row.message_id || row.id;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setLogs(deduped);
      }
    } finally {
      setLogsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchLogs(newPage);
  };

  const failureRate = stats ? Math.round(((stats.failed + stats.dlq) / Math.max(stats.total, 1)) * 100) : 0;

  const StatusBadge = ({ status }: { status: string }) => {
    const config = statusConfig[status] || { label: status, variant: 'outline' as const, icon: Clock };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Email Analytics</h1>
            <p className="text-sm text-muted-foreground">Detailed email delivery logs and statistics</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Time Range</label>
                <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="dlq">DLQ</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suppressed">Suppressed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Template</label>
                <Select value={templateFilter} onValueChange={setTemplateFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All templates</SelectItem>
                    {templates.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-4"><Skeleton className="h-16" /></CardContent></Card>
            ))
          ) : stats ? (
            <>
              <Card>
                <CardContent className="pt-4 text-center">
                  <Mail className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Emails</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-500" />
                  <p className="text-2xl font-bold text-green-500">{stats.sent}</p>
                  <p className="text-xs text-muted-foreground">Sent</p>
                </CardContent>
              </Card>
              <Card className={failureRate > 30 ? 'border-destructive/50 bg-destructive/5' : ''}>
                <CardContent className="pt-4 text-center">
                  <XCircle className="h-5 w-5 mx-auto mb-1 text-destructive" />
                  <p className="text-2xl font-bold text-destructive">{stats.failed + stats.dlq}</p>
                  <p className="text-xs text-muted-foreground">Failed ({failureRate}%)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-bold text-primary">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                  <p className="text-2xl font-bold text-yellow-500">{stats.suppressed}</p>
                  <p className="text-xs text-muted-foreground">Suppressed</p>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {/* Email Log Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Email Log</CardTitle>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No emails found for the selected filters.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Template</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {log.template_name}
                            </code>
                          </TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">
                            {log.recipient_email}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={log.status} />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(log.created_at), 'dd MMM yyyy HH:mm')}
                          </TableCell>
                          <TableCell className="text-xs text-destructive max-w-[250px] truncate">
                            {log.error_message || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-muted-foreground">
                    Page {page + 1} · Showing {logs.length} results
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => handlePageChange(page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={logs.length < PAGE_SIZE}
                      onClick={() => handlePageChange(page + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
