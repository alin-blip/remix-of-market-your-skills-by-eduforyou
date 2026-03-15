import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, Brain, MessageSquare, ExternalLink, Trash2, 
  Loader2, Crosshair, GripVertical, Calendar, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

const KANBAN_STAGES = [
  { id: 'identified', label: { en: 'Identified', ro: 'Identificat' }, color: 'bg-muted' },
  { id: 'observing', label: { en: 'Observing', ro: 'Observare' }, color: 'bg-blue-500/10' },
  { id: 'soft_connect', label: { en: 'Soft Connect', ro: 'Conectare Soft' }, color: 'bg-purple-500/10' },
  { id: 'pitch', label: { en: 'Pitch / Offer', ro: 'Pitch / Ofertă' }, color: 'bg-orange-500/10' },
  { id: 'followup', label: { en: 'Follow-up', ro: 'Follow-up' }, color: 'bg-yellow-500/10' },
  { id: 'won', label: { en: 'Won', ro: 'Câștigat' }, color: 'bg-green-500/10' },
  { id: 'lost', label: { en: 'Lost', ro: 'Pierdut' }, color: 'bg-destructive/10' },
];

interface Target {
  id: string;
  name: string;
  linkedin_url: string | null;
  website_url: string | null;
  industry: string | null;
  decision_maker_role: string | null;
  path_type: string;
  kanban_stage: string;
  ai_analysis: any;
  reminder_date: string | null;
  notes: string | null;
  created_at: string;
}

interface TargetTask {
  id: string;
  target_id: string;
  title: string;
  is_completed: boolean;
}

