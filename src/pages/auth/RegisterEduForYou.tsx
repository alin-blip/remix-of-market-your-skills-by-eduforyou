import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, ArrowRight, GraduationCap, User, Building2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

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

const campuses = ['London', 'Birmingham', 'Manchester', 'Online'];

export default function RegisterEduForYou() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studyField, setStudyField] = useState('');
  const [campus, setCampus] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const canSubmit = fullName.trim() && email.trim() && password.length >= 6 && studyField && campus;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast.error(t.auth.registerFailed, { description: error.message });
        setLoading(false);
        return;
      }

      // Wait briefly for profile trigger to create profile
      await new Promise(r => setTimeout(r, 500));

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({
          full_name: fullName,
          study_field: studyField,
          campus,
          is_eduforyou_member: true,
          onboarding_completed: true,
        } as any).eq('id', user.id);
      }

      toast.success('Cont creat cu succes! Bine ai venit!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('A apărut o eroare. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 gradient-glow pointer-events-none" />
      <div className="fixed top-[12%] right-[12%] w-72 h-72 rounded-full bg-primary/[0.07] blur-3xl animate-float pointer-events-none" />
      <div className="fixed bottom-[15%] left-[10%] w-52 h-52 rounded-full bg-primary/[0.05] blur-2xl animate-float pointer-events-none" style={{ animationDelay: '2.5s' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {t.common.back}
          </Link>
        </div>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 mb-6 group animate-fade-in" style={{ animationDelay: '80ms', animationFillMode: 'both' }}>
          <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center shadow-lg glow-accent group-hover:scale-110 transition-transform">
            <span className="text-accent-foreground font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>M</span>
          </div>
          <span className="text-2xl tracking-tight">
            <span className="italic font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>Market</span>
            <span className="font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>YourSkill</span>
          </span>
        </Link>

        {/* EduForYou badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm mb-6 animate-fade-in" style={{ animationDelay: '120ms', animationFillMode: 'both' }}>
          <GraduationCap className="h-4 w-4 text-primary" />
          <span className="text-primary font-medium">Acces gratuit pentru studenți EduForYou</span>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-6 animate-fade-in" style={{ animationDelay: '150ms', animationFillMode: 'both' }} />

        <div className="p-8 rounded-2xl glass card-shine border-primary/20 animate-slide-up" style={{ animationDelay: '180ms', animationFillMode: 'both' }}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Înregistrare Student EduForYou</h1>
            <p className="text-muted-foreground text-sm">
              Completează datele tale pentru acces gratuit la platformă.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Nume complet
              </Label>
              <Input
                id="fullName"
                placeholder="ex: Maria Popescu"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
                className="h-12 bg-secondary border-border rounded-xl focus:border-primary/40 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-12 bg-secondary border-border rounded-xl focus:border-primary/40 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Parolă</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 caractere"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                className="h-12 bg-secondary border-border rounded-xl focus:border-primary/40 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Cursul tău
              </Label>
              <Select value={studyField} onValueChange={setStudyField}>
                <SelectTrigger className="h-12 bg-secondary border-border rounded-xl focus:border-primary/40">
                  <SelectValue placeholder="Selectează cursul" />
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
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Campusul
              </Label>
              <Select value={campus} onValueChange={setCampus}>
                <SelectTrigger className="h-12 bg-secondary border-border rounded-xl focus:border-primary/40">
                  <SelectValue placeholder="Selectează campusul" />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-12 font-semibold text-base text-primary-foreground rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, hsl(42 62% 55%), hsl(45 80% 65%), hsl(42 62% 55%))', boxShadow: '0 0 30px -8px hsl(42 62% 55% / 0.4)' }}
                disabled={loading || !canSubmit}
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
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-muted-foreground text-sm">
              Ai deja cont?{' '}
              <Link to="/auth/login" className="text-primary hover:underline font-semibold">
                Conectează-te
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-muted-foreground text-xs">
            Nu ești student EduForYou?{' '}
            <Link to="/auth/register" className="text-primary hover:underline">
              Înregistrare standard
            </Link>
          </p>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent mt-8 animate-fade-in" style={{ animationDelay: '650ms', animationFillMode: 'both' }} />
      </div>
    </div>
  );
}
