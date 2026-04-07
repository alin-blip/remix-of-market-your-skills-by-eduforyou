import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft, User, Mail, Calendar, GraduationCap, Shield, Cpu, BookOpen,
  Target, FileText, Activity, CheckCircle2, XCircle, Clock
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  study_field: string | null;
  campus: string | null;
  verified: boolean | null;
  onboarding_completed: boolean | null;
  freedom_score: number | null;
  execution_dna: string | null;
  locale: string | null;
  is_eduforyou_member: boolean;
  created_at: string | null;
  updated_at: string | null;
  goals: any;
  interests: any;
  values: any;
  projects_experience: string | null;
}

interface AIOutput {
  id: string;
  tool: string;
  created_at: string | null;
}

interface CoursePurchase {
  id: string;
  amount: number;
  currency: string | null;
  status: string | null;
  purchased_at: string | null;
  course: { title: string } | null;
}

interface EmailLog {
  id: string;
  template_name: string;
  recipient_email: string;
  status: string;
  created_at: string;
  error_message: string | null;
}

const TOOL_LABELS: Record<string, string> = {
  'offer-builder': 'Offer Builder',
  'profile-builder': 'Profile Builder',
  'ikigai-builder': 'Ikigai Builder',
  'skill-scanner': 'Skill Scanner',
  'life-os-wizard': 'Life OS',
  'outreach-generator': 'Outreach',
  'gig-generator': 'Gig Generator',
  'cv-generator': 'CV Generator',
  'dream100-analyzer': 'Dream 100',
};

