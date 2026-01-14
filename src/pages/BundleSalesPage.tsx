import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  Clock, 
  BookOpen, 
  Award, 
  CheckCircle, 
  Star, 
  Package,
  ShieldCheck,
  Zap,
  Loader2,
  Percent
} from 'lucide-react';
import { toast } from 'sonner';

interface Bundle {
  id: string;
  title: string;
  description: string | null;
  bundle_price: number;
  original_price: number;
  currency: string | null;
  thumbnail_url: string | null;
  stripe_price_id: string | null;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  lessons_count: number | null;
}

export default function BundleSalesPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    fetchBundle();
  }, [slug]);

  useEffect(() => {
    if (bundle && user) {
      checkPurchaseStatus();
    }
  }, [bundle, user]);

  const fetchBundle = async () => {
    try {
      const { data: bundleData, error: bundleError } = await supabase
        .from('course_bundles')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (bundleError) throw bundleError;
      setBundle(bundleData);

      // Fetch courses in the bundle
      const { data: bundleCourses } = await supabase
        .from('bundle_courses')
        .select('course_id, position')
        .eq('bundle_id', bundleData.id)
        .order('position');

      if (bundleCourses && bundleCourses.length > 0) {
        const courseIds = bundleCourses.map(bc => bc.course_id);
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, title, description, thumbnail_url, duration_minutes, lessons_count')
          .in('id', courseIds);

        setCourses(coursesData || []);
      }
    } catch (error) {
      console.error('Error fetching bundle:', error);
      toast.error('Bundle-ul nu a fost găsit');
    } finally {
      setLoading(false);
    }
  };

  const checkPurchaseStatus = async () => {
    if (!bundle || !user) return;

    const { data } = await supabase
      .from('bundle_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('bundle_id', bundle.id)
      .eq('status', 'completed')
      .maybeSingle();

    setHasPurchased(!!data);
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate(`/auth/login?redirect=/bundles/${slug}`);
      return;
    }

    if (!bundle?.stripe_price_id) {
      toast.error('Bundle-ul nu este disponibil pentru cumpărare');
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          priceId: bundle.stripe_price_id,
          mode: 'payment',
          successUrl: `${window.location.origin}/payment-success?type=bundle&bundle_id=${bundle.id}`,
          cancelUrl: `${window.location.origin}/bundles/${slug}?canceled=true`,
          userId: user.id,
          bundleId: bundle.id,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Eroare la procesarea plății');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-2xl font-bold">Bundle-ul nu a fost găsit</h1>
        <Button onClick={() => navigate('/learning-hub')}>
          Înapoi la cursuri
        </Button>
      </div>
    );
  }

  const savings = bundle.original_price - bundle.bundle_price;
  const savingsPercent = Math.round((savings / bundle.original_price) * 100);
  const totalDuration = courses.reduce((acc, c) => acc + (c.duration_minutes || 0), 0);
  const totalLessons = courses.reduce((acc, c) => acc + (c.lessons_count || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="gradient-glow absolute inset-0" />
        <div className="gradient-mesh absolute inset-0" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <Badge className="gradient-accent text-accent-foreground text-sm px-4 py-1">
              <Percent className="h-4 w-4 mr-1" />
              Economisești {savingsPercent}%
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {bundle.title}
            </h1>
            
            <p className="text-xl text-muted-foreground">
              {bundle.description || `${courses.length} cursuri premium într-un singur pachet la preț redus.`}
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <span>{courses.length} cursuri</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>{totalLessons} lecții</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>{Math.round(totalDuration / 60)}h conținut</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span>{courses.length} certificate</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground line-through">£{bundle.original_price}</div>
                <div className="text-4xl font-bold text-gradient">£{bundle.bundle_price}</div>
              </div>
              
              {hasPurchased ? (
                <Button size="lg" className="gap-2" onClick={() => navigate('/learning-hub')}>
                  <Play className="h-5 w-5" />
                  Accesează cursurile
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="gap-2 gradient-primary glow-primary px-8"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Cumpără pachetul
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Included */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Cursuri incluse în pachet
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Toate aceste cursuri premium, la un preț imbatabil
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="glass hover-lift overflow-hidden">
                <div className="aspect-video bg-muted">
                  {course.thumbnail_url ? (
                    <img 
                      src={course.thumbnail_url} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center gradient-primary">
                      <BookOpen className="h-12 w-12 text-white/60" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.duration_minutes ? `${Math.round(course.duration_minutes / 60)}h` : 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {course.lessons_count || 0} lecții
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Value Comparison */}
      <section className="py-16 bg-card/50">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="glass border-accent/30 glow-accent">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Valoare totală: £{bundle.original_price}</h3>
                  <ul className="space-y-3">
                    {courses.map((course) => (
                      <li key={course.id} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        {course.title}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-center space-y-4">
                  <div className="text-sm text-muted-foreground">Plătești doar</div>
                  <div className="text-5xl font-bold text-gradient">£{bundle.bundle_price}</div>
                  <Badge className="gradient-accent text-accent-foreground text-lg px-4 py-2">
                    Economisești £{savings}!
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="glass border-primary/30">
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              <ShieldCheck className="h-16 w-16 mx-auto text-primary" />
              <h2 className="text-3xl font-bold">Garanție 30 de zile</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Cumperi fără risc. Dacă nu ești satisfăcut, îți returnăm banii complet în primele 30 de zile.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-card/50">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Nu rata această ofertă!
          </h2>
          
          {hasPurchased ? (
            <Button size="lg" className="gap-2 px-8" onClick={() => navigate('/learning-hub')}>
              <Play className="h-5 w-5" />
              Accesează cursurile tale
            </Button>
          ) : (
            <Button 
              size="lg" 
              className="gap-2 gradient-primary glow-primary px-12"
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Cumpără acum - £{bundle.bundle_price}
                </>
              )}
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Student Freedom OS. Toate drepturile rezervate.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link to="/" className="hover:text-foreground transition-colors">Acasă</Link>
            <Link to="/learning-hub" className="hover:text-foreground transition-colors">Cursuri</Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors">Prețuri</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
