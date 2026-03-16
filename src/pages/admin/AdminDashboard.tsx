import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Clock, GraduationCap, Sparkles, Briefcase, Shield, ArrowRight, BarChart3, BookOpen, MessageSquare, Cpu } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/lib/i18n';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Stats {
  totalUsers: number;
  verifiedUsers: number;
  pendingVerifications: number;
  onboardingCompleted: number;
  totalSkills: number;
  publishedGigs: number;
}

interface DomainData {
  name: string;
  value: number;
}

interface RegistrationData {
  date: string;
  count: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function AdminDashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState<Stats | null>(null);
  const [domainData, setDomainData] = useState<DomainData[]>([]);
  const [registrationData, setRegistrationData] = useState<RegistrationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all stats in parallel
      const [
        usersResult,
        verifiedResult,
        pendingResult,
        onboardingResult,
        skillsResult,
        gigsResult,
        domainsResult,
      ] = await Promise.all([
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

      // Process domain data
      if (domainsResult.data) {
        const domainCounts: Record<string, number> = {};
        domainsResult.data.forEach((profile) => {
          const domain = profile.study_field || 'Not specified';
          domainCounts[domain] = (domainCounts[domain] || 0) + 1;
        });
        
        const sortedDomains = Object.entries(domainCounts)
          .map(([name, value]) => ({ name: name.length > 20 ? name.substring(0, 20) + '...' : name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        
        setDomainData(sortedDomains);
      }

      // Fetch registration data for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentUsers) {
        const dailyCounts: Record<string, number> = {};
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          dailyCounts[dateStr] = 0;
        }

        recentUsers.forEach((user) => {
          if (user.created_at) {
            const dateStr = user.created_at.split('T')[0];
            if (dailyCounts[dateStr] !== undefined) {
              dailyCounts[dateStr]++;
            }
          }
        });

        setRegistrationData(
          Object.entries(dailyCounts)
            .map(([date, count]) => ({ 
              date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }), 
              count 
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
            <p className="text-muted-foreground">
              {t.admin?.dashboardSubtitle || 'Platform overview and management'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatsCard
              title={t.admin?.stats?.totalUsers || 'Total Users'}
              value={stats.totalUsers}
              icon={<Users className="h-6 w-6" />}
            />
            <StatsCard
              title={t.admin?.stats?.verifiedUsers || 'Verified Users'}
              value={stats.verifiedUsers}
              icon={<UserCheck className="h-6 w-6" />}
              description={`${Math.round((stats.verifiedUsers / Math.max(stats.totalUsers, 1)) * 100)}%`}
            />
            <StatsCard
              title={t.admin?.stats?.pendingVerifications || 'Pending Verifications'}
              value={stats.pendingVerifications}
              icon={<Clock className="h-6 w-6" />}
            />
            <StatsCard
              title={t.admin?.stats?.onboardingCompleted || 'Onboarding Completed'}
              value={stats.onboardingCompleted}
              icon={<GraduationCap className="h-6 w-6" />}
              description={`${Math.round((stats.onboardingCompleted / Math.max(stats.totalUsers, 1)) * 100)}%`}
            />
            <StatsCard
              title={t.admin?.stats?.totalSkills || 'Total Skills'}
              value={stats.totalSkills}
              icon={<Sparkles className="h-6 w-6" />}
            />
            <StatsCard
              title={t.admin?.stats?.publishedGigs || 'Published Gigs'}
              value={stats.publishedGigs}
              icon={<Briefcase className="h-6 w-6" />}
            />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Registrations Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t.admin?.charts?.registrations || 'Registrations (Last 7 Days)'}</CardTitle>
              <CardDescription>New user signups per day</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={registrationData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis allowDecimals={false} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Domain Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t.admin?.charts?.domains || 'Top Study Fields'}</CardTitle>
              <CardDescription>Distribution of user study fields</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64" />
              ) : domainData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={250}>
                    <PieChart>
                      <Pie
                        data={domainData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {domainData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {domainData.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm text-muted-foreground">({item.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
                    <span className="ml-2 bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 text-xs">
                      {stats.pendingVerifications}
                    </span>
                  )}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  {t.admin?.viewUsers || 'View All Users'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/courses">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Gestionare Cursuri
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/course-analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Course Analytics
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/feedback">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Feedback Utilizatori
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/ai-outputs">
                  <Cpu className="h-4 w-4 mr-2" />
                  Generări AI
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