export default function UserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [aiOutputs, setAiOutputs] = useState<AIOutput[]>([]);
  const [purchases, setPurchases] = useState<CoursePurchase[]>([]);
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [skillCount, setSkillCount] = useState(0);
  const [gigCount, setGigCount] = useState(0);
  const [targetCount, setTargetCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [profileRes, aiRes, purchaseRes, skillRes, gigRes, targetRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).single(),
          supabase.from('ai_outputs').select('id, tool, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
          supabase.from('course_purchases').select('id, amount, currency, status, purchased_at, course_id').eq('user_id', userId).order('purchased_at', { ascending: false }),
          supabase.from('skill_entries').select('id', { count: 'exact', head: true }).eq('user_id', userId),
          supabase.from('gigs_jobs').select('id', { count: 'exact', head: true }).eq('user_id', userId),
          supabase.from('dream100_targets').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        ]);

        if (profileRes.data) setProfile(profileRes.data as any);
        if (aiRes.data) setAiOutputs(aiRes.data);
        setSkillCount(skillRes.count || 0);
        setGigCount(gigRes.count || 0);
        setTargetCount(targetRes.count || 0);

        // Fetch course titles for purchases
        if (purchaseRes.data && purchaseRes.data.length > 0) {
          const courseIds = [...new Set(purchaseRes.data.map(p => p.course_id))];
          const { data: courses } = await supabase.from('courses').select('id, title').in('id', courseIds);
          const courseMap = new Map(courses?.map(c => [c.id, c.title]) || []);
          setPurchases(purchaseRes.data.map(p => ({
            ...p,
            course: courseMap.has(p.course_id) ? { title: courseMap.get(p.course_id)! } : null,
          })));
        }

        // Fetch emails sent to this user
        if (profileRes.data?.email) {
          const { data: emailData } = await supabase
            .from('email_send_log')
            .select('*')
            .eq('recipient_email', profileRes.data.email)
            .order('created_at', { ascending: false })
            .limit(50);
          // email_send_log has service_role RLS, so this may return empty for admin via anon key
          // We'll handle gracefully
          setEmails((emailData as any[]) || []);
        }
      } catch (err) {
        console.error('UserDetail fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [userId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/users"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <p className="text-muted-foreground">Utilizatorul nu a fost găsit.</p>
        </div>
      </MainLayout>
    );
  }

  const initials = (profile.full_name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  // AI tool usage summary
  const toolUsage = aiOutputs.reduce<Record<string, number>>((acc, o) => {
    acc[o.tool] = (acc[o.tool] || 0) + 1;
    return acc;
  }, {});

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/users"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">User Detail</h1>
        </div>

        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-xl font-semibold">{profile.full_name || 'No name'}</h2>
                  <p className="text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-4 w-4" /> {profile.email || 'No email'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.is_eduforyou_member && (
                    <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                      <GraduationCap className="h-3 w-3" /> EduForYou
                    </Badge>
                  )}
                  {profile.verified && (
                    <Badge variant="default" className="gap-1">
                      <Shield className="h-3 w-3" /> Verified
                    </Badge>
                  )}
                  {profile.onboarding_completed && (
                    <Badge variant="secondary">Onboarded</Badge>
                  )}
                  {profile.execution_dna && (
                    <Badge variant="outline">DNA: {profile.execution_dna}</Badge>
                  )}
                  {profile.locale && (
                    <Badge variant="outline">Locale: {profile.locale.toUpperCase()}</Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <InfoItem icon={<Calendar className="h-4 w-4" />} label="Joined" value={profile.created_at ? format(new Date(profile.created_at), 'MMM dd, yyyy') : '—'} />
                  <InfoItem icon={<BookOpen className="h-4 w-4" />} label="Study Field" value={profile.study_field || '—'} />
                  <InfoItem icon={<Target className="h-4 w-4" />} label="Freedom Score" value={String(profile.freedom_score || 0)} />
                  <InfoItem icon={<User className="h-4 w-4" />} label="Campus" value={profile.campus || '—'} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="AI Generations" value={aiOutputs.length} icon={<Cpu className="h-5 w-5" />} />
          <StatCard label="Courses Bought" value={purchases.length} icon={<BookOpen className="h-5 w-5" />} />
          <StatCard label="Skills" value={skillCount} icon={<Activity className="h-5 w-5" />} />
          <StatCard label="Gigs" value={gigCount} icon={<FileText className="h-5 w-5" />} />
          <StatCard label="Dream 100" value={targetCount} icon={<Target className="h-5 w-5" />} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ai" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ai">AI Activity ({aiOutputs.length})</TabsTrigger>
            <TabsTrigger value="courses">Courses ({purchases.length})</TabsTrigger>
            <TabsTrigger value="emails">Emails ({emails.length})</TabsTrigger>
            <TabsTrigger value="profile">Full Profile</TabsTrigger>
          </TabsList>

          {/* AI Tab */}
          <TabsContent value="ai" className="space-y-4">
            {Object.keys(toolUsage).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tool Usage Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(toolUsage).sort((a, b) => b[1] - a[1]).map(([tool, count]) => (
                      <Badge key={tool} variant="secondary" className="gap-1">
                        {TOOL_LABELS[tool] || tool}: {count}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent AI Generations</CardTitle>
                <CardDescription>Ultimele 50 de generări AI</CardDescription>
              </CardHeader>
              <CardContent>
                {aiOutputs.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nicio generare AI</p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tool</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {aiOutputs.map(o => (
                          <TableRow key={o.id}>
                            <TableCell>
                              <Badge variant="outline">{TOOL_LABELS[o.tool] || o.tool}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {o.created_at ? format(new Date(o.created_at), 'MMM dd, yyyy HH:mm') : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Course Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                {purchases.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nicio achiziție de curs</p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchases.map(p => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.course?.title || 'Unknown'}</TableCell>
                            <TableCell>{p.amount} {p.currency || 'EUR'}</TableCell>
                            <TableCell>
                              <Badge variant={p.status === 'completed' ? 'default' : 'secondary'} className="gap-1">
                                {p.status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                {p.status || 'pending'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {p.purchased_at ? format(new Date(p.purchased_at), 'MMM dd, yyyy') : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emails Tab */}
          <TabsContent value="emails">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Emails Sent</CardTitle>
                <CardDescription>Emailuri trimise către acest utilizator</CardDescription>
              </CardHeader>
              <CardContent>
                {emails.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nicio înregistrare de email (datele sunt vizibile doar prin service role)</p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Template</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Error</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {emails.map(e => (
                          <TableRow key={e.id}>
                            <TableCell className="font-medium">{e.template_name}</TableCell>
                            <TableCell>
                              <Badge variant={e.status === 'sent' ? 'default' : 'destructive'} className="gap-1">
                                {e.status === 'sent' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                {e.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                              {e.error_message || '—'}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {format(new Date(e.created_at), 'MMM dd, yyyy HH:mm')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Full Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ProfileField label="Full Name" value={profile.full_name} />
                  <ProfileField label="Email" value={profile.email} />
                  <ProfileField label="Study Field" value={profile.study_field} />
                  <ProfileField label="Campus" value={profile.campus} />
                  <ProfileField label="Locale" value={profile.locale} />
                  <ProfileField label="Execution DNA" value={profile.execution_dna} />
                  <ProfileField label="Freedom Score" value={String(profile.freedom_score || 0)} />
                  <ProfileField label="Projects Experience" value={profile.projects_experience} />
                  <ProfileField label="Verified" value={profile.verified ? 'Yes' : 'No'} />
                  <ProfileField label="Onboarding" value={profile.onboarding_completed ? 'Completed' : 'Incomplete'} />
                  <ProfileField label="EduForYou" value={profile.is_eduforyou_member ? 'Yes' : 'No'} />
                  <ProfileField label="Created" value={profile.created_at ? format(new Date(profile.created_at), 'MMM dd, yyyy HH:mm') : '—'} />
                </div>
                {profile.goals && Array.isArray(profile.goals) && profile.goals.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Goals</p>
                    <div className="flex flex-wrap gap-1">
                      {(profile.goals as string[]).map((g, i) => (
                        <Badge key={i} variant="outline">{g}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {profile.interests && Array.isArray(profile.interests) && profile.interests.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Interests</p>
                    <div className="flex flex-wrap gap-1">
                      {(profile.interests as string[]).map((g, i) => (
                        <Badge key={i} variant="secondary">{g}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {profile.values && Array.isArray(profile.values) && profile.values.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Values</p>
                    <div className="flex flex-wrap gap-1">
                      {(profile.values as string[]).map((g, i) => (
                        <Badge key={i} variant="outline">{g}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4 flex items-center gap-3">
        <div className="text-primary">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  );
}
