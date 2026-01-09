import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Target, 
  Package, 
  MessageSquare, 
  ArrowRight,
  CheckCircle2,
  Zap,
  TrendingUp,
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Skill Scanner AI',
    description: 'Descoperă competențele tale monetizabile folosind inteligența artificială.',
  },
  {
    icon: Target,
    title: 'Ikigai Builder',
    description: 'Găsește-ți direcția perfectă la intersecția pasiunii cu piața.',
  },
  {
    icon: Package,
    title: 'Offer Builder',
    description: 'Creează pachete de servicii profesionale cu prețuri optimizate.',
  },
  {
    icon: MessageSquare,
    title: 'Outreach Generator',
    description: 'Generează mesaje personalizate pentru primii tăi clienți.',
  },
];

const benefits = [
  'Descoperă ce poți vinde ca student',
  'Primești un plan personalizat AI',
  'Creezi oferta ta în sub 30 minute',
  'Trimiți primul outreach azi',
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-accent flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="font-display font-bold text-lg">Student Freedom</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth/login">Autentificare</Link>
            </Button>
            <Button asChild className="gradient-accent text-accent-foreground hover:opacity-90">
              <Link to="/auth/register">
                Începe gratuit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 gradient-hero text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-sm mb-6">
              <Zap className="h-4 w-4 text-accent" />
              <span>Platformă AI pentru studenți freelanceri</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Transformă-ți cunoștințele în{' '}
              <span className="text-accent">venit real</span>
            </h1>
            
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              De la „nu știu ce pot vinde" la primul tău client plătit. 
              Student Freedom OS te ghidează pas cu pas folosind AI.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button size="lg" asChild className="gradient-accent text-accent-foreground hover:opacity-90 text-lg px-8">
                <Link to="/auth/register">
                  Începe gratuit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
                <Link to="/auth/login">Am deja cont</Link>
              </Button>
            </div>
            
            {/* Benefits List */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-white/90">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Tot ce ai nevoie pentru primul client
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Patru unelte AI care te duc de la idee la primele mesaje de outreach.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={i}
                  className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group"
                >
                  <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Cum funcționează
            </h2>
            <p className="text-lg text-muted-foreground">
              Trei pași simpli către libertatea financiară
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Completează onboarding-ul', desc: '5 minute de întrebări despre tine, studii și obiective.' },
              { step: '2', title: 'Lasă AI-ul să lucreze', desc: 'Skill Scanner, Ikigai și Offer Builder îți creează planul.' },
              { step: '3', title: 'Trimite outreach', desc: 'Folosește mesajele generate pentru a contacta primii clienți.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="h-14 w-14 rounded-full gradient-accent flex items-center justify-center text-2xl font-display font-bold text-accent-foreground mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary">
        <div className="container text-center">
          <TrendingUp className="h-12 w-12 text-primary-foreground/80 mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Gata să începi?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Înscrie-te gratuit și descoperă potențialul tău de freelancer.
          </p>
          <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90 text-lg px-8">
            <Link to="/auth/register">
              Creează cont gratuit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-foreground text-background/60">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded gradient-accent flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="font-display font-semibold text-background">Student Freedom OS</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Eduforyou. Toate drepturile rezervate.
          </p>
        </div>
      </footer>
    </div>
  );
}
