import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      toast.error('Eroare la trimiterea emailului de resetare.');
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 gradient-mesh pointer-events-none" />
        <div className="fixed inset-0 gradient-glow pointer-events-none" />
        <div className="w-full max-w-md relative z-10 text-center">
          <div className="p-8 rounded-2xl glass animate-slide-up">
            <div className="h-16 w-16 rounded-full gradient-accent flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-accent-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">Email trimis!</h1>
            <p className="text-muted-foreground mb-6">
              Verifică inbox-ul pentru linkul de resetare a parolei. Dacă nu îl găsești, verifică și folderul Spam.
            </p>
            <Link to="/auth/login" className="text-primary hover:underline font-semibold">
              ← Înapoi la autentificare
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
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi
          </Link>
        </div>

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
            <h1 className="font-display text-3xl font-bold mb-2">Resetează parola</h1>
            <p className="text-muted-foreground">
              Introdu emailul tău și îți vom trimite un link pentru resetarea parolei.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@exemplu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                  Se trimite...
                </>
              ) : (
                'Trimite link de resetare'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
