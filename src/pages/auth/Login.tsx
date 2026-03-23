import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, ArrowLeft, Globe, Sun, Moon, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { lovable } from '@/integrations/lovable/index';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(window.location.search);
  const isPaid = searchParams.get('paid') === 'true';
  const planParam = searchParams.get('plan');

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 gradient-glow pointer-events-none" />

      {/* Floating gold accent elements */}
      <div className="fixed top-[15%] left-[10%] w-64 h-64 rounded-full bg-primary/[0.07] blur-3xl animate-float pointer-events-none" />
      <div className="fixed bottom-[20%] right-[8%] w-48 h-48 rounded-full bg-primary/[0.05] blur-2xl animate-float pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="fixed top-[60%] left-[60%] w-32 h-32 rounded-full bg-primary/[0.04] blur-2xl animate-pulse-soft pointer-events-none" style={{ animationDelay: '1s' }} />
      
      <div className="w-full max-w-md relative z-10">
        {/* Header with Back link and Language Selector */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.common.back}
          </Link>
          
          <div className="flex gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setLocale('ro')}
                  className={cn(locale === 'ro' && 'bg-accent')}
                >
                  🇷🇴 Română
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLocale('en')}
                  className={cn(locale === 'en' && 'bg-accent')}
                >
                  🇬🇧 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {theme === 'light' ? <Sun className="h-4 w-4" /> : theme === 'dark' ? <Moon className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setTheme('light')}
                  className={cn(theme === 'light' && 'bg-accent')}
                >
                  <Sun className="h-4 w-4 mr-2" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTheme('dark')}
                  className={cn(theme === 'dark' && 'bg-accent')}
                >
                  <Moon className="h-4 w-4 mr-2" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTheme('system')}
                  className={cn(theme === 'system' && 'bg-accent')}
                >
                  <Monitor className="h-4 w-4 mr-2" /> System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 mb-8 group animate-fade-in" style={{ animationDelay: '80ms', animationFillMode: 'both' }}>
          <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center shadow-lg glow-accent group-hover:scale-110 transition-transform">
            <span className="text-accent-foreground font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>M</span>
          </div>
          <span className="text-2xl tracking-tight">
            <span className="italic font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>Market</span>
            <span className="font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>YourSkill</span>
          </span>
        </Link>

        {/* Decorative gold line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-8 animate-fade-in" style={{ animationDelay: '120ms', animationFillMode: 'both' }} />

        {/* Form Card */}
        <div className="p-8 rounded-2xl glass card-shine border-primary/20 animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
          <div className="mb-8 animate-slide-up" style={{ animationDelay: '220ms', animationFillMode: 'both' }}>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{t.auth.welcomeBack}</h1>
            <p className="text-muted-foreground">
              {t.auth.loginDescription}
            </p>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-border hover:border-primary/30 bg-secondary hover:bg-secondary/80 font-medium text-base mb-4 transition-all duration-300"
              onClick={async () => {
                const { error } = await lovable.auth.signInWithOAuth('google', {
                  redirect_uri: window.location.origin + '/dashboard',
                });
                if (error) toast.error('Google login failed');
              }}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {t.auth.loginButton} cu Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-border hover:border-primary/30 bg-secondary hover:bg-secondary/80 font-medium text-base mb-4 transition-all duration-300"
              onClick={async () => {
                const { error } = await lovable.auth.signInWithOAuth('apple', {
                  redirect_uri: window.location.origin + '/dashboard',
                });
                if (error) toast.error('Apple login failed');
              }}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              {t.auth.loginButton} cu Apple
            </Button>
          </div>

          <div className="relative mb-4 animate-fade-in" style={{ animationDelay: '350ms', animationFillMode: 'both' }}>
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">sau</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
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
                className="h-12 bg-secondary border-border rounded-xl focus:border-primary/40 focus:ring-primary/20 transition-all duration-300"
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
                className="h-12 bg-secondary border-border rounded-xl focus:border-primary/40 focus:ring-primary/20 transition-all duration-300"
              />
            </div>

            <div className="animate-scale-in" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
              <Button 
                type="submit" 
                className="w-full h-12 font-semibold text-base text-primary-foreground rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, hsl(42 62% 55%), hsl(45 80% 65%), hsl(42 62% 55%))', boxShadow: '0 0 30px -8px hsl(42 62% 55% / 0.4)' }}
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
            </div>
          </form>

          <div className="mt-4 text-center animate-fade-in" style={{ animationDelay: '550ms', animationFillMode: 'both' }}>
            <Link to="/auth/forgot-password" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Ai uitat parola?
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-border text-center animate-fade-in" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
            <p className="text-muted-foreground">
              {t.auth.noAccount}{' '}
              <Link to="/auth/register" className="text-primary hover:underline font-semibold">
                {t.auth.registerFree}
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom decorative gold line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent mt-8 animate-fade-in" style={{ animationDelay: '650ms', animationFillMode: 'both' }} />
      </div>
    </div>
  );
}
