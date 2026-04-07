import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Clock, GraduationCap, Sparkles, Briefcase, Shield, ArrowRight, BarChart3, BookOpen, MessageSquare, Cpu, Brain, Target, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/lib/i18n';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { UserFunnel } from '@/components/admin/UserFunnel';
import { EmailHealthCard } from '@/components/admin/EmailHealthCard';
import { UsersAtRisk } from '@/components/admin/UsersAtRisk';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Stats {
  totalUsers: number;
  verifiedUsers: number;
  pendingVerifications: number;
  onboardingCompleted: number;
  totalSkills: number;
  publishedGigs: number;
}

interface EngagementStats {
  activeAIUsers: number;
  totalAIGenerations: number;
  ikigaiCompleted: number;
  dreamTargets: number;
  aiToolBreakdown: { name: string; count: number }[];
}

interface DomainData { name: string; value: number; }
interface RegistrationData { date: string; count: number; }

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function AdminDashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState<Stats | null>(null);
  const [engagement, setEngagement] = useState<EngagementStats | null>(null);
  const [domainData, setDomainData] = useState<DomainData[]>([]);
  const [registrationData, setRegistrationData] = useState<RegistrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    fetchStats();
  }, [period]);

  const getDaysAgo = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Base stats
      const [usersResult, verifiedResult, pendingResult, onboardingResult, skillsResult, gigsResult, domainsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('verified', true),
        supabase.from('verifications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('onboarding_completed', true),
        supabase.from('skill_entries').select('id', { count: 'exact', head: true }),
        supabase.from('gigs_jobs').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('profiles').select('study_field'),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        verifiedUsers: verifiedResult.count || 0,
        pendingVerifications: pendingResult.count || 0,
        onboardingCompleted: onboardingResult.count || 0,
        totalSkills: skillsResult.count || 0,
        publishedGigs: gigsResult.count || 0,
      });

      // Engagement stats
      const [aiOutputsRes, ikigaiRes, dreamRes] = await Promise.all([
        supabase.from('ai_outputs').select('user_id, tool'),
        supabase.from('ikigai_results').select('id', { count: 'exact', head: true }),
        supabase.from('dream100_targets').select('id', { count: 'exact', head: true }),
      ]);

      const aiData = aiOutputsRes.data || [];
      const uniqueAIUsers = new Set(aiData.map(r => r.user_id).filter(Boolean)).size;
      const toolCounts: Record<string, number> = {};
      aiData.forEach(r => { toolCounts[r.tool] = (toolCounts[r.tool] || 0) + 1; });

      const aiToolBreakdown = Object.entries(toolCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      setEngagement({
        activeAIUsers: uniqueAIUsers,
        totalAIGenerations: aiData.length,
        ikigaiCompleted: ikigaiRes.count || 0,
        dreamTargets: dreamRes.count || 0,
        aiToolBreakdown,
      });

      // Domain data
      if (domainsResult.data) {
        const domainCounts: Record<string, number> = {};
        domainsResult.data.forEach((profile) => {
          const domain = profile.study_field || 'Not specified';
          domainCounts[domain] = (domainCounts[domain] || 0) + 1;
        });
        setDomainData(
          Object.entries(domainCounts)
            .map(([name, value]) => ({ name: name.length > 20 ? name.substring(0, 20) + '...' : name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
        );
      }

      // Registration data based on period
      const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = getDaysAgo(daysBack);
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate);

      if (recentUsers) {
        const dailyCounts: Record<string, number> = {};
        for (let i = 0; i < daysBack; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          dailyCounts[date.toISOString().split('T')[0]] = 0;
        }
        recentUsers.forEach((user) => {
          if (user.created_at) {
            const dateStr = user.created_at.split('T')[0];
            if (dailyCounts[dateStr] !== undefined) dailyCounts[dateStr]++;
          }
        });
        setRegistrationData(
          Object.entries(dailyCounts)
            .map(([date, count]) => ({
              date: new Date(date).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' }),
              count,
            }))
            .reverse()
        );
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              {t.admin?.title || 'Admin Panel'}
            </h1>
            <p className="text-muted-foreground">{t.admin?.dashboardSubtitle || 'Platform overview and management'}</p>
          </div>
        </div>

        {/* Platform Stats */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatsCard title="Total Users" value={stats.totalUsers} icon={<Users className="h-6 w-6" />} />
            <StatsCard title="Verified" value={stats.verifiedUsers} icon={<UserCheck className="h-6 w-6" />} description={`${Math.round((stats.verifiedUsers / Math.max(stats.totalUsers, 1)) * 100)}%`} />
            <StatsCard title="Pending Verifications" value={stats.pendingVerifications} icon={<Clock className="h-6 w-6" />} alert={stats.pendingVerifications > 5} />
            <StatsCard title="Onboarding Done" value={stats.onboardingCompleted} icon={<GraduationCap className="h-6 w-6" />} description={`${Math.round((stats.onboardingCompleted / Math.max(stats.totalUsers, 1)) * 100)}%`} />
            <StatsCard title="Total Skills" value={stats.totalSkills} icon={<Sparkles className="h-6 w-6" />} />
            <StatsCard title="Published Gigs" value={stats.publishedGigs} icon={<Briefcase className="h-6 w-6" />} />
          </div>
        )}

        {/* Engagement Stats */}
        {!loading && engagement && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Active AI Users" value={engagement.activeAIUsers} icon={<Brain className="h-6 w-6" />} description={`din ${stats?.totalUsers || 0} total`} />
            <StatsCard title="AI Generations" value={engagement.totalAIGenerations} icon={<Cpu className="h-6 w-6" />} />
            <StatsCard title="Ikigai Completed" value={engagement.ikigaiCompleted} icon={<Sparkles className="h-6 w-6" />} />
            <StatsCard title="Dream 100 Targets" value={engagement.dreamTargets} icon={<Target className="h-6 w-6" />} />
          </div>
        )}

        {/* Period Tabs + Charts */}
        <Tabs value={period} onValueChange={(v) => setPeriod(v as '7d' | '30d' | 'all')}>
          <TabsList>
            <TabsTrigger value="7d">7 zile</TabsTrigger>
            <TabsTrigger value="30d">30 zile</TabsTrigger>
            <TabsTrigger value="all">All time</TabsTrigger>
          </TabsList>

          <TabsContent value={period} className="mt-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Registrations Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Registrations ({period === '7d' ? 'Last 7 Days' : period === '30d' ? 'Last 30 Days' : 'All Time'})</CardTitle>
                  <CardDescription>New user signups per day</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-64" /> : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={registrationData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" interval={period === 'all' ? 6 : period === '30d' ? 2 : 0} />
                        <YAxis allowDecimals={false} className="text-xs" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* AI Tools Usage Chart */}
              {engagement && engagement.aiToolBreakdown.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Tools Usage</CardTitle>
                    <CardDescription>Generări per unealtă AI</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={engagement.aiToolBreakdown} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" allowDecimals={false} className="text-xs" />
                        <YAxis dataKey="name" type="category" width={120} className="text-xs" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Funnel + Email Health */}
        <div className="grid gap-6 md:grid-cols-2">
          <UserFunnel />
          <EmailHealthCard />
        </div>

        {/* Domain Distribution + Activity Feed */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Domain Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Top Study Fields</CardTitle>
              <CardDescription>Distribution of user study fields</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-64" /> : domainData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={250}>
                    <PieChart>
                      <Pie data={domainData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {domainData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {domainData.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm text-muted-foreground">({item.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>

          <ActivityFeed />
        </div>

        {/* Users at Risk */}
        <UsersAtRisk />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t.admin?.quickActions || 'Quick Actions'}</CardTitle>
            <CardDescription>Manage platform features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link to="/admin/verifications">
                  <Clock className="h-4 w-4 mr-2" />
                  {t.admin?.manageVerifications || 'Manage Verifications'}
                  {stats && stats.pendingVerifications > 0 && (
                    <span className="ml-2 bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 text-xs">{stats.pendingVerifications}</span>
                  )}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/users"><Users className="h-4 w-4 mr-2" />View All Users<ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/courses"><BookOpen className="h-4 w-4 mr-2" />Gestionare Cursuri<ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/course-analytics"><BarChart3 className="h-4 w-4 mr-2" />Course Analytics<ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/feedback"><MessageSquare className="h-4 w-4 mr-2" />Feedback Utilizatori<ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/ai-outputs"><Cpu className="h-4 w-4 mr-2" />Generări AI<ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
