import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { QuizTranslation } from './quizData';

interface DnaQuizLeadCaptureProps {
  t: QuizTranslation;
  onSubmit: (email: string) => void;
  isLoading: boolean;
}

export function DnaQuizLeadCapture({ t, onSubmit, isLoading }: DnaQuizLeadCaptureProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Email invalid');
      return;
    }
    setError('');
    onSubmit(trimmed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6 max-w-md mx-auto"
    >
      <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
        <Mail className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">{t.emailTitle}</h2>
      <p className="text-muted-foreground">{t.emailSubtitle}</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-center"
          required
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? '...' : t.emailButton}
        </Button>
      </form>
    </motion.div>
  );
}
