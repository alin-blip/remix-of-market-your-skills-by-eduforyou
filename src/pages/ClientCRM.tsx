import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';
import { formatDistanceToNow, isPast, isToday } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';
import {
  Handshake, Plus, Search, Mail, Phone, Building2, Bell, CheckCircle2,
  Clock, AlertTriangle, Edit, Trash2, Percent, PoundSterling, Award,
  UserPlus, Target, FileSignature
} from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
  status: string;
  source?: string | null;
  partner_type?: string | null;
  commission_pct?: number | null;
  commission_fixed?: number | null;
  commission_currency?: string | null;
  contract_status?: string | null;
  performance_bonus_json?: any;
  last_contact_at?: string | null;
  next_followup_at?: string | null;
  created_at: string;
}

interface FollowupReminder {
  id: string;
  client_id: string;
  title: string;
  notes?: string | null;
  reminder_date: string;
  is_completed: boolean;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  lead: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  prospect: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
  active: { bg: 'bg-green-500/10', text: 'text-green-500' },
  inactive: { bg: 'bg-gray-500/10', text: 'text-gray-500' },
  lost: { bg: 'bg-red-500/10', text: 'text-red-500' },
};

const PARTNER_TYPES = [
  { v: 'affiliate', l: 'Affiliate (% commission)' },
  { v: 'referral', l: 'Referral (fixed fee)' },
  { v: 'jv', l: 'Joint Venture (rev share + bonus)' },
  { v: 'white_label', l: 'White Label' },
  { v: 'strategic', l: 'Strategic Alliance' },
];

const CONTRACT_STATUSES = [
  { v: 'none', l: 'No contract yet' },
  { v: 'draft', l: 'Draft sent' },
  { v: 'negotiating', l: 'Negotiating' },
  { v: 'signed', l: 'Signed' },
  { v: 'live', l: 'Live & active' },
];

