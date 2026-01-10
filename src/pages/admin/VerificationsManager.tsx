import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Check, X, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/lib/i18n';
import { MainLayout } from '@/components/layout/MainLayout';
import { VerificationCard } from '@/components/admin/VerificationCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

type VerificationStatus = 'pending' | 'approved' | 'rejected';

interface Verification {
  id: string;
  user_id: string;
  document_type: string | null;
  document_url: string | null;
  status: VerificationStatus;
  created_at: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  admin_id: string | null;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export default function VerificationsManager() {
  const { t } = useI18n();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | VerificationStatus>('all');

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      // Fetch verifications first
      const { data: verificationsData, error: verificationsError } = await supabase
        .from('verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (verificationsError) throw verificationsError;

      // Fetch profiles for each verification
      const userIds = [...new Set(verificationsData?.map(v => v.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      // Combine data
      const combined = (verificationsData || []).map(v => ({
        ...v,
        status: v.status as VerificationStatus,
        profiles: profilesData?.find(p => p.id === v.user_id) || null
      }));

      setVerifications(combined as Verification[]);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVerifications = verifications.filter((v) => {
    if (activeTab === 'all') return true;
    return v.status === activeTab;
  });

  const counts = {
    all: verifications.length,
    pending: verifications.filter((v) => v.status === 'pending').length,
    approved: verifications.filter((v) => v.status === 'approved').length,
    rejected: verifications.filter((v) => v.status === 'rejected').length,
  };

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
            <h1 className="text-3xl font-bold">
              {t.admin?.verifications || 'Verifications Manager'}
            </h1>
            <p className="text-muted-foreground">
              {t.admin?.verificationsSubtitle || 'Review and manage user verification requests'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <Filter className="h-4 w-4" />
              All
              <Badge variant="secondary">{counts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending
              <Badge variant="secondary">{counts.pending}</Badge>
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <Check className="h-4 w-4" />
              Approved
              <Badge variant="secondary">{counts.approved}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <X className="h-4 w-4" />
              Rejected
              <Badge variant="secondary">{counts.rejected}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : filteredVerifications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {t.admin?.noVerifications || 'No verifications found'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVerifications.map((verification) => (
                  <VerificationCard
                    key={verification.id}
                    verification={verification}
                    onStatusChange={fetchVerifications}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
