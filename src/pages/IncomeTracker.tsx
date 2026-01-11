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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Plus,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank,
  Loader2,
  Trophy,
  Flame
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface IncomeRecord {
  id: string;
  platform: string;
  amount: number;
  currency: string;
  description: string;
  client_name: string;
  payment_date: string;
  payment_status: string;
}

const platforms = [
  { value: 'swipehire', label: 'SwipeHire', color: 'bg-purple-500' },
  { value: 'fiverr', label: 'Fiverr', color: 'bg-green-500' },
  { value: 'upwork', label: 'Upwork', color: 'bg-emerald-500' },
  { value: 'freelancer', label: 'Freelancer.com', color: 'bg-blue-500' },
  { value: 'other', label: 'Altele', color: 'bg-gray-500' },
];

const milestones = [
  { amount: 100, label: 'Primul €100', icon: '🎯' },
  { amount: 500, label: 'First €500', icon: '🚀' },
  { amount: 1000, label: '€1K Club', icon: '💎' },
  { amount: 5000, label: '€5K Achiever', icon: '🏆' },
  { amount: 10000, label: '€10K Pro', icon: '👑' },
];

export default function IncomeTracker() {
  const { user } = useAuth();
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    platform: 'swipehire',
    amount: '',
    currency: 'EUR',
    description: '',
    client_name: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    payment_status: 'completed',
  });

  useEffect(() => {
    if (user) {
      fetchIncomeRecords();
    }
  }, [user]);

  const fetchIncomeRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('freelance_income')
        .select('*')
        .eq('user_id', user?.id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setIncomeRecords(data || []);
    } catch (error) {
      console.error('Error fetching income:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIncome = async () => {
    if (!formData.amount || !formData.platform) {
      toast.error('Completează suma și platforma');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('freelance_income')
        .insert({
          user_id: user?.id,
          platform: formData.platform,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          description: formData.description,
          client_name: formData.client_name,
          payment_date: formData.payment_date,
          payment_status: formData.payment_status,
        });

      if (error) throw error;

      toast.success('Venit adăugat cu succes!');
      setShowAddDialog(false);
      setFormData({
        platform: 'swipehire',
        amount: '',
        currency: 'EUR',
        description: '',
        client_name: '',
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        payment_status: 'completed',
      });
      fetchIncomeRecords();
    } catch (error: any) {
      toast.error(error.message || 'Eroare la adăugarea venitului');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate statistics
  const totalIncome = incomeRecords.reduce((sum, r) => sum + Number(r.amount), 0);
  
  const thisMonthStart = startOfMonth(new Date());
  const thisMonthEnd = endOfMonth(new Date());
  const thisMonthIncome = incomeRecords
    .filter(r => {
      const date = new Date(r.payment_date);
      return date >= thisMonthStart && date <= thisMonthEnd;
    })
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
  const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
  const lastMonthIncome = incomeRecords
    .filter(r => {
      const date = new Date(r.payment_date);
      return date >= lastMonthStart && date <= lastMonthEnd;
    })
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const monthlyChange = lastMonthIncome > 0 
    ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome * 100).toFixed(1)
    : thisMonthIncome > 0 ? '100' : '0';

  // Chart data
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const monthIncome = incomeRecords
      .filter(r => {
        const d = new Date(r.payment_date);
        return d >= monthStart && d <= monthEnd;
      })
      .reduce((sum, r) => sum + Number(r.amount), 0);
    
    return {
      month: format(date, 'MMM'),
      income: monthIncome,
    };
  });

  // Platform breakdown
  const platformBreakdown = platforms.map(p => ({
    ...p,
    amount: incomeRecords
      .filter(r => r.platform === p.value)
      .reduce((sum, r) => sum + Number(r.amount), 0),
  })).filter(p => p.amount > 0);

  // Current milestone
  const currentMilestone = milestones.filter(m => totalIncome >= m.amount).pop();
  const nextMilestone = milestones.find(m => totalIncome < m.amount);
  const milestoneProgress = nextMilestone 
    ? (totalIncome / nextMilestone.amount * 100).toFixed(0)
    : 100;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                <Wallet className="h-7 w-7 text-green-500" />
              </div>
              Income Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              Urmărește veniturile din freelancing pe toate platformele
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Adaugă Venit
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Câștigat</p>
                    <p className="text-3xl font-bold text-green-500">
                      €{totalIncome.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-500/20">
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Luna aceasta</p>
                    <p className="text-3xl font-bold">€{thisMonthIncome.toLocaleString()}</p>
                    <div className={`flex items-center gap-1 text-sm mt-1 ${
                      Number(monthlyChange) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {Number(monthlyChange) >= 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {monthlyChange}% vs luna trecută
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Clienți</p>
                    <p className="text-3xl font-bold">
                      {new Set(incomeRecords.map(r => r.client_name).filter(Boolean)).size}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <Target className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Proiecte</p>
                    <p className="text-3xl font-bold">{incomeRecords.length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/10">
                    <Calendar className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Milestone Progress */}
        {nextMilestone && (
          <Card className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-background border-amber-500/20">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{nextMilestone.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Următorul milestone: {nextMilestone.label}</span>
                    <span className="text-sm text-muted-foreground">
                      €{totalIncome.toLocaleString()} / €{nextMilestone.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${milestoneProgress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  {milestoneProgress}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Evoluție Venituri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`€${value}`, 'Venit']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      stroke="hsl(var(--primary))" 
                      fill="url(#incomeGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Platform Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Per Platformă</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {platformBreakdown.length > 0 ? (
                platformBreakdown.map((platform) => (
                  <div key={platform.value} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{platform.label}</span>
                        <span className="text-sm text-muted-foreground">
                          €{platform.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                        <div 
                          className={`h-full ${platform.color}`}
                          style={{ width: `${(platform.amount / totalIncome * 100).toFixed(0)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Niciun venit înregistrat încă
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Tranzacții Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {incomeRecords.length > 0 ? (
              <div className="space-y-3">
                {incomeRecords.slice(0, 10).map((record) => {
                  const platform = platforms.find(p => p.value === record.platform);
                  return (
                    <div 
                      key={record.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${platform?.color || 'bg-gray-500'}`} />
                        <div>
                          <p className="font-medium text-sm">
                            {record.description || record.client_name || 'Venit'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {platform?.label} • {format(new Date(record.payment_date), 'dd MMM yyyy')}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-green-500">
                        +€{Number(record.amount).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <PiggyBank className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Niciun venit înregistrat încă</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setShowAddDialog(true)}
                >
                  Adaugă primul venit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Income Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adaugă Venit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platformă</Label>
                  <Select 
                    value={formData.platform} 
                    onValueChange={(v) => setFormData(p => ({ ...p, platform: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map(p => (
                        <SelectItem key={p.value} value={p.value}>
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${p.color}`} />
                            {p.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data plății</Label>
                  <Input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData(p => ({ ...p, payment_date: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sumă</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monedă</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(v) => setFormData(p => ({ ...p, currency: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="RON">RON (lei)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Client</Label>
                <Input
                  placeholder="Numele clientului"
                  value={formData.client_name}
                  onChange={(e) => setFormData(p => ({ ...p, client_name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Descriere</Label>
                <Input
                  placeholder="ex: Website redesign"
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowAddDialog(false)}>
                Anulează
              </Button>
              <Button onClick={handleAddIncome} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Adaugă
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
