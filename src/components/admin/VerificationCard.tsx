import { useState } from 'react';
import { format } from 'date-fns';
import { Check, X, Clock, User, FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { VerificationDialog } from './VerificationDialog';
import { useI18n } from '@/lib/i18n';

interface Verification {
  id: string;
  user_id: string;
  document_type: string | null;
  document_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  admin_id: string | null;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

interface VerificationCardProps {
  verification: Verification;
  onStatusChange: () => void;
}

export function VerificationCard({ verification, onStatusChange }: VerificationCardProps) {
  const { t } = useI18n();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject'>('approve');

  const statusConfig = {
    pending: {
      label: t.admin?.verification?.pending || 'Pending',
      variant: 'secondary' as const,
      icon: Clock,
    },
    approved: {
      label: t.admin?.verification?.approved || 'Approved',
      variant: 'default' as const,
      icon: Check,
    },
    rejected: {
      label: t.admin?.verification?.rejected || 'Rejected',
      variant: 'destructive' as const,
      icon: X,
    },
  };

  const config = statusConfig[verification.status];
  const StatusIcon = config.icon;

  const handleAction = (action: 'approve' | 'reject') => {
    setDialogAction(action);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">
                  {verification.profiles?.full_name || 'Unknown User'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {verification.profiles?.email || 'No email'}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  <span>{verification.document_type || 'No document'}</span>
                </div>
                {verification.created_at && (
                  <p className="text-xs text-muted-foreground">
                    Submitted: {format(new Date(verification.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <Badge variant={config.variant} className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {config.label}
              </Badge>

              {verification.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction('reject')}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4 mr-1" />
                    {t.admin?.verification?.reject || 'Reject'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAction('approve')}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {t.admin?.verification?.approve || 'Approve'}
                  </Button>
                </div>
              )}

              {verification.document_url && (
                <Button size="sm" variant="ghost" asChild>
                  <a href={verification.document_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Document
                  </a>
                </Button>
              )}
            </div>
          </div>

          {verification.status === 'rejected' && verification.rejection_reason && (
            <div className="mt-3 p-2 bg-destructive/10 rounded-md">
              <p className="text-sm text-destructive">
                <strong>Reason:</strong> {verification.rejection_reason}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <VerificationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        verification={verification}
        action={dialogAction}
        onSuccess={onStatusChange}
      />
    </>
  );
}
