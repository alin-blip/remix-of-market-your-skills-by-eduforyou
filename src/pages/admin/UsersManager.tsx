import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Search, UserCheck, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/lib/i18n';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  study_field: string | null;
  verified: boolean | null;
  onboarding_completed: boolean | null;
  freedom_score: number | null;
  created_at: string | null;
}

export default function UsersManager() {
  const { t } = useI18n();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.study_field?.toLowerCase().includes(query)
    );
  });

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
              {t.admin?.usersSubtitle || 'View and manage platform users'}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.admin?.searchUsers || 'Search users...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.admin?.table?.name || 'Name'}</TableHead>
                  <TableHead>{t.admin?.table?.email || 'Email'}</TableHead>
                  <TableHead>{t.admin?.table?.studyField || 'Study Field'}</TableHead>
                  <TableHead>{t.admin?.table?.status || 'Status'}</TableHead>
                  <TableHead>{t.admin?.table?.freedomScore || 'Score'}</TableHead>
                  <TableHead>{t.admin?.table?.joinedAt || 'Joined'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t.admin?.noUsers || 'No users found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name || 'No name'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email || 'No email'}
                      </TableCell>
                      <TableCell>
                        {user.study_field ? (
                          <span className="text-sm">{user.study_field}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.verified && (
                            <Badge variant="default" className="gap-1">
                              <UserCheck className="h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                          {user.onboarding_completed && (
                            <Badge variant="secondary" className="gap-1">
                              <GraduationCap className="h-3 w-3" />
                              Onboarded
                            </Badge>
                          )}
                          {!user.verified && !user.onboarding_completed && (
                            <Badge variant="outline">New</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{user.freedom_score || 0}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.created_at
                          ? format(new Date(user.created_at), 'MMM dd, yyyy')
                          : 'Unknown'}
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
