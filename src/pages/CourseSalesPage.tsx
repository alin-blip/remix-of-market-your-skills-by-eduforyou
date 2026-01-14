import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Clock, 
  BookOpen, 
  Award, 
  CheckCircle, 
  Star, 
  Users,
  ShieldCheck,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface SalesPageContent {
  headline?: string;
  subheadline?: string;
  benefits?: string[];
  testimonials?: { name: string; role: string; text: string; avatar?: string }[];
  faq?: { question: string; answer: string }[];
  modules?: { title: string; lessons: string[] }[];
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string | null;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  lessons_count: number | null;
  level: string;
  category: string | null;
  stripe_price_id: string | null;
  sales_page_content: SalesPageContent | null;
}

interface Lesson {
  id: string;
  title: string;
  duration_minutes: number | null;
  position: number;
}

export default function CourseSalesPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [slug]);

  useEffect(() => {
    if (course && user) {
      checkPurchaseStatus();
    }
  }, [course, user]);

  const fetchCourse = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (courseError) throw courseError;
      
      // Parse sales_page_content and cast to correct type
      let parsedSalesContent: SalesPageContent | null = null;
      if (courseData.sales_page_content) {
        if (typeof courseData.sales_page_content === 'string') {
          try {
            parsedSalesContent = JSON.parse(courseData.sales_page_content);
          } catch {
            parsedSalesContent = null;
          }
        } else {
          parsedSalesContent = courseData.sales_page_content as SalesPageContent;
        }
      }
      
      setCourse({
        ...courseData,
        sales_page_content: parsedSalesContent,
      } as Course);

      const { data: lessonsData } = await supabase
        .from('course_lessons')
        .select('id, title, duration_minutes, position')
        .eq('course_id', courseData.id)
        .order('position');

      setLessons(lessonsData || []);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Cursul nu a fost găsit');
    } finally {
      setLoading(false);
    }
  };

  const checkPurchaseStatus = async () => {
    if (!course || !user) return;

    const { data } = await supabase
      .from('course_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .eq('status', 'completed')
      .maybeSingle();

    setHasPurchased(!!data);
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate(`/auth/login?redirect=/courses/${slug}`);
      return;
    }

    if (!course?.stripe_price_id) {
      toast.error('Cursul nu este disponibil pentru cumpărare');
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          priceId: course.stripe_price_id,
          mode: 'payment',
          successUrl: `${window.location.origin}/payment-success?type=course&course_id=${course.id}`,
          cancelUrl: `${window.location.origin}/courses/${slug}?canceled=true`,
          userId: user.id,
          courseId: course.id,
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

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-2xl font-bold">Cursul nu a fost găsit</h1>
        <Button onClick={() => navigate('/learning-hub')}>
          Înapoi la cursuri
        </Button>
      </div>
    );
  }

  const salesContent = course.sales_page_content || {};
  const defaultBenefits = [
    'Acces pe viață la toate materialele',
    'Certificat de completare',
    'Resurse descărcabile incluse',
    'Suport prin comunitate',
  ];
  const benefits = salesContent.benefits || defaultBenefits;

  const defaultTestimonials = [
    {
      name: 'Maria P.',
      role: 'Freelancer',
      text: 'Acest curs mi-a schimbat complet perspectiva. Am aplicat tehnicile învățate și am văzut rezultate în mai puțin de o lună.',
    },
    {
      name: 'Andrei M.',
      role: 'Antreprenor',
      text: 'Conținut de calitate, bine structurat și ușor de urmărit. Recomand tuturor celor care vor să avanseze.',
    },
    {
      name: 'Elena D.',
      role: 'Student',
      text: 'Cel mai bun investment în dezvoltarea mea profesională. Merită fiecare bănuț!',
    },
  ];
  const testimonials = salesContent.testimonials || defaultTestimonials;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="gradient-glow absolute inset-0" />
        <div className="gradient-mesh absolute inset-0" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="text-sm">
                {course.category || 'Curs Premium'}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {salesContent.headline || course.title}
              </h1>
              
              <p className="text-xl text-muted-foreground">
                {salesContent.subheadline || course.description}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration_minutes ? `${Math.round(course.duration_minutes / 60)}h` : 'Self-paced'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{lessons.length} lecții</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>Certificat inclus</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <span className="text-muted-foreground">500+ studenți înscriși</span>
                </div>
              </div>

              {hasPurchased ? (
                <Button size="lg" className="w-full md:w-auto gap-2" onClick={() => navigate(`/course/${course.id}`)}>
                  <Play className="h-5 w-5" />
                  Continuă cursul
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="gap-2 gradient-primary glow-primary"
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        Cumpără acum - £{course.price}
                      </>
                    )}
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2">
                    <Play className="h-5 w-5" />
                    Previzualizare gratuită
                  </Button>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden bg-muted glow-primary">
                {course.thumbnail_url ? (
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center gradient-primary">
                    <Play className="h-16 w-16 text-white/80" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="lg" className="rounded-full w-16 h-16 p-0">
                    <Play className="h-8 w-8" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-card/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Ce vei învăța
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="glass hover-lift">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm">{benefit}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Curriculum complet
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            {lessons.length} lecții • {course.duration_minutes ? `${Math.round(course.duration_minutes / 60)} ore` : 'Self-paced'}
          </p>

          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <Card key={lesson.id} className="glass">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <span className="font-medium">{lesson.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{lesson.duration_minutes || 5} min</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-card/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Ce spun studenții
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Alătură-te celor 500+ studenți care au transformat deja cariera lor
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="glass hover-lift">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="glass border-primary/30 glow-primary">
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              <ShieldCheck className="h-16 w-16 mx-auto text-primary" />
              <h2 className="text-3xl font-bold">
                Garanție 30 de zile
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Dacă nu ești mulțumit de curs din orice motiv, îți oferim banii înapoi în primele 30 de zile. Fără întrebări, fără bătăi de cap.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-card/50">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Pregătit să începi?
          </h2>
          <p className="text-xl text-muted-foreground">
            Investește în viitorul tău azi.
          </p>

          <Card className="glass inline-block">
            <CardContent className="p-8 space-y-6">
              <div className="text-5xl font-bold">
                £{course.price}
                <span className="text-lg text-muted-foreground font-normal"> / acces pe viață</span>
              </div>

              <ul className="text-left space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>Acces complet la {lessons.length} lecții</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>Resurse și materiale bonus</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>Certificat de completare</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>Garanție 30 de zile</span>
                </li>
              </ul>

              {hasPurchased ? (
                <Button size="lg" className="w-full gap-2" onClick={() => navigate(`/course/${course.id}`)}>
                  <Play className="h-5 w-5" />
                  Accesează cursul
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="w-full gap-2 gradient-primary glow-primary"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Cumpără acum
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
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
