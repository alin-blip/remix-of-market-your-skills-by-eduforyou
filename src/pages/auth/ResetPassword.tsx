import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    // Also check URL hash for recovery type
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Parola trebuie să aibă cel puțin 6 caractere.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Parolele nu coincid.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      toast.error('Eroare la resetarea parolei: ' + error.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate('/dashboard'), 3000);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 gradient-mesh pointer-events-none" />
        <div className="fixed inset-0 gradient-glow pointer-events-none" />
        <div className="w-full max-w-md relative z-10 text-center">
          <div className="p-8 rounded-2xl glass animate-slide-up">
            <div className="h-16 w-16 rounded-full gradient-accent flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-accent-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">Parolă resetată!</h1>
            <p className="text-muted-foreground">
              Parola ta a fost actualizată cu succes. Vei fi redirecționat...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 gradient-mesh pointer-events-none" />
        <div className="fixed inset-0 gradient-glow pointer-events-none" />
        <div className="w-full max-w-md relative z-10 text-center">
          <div className="p-8 rounded-2xl glass animate-slide-up">
            <h1 className="font-display text-2xl font-bold mb-4">Link invalid sau expirat</h1>
            <p className="text-muted-foreground mb-6">
              Te rugăm să soliciți un nou link de resetare a parolei.
            </p>
            <Link to="/auth/forgot-password" className="text-primary hover:underline font-semibold">
              Solicită un nou link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 gradient-glow pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center gap-3 mb-8 group">
          <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center shadow-lg glow-accent group-hover:scale-110 transition-transform">
            <Sparkles className="h-6 w-6 text-accent-foreground" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight">
            Student<span className="text-accent">Freedom</span>
          </span>
        </Link>

        <div className="p-8 rounded-2xl glass animate-slide-up">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">Parolă nouă</h1>
            <p className="text-muted-foreground">
              Introdu parola ta nouă mai jos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Parolă nouă</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minim 6 caractere"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                className="h-12 bg-secondary border-border focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmă parola</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repetă parola"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                className="h-12 bg-secondary border-border focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 gradient-primary text-primary-foreground font-semibold text-base glow-primary hover:scale-[1.02] transition-transform"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Se salvează...
                </>
              ) : (
                'Resetează parola'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
