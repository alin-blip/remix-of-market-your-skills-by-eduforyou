import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Search, UserCheck, GraduationCap, ShieldOff, ShieldCheck, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/lib/i18n';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  study_field: string | null;
  campus: string | null;
  verified: boolean | null;
  onboarding_completed: boolean | null;
  freedom_score: number | null;
  created_at: string | null;
  is_eduforyou_member: boolean;
}

export default function UsersManager() {
  const { t } = useI18n();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'eduforyou' | 'regular'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEduForYou = async (userId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_eduforyou_member: !currentValue } as any)
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_eduforyou_member: !currentValue } : u
      ));
      
      toast.success(currentValue 
        ? 'Acces EduForYou dezactivat' 
        : 'Acces EduForYou activat'
      );
    } catch (error) {
      console.error('Error toggling EduForYou:', error);
      toast.error('Eroare la actualizare');
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === 'eduforyou' && !user.is_eduforyou_member) return false;
    if (filter === 'regular' && user.is_eduforyou_member) return false;
    
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.study_field?.toLowerCase().includes(query) ||
      user.campus?.toLowerCase().includes(query)
    );
  });

  const eduCount = users.filter(u => u.is_eduforyou_member).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              {t.admin?.users || 'Users Manager'}
            </h1>
            <p className="text-muted-foreground">
              {t.admin?.usersSubtitle || 'View and manage platform users'} • {eduCount} studenți EduForYou
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.admin?.searchUsers || 'Search users...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toți utilizatorii</SelectItem>
              <SelectItem value="eduforyou">Doar EduForYou</SelectItem>
              <SelectItem value="regular">Fără EduForYou</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.admin?.table?.name || 'Name'}</TableHead>
                  <TableHead>{t.admin?.table?.email || 'Email'}</TableHead>
                  <TableHead>Curs</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>{t.admin?.table?.status || 'Status'}</TableHead>
                  <TableHead>{t.admin?.table?.joinedAt || 'Joined'}</TableHead>
                  <TableHead>Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t.admin?.noUsers || 'No users found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <Link to={`/admin/users/${user.id}`} className="text-primary hover:underline">
                          {user.full_name || 'No name'}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.email || 'No email'}
                      </TableCell>
                      <TableCell>
                        {user.study_field ? (
                          <span className="text-sm">{user.study_field}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.campus ? (
                          <div className="flex items-center gap-1.5 text-sm">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            {user.campus}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.is_eduforyou_member && (
                            <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                              <GraduationCap className="h-3 w-3" />
                              EduForYou
                            </Badge>
                          )}
                          {user.verified && (
                            <Badge variant="default" className="gap-1">
                              <UserCheck className="h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                          {user.onboarding_completed && !user.is_eduforyou_member && (
                            <Badge variant="secondary" className="gap-1">
                              Onboarded
                            </Badge>
                          )}
                          {!user.verified && !user.onboarding_completed && !user.is_eduforyou_member && (
                            <Badge variant="outline">New</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.created_at
                          ? format(new Date(user.created_at), 'MMM dd, yyyy')
                          : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={user.is_eduforyou_member ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => toggleEduForYou(user.id, user.is_eduforyou_member)}
                          className="gap-1.5 text-xs"
                        >
                          {user.is_eduforyou_member ? (
                            <>
                              <ShieldOff className="h-3.5 w-3.5" />
                              Blochează
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Activează EDU
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>
    </MainLayout>
  );
}
