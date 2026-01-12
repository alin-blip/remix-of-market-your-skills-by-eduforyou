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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';
import { format, formatDistanceToNow, isPast, isToday } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  Calendar,
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MoreVertical,
  Edit,
  Trash2,
  DollarSign,
  Briefcase,
  MessageSquare,
  UserPlus,
  Target
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  status: string;
  source?: string;
  last_contact_at?: string;
  next_followup_at?: string;
  created_at: string;
}

interface ClientProject {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  status: string;
  value?: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
}

interface FollowupReminder {
  id: string;
  client_id: string;
  title: string;
  notes?: string;
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

export default function ClientCRM() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const dateLocale = locale === 'ro' ? ro : enUS;
  
  // Status labels from translations
  const statusLabels: Record<string, string> = {
    lead: t.clientCRM?.status?.lead || 'Lead',
    prospect: t.clientCRM?.status?.prospect || 'Prospect',
    active: t.clientCRM?.status?.active || 'Active Client',
    inactive: t.clientCRM?.status?.inactive || 'Inactive',
    lost: t.clientCRM?.status?.lost || 'Lost',
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
    status: 'lead',
    source: '',
  });

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    status: 'active',
    value: '',
    start_date: '',
    end_date: '',
  });

  const [reminderForm, setReminderForm] = useState({
    title: '',
    notes: '',
    reminder_date: '',
  });

  // Fetch clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Client[];
    },
    enabled: !!user?.id,
  });

  // Fetch projects for selected client
  const { data: projects = [] } = useQuery({
    queryKey: ['client-projects', selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient?.id) return [];
      const { data, error } = await supabase
        .from('client_projects')
        .select('*')
        .eq('client_id', selectedClient.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ClientProject[];
    },
    enabled: !!selectedClient?.id,
  });

  // Fetch reminders
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

  // Create/Update client
  const clientMutation = useMutation({
    mutationFn: async (data: typeof clientForm & { id?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (data.id) {
        const { error } = await supabase
          .from('clients')
          .update({
            name: data.name,
            email: data.email || null,
            phone: data.phone || null,
            company: data.company || null,
            notes: data.notes || null,
            status: data.status,
            source: data.source || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clients')
          .insert({
            user_id: user.id,
            name: data.name,
            email: data.email || null,
            phone: data.phone || null,
            company: data.company || null,
            notes: data.notes || null,
            status: data.status,
            source: data.source || null,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(editingClient ? (t.clientCRM?.messages?.clientUpdated || 'Client updated!') : (t.clientCRM?.messages?.clientAdded || 'Client added!'));
      resetClientForm();
    },
    onError: () => toast.error(t.clientCRM?.messages?.saveError || 'Error saving'),
  });

  // Delete client
  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(t.clientCRM?.messages?.clientDeleted || 'Client deleted!');
      setSelectedClient(null);
    },
    onError: () => toast.error(t.clientCRM?.messages?.deleteError || 'Error deleting'),
  });

  // Create project
  const projectMutation = useMutation({
    mutationFn: async (data: typeof projectForm) => {
      if (!user?.id || !selectedClient?.id) throw new Error('Missing data');
      const { error } = await supabase
        .from('client_projects')
        .insert({
          user_id: user.id,
          client_id: selectedClient.id,
          title: data.title,
          description: data.description || null,
          status: data.status,
          value: data.value ? parseFloat(data.value) : null,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-projects'] });
      toast.success(t.clientCRM?.messages?.projectAdded || 'Project added!');
      setShowProjectDialog(false);
      setProjectForm({ title: '', description: '', status: 'active', value: '', start_date: '', end_date: '' });
    },
    onError: () => toast.error(t.clientCRM?.messages?.saveError || 'Error saving'),
  });

  // Create reminder
  const reminderMutation = useMutation({
    mutationFn: async (data: typeof reminderForm) => {
      if (!user?.id || !selectedClient?.id) throw new Error('Missing data');
      const { error } = await supabase
        .from('followup_reminders')
        .insert({
          user_id: user.id,
          client_id: selectedClient.id,
          title: data.title,
          notes: data.notes || null,
          reminder_date: data.reminder_date,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup-reminders'] });
      toast.success(t.clientCRM?.messages?.reminderAdded || 'Reminder added!');
      setShowReminderDialog(false);
      setReminderForm({ title: '', notes: '', reminder_date: '' });
    },
    onError: () => toast.error(t.clientCRM?.messages?.saveError || 'Error saving'),
  });

  // Complete reminder
  const completeReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const { error } = await supabase
        .from('followup_reminders')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', reminderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup-reminders'] });
      toast.success(t.clientCRM?.messages?.reminderCompleted || 'Reminder completed!');
    },
  });

  const resetClientForm = () => {
    setShowClientDialog(false);
    setEditingClient(null);
    setClientForm({ name: '', email: '', phone: '', company: '', notes: '', status: 'lead', source: '' });
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setClientForm({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      notes: client.notes || '',
      status: client.status,
      source: client.source || '',
    });
    setShowClientDialog(true);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const upcomingReminders = reminders.filter(r => !isPast(new Date(r.reminder_date)) || isToday(new Date(r.reminder_date)));
  const overdueReminders = reminders.filter(r => isPast(new Date(r.reminder_date)) && !isToday(new Date(r.reminder_date)));

  const totalProjectValue = projects.reduce((sum, p) => sum + (p.value || 0), 0);

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <Users className="h-7 w-7 text-blue-500" />
              </div>
              {t.clientCRM?.title || 'Client CRM'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t.clientCRM?.subtitle || 'Manage clients, projects and follow-ups'}
            </p>
          </div>
          <Button onClick={() => setShowClientDialog(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            {t.clientCRM?.addClient || 'Add Client'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{clients.length}</p>
                  <p className="text-xs text-muted-foreground">{t.clientCRM?.totalClients || 'Total Clients'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Target className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{clients.filter(c => c.status === 'active').length}</p>
                  <p className="text-xs text-muted-foreground">{t.clientCRM?.activeClients || 'Active Clients'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Bell className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reminders.length}</p>
                  <p className="text-xs text-muted-foreground">{t.clientCRM?.followUps || 'Follow-ups'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <DollarSign className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{clients.filter(c => c.status === 'lead').length}</p>
                  <p className="text-xs text-muted-foreground">{t.clientCRM?.newLeads || 'New Leads'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Reminders Alert */}
        {overdueReminders.length > 0 && (
          <Card className="border-red-500/50 bg-red-500/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div className="flex-1">
                  <p className="font-medium text-red-500">
                    {overdueReminders.length} {t.clientCRM?.overdueReminders || 'overdue follow-ups'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t.clientCRM?.overdueDescription || 'You have reminders past their due date'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clients List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search & Filter */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.clientCRM?.searchPlaceholder || 'Search clients...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.clientCRM?.filterAll || 'All'}</SelectItem>
                  <SelectItem value="lead">{statusLabels.lead}</SelectItem>
                  <SelectItem value="prospect">{statusLabels.prospect}</SelectItem>
                  <SelectItem value="active">{statusLabels.active}</SelectItem>
                  <SelectItem value="inactive">{statusLabels.inactive}</SelectItem>
                  <SelectItem value="lost">{statusLabels.lost}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clients Grid */}
            <div className="space-y-3">
              <AnimatePresence>
                {filteredClients.map((client, index) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className={`cursor-pointer hover:shadow-md transition-all ${selectedClient?.id === client.id ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedClient(client)}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                              <span className="font-semibold text-primary">
                                {client.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{client.name}</h3>
                                <Badge className={`${statusColors[client.status]?.bg} ${statusColors[client.status]?.text} border-0`}>
                                  {statusLabels[client.status]}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                {client.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {client.email}
                                  </span>
                                )}
                                {client.company && (
                                  <span className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    {client.company}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditClient(client); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredClients.length === 0 && !isLoading && (
                <Card className="bg-muted/30">
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">{locale === 'ro' ? 'Niciun client găsit' : 'No clients found'}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {locale === 'ro' ? 'Adaugă primul tău client pentru a începe' : 'Add your first client to get started'}
                    </p>
                    <Button onClick={() => setShowClientDialog(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      {t.clientCRM?.addClient || 'Add Client'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Client Details / Reminders Sidebar */}
          <div className="space-y-4">
            {selectedClient ? (
              <>
                {/* Client Details Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{t.clientCRM?.clientDetails || 'Client Details'}</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => deleteClientMutation.mutate(selectedClient.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold">{selectedClient.name}</h3>
                      <Badge className={`${statusColors[selectedClient.status]?.bg} ${statusColors[selectedClient.status]?.text} border-0 mt-1`}>
                        {statusLabels[selectedClient.status]}
                      </Badge>
                    </div>

                    {selectedClient.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${selectedClient.email}`} className="hover:underline">{selectedClient.email}</a>
                      </div>
                    )}
                    {selectedClient.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${selectedClient.phone}`} className="hover:underline">{selectedClient.phone}</a>
                      </div>
                    )}
                    {selectedClient.company && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedClient.company}</span>
                      </div>
                    )}
                    {selectedClient.notes && (
                      <div className="p-3 bg-muted/50 rounded-lg text-sm">
                        <p className="text-muted-foreground">{selectedClient.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="secondary" className="flex-1 gap-2" onClick={() => setShowProjectDialog(true)}>
                        <Briefcase className="h-4 w-4" />
                        {t.clientCRM?.addProject || 'Add Project'}
                      </Button>
                      <Button variant="secondary" className="flex-1 gap-2" onClick={() => setShowReminderDialog(true)}>
                        <Bell className="h-4 w-4" />
                        {t.clientCRM?.addReminder || 'Add Reminder'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Projects */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {t.clientCRM?.projects || 'Projects'} ({projects.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {projects.length > 0 ? (
                      <div className="space-y-3">
                        {projects.map(project => (
                          <div key={project.id} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">{project.title}</h4>
                              {project.value && (
                                <span className="text-sm font-semibold text-green-500">
                                  {project.value}€
                                </span>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {project.status}
                            </Badge>
                          </div>
                        ))}
                        <div className="pt-2 border-t flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t.clientCRM?.totalValue || 'Total Value'}</span>
                          <span className="font-bold text-green-500">{totalProjectValue}€</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {t.clientCRM?.noProjectsYet || 'No projects yet'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Reminders Panel when no client selected */
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    {t.clientCRM?.reminders || 'Reminders'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingReminders.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingReminders.slice(0, 5).map(reminder => {
                        const client = clients.find(c => c.id === reminder.client_id);
                        const isOverdue = isPast(new Date(reminder.reminder_date)) && !isToday(new Date(reminder.reminder_date));
                        
                        return (
                          <div 
                            key={reminder.id} 
                            className={`p-3 rounded-lg border ${isOverdue ? 'border-red-500/50 bg-red-500/5' : 'bg-muted/50'}`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-sm">{reminder.title}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {client?.name}
                                </p>
                                <p className={`text-xs mt-1 ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {formatDistanceToNow(new Date(reminder.reminder_date), { addSuffix: true, locale: dateLocale })}
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => completeReminderMutation.mutate(reminder.id)}
                              >
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

        {/* Add/Edit Client Dialog */}
        <Dialog open={showClientDialog} onOpenChange={resetClientForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Editează Client' : 'Adaugă Client Nou'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nume *</Label>
                <Input
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="Nume client"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    placeholder="+40..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Companie</Label>
                <Input
                  value={clientForm.company}
                  onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                  placeholder="Nume companie"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={clientForm.status} onValueChange={(v) => setClientForm({ ...clientForm, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="active">Client Activ</SelectItem>
                      <SelectItem value="inactive">Inactiv</SelectItem>
                      <SelectItem value="lost">Pierdut</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sursă</Label>
                  <Input
                    value={clientForm.source}
                    onChange={(e) => setClientForm({ ...clientForm, source: e.target.value })}
                    placeholder="LinkedIn, Referral..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notițe</Label>
                <Textarea
                  value={clientForm.notes}
                  onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                  placeholder="Informații adiționale..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={resetClientForm}>Anulează</Button>
              <Button 
                onClick={() => clientMutation.mutate({ ...clientForm, id: editingClient?.id })}
                disabled={!clientForm.name || clientMutation.isPending}
              >
                {clientMutation.isPending ? 'Se salvează...' : editingClient ? 'Actualizează' : 'Adaugă'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Project Dialog */}
        <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adaugă Proiect</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Titlu Proiect *</Label>
                <Input
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  placeholder="Nume proiect"
                />
              </div>
              <div className="space-y-2">
                <Label>Descriere</Label>
                <Textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Detalii proiect..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valoare (€)</Label>
                  <Input
                    type="number"
                    value={projectForm.value}
                    onChange={(e) => setProjectForm({ ...projectForm, value: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={projectForm.status} onValueChange={(v) => setProjectForm({ ...projectForm, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activ</SelectItem>
                      <SelectItem value="completed">Finalizat</SelectItem>
                      <SelectItem value="paused">Pauză</SelectItem>
                      <SelectItem value="cancelled">Anulat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Start</Label>
                  <Input
                    type="date"
                    value={projectForm.start_date}
                    onChange={(e) => setProjectForm({ ...projectForm, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Final</Label>
                  <Input
                    type="date"
                    value={projectForm.end_date}
                    onChange={(e) => setProjectForm({ ...projectForm, end_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowProjectDialog(false)}>Anulează</Button>
              <Button 
                onClick={() => projectMutation.mutate(projectForm)}
                disabled={!projectForm.title || projectMutation.isPending}
              >
                {projectMutation.isPending ? 'Se salvează...' : 'Adaugă'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Reminder Dialog */}
        <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adaugă Follow-up Reminder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Titlu *</Label>
                <Input
                  value={reminderForm.title}
                  onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                  placeholder="ex: Follow-up call"
                />
              </div>
              <div className="space-y-2">
                <Label>Data și Ora *</Label>
                <Input
                  type="datetime-local"
                  value={reminderForm.reminder_date}
                  onChange={(e) => setReminderForm({ ...reminderForm, reminder_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Notițe</Label>
                <Textarea
                  value={reminderForm.notes}
                  onChange={(e) => setReminderForm({ ...reminderForm, notes: e.target.value })}
                  placeholder="Detalii pentru follow-up..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowReminderDialog(false)}>Anulează</Button>
              <Button 
                onClick={() => reminderMutation.mutate(reminderForm)}
                disabled={!reminderForm.title || !reminderForm.reminder_date || reminderMutation.isPending}
              >
                {reminderMutation.isPending ? 'Se salvează...' : 'Adaugă'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}