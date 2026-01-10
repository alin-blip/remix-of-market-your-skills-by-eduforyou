import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(t.auth.loginFailed, {
        description: t.auth.loginFailedDescription,
      });
      setLoading(false);
      return;
    }

    toast.success(t.auth.welcomeBack + '!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 gradient-glow pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Back link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.common.back}
        </Link>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 mb-8 group">
          <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center shadow-lg glow-accent group-hover:scale-110 transition-transform">
            <Sparkles className="h-6 w-6 text-accent-foreground" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight">
            Student<span className="text-accent">Freedom</span>
          </span>
        </Link>

        {/* Form Card */}
        <div className="p-8 rounded-2xl glass animate-slide-up">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">{t.auth.welcomeBack}</h1>
            <p className="text-muted-foreground">
              {t.auth.loginDescription}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">{t.auth.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-12 bg-secondary border-border focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">{t.auth.password}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  {t.auth.loggingIn}
                </>
              ) : (
                t.auth.loginButton
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-muted-foreground">
              {t.auth.noAccount}{' '}
              <Link to="/auth/register" className="text-accent hover:underline font-semibold">
                {t.auth.registerFree}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