export default function Dream100Tracker() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const [targets, setTargets] = useState<Target[]>([]);
  const [tasks, setTasks] = useState<Record<string, TargetTask[]>>({});
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [pathFilter, setPathFilter] = useState<string>('all');
  
  // New target form
  const [newTarget, setNewTarget] = useState({
    name: '', linkedin_url: '', website_url: '', industry: '',
    decision_maker_role: '', path_type: 'freelancer', notes: '',
  });

  const fetchTargets = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('dream100_targets')
      .select('*')
      .order('created_at', { ascending: false });
    setTargets((data as any[]) || []);
    setLoading(false);
  }, [user]);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('dream100_tasks').select('*');
    const grouped: Record<string, TargetTask[]> = {};
    (data as any[] || []).forEach((t: any) => {
      if (!grouped[t.target_id]) grouped[t.target_id] = [];
      grouped[t.target_id].push(t);
    });
    setTasks(grouped);
  }, [user]);

  useEffect(() => { fetchTargets(); fetchTasks(); }, [fetchTargets, fetchTasks]);

  const addTarget = async () => {
    if (!user || !newTarget.name.trim()) return;
    const { error } = await supabase.from('dream100_targets').insert({
      user_id: user.id, ...newTarget, kanban_stage: 'identified',
    });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    setNewTarget({ name: '', linkedin_url: '', website_url: '', industry: '', decision_maker_role: '', path_type: 'freelancer', notes: '' });
    setAddDialogOpen(false);
    fetchTargets();
    toast({ title: locale === 'ro' ? 'Țintă adăugată!' : 'Target added!' });
  };

  const deleteTarget = async (id: string) => {
    await supabase.from('dream100_targets').delete().eq('id', id);
    fetchTargets();
  };

  const analyzeTarget = async (target: Target) => {
    setAnalyzingId(target.id);
    try {
      const { data, error } = await supabase.functions.invoke('dream100-analyzer', {
        body: {
          targetId: target.id,
          companyName: target.name,
          websiteUrl: target.website_url,
          industry: target.industry,
          role: target.decision_maker_role,
        },
      });
      if (error) throw error;
      if (data?.analysis) {
        setTargets(prev => prev.map(t => t.id === target.id ? { ...t, ai_analysis: data.analysis } : t));
        toast({ title: locale === 'ro' ? 'Analiză completă!' : 'Analysis complete!' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setAnalyzingId(null);
    }
  };

  const moveToStage = async (targetId: string, newStage: string) => {
    await supabase.from('dream100_targets').update({ kanban_stage: newStage }).eq('id', targetId);
    setTargets(prev => prev.map(t => t.id === targetId ? { ...t, kanban_stage: newStage } : t));
    // Auto-add to CRM when won
    if (newStage === 'won') {
      const target = targets.find(t => t.id === targetId);
      if (target && user) {
        await supabase.from('clients').insert({
          user_id: user.id,
          name: target.name,
          company: target.name,
          source: 'Dream 100',
          status: 'active',
        });
        toast({ title: locale === 'ro' ? 'Client adăugat în CRM!' : 'Client added to CRM!' });
      }
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const targetId = result.draggableId;
    const newStage = result.destination.droppableId;
    moveToStage(targetId, newStage);
  };

  const addTask = async (targetId: string, title: string) => {
    if (!user || !title.trim()) return;
    await supabase.from('dream100_tasks').insert({ target_id: targetId, user_id: user.id, title });
    fetchTasks();
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    await supabase.from('dream100_tasks').update({ 
      is_completed: completed, 
      completed_at: completed ? new Date().toISOString() : null 
    }).eq('id', taskId);
    fetchTasks();
  };

  const filteredTargets = pathFilter === 'all' ? targets : targets.filter(t => t.path_type === pathFilter);
  const targetCount = filteredTargets.length;
  const wonCount = filteredTargets.filter(t => t.kanban_stage === 'won').length;

  return (
    <MainLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Crosshair className="h-7 w-7 text-primary" />
              Dream 100 Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              {locale === 'ro' 
                ? `${targetCount} din 100 ținte identificate • ${wonCount} câștigate`
                : `${targetCount} of 100 targets identified • ${wonCount} won`}
            </p>
            <Progress value={(targetCount / 100) * 100} className="h-2 mt-2 max-w-xs" />
          </div>
          <div className="flex items-center gap-2">
            <Select value={pathFilter} onValueChange={setPathFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{locale === 'ro' ? 'Toate căile' : 'All paths'}</SelectItem>
                <SelectItem value="employee">{locale === 'ro' ? 'Angajat' : 'Employee'}</SelectItem>
                <SelectItem value="freelancer">Freelancer</SelectItem>
                <SelectItem value="startup">Startup</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />{locale === 'ro' ? 'Adaugă Țintă' : 'Add Target'}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{locale === 'ro' ? 'Adaugă Țintă Nouă' : 'Add New Target'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>{locale === 'ro' ? 'Nume companie/persoană' : 'Company/Person name'}</Label>
                    <Input value={newTarget.name} onChange={e => setNewTarget(p => ({ ...p, name: e.target.value }))} placeholder="Acme Corp" />
                  </div>
                  <div>
                    <Label>{locale === 'ro' ? 'Tip cale' : 'Path type'}</Label>
                    <Select value={newTarget.path_type} onValueChange={v => setNewTarget(p => ({ ...p, path_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">{locale === 'ro' ? 'Angajat' : 'Employee'}</SelectItem>
                        <SelectItem value="freelancer">Freelancer</SelectItem>
                        <SelectItem value="startup">Startup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>LinkedIn URL</Label>
                    <Input value={newTarget.linkedin_url} onChange={e => setNewTarget(p => ({ ...p, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/company/..." />
                  </div>
                  <div>
                    <Label>Website URL</Label>
                    <Input value={newTarget.website_url} onChange={e => setNewTarget(p => ({ ...p, website_url: e.target.value }))} placeholder="https://..." />
                  </div>
                  <div>
                    <Label>{locale === 'ro' ? 'Industrie' : 'Industry'}</Label>
                    <Input value={newTarget.industry} onChange={e => setNewTarget(p => ({ ...p, industry: e.target.value }))} placeholder="FinTech, Marketing..." />
                  </div>
                  <div>
                    <Label>{locale === 'ro' ? 'Rol decident' : 'Decision maker role'}</Label>
                    <Input value={newTarget.decision_maker_role} onChange={e => setNewTarget(p => ({ ...p, decision_maker_role: e.target.value }))} placeholder="CEO, Hiring Manager..." />
                  </div>
                  <div>
                    <Label>{locale === 'ro' ? 'Note' : 'Notes'}</Label>
                    <Textarea value={newTarget.notes} onChange={e => setNewTarget(p => ({ ...p, notes: e.target.value }))} rows={2} />
                  </div>
                  <Button onClick={addTarget} className="w-full">{locale === 'ro' ? 'Adaugă' : 'Add Target'}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-3 overflow-x-auto pb-4 min-h-[60vh]">
              {KANBAN_STAGES.map(stage => {
                const stageTargets = filteredTargets.filter(t => t.kanban_stage === stage.id);
                return (
                  <Droppable key={stage.id} droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "flex-shrink-0 w-72 rounded-xl border p-3 transition-colors",
                          stage.color,
                          snapshot.isDraggingOver && "ring-2 ring-primary/50"
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-foreground">
                            {stage.label[locale as 'en' | 'ro']}
                          </h3>
                          <Badge variant="secondary" className="text-xs">{stageTargets.length}</Badge>
                        </div>
                        <div className="space-y-2 min-h-[100px]">
                          {stageTargets.map((target, index) => (
                            <Draggable key={target.id} draggableId={target.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={cn(
                                    "bg-card border rounded-lg p-3 space-y-2 shadow-sm",
                                    snapshot.isDragging && "shadow-lg ring-2 ring-primary/30"
                                  )}
                                >
                                  <div className="flex items-start gap-2">
                                    <div {...provided.dragHandleProps} className="mt-1 cursor-grab">
                                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm text-foreground truncate">{target.name}</p>
                                      <div className="flex items-center gap-1 mt-0.5">
                                        {target.industry && <Badge variant="outline" className="text-[10px] px-1">{target.industry}</Badge>}
                                        <Badge variant="outline" className="text-[10px] px-1">{target.path_type}</Badge>
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteTarget(target.id)}>
                                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                                    </Button>
                                  </div>

                                  {/* AI Analysis indicator */}
                                  {target.ai_analysis && (
                                    <div className="text-[10px] text-muted-foreground bg-muted/50 rounded p-1.5">
                                      <span className="font-medium text-primary">✨ {locale === 'ro' ? 'Analizat' : 'Analyzed'}</span>
                                      {' — '}{target.ai_analysis.recommended_tone}
                                    </div>
                                  )}

                                  {/* Tasks checklist */}
                                  {tasks[target.id]?.map(task => (
                                    <div key={task.id} className="flex items-center gap-2 text-xs">
                                      <Checkbox
                                        checked={task.is_completed}
                                        onCheckedChange={(c) => toggleTask(task.id, !!c)}
                                        className="h-3.5 w-3.5"
                                      />
                                      <span className={cn(task.is_completed && "line-through text-muted-foreground")}>{task.title}</span>
                                    </div>
                                  ))}

                                  {/* Action buttons */}
                                  <div className="flex gap-1 pt-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs flex-1"
                                      disabled={analyzingId === target.id}
                                      onClick={() => analyzeTarget(target)}
                                    >
                                      {analyzingId === target.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Brain className="h-3 w-3" />}
                                      <span className="ml-1">{locale === 'ro' ? 'Analizează' : 'Analyze'}</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs flex-1"
                                      onClick={() => window.location.href = `/outreach-sequences?targetId=${target.id}`}
                                    >
                                      <MessageSquare className="h-3 w-3 mr-1" />
                                      {locale === 'ro' ? 'Mesaj' : 'Message'}
                                    </Button>
                                    {target.linkedin_url && (
                                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                        <a href={target.linkedin_url} target="_blank" rel="noopener">
                                          <ExternalLink className="h-3 w-3" />
                                        </a>
                                      </Button>
                                    )}
                                  </div>

                                  {/* Quick add task */}
                                  <QuickAddTask targetId={target.id} onAdd={addTask} locale={locale} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>
    </MainLayout>
  );
}

function QuickAddTask({ targetId, onAdd, locale }: { targetId: string; onAdd: (id: string, title: string) => void; locale: string }) {
  const [title, setTitle] = useState('');
  const [show, setShow] = useState(false);

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors w-full text-left"
      >
        + {locale === 'ro' ? 'Adaugă task' : 'Add task'}
      </button>
    );
  }

  return (
    <div className="flex gap-1">
      <Input
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="h-6 text-xs"
        placeholder={locale === 'ro' ? 'Task nou...' : 'New task...'}
        onKeyDown={e => {
          if (e.key === 'Enter' && title.trim()) {
            onAdd(targetId, title);
            setTitle('');
            setShow(false);
          }
          if (e.key === 'Escape') setShow(false);
        }}
        autoFocus
      />
    </div>
  );
}