export default function PartnerCRM() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const queryClient = useQueryClient();
  const dateLocale = locale === 'ro' ? ro : enUS;

  const statusLabels: Record<string, string> = {
    lead: locale === 'ro' ? 'Lead' : 'Lead',
    prospect: locale === 'ro' ? 'În discuție' : 'In conversation',
    active: locale === 'ro' ? 'Partener activ' : 'Active partner',
    inactive: locale === 'ro' ? 'Inactiv' : 'Inactive',
    lost: locale === 'ro' ? 'Pierdut' : 'Lost',
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showPartnerDialog, setShowPartnerDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const [partnerForm, setPartnerForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
    status: 'lead',
    source: '',
    partner_type: 'affiliate',
    commission_pct: '',
    commission_fixed: '',
    commission_currency: 'GBP',
    contract_status: 'none',
    performance_bonus: '',
  });

  const [reminderForm, setReminderForm] = useState({
    title: '',
    notes: '',
    reminder_date: '',
  });

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['partners', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Partner[];
    },
    enabled: !!user?.id,
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['followup-reminders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('followup_reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('reminder_date', { ascending: true });
      if (error) throw error;
      return data as FollowupReminder[];
    },
    enabled: !!user?.id,
  });

  const partnerMutation = useMutation({
    mutationFn: async (data: typeof partnerForm & { id?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const payload: any = {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        company: data.company || null,
        notes: data.notes || null,
        status: data.status,
        source: data.source || null,
        partner_type: data.partner_type || null,
        commission_pct: data.commission_pct ? parseFloat(data.commission_pct) : null,
        commission_fixed: data.commission_fixed ? parseFloat(data.commission_fixed) : null,
        commission_currency: data.commission_currency || 'GBP',
        contract_status: data.contract_status || 'none',
        performance_bonus_json: data.performance_bonus
          ? { description: data.performance_bonus }
          : null,
      };
      if (data.id) {
        const { error } = await supabase
          .from('clients')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clients')
          .insert({ ...payload, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success(editingPartner
        ? (locale === 'ro' ? 'Partener actualizat!' : 'Partner updated!')
        : (locale === 'ro' ? 'Partener adăugat!' : 'Partner added!'));
      resetForm();
    },
    onError: () => toast.error(locale === 'ro' ? 'Eroare la salvare' : 'Save error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success(locale === 'ro' ? 'Partener șters!' : 'Partner deleted!');
      setSelectedPartner(null);
    },
  });

  const reminderMutation = useMutation({
    mutationFn: async (data: typeof reminderForm) => {
      if (!user?.id || !selectedPartner?.id) throw new Error('Missing data');
      const { error } = await supabase.from('followup_reminders').insert({
        user_id: user.id,
        client_id: selectedPartner.id,
        title: data.title,
        notes: data.notes || null,
        reminder_date: data.reminder_date,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup-reminders'] });
      toast.success(locale === 'ro' ? 'Reminder adăugat!' : 'Reminder added!');
      setShowReminderDialog(false);
      setReminderForm({ title: '', notes: '', reminder_date: '' });
    },
  });

  const completeReminderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('followup_reminders')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['followup-reminders'] }),
  });

  const resetForm = () => {
    setShowPartnerDialog(false);
    setEditingPartner(null);
    setPartnerForm({
      name: '', email: '', phone: '', company: '', notes: '', status: 'lead',
      source: '', partner_type: 'affiliate', commission_pct: '', commission_fixed: '',
      commission_currency: 'GBP', contract_status: 'none', performance_bonus: '',
    });
  };

  const handleEdit = (p: Partner) => {
    setEditingPartner(p);
    setPartnerForm({
      name: p.name,
      email: p.email || '',
      phone: p.phone || '',
      company: p.company || '',
      notes: p.notes || '',
      status: p.status,
      source: p.source || '',
      partner_type: p.partner_type || 'affiliate',
      commission_pct: p.commission_pct?.toString() || '',
      commission_fixed: p.commission_fixed?.toString() || '',
      commission_currency: p.commission_currency || 'GBP',
      contract_status: p.contract_status || 'none',
      performance_bonus: p.performance_bonus_json?.description || '',
    });
    setShowPartnerDialog(true);
  };

  const filtered = partners.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = selectedStatus === 'all' || p.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const overdue = reminders.filter(r => isPast(new Date(r.reminder_date)) && !isToday(new Date(r.reminder_date)));
  const upcoming = reminders.filter(r => !isPast(new Date(r.reminder_date)) || isToday(new Date(r.reminder_date)));

  const formatCommission = (p: Partner) => {
    const parts: string[] = [];
    if (p.commission_pct) parts.push(`${p.commission_pct}%`);
    if (p.commission_fixed) parts.push(`${p.commission_currency || 'GBP'} ${p.commission_fixed} fix`);
    return parts.length ? parts.join(' + ') : (locale === 'ro' ? 'Nu e setat' : 'Not set');
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                <Handshake className="h-7 w-7 text-primary" />
              </div>
              {locale === 'ro' ? 'Partner CRM' : 'Partner CRM'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {locale === 'ro'
                ? 'Gestionează parteneriatele Dream 100, contractele și comisioanele hibride'
                : 'Manage your Dream 100 partnerships, contracts and hybrid commissions'}
            </p>
          </div>
          <Button onClick={() => setShowPartnerDialog(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            {locale === 'ro' ? 'Adaugă Partener' : 'Add Partner'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4"><div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Handshake className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{partners.length}</p>
              <p className="text-xs text-muted-foreground">{locale === 'ro' ? 'Total parteneri' : 'Total partners'}</p></div>
          </div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><Target className="h-5 w-5 text-green-500" /></div>
            <div><p className="text-2xl font-bold">{partners.filter(p => p.status === 'active').length}</p>
              <p className="text-xs text-muted-foreground">{locale === 'ro' ? 'Activi' : 'Active'}</p></div>
          </div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><FileSignature className="h-5 w-5 text-amber-500" /></div>
            <div><p className="text-2xl font-bold">{partners.filter(p => p.contract_status === 'signed' || p.contract_status === 'live').length}</p>
              <p className="text-xs text-muted-foreground">{locale === 'ro' ? 'Contracte semnate' : 'Signed contracts'}</p></div>
          </div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10"><Bell className="h-5 w-5 text-purple-500" /></div>
            <div><p className="text-2xl font-bold">{reminders.length}</p>
              <p className="text-xs text-muted-foreground">{locale === 'ro' ? 'Follow-ups' : 'Follow-ups'}</p></div>
          </div></CardContent></Card>
        </div>

        {overdue.length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="py-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <p className="font-medium text-destructive">
                {overdue.length} {locale === 'ro' ? 'follow-up-uri întârziate' : 'overdue follow-ups'}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={locale === 'ro' ? 'Caută parteneri...' : 'Search partners...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{locale === 'ro' ? 'Toate' : 'All'}</SelectItem>
                  {Object.entries(statusLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {filtered.map((p, i) => (
                  <motion.div key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: i * 0.05 }}>
                    <Card
                      className={`cursor-pointer hover:shadow-md transition-all ${selectedPartner?.id === p.id ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedPartner(p)}>
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                              <span className="font-semibold text-primary">{p.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{p.name}</h3>
                                <Badge className={`${statusColors[p.status]?.bg} ${statusColors[p.status]?.text} border-0`}>
                                  {statusLabels[p.status]}
                                </Badge>
                                {p.partner_type && (
                                  <Badge variant="outline" className="text-xs">{p.partner_type}</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                                {p.company && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{p.company}</span>}
                                {(p.commission_pct || p.commission_fixed) && (
                                  <span className="flex items-center gap-1 text-foreground font-medium">
                                    <Award className="h-3 w-3 text-amber-500" />{formatCommission(p)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(p); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filtered.length === 0 && !isLoading && (
                <Card className="bg-muted/30">
                  <CardContent className="py-12 text-center">
                    <Handshake className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">
                      {locale === 'ro' ? 'Niciun partener încă' : 'No partners yet'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {locale === 'ro' ? 'Începe să-ți construiești Dream 100 acum' : 'Start building your Dream 100 now'}
                    </p>
                    <Button onClick={() => setShowPartnerDialog(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      {locale === 'ro' ? 'Adaugă primul partener' : 'Add first partner'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {selectedPartner ? (
              <>
                <Card>
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">{locale === 'ro' ? 'Detalii partener' : 'Partner details'}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(selectedPartner.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold">{selectedPartner.name}</h3>
                      <Badge className={`${statusColors[selectedPartner.status]?.bg} ${statusColors[selectedPartner.status]?.text} border-0 mt-1`}>
                        {statusLabels[selectedPartner.status]}
                      </Badge>
                    </div>

                    {selectedPartner.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${selectedPartner.email}`} className="hover:underline">{selectedPartner.email}</a>
                      </div>
                    )}
                    {selectedPartner.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${selectedPartner.phone}`} className="hover:underline">{selectedPartner.phone}</a>
                      </div>
                    )}
                    {selectedPartner.company && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedPartner.company}</span>
                      </div>
                    )}

                    {/* Commission summary */}
                    <div className="p-3 rounded-lg border bg-gradient-to-br from-amber-500/5 to-transparent space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Award className="h-4 w-4 text-amber-500" />
                        {locale === 'ro' ? 'Comision agreed' : 'Agreed commission'}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Percent className="h-3 w-3 text-muted-foreground" />
                          <span>{selectedPartner.commission_pct || 0}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <PoundSterling className="h-3 w-3 text-muted-foreground" />
                          <span>{selectedPartner.commission_currency || 'GBP'} {selectedPartner.commission_fixed || 0}</span>
                        </div>
                      </div>
                      {selectedPartner.performance_bonus_json?.description && (
                        <p className="text-xs text-muted-foreground border-t pt-2">
                          🎯 {selectedPartner.performance_bonus_json.description}
                        </p>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {CONTRACT_STATUSES.find(c => c.v === selectedPartner.contract_status)?.l || 'No contract'}
                      </Badge>
                    </div>

                    {selectedPartner.notes && (
                      <div className="p-3 bg-muted/50 rounded-lg text-sm">
                        <p className="text-muted-foreground">{selectedPartner.notes}</p>
                      </div>
                    )}

                    <Button variant="secondary" className="w-full gap-2" onClick={() => setShowReminderDialog(true)}>
                      <Bell className="h-4 w-4" />
                      {locale === 'ro' ? 'Adaugă reminder' : 'Add reminder'}
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    {locale === 'ro' ? 'Follow-ups' : 'Follow-ups'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcoming.length > 0 ? (
                    <div className="space-y-3">
                      {upcoming.slice(0, 5).map(r => {
                        const partner = partners.find(p => p.id === r.client_id);
                        const isOverdue = isPast(new Date(r.reminder_date)) && !isToday(new Date(r.reminder_date));
                        return (
                          <div key={r.id} className={`p-3 rounded-lg border ${isOverdue ? 'border-destructive/50 bg-destructive/5' : 'bg-muted/50'}`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-sm">{r.title}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">{partner?.name}</p>
                                <p className={`text-xs mt-1 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {formatDistanceToNow(new Date(r.reminder_date), { addSuffix: true, locale: dateLocale })}
                                </p>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8"
                                onClick={() => completeReminderMutation.mutate(r.id)}>
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {locale === 'ro' ? 'Niciun reminder activ' : 'No active reminders'}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Partner Dialog with Hybrid Commission */}
        <Dialog open={showPartnerDialog} onOpenChange={(o) => !o && resetForm()}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPartner
                  ? (locale === 'ro' ? 'Editează partener' : 'Edit partner')
                  : (locale === 'ro' ? 'Partener nou' : 'New partner')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{locale === 'ro' ? 'Nume contact *' : 'Contact name *'}</Label>
                  <Input value={partnerForm.name} onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{locale === 'ro' ? 'Companie' : 'Company'}</Label>
                  <Input value={partnerForm.company} onChange={(e) => setPartnerForm({ ...partnerForm, company: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={partnerForm.email} onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{locale === 'ro' ? 'Telefon' : 'Phone'}</Label>
                  <Input value={partnerForm.phone} onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{locale === 'ro' ? 'Tip parteneriat' : 'Partnership type'}</Label>
                  <Select value={partnerForm.partner_type} onValueChange={(v) => setPartnerForm({ ...partnerForm, partner_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PARTNER_TYPES.map(p => <SelectItem key={p.v} value={p.v}>{p.l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={partnerForm.status} onValueChange={(v) => setPartnerForm({ ...partnerForm, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{locale === 'ro' ? 'Status contract' : 'Contract status'}</Label>
                  <Select value={partnerForm.contract_status} onValueChange={(v) => setPartnerForm({ ...partnerForm, contract_status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CONTRACT_STATUSES.map(c => <SelectItem key={c.v} value={c.v}>{c.l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Hybrid Commission Section */}
              <div className="rounded-lg border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Award className="h-4 w-4 text-amber-500" />
                  {locale === 'ro' ? 'Comision hibrid (% + fix + bonus)' : 'Hybrid commission (% + fixed + bonus)'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {locale === 'ro'
                    ? 'Combină ce ai negociat: rev share, fee fix per referral și bonus de performanță.'
                    : 'Combine what you negotiated: revenue share, fixed fee per referral, and performance bonus.'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Percent className="h-3 w-3" /> % rev share</Label>
                    <Input type="number" step="0.1" placeholder="e.g. 10" value={partnerForm.commission_pct}
                      onChange={(e) => setPartnerForm({ ...partnerForm, commission_pct: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><PoundSterling className="h-3 w-3" /> Fixed fee</Label>
                    <Input type="number" step="1" placeholder="e.g. 250" value={partnerForm.commission_fixed}
                      onChange={(e) => setPartnerForm({ ...partnerForm, commission_fixed: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{locale === 'ro' ? 'Monedă' : 'Currency'}</Label>
                    <Select value={partnerForm.commission_currency} onValueChange={(v) => setPartnerForm({ ...partnerForm, commission_currency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GBP">GBP £</SelectItem>
                        <SelectItem value="EUR">EUR €</SelectItem>
                        <SelectItem value="USD">USD $</SelectItem>
                        <SelectItem value="RON">RON lei</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{locale === 'ro' ? 'Bonus performanță (descriere)' : 'Performance bonus (description)'}</Label>
                  <Input placeholder={locale === 'ro'
                    ? 'ex: +£500 dacă închide 5 referrals/lună'
                    : 'e.g. +£500 if 5+ referrals/month'}
                    value={partnerForm.performance_bonus}
                    onChange={(e) => setPartnerForm({ ...partnerForm, performance_bonus: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{locale === 'ro' ? 'Sursă' : 'Source'}</Label>
                  <Input value={partnerForm.source} placeholder="LinkedIn, Dream 100, referral..."
                    onChange={(e) => setPartnerForm({ ...partnerForm, source: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{locale === 'ro' ? 'Notițe' : 'Notes'}</Label>
                <Textarea rows={3} value={partnerForm.notes}
                  onChange={(e) => setPartnerForm({ ...partnerForm, notes: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>{locale === 'ro' ? 'Anulează' : 'Cancel'}</Button>
              <Button onClick={() => partnerMutation.mutate({ ...partnerForm, id: editingPartner?.id })}
                disabled={!partnerForm.name || partnerMutation.isPending}>
                {partnerMutation.isPending ? '...' : editingPartner ? (locale === 'ro' ? 'Actualizează' : 'Update') : (locale === 'ro' ? 'Adaugă' : 'Add')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reminder dialog */}
        <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>{locale === 'ro' ? 'Adaugă reminder' : 'Add reminder'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{locale === 'ro' ? 'Titlu' : 'Title'}</Label>
                <Input value={reminderForm.title} onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{locale === 'ro' ? 'Data' : 'Date'}</Label>
                <Input type="datetime-local" value={reminderForm.reminder_date}
                  onChange={(e) => setReminderForm({ ...reminderForm, reminder_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{locale === 'ro' ? 'Notițe' : 'Notes'}</Label>
                <Textarea rows={3} value={reminderForm.notes}
                  onChange={(e) => setReminderForm({ ...reminderForm, notes: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReminderDialog(false)}>{locale === 'ro' ? 'Anulează' : 'Cancel'}</Button>
              <Button onClick={() => reminderMutation.mutate(reminderForm)}
                disabled={!reminderForm.title || !reminderForm.reminder_date}>
                {locale === 'ro' ? 'Salvează' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
