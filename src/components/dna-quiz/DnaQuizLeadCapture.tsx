import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import type { QuizTranslation, DnaProfile, QuizLang } from './quizData';

interface DnaQuizLeadCaptureProps {
  t: QuizTranslation;
  onSubmit: (email: string) => void;
  onSignup: (userId: string, email: string) => void;
  isLoading: boolean;
  quizState?: {
    scores: Record<DnaProfile, number>;
    answers: number[];
    result: { primary: DnaProfile; secondary?: DnaProfile } | null;
    lang: QuizLang;
  };
}

export function DnaQuizLeadCapture({ t, onSubmit, onSignup, isLoading }: DnaQuizLeadCaptureProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [signing, setSigning] = useState(false);
  const [mode, setMode] = useState<'signup' | 'login'>('signup');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Email invalid');
      return;
    }
    if (password.length < 6) {
      setError(mode === 'signup' ? 'Min. 6 caractere pentru parolă' : 'Parolă invalidă');
      return;
    }
    setError('');
    setSigning(true);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (signUpError) {
          setError(signUpError.message);
          setSigning(false);
          return;
        }
        if (data.user) {
          onSignup(data.user.id, trimmedEmail);
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (signInError) {
          setError(signInError.message);
          setSigning(false);
          return;
        }
        if (data.user) {
          onSignup(data.user.id, trimmedEmail);
        }
      }
    } catch {
      setError(t.signupError);
      setSigning(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { lovable } = await import('@/integrations/lovable/index');
      await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin + '/dashboard',
      });
    } catch (err) {
      console.error('Google sign-in error:', err);
    }
  };

  const busy = isLoading || signing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-5 max-w-md mx-auto"
    >
      <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
        <Mail className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">{t.signupTitle}</h2>
      <p className="text-muted-foreground text-sm">{t.signupSubtitle}</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-center"
          required
          disabled={busy}
        />
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="password"
            placeholder={t.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 text-center"
            required
            minLength={6}
            disabled={busy}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {mode === 'signup' ? t.signupButton : t.loginLinkAction}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">{t.orContinueWith}</span>
        <Separator className="flex-1" />
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={busy}
      >
        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      </Button>

      <p className="text-xs text-muted-foreground">
        {mode === 'signup' ? (
          <>
            {t.loginLink}{' '}
            <button
              type="button"
              className="text-primary underline hover:no-underline"
              onClick={() => { setMode('login'); setError(''); }}
            >
              {t.loginLinkAction}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="text-primary underline hover:no-underline"
              onClick={() => { setMode('signup'); setError(''); }}
            >
              {t.signupButton.split(' ')[0]} cont
            </button>
          </>
        )}
      </p>
    </motion.div>
  );
}
