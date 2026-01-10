import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Verification {
  id: string;
  user_id: string;
}

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verification: Verification;
  action: 'approve' | 'reject';
  onSuccess: () => void;
}

export function VerificationDialog({
  open,
  onOpenChange,
  verification,
  action,
  onSuccess,
}: VerificationDialogProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      if (action === 'approve') {
        // Update verification status
        const { error: verificationError } = await supabase
          .from('verifications')
          .update({
            status: 'approved',
            admin_id: user.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', verification.id);

        if (verificationError) throw verificationError;

        // Update profile verified status
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ verified: true })
          .eq('id', verification.user_id);

        if (profileError) throw profileError;

        toast.success(t.admin?.verification?.approved || 'Verification approved');
      } else {
        // Reject verification
        const { error: verificationError } = await supabase
          .from('verifications')
          .update({
            status: 'rejected',
            admin_id: user.id,
            reviewed_at: new Date().toISOString(),
            rejection_reason: rejectionReason || 'No reason provided',
          })
          .eq('id', verification.id);

        if (verificationError) throw verificationError;

        toast.success(t.admin?.verification?.rejected || 'Verification rejected');
      }

      onSuccess();
      onOpenChange(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {action === 'approve' 
              ? (t.admin?.verification?.approveTitle || 'Approve Verification')
              : (t.admin?.verification?.rejectTitle || 'Reject Verification')
            }
          </AlertDialogTitle>
          <AlertDialogDescription>
            {action === 'approve'
              ? 'Are you sure you want to approve this verification? The user will be marked as verified.'
              : 'Are you sure you want to reject this verification? Please provide a reason.'
            }
          </AlertDialogDescription>
        </AlertDialogHeader>

        {action === 'reject' && (
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">
              {t.admin?.verification?.rejectionReason || 'Rejection Reason'}
            </Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              rows={3}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t.common?.cancel || 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || (action === 'reject' && !rejectionReason.trim())}
            className={action === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {isLoading ? 'Processing...' : action === 'approve' ? 'Approve' : 'Reject'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
