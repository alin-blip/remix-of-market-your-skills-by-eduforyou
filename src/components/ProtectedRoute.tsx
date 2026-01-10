import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireOnboarding = true,
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const location = useLocation();

  // Show loading state while checking auth and admin status
  if (loading || (requireAdmin && adminLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Use secure server-side admin check for admin routes
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Redirect to onboarding if not completed
  if (requireOnboarding && !profile?.onboarding_completed && location.pathname !== '/onboard') {
    return <Navigate to="/onboard" replace />;
  }

  return <>{children}</>;
}
