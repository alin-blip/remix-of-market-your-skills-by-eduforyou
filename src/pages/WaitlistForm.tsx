import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, CheckCircle2, Loader2, ArrowRight, Globe, Calendar, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import logoImg from '@/assets/logo.png';

const DOMAIN_OPTIONS = ['IT', 'Marketing', 'Design', 'Business', 'Educație', 'Sănătate', 'Altele'];
const FREELANCE_OPTIONS = ['Da', 'Nu', 'Puțin'];
const HOW_HEARD_OPTIONS = ['Social Media', 'Prieten', 'Google', 'TikTok', 'YouTube', 'Altele'];

const eduforyouCourses = [
  { category: 'Business & Management', name: 'Applied Business Psychology (BSc)' },
  { category: 'Business & Management', name: 'Global Business Management (BSc)' },
  { category: 'Business & Management', name: 'Project Management (BSc)' },
  { category: 'Business & Management', name: 'Accounting & Finance (BSc)' },
  { category: 'Business & Management', name: 'Business & Tourism (BSc)' },
  { category: 'Business & Management', name: 'Business (HND)' },
  { category: 'Business & Management', name: 'Global Business Entrepreneurship (BSc)' },
  { category: 'Business & Management', name: 'Business Administration (MBA)' },
  { category: 'Business & Management', name: 'Marketing Management (BSc)' },
  { category: 'Business & Management', name: 'International Business (BSc)' },
  { category: 'Business & Management', name: 'Human Resource Management (BSc)' },
  { category: 'Technology & Computing', name: 'Computing (BSc)' },
  { category: 'Technology & Computing', name: 'Computer Science (BSc)' },
  { category: 'Technology & Computing', name: 'Software Engineering (BSc)' },
  { category: 'Technology & Computing', name: 'Cyber Security (BSc)' },
  { category: 'Technology & Computing', name: 'Cyber Security (HND)' },
  { category: 'Technology & Computing', name: 'Data Science (BSc)' },
  { category: 'Technology & Computing', name: 'Artificial Intelligence (BSc)' },
  { category: 'Technology & Computing', name: 'Information Technology (BSc)' },
  { category: 'Technology & Computing', name: 'Web Development (BSc)' },
  { category: 'Healthcare & Social Sciences', name: 'Psychology & Counselling (BSc)' },
  { category: 'Healthcare & Social Sciences', name: 'Healthcare Practice (HND)' },
  { category: 'Healthcare & Social Sciences', name: 'Nursing (BSc)' },
  { category: 'Healthcare & Social Sciences', name: 'Health & Social Care (BSc)' },
  { category: 'Healthcare & Social Sciences', name: 'Public Health (BSc)' },
  { category: 'Healthcare & Social Sciences', name: 'Social Work (BSc)' },
  { category: 'Healthcare & Social Sciences', name: 'Biomedical Science (BSc)' },
  { category: 'Construction & Engineering', name: 'Construction Management (BSc)' },
  { category: 'Construction & Engineering', name: 'Construction Management (HND)' },
  { category: 'Construction & Engineering', name: 'Civil Engineering (BEng)' },
  { category: 'Construction & Engineering', name: 'Mechanical Engineering (BEng)' },
  { category: 'Construction & Engineering', name: 'Electrical Engineering (BEng)' },
  { category: 'Construction & Engineering', name: 'Architecture (BA)' },
  { category: 'Construction & Engineering', name: 'Quantity Surveying (BSc)' },
  { category: 'Creative & Media', name: 'Graphic Design (BA)' },
  { category: 'Creative & Media', name: 'Digital Marketing (BSc)' },
  { category: 'Creative & Media', name: 'Media & Communications (BA)' },
  { category: 'Creative & Media', name: 'Film & Television Production (BA)' },
  { category: 'Creative & Media', name: 'Photography (BA)' },
  { category: 'Creative & Media', name: 'Fashion Design (BA)' },
  { category: 'Law & Humanities', name: 'Law (LLB)' },
  { category: 'Law & Humanities', name: 'Criminology (BSc)' },
  { category: 'Law & Humanities', name: 'Politics & International Relations (BA)' },
  { category: 'Law & Humanities', name: 'History (BA)' },
  { category: 'Law & Humanities', name: 'English Literature (BA)' },
];

const coursesByCategory = eduforyouCourses.reduce((acc, course) => {
  if (!acc[course.category]) acc[course.category] = [];
  acc[course.category].push(course.name);
  return acc;
}, {} as Record<string, string[]>);

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
    study_field: '',
    date_of_birth: '',
    preferred_locale: 'ro',
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
      email: form.email.trim().toLowerCase(),
      phone: form.phone,
      domain: form.domain || null,
      freelance_experience: form.freelance_experience || null,
      objective: form.objective || null,
      country: form.country || null,
      how_heard: form.how_heard || null,
      is_eduforyou_member: form.is_eduforyou_member,
      study_field: form.study_field || null,
      date_of_birth: form.date_of_birth || null,
      preferred_locale: form.preferred_locale || 'ro',
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

            {/* 4. Data nașterii */}
            <div className="space-y-1.5">
              <Label htmlFor="date_of_birth" className="text-sm font-medium flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Data nașterii
              </Label>
              <Input
                id="date_of_birth"
                type="date"
                value={form.date_of_birth}
                onChange={(e) => updateField('date_of_birth', e.target.value)}
                disabled={loading}
                className="h-11 bg-secondary border-border focus:border-primary"
              />
            </div>

            {/* 5. Curs universitar */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                Curs universitar (Eduforyou)
              </Label>
              <Select value={form.study_field} onValueChange={(v) => updateField('study_field', v)}>
                <SelectTrigger className="h-11 bg-secondary border-border">
                  <SelectValue placeholder="Alege cursul tău" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {Object.entries(coursesByCategory).map(([category, courses]) => (
                    <SelectGroup key={category}>
                      <SelectLabel className="text-primary font-semibold">{category}</SelectLabel>
                      {courses.map((course) => (
                        <SelectItem key={course} value={course}>{course}</SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                  <SelectGroup>
                    <SelectLabel className="text-primary font-semibold">Altele</SelectLabel>
                    <SelectItem value="Altul (specificați)">Altul (specificați)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Selectează cursul la care ești înscris sau pe care îl urmezi prin Eduforyou.
              </p>
            </div>

            {/* 6. Limba preferată */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Limba preferată
              </Label>
              <Select value={form.preferred_locale} onValueChange={(v) => updateField('preferred_locale', v)}>
                <SelectTrigger className="h-11 bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ro">🇷🇴 Română</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 7. Domeniu */}
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

            {/* 8. Experienta freelancing */}
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

            {/* 9. Obiectiv */}
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

            {/* 10. Tara */}
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

            {/* 11. De unde ai auzit */}
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

            {/* 12. Eduforyou - ULTIMUL */}
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
