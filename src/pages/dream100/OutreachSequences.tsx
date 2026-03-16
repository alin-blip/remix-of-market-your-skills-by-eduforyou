import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Loader2, Copy, RefreshCw, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OutputLanguageSelect } from '@/components/shared/OutputLanguageSelect';

interface OutreachMessage {
  day: number;
  label: string;
  subject?: string;
  content: string;
  status: 'draft' | 'sent' | 'replied';
  sent_at?: string;
}

interface Sequence {
  id: string;
  target_id: string | null;
  target_name?: string;
  path_type: string;
  platform: string;
  messages: OutreachMessage[];
  created_at: string;
}

export default function OutreachSequences() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const [searchParams] = useSearchParams();
  const preTargetId = searchParams.get('targetId') || '';

  const [targets, setTargets] = useState<any[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [activeTab, setActiveTab] = useState('generate');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const [outputLang, setOutputLang] = useState(locale === 'en' ? 'en' : 'ro');
  const [config, setConfig] = useState({
    targetId: preTargetId,
    pathType: 'freelancer',
    platform: 'linkedin',
  });

  const [generatedMessages, setGeneratedMessages] = useState<OutreachMessage[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('dream100_targets').select('id, name, industry').order('name'),
      supabase.from('outreach_sequences').select('*').order('created_at', { ascending: false }),
    ]).then(([targetsRes, seqRes]) => {
      setTargets((targetsRes.data as any[]) || []);
      const seqs = ((seqRes.data as any[]) || []).map(s => ({
        ...s,
        messages: Array.isArray(s.messages) ? s.messages : [],
      }));
      setSequences(seqs);
      setLoading(false);
    });
  }, [user]);

  const generate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('outreach-sequence', {
        body: { ...config, locale: outputLang },
      });
      if (error) throw error;
      if (data?.messages) {
        setGeneratedMessages(data.messages);
        // Refresh sequences list
        const { data: seqData } = await supabase.from('outreach_sequences').select('*').order('created_at', { ascending: false });
        setSequences(((seqData as any[]) || []).map(s => ({ ...s, messages: Array.isArray(s.messages) ? s.messages : [] })));
        toast({ title: locale === 'ro' ? 'Secvență generată!' : 'Sequence generated!' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const markSent = async (sequenceId: string, messageIndex: number) => {
    const seq = sequences.find(s => s.id === sequenceId);
    if (!seq) return;
    const updatedMessages = [...seq.messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      status: 'sent',
      sent_at: new Date().toISOString(),
    };
    await supabase.from('outreach_sequences').update({ messages: updatedMessages as any }).eq('id', sequenceId);
    setSequences(prev => prev.map(s => s.id === sequenceId ? { ...s, messages: updatedMessages } : s));

    // Auto-advance kanban stage
    if (seq.target_id) {
      const stageMap: Record<number, string> = { 0: 'soft_connect', 1: 'pitch', 2: 'followup' };
      const newStage = stageMap[messageIndex];
      if (newStage) {
        await supabase.from('dream100_targets').update({ kanban_stage: newStage }).eq('id', seq.target_id);
      }
    }
    toast({ title: locale === 'ro' ? 'Marcat ca trimis!' : 'Marked as sent!' });
  };

  const markReplied = async (sequenceId: string) => {
    const seq = sequences.find(s => s.id === sequenceId);
    if (!seq) return;
    const updatedMessages = seq.messages.map(m => ({ ...m, status: 'replied' as const }));
    await supabase.from('outreach_sequences').update({ messages: updatedMessages as any }).eq('id', sequenceId);
    setSequences(prev => prev.map(s => s.id === sequenceId ? { ...s, messages: updatedMessages } : s));

    if (seq.target_id) {
      await supabase.from('dream100_targets').update({ kanban_stage: 'pitch' }).eq('id', seq.target_id);
    }
    toast({ title: locale === 'ro' ? 'Marcat ca răspuns primit!' : 'Marked as replied!' });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: locale === 'ro' ? 'Copiat!' : 'Copied!' });
  };

  const getTargetName = (targetId: string | null) => {
    if (!targetId) return locale === 'ro' ? 'Fără țintă' : 'No target';
    return targets.find(t => t.id === targetId)?.name || targetId;
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Send className="h-7 w-7 text-primary" />
            {locale === 'ro' ? 'Outreach Secvențial' : 'Sequential Outreach'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {locale === 'ro'
              ? 'Generează secvențe de 3 mesaje personalizate per țintă'
              : 'Generate personalized 3-message sequences per target'}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="generate">{locale === 'ro' ? 'Generează' : 'Generate'}</TabsTrigger>
            <TabsTrigger value="active">
              {locale === 'ro' ? 'Secvențe Active' : 'Active Sequences'}
              {sequences.length > 0 && <Badge variant="secondary" className="ml-2 text-xs">{sequences.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>{locale === 'ro' ? 'Tip cale' : 'Path type'}</Label>
                    <Select value={config.pathType} onValueChange={v => setConfig(c => ({ ...c, pathType: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">{locale === 'ro' ? 'Angajat' : 'Employee'}</SelectItem>
                        <SelectItem value="freelancer">Freelancer</SelectItem>
                        <SelectItem value="startup">Startup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{locale === 'ro' ? 'Țintă din Dream 100' : 'Target from Dream 100'}</Label>
                    <Select value={config.targetId} onValueChange={v => setConfig(c => ({ ...c, targetId: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={locale === 'ro' ? 'Selectează...' : 'Select...'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{locale === 'ro' ? 'Fără țintă specifică' : 'No specific target'}</SelectItem>
                        {targets.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{locale === 'ro' ? 'Platformă' : 'Platform'}</Label>
                    <Select value={config.platform} onValueChange={v => setConfig(c => ({ ...c, platform: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp/DM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={generate} disabled={generating} className="w-full md:w-auto">
                  {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  {locale === 'ro' ? 'Generează Secvență' : 'Generate Sequence'}
                </Button>
              </CardContent>
            </Card>

            {/* Generated messages preview */}
            {generatedMessages.length > 0 && (
              <div className="space-y-3">
                {generatedMessages.map((msg, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={i === 0 ? 'default' : i === 1 ? 'secondary' : 'outline'}>
                            {locale === 'ro' ? `Ziua ${msg.day}` : `Day ${msg.day}`}
                          </Badge>
                          <span className="text-sm font-medium text-foreground">{msg.label}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(msg.content)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      {msg.subject && <p className="text-xs text-muted-foreground mb-1">Subject: {msg.subject}</p>}
                      <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sequences.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground">{locale === 'ro' ? 'Nicio secvență activă' : 'No active sequences'}</p>
                </CardContent>
              </Card>
            ) : (
              sequences.map(seq => (
                <Card key={seq.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{getTargetName(seq.target_id)}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{seq.platform}</Badge>
                          <Badge variant="outline" className="text-xs">{seq.path_type}</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => markReplied(seq.id)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {locale === 'ro' ? 'Răspuns primit' : 'Got reply'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {seq.messages.map((msg, i) => (
                      <div key={i} className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border",
                        msg.status === 'sent' && "bg-green-500/5 border-green-500/20",
                        msg.status === 'replied' && "bg-primary/5 border-primary/20",
                      )}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={msg.status === 'sent' ? 'default' : msg.status === 'replied' ? 'secondary' : 'outline'} className="text-xs">
                              {msg.status === 'draft' ? (locale === 'ro' ? 'Pregătit' : 'Ready') : 
                               msg.status === 'sent' ? (locale === 'ro' ? 'Trimis' : 'Sent') : 
                               (locale === 'ro' ? 'Răspuns' : 'Replied')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {locale === 'ro' ? `Ziua ${msg.day}` : `Day ${msg.day}`} — {msg.label}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{msg.content}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(msg.content)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          {msg.status === 'draft' && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markSent(seq.id, i)}>
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
