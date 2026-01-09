import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const benefits = [
  'Acces la toate uneltele AI',
  'Plan personalizat de freelancing',
  'Template-uri de outreach',
];

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error('Parola prea scurtă', {
        description: 'Parola trebuie să aibă minim 6 caractere.',
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, fullName);

    if (error) {
      toast.error('Înregistrare eșuată', {
        description: error.message || 'A apărut o eroare. Încearcă din nou.',
      });
      setLoading(false);
      return;
    }

    toast.success('Cont creat cu succes!', {
      description: 'Bine ai venit în Student Freedom OS!',
    });
    navigate('/onboard');
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
          Înapoi
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
            <h1 className="font-display text-3xl font-bold mb-2">Creează cont</h1>
            <p className="text-muted-foreground">
              Începe-ți călătoria spre libertate financiară
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">Nume complet</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Ion Popescu"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
                className="h-12 bg-secondary border-border focus:border-primary"
              />
            </div>
            
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
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Parolă</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minim 6 caractere"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                className="h-12 bg-secondary border-border focus:border-primary"
              />
            </div>

            {/* Benefits */}
            <div className="py-4 space-y-3">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full gradient-accent flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-accent-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 gradient-accent text-accent-foreground font-semibold text-base glow-accent hover:scale-[1.02] transition-transform"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Se creează contul...
                </>
              ) : (
                <>
                  Creează cont gratuit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-muted-foreground">
              Ai deja cont?{' '}
              <Link to="/auth/login" className="text-primary hover:underline font-semibold">
                Autentifică-te
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
