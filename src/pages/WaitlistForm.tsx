import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, ArrowLeft, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import logoImg from '@/assets/logo.png';

const DOMAIN_OPTIONS = ['IT', 'Marketing', 'Design', 'Business', 'Educație', 'Sănătate', 'Altele'];
const FREELANCE_OPTIONS = ['Da', 'Nu', 'Puțin'];
const HOW_HEARD_OPTIONS = ['Social Media', 'Prieten', 'Google', 'TikTok', 'YouTube', 'Altele'];

export default function WaitlistForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    domain: '',
    freelance_experience: '',
    objective: '',
    country: '',
    how_heard: '',
    is_eduforyou_member: false,
  });

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.phone) {
      toast.error('Te rugăm să completezi toate câmpurile obligatorii.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('waitlist_applications').insert({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      domain: form.domain || null,
      freelance_experience: form.freelance_experience || null,
      objective: form.objective || null,
      country: form.country || null,
      how_heard: form.how_heard || null,
      is_eduforyou_member: form.is_eduforyou_member,
    });

    setLoading(false);

    if (error) {
      if (error.code === '23505') {
        toast.error('Acest email este deja înregistrat în waitlist.');
      } else {
        toast.error('A apărut o eroare. Te rugăm să încerci din nou.');
      }
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 gradient-mesh pointer-events-none" />
        <div className="fixed inset-0 gradient-glow pointer-events-none" />
        <div className="w-full max-w-md relative z-10 text-center">
          <div className="p-8 rounded-2xl glass animate-slide-up">
            <div className="h-16 w-16 rounded-full gradient-accent flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-accent-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">Mulțumim! 🎉</h1>
            <p className="text-muted-foreground mb-6">
              Aplicația ta a fost trimisă cu succes. Vom reveni cu un răspuns în cel mai scurt timp posibil.
            </p>
            <Link to="/" className="text-primary hover:underline font-semibold">
              ← Înapoi la pagina principală
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

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi
          </Link>
        </div>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 mb-6 group">
          <img src={logoImg} alt="Logo" className="h-10 w-10 rounded-xl" />
          <span className="font-display font-bold text-2xl tracking-tight">
            Student<span className="text-accent">Freedom</span>
          </span>
        </Link>

        {/* Form Card */}
        <div className="p-8 rounded-2xl glass animate-slide-up">
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold mb-2">Înscrie-te pe Waitlist</h1>
            <p className="text-muted-foreground">
              Completează formularul pentru a te înscrie în programul beta. Locurile sunt limitate.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Nume complet */}
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-sm font-medium">Nume complet *</Label>
              <Input
                id="full_name"
                placeholder="Ion Popescu"
                value={form.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                required
                disabled={loading}
                className="h-11 bg-secondary border-border focus:border-primary"
              />
            </div>

            {/* 2. Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@exemplu.com"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
                disabled={loading}
                className="h-11 bg-secondary border-border focus:border-primary"
              />
            </div>

            {/* 3. Telefon */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium">Telefon *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+40 7XX XXX XXX"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                required
                disabled={loading}
                className="h-11 bg-secondary border-border focus:border-primary"
              />
            </div>

            {/* 4. Domeniu */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">În ce domeniu lucrezi/studiezi?</Label>
              <Select value={form.domain} onValueChange={(v) => updateField('domain', v)}>
                <SelectTrigger className="h-11 bg-secondary border-border">
                  <SelectValue placeholder="Alege domeniul" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAIN_OPTIONS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 5. Experienta freelancing */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Ai experiență cu freelancing?</Label>
              <RadioGroup
                value={form.freelance_experience}
                onValueChange={(v) => updateField('freelance_experience', v)}
                className="flex gap-4"
              >
                {FREELANCE_OPTIONS.map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <RadioGroupItem value={opt} id={`freelance-${opt}`} />
                    <Label htmlFor={`freelance-${opt}`} className="text-sm cursor-pointer">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* 6. Obiectiv */}
            <div className="space-y-1.5">
              <Label htmlFor="objective" className="text-sm font-medium">Ce obiectiv ai cu platforma?</Label>
              <Textarea
                id="objective"
                placeholder="Descrie pe scurt ce vrei să obții..."
                value={form.objective}
                onChange={(e) => updateField('objective', e.target.value)}
                disabled={loading}
                className="bg-secondary border-border focus:border-primary min-h-[80px]"
              />
            </div>

            {/* 7. Tara */}
            <div className="space-y-1.5">
              <Label htmlFor="country" className="text-sm font-medium">Țara de rezidență</Label>
              <Input
                id="country"
                placeholder="România"
                value={form.country}
                onChange={(e) => updateField('country', e.target.value)}
                disabled={loading}
                className="h-11 bg-secondary border-border focus:border-primary"
              />
            </div>

            {/* 8. De unde ai auzit */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">De unde ai auzit de noi?</Label>
              <Select value={form.how_heard} onValueChange={(v) => updateField('how_heard', v)}>
                <SelectTrigger className="h-11 bg-secondary border-border">
                  <SelectValue placeholder="Selectează" />
                </SelectTrigger>
                <SelectContent>
                  {HOW_HEARD_OPTIONS.map((h) => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 9. Eduforyou - ULTIMUL */}
            <div className="space-y-1.5 pt-2 border-t border-border">
              <Label className="text-sm font-medium">Ești înscris cu Eduforyou?</Label>
              <RadioGroup
                value={form.is_eduforyou_member ? 'da' : 'nu'}
                onValueChange={(v) => updateField('is_eduforyou_member', v === 'da')}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="da" id="edu-da" />
                  <Label htmlFor="edu-da" className="text-sm cursor-pointer">Da</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="nu" id="edu-nu" />
                  <Label htmlFor="edu-nu" className="text-sm cursor-pointer">Nu</Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              type="submit"
              className="w-full h-12 gradient-accent text-accent-foreground font-semibold text-base glow-accent hover:scale-[1.02] transition-transform mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Se trimite...
                </>
              ) : (
                <>
                  Trimite aplicația
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
