import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  PoundSterling, TrendingUp, Plus, Calendar, Handshake, ArrowUpRight, ArrowDownRight,
  Wallet, Loader2, Award, Percent
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CommissionRecord {
  id: string;
  platform: string;
  amount: number;
  currency: string;
  description: string;
  client_name: string;
  payment_date: string;
  payment_status: string;
  partner_id?: string | null;
  referrals_count?: number | null;
  commission_pct?: number | null;
  commission_fixed?: number | null;
  revenue_attributed?: number | null;
  payout_status?: string | null;
}

interface Partner {
  id: string;
  name: string;
  company?: string | null;
  commission_pct?: number | null;
  commission_fixed?: number | null;
  commission_currency?: string | null;
}

const PAYOUT_STATUSES = [
  { v: 'pending', l: 'Pending' },
  { v: 'invoiced', l: 'Invoiced' },
  { v: 'paid', l: 'Paid' },
];

export default function CommissionTracker() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const [records, setRecords] = useState<CommissionRecord[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    partner_id: '',
    amount: '',
    currency: 'GBP',
    description: '',
    client_name: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    referrals_count: '1',
    commission_pct: '',
    commission_fixed: '',
    revenue_attributed: '',
    payout_status: 'pending',
  });

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [{ data: incomeData }, { data: partnerData }] = await Promise.all([
        supabase.from('freelance_income').select('*').eq('user_id', user?.id).order('payment_date', { ascending: false }),
        supabase.from('clients').select('id, name, company, commission_pct, commission_fixed, commission_currency').eq('user_id', user?.id),
      ]);
      setRecords(incomeData || []);
      setPartners((partnerData as Partner[]) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.amount) {
      toast.error(locale === 'ro' ? 'Completează suma' : 'Fill in the amount');
      return;
    }
    setIsSaving(true);
    try {
      const partner = partners.find(p => p.id === formData.partner_id);
      const { error } = await supabase.from('freelance_income').insert({
        user_id: user?.id,
        platform: partner?.company || partner?.name || 'direct',
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        description: formData.description,
        client_name: formData.client_name || partner?.name || '',
        payment_date: formData.payment_date,
        payment_status: 'completed',
        partner_id: formData.partner_id || null,
        referrals_count: parseInt(formData.referrals_count) || 1,
        commission_pct: formData.commission_pct ? parseFloat(formData.commission_pct) : null,
        commission_fixed: formData.commission_fixed ? parseFloat(formData.commission_fixed) : null,
        revenue_attributed: formData.revenue_attributed ? parseFloat(formData.revenue_attributed) : null,
        payout_status: formData.payout_status,
      } as any);
      if (error) throw error;
      toast.success(locale === 'ro' ? 'Comision adăugat!' : 'Commission added!');
      setShowAddDialog(false);
      setFormData({
        partner_id: '', amount: '', currency: 'GBP', description: '', client_name: '',
        payment_date: format(new Date(), 'yyyy-MM-dd'), referrals_count: '1',
        commission_pct: '', commission_fixed: '', revenue_attributed: '', payout_status: 'pending',
      });
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Error');
    } finally {
      setIsSaving(false);
    }
  };

  // Stats
  const totalCommission = records.reduce((s, r) => s + Number(r.amount), 0);
  const totalRevenueAttributed = records.reduce((s, r) => s + Number(r.revenue_attributed || 0), 0);
  const totalReferrals = records.reduce((s, r) => s + Number(r.referrals_count || 0), 0);
  const pendingAmount = records.filter(r => r.payout_status === 'pending').reduce((s, r) => s + Number(r.amount), 0);

  const thisMonthStart = startOfMonth(new Date());
  const thisMonth = records.filter(r => new Date(r.payment_date) >= thisMonthStart).reduce((s, r) => s + Number(r.amount), 0);
  const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
  const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
  const lastMonth = records.filter(r => {
    const d = new Date(r.payment_date);
    return d >= lastMonthStart && d <= lastMonthEnd;
  }).reduce((s, r) => s + Number(r.amount), 0);
  const monthlyChange = lastMonth > 0 ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) : thisMonth > 0 ? '100' : '0';

  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i);
    const ms = startOfMonth(d), me = endOfMonth(d);
    const v = records.filter(r => {
      const dt = new Date(r.payment_date);
      return dt >= ms && dt <= me;
    }).reduce((s, r) => s + Number(r.amount), 0);
    return { month: format(d, 'MMM'), commission: v };
  });

  // Per-partner breakdown
  const partnerBreakdown = partners.map(p => {
    const partnerRecords = records.filter(r => r.partner_id === p.id);
    return {
      ...p,
      total: partnerRecords.reduce((s, r) => s + Number(r.amount), 0),
      referrals: partnerRecords.reduce((s, r) => s + Number(r.referrals_count || 0), 0),
      revenue: partnerRecords.reduce((s, r) => s + Number(r.revenue_attributed || 0), 0),
      count: partnerRecords.length,
    };
  }).filter(p => p.total > 0).sort((a, b) => b.total - a.total);

  if (isLoading) {
    return <MainLayout><div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></MainLayout>;
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                <Wallet className="h-7 w-7 text-amber-500" />
              </div>
              {locale === 'ro' ? 'Commission Tracker' : 'Commission Tracker'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {locale === 'ro'
                ? 'Urmărește comisioanele câștigate, referrals și payout-urile per partener.'
                : 'Track earned commissions, referrals and payouts per partner.'}
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {locale === 'ro' ? 'Adaugă comision' : 'Add commission'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{locale === 'ro' ? 'Total comision' : 'Total commission'}</p>
                    <p className="text-3xl font-bold text-amber-500">£{totalCommission.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/20"><Award className="h-6 w-6 text-amber-500" /></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{locale === 'ro' ? 'Luna aceasta' : 'This month'}</p>
                    <p className="text-3xl font-bold">£{thisMonth.toLocaleString()}</p>
                    <div className={`flex items-center gap-1 text-sm mt-1 ${Number(monthlyChange) >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                      {Number(monthlyChange) >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {monthlyChange}% {locale === 'ro' ? 'vs luna trecută' : 'vs last month'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10"><TrendingUp className="h-6 w-6 text-primary" /></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{locale === 'ro' ? 'Referrals total' : 'Total referrals'}</p>
                    <p className="text-3xl font-bold">{totalReferrals}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      £{totalRevenueAttributed.toLocaleString()} {locale === 'ro' ? 'venit atribuit' : 'attributed revenue'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/10"><Handshake className="h-6 w-6 text-blue-500" /></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{locale === 'ro' ? 'În așteptare' : 'Pending payout'}</p>
                    <p className="text-3xl font-bold text-orange-500">£{pendingAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-500/10"><Calendar className="h-6 w-6 text-orange-500" /></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>{locale === 'ro' ? 'Evoluție comisioane' : 'Commission trend'}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(v: number) => [`£${v}`, locale === 'ro' ? 'Comision' : 'Commission']}
                    />
                    <Area type="monotone" dataKey="commission" stroke="hsl(var(--primary))" fill="url(#commGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Per-Partner Breakdown */}
          <Card>
            <CardHeader><CardTitle>{locale === 'ro' ? 'Per partener' : 'Per partner'}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {partnerBreakdown.length > 0 ? partnerBreakdown.slice(0, 6).map(p => (
                <div key={p.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate">{p.company || p.name}</span>
                    <span className="text-sm font-bold text-amber-500">£{p.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{p.referrals} referrals</span>
                    <span>{p.count} payouts</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                      style={{ width: `${(p.total / totalCommission * 100).toFixed(0)}%` }} />
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {locale === 'ro' ? 'Niciun comision atribuit unui partener încă' : 'No commission attributed to a partner yet'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent */}
        <Card>
          <CardHeader><CardTitle>{locale === 'ro' ? 'Tranzacții recente' : 'Recent transactions'}</CardTitle></CardHeader>
          <CardContent>
            {records.length > 0 ? (
              <div className="space-y-3">
                {records.slice(0, 10).map(r => {
                  const partner = partners.find(p => p.id === r.partner_id);
                  return (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <div>
                          <p className="font-medium text-sm">
                            {r.description || r.client_name || (locale === 'ro' ? 'Comision' : 'Commission')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {partner ? `${partner.company || partner.name} • ` : ''}
                            {format(new Date(r.payment_date), 'dd MMM yyyy')}
                            {r.referrals_count ? ` • ${r.referrals_count} referrals` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-amber-500 block">+£{Number(r.amount).toLocaleString()}</span>
                        <Badge variant="outline" className="text-xs mt-1">
                          {PAYOUT_STATUSES.find(s => s.v === r.payout_status)?.l || 'pending'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  {locale === 'ro' ? 'Niciun comision înregistrat încă' : 'No commission recorded yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{locale === 'ro' ? 'Adaugă comision' : 'Add commission'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{locale === 'ro' ? 'Partener' : 'Partner'}</Label>
                <Select value={formData.partner_id} onValueChange={(v) => {
                  const p = partners.find(pp => pp.id === v);
                  setFormData({
                    ...formData,
                    partner_id: v,
                    commission_pct: p?.commission_pct?.toString() || formData.commission_pct,
                    commission_fixed: p?.commission_fixed?.toString() || formData.commission_fixed,
                    currency: p?.commission_currency || formData.currency,
                  });
                }}>
                  <SelectTrigger><SelectValue placeholder={locale === 'ro' ? 'Selectează partener' : 'Select partner'} /></SelectTrigger>
                  <SelectContent>
                    {partners.map(p => <SelectItem key={p.id} value={p.id}>{p.company || p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{locale === 'ro' ? 'Sumă comision *' : 'Commission *'}</Label>
                  <Input type="number" step="0.01" value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{locale === 'ro' ? 'Monedă' : 'Currency'}</Label>
                  <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">GBP £</SelectItem>
                      <SelectItem value="EUR">EUR €</SelectItem>
                      <SelectItem value="USD">USD $</SelectItem>
                      <SelectItem value="RON">RON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{locale === 'ro' ? 'Data plății' : 'Payment date'}</Label>
                  <Input type="date" value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Handshake className="h-3 w-3" /> Referrals</Label>
                  <Input type="number" value={formData.referrals_count}
                    onChange={(e) => setFormData({ ...formData, referrals_count: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Percent className="h-3 w-3" /> %</Label>
                  <Input type="number" step="0.1" value={formData.commission_pct}
                    onChange={(e) => setFormData({ ...formData, commission_pct: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><PoundSterling className="h-3 w-3" /> Fix</Label>
                  <Input type="number" step="0.01" value={formData.commission_fixed}
                    onChange={(e) => setFormData({ ...formData, commission_fixed: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{locale === 'ro' ? 'Venit atribuit' : 'Revenue attributed'}</Label>
                  <Input type="number" placeholder="e.g. 5000" value={formData.revenue_attributed}
                    onChange={(e) => setFormData({ ...formData, revenue_attributed: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{locale === 'ro' ? 'Status payout' : 'Payout status'}</Label>
                  <Select value={formData.payout_status} onValueChange={(v) => setFormData({ ...formData, payout_status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYOUT_STATUSES.map(s => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{locale === 'ro' ? 'Descriere' : 'Description'}</Label>
                <Input value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                {locale === 'ro' ? 'Anulează' : 'Cancel'}
              </Button>
              <Button onClick={handleAdd} disabled={isSaving || !formData.amount}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (locale === 'ro' ? 'Salvează' : 'Save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
