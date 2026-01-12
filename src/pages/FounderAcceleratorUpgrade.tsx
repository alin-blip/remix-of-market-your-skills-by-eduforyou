import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';
import { 
  Rocket, 
  CheckCircle2, 
  Star, 
  Users, 
  Target, 
  TrendingUp,
  Lightbulb,
  Zap,
  Shield,
  Award,
  Clock,
  Video,
  FileText,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Crown,
  Play
} from 'lucide-react';

const modules = [
  {
    number: 1,
    title: "Deciding to Start a Startup",
    description: "Află dacă antreprenoriatul este pentru tine și cum să te pregătești pentru călătoria ta.",
    lessons: 4,
    duration: "2h 30min",
    topics: ["Should You Start A Startup?", "Why to Not Not Start", "Before the Startup", "Founder Mindset"]
  },
  {
    number: 2,
    title: "Getting & Evaluating Startup Ideas",
    description: "Învață cum să găsești și să evaluezi idei de startup care pot deveni business-uri de milioane.",
    lessons: 5,
    duration: "3h 15min",
    topics: ["How to Get Startup Ideas", "Idea Validation Framework", "All About Pivoting", "Market Research", "Competitive Analysis"]
  },
  {
    number: 3,
    title: "Building Your Founding Team",
    description: "Găsește co-fondatorii potriviți și construiește o echipă câștigătoare.",
    lessons: 4,
    duration: "2h 45min",
    topics: ["All About Co-Founders", "How to Split Equity", "Avoiding Founder Conflicts", "Team Dynamics"]
  },
  {
    number: 4,
    title: "Planning & Building Your MVP",
    description: "Construiește un MVP care rezolvă probleme reale și atrage primii utilizatori.",
    lessons: 5,
    duration: "4h",
    topics: ["How to Talk to Users", "How to Build an MVP", "Product Development Cycle", "Feature Prioritization", "Launch Checklist"]
  },
  {
    number: 5,
    title: "Launching & Getting First Customers",
    description: "Strategii dovedite pentru a lansa și a atrage primii clienți plătitori.",
    lessons: 4,
    duration: "3h",
    topics: ["How to Launch (Again and Again)", "Getting First Customers", "Do Things That Don't Scale", "Early Traction Tactics"]
  },
  {
    number: 6,
    title: "Growth & Monetization",
    description: "Scalează-ți startup-ul și monetizează eficient.",
    lessons: 5,
    duration: "4h 30min",
    topics: ["Setting KPIs & Prioritization", "Business Models & Pricing", "Growth for Startups", "Retention Strategies", "Product-Market Fit"]
  },
  {
    number: 7,
    title: "Fundraising & Company Building",
    description: "Atrage investiții și construiește o companie durabilă.",
    lessons: 4,
    duration: "3h 30min",
    topics: ["How Startup Fundraising Works", "Pitch Deck Mastery", "Negotiating with Investors", "Building Company Culture"]
  },
  {
    number: 8,
    title: "Stories from Great Founders",
    description: "Învață de la fondatorii celor mai de succes companii din lume.",
    lessons: 5,
    duration: "4h",
    topics: ["The Facebook Story", "The Airbnb Story", "The Stripe Story", "Lessons from Unicorns", "Founder Q&A Sessions"]
  }
];

const benefits = [
  { icon: Video, title: "36+ ore de conținut video", description: "Lecții HD cu experți și fondatori de succes" },
  { icon: FileText, title: "Materiale descărcabile", description: "Templates, worksheets și checklist-uri" },
  { icon: MessageSquare, title: "Comunitate privată", description: "Acces la grupul de fondatori" },
  { icon: Award, title: "Certificat de absolvire", description: "Certificat personalizat la finalizare" },
  { icon: Clock, title: "Acces pe viață", description: "Învață în ritmul tău, oricând" },
  { icon: Shield, title: "Garanție 30 zile", description: "Banii înapoi fără întrebări" },
];

const testimonials = [
  {
    name: "Alexandru P.",
    role: "Fondator, TechStartup",
    content: "Acest program mi-a schimbat complet perspectiva. Am lansat MVP-ul în 6 săptămâni și am primii 50 de clienți plătitori!",
    image: null
  },
  {
    name: "Maria D.",
    role: "Co-fondator, HealthApp",
    content: "Modulele de fundraising m-au ajutat să strâng £200k în primele 3 luni. Recomand tuturor aspiranților antreprenori.",
    image: null
  },
  {
    name: "Andrei R.",
    role: "CEO, SaaS Platform",
    content: "De la idee la £10k MRR în 4 luni. Strategiile din acest curs funcționează, garantat.",
    image: null
  }
];

export default function FounderAcceleratorUpgrade() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Trebuie să fii autentificat pentru a achiziționa');
      navigate('/auth/login');
      return;
    }

    setIsLoading(true);
    // TODO: Integrate with Stripe for real payments
    toast.success('Vom implementa plata cu Stripe în curând!');
    setIsLoading(false);
  };

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              <Badge className="mb-6 py-2 px-4 bg-amber-500/20 text-amber-500 border-amber-500/30">
                <Crown className="h-4 w-4 mr-2" />
                Program Premium • Acces Nelimitat
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-amber-500 bg-clip-text text-transparent">
                Founder Accelerator
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Programul complet de 8 module pentru a-ți transforma ideea într-un startup de succes.
                Bazat pe curriculum-ul Y Combinator.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Video className="h-5 w-5 text-primary" />
                  <span>36+ ore video</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>8 module complete</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Comunitate privată</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Acces pe viață</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  className="gap-2 px-8 py-6 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  onClick={handlePurchase}
                  disabled={isLoading}
                >
                  <Rocket className="h-5 w-5" />
                  Începe Acum - £997
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <p className="text-sm text-muted-foreground">
                  sau 3 x £349/lună
                </p>
              </div>

              <p className="mt-6 text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                Garanție 30 zile - banii înapoi fără întrebări
              </p>
            </motion.div>
          </div>
        </section>

        {/* What You'll Learn */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Curriculum Complet</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                8 Module Care Îți Transformă Startup-ul
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Fiecare modul este creat de experți cu experiență în Y Combinator și startup-uri de succes
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {modules.map((module, index) => (
                <motion.div
                  key={module.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow border-2 hover:border-primary/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
                            {module.number}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{module.title}</CardTitle>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Play className="h-3 w-3" />
                                {module.lessons} lecții
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {module.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                        {index < 3 && (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-500 border-0 text-xs">
                            Preview gratuit
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {module.topics.slice(0, 3).map((topic) => (
                          <Badge key={topic} variant="outline" className="text-xs font-normal">
                            {topic}
                          </Badge>
                        ))}
                        {module.topics.length > 3 && (
                          <Badge variant="outline" className="text-xs font-normal">
                            +{module.topics.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Ce Primești</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Tot Ce Ai Nevoie Pentru Succes
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center h-full hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Povești de Succes</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ce Spun Absolvenții Noștri
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="pt-6">
                      <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4 italic">
                        "{testimonial.content}"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground font-bold">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{testimonial.name}</p>
                          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-background border-amber-500/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl" />
              <CardContent className="py-12 text-center relative">
                <Badge className="mb-6 py-2 px-4 bg-amber-500/20 text-amber-500 border-amber-500/30">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Ofertă Limitată
                </Badge>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ești Gata Să Îți Lansezi Startup-ul?
                </h2>
                
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Alătură-te celor peste 500 de fondatori care și-au transformat ideile în business-uri profitabile.
                </p>

                <div className="mb-8">
                  <div className="text-5xl font-bold text-amber-500 mb-2">£997</div>
                  <p className="text-muted-foreground">plată unică • acces pe viață</p>
                  <p className="text-sm text-muted-foreground mt-1">sau 3 x £349/lună</p>
                </div>

                <Button 
                  size="lg" 
                  className="gap-2 px-10 py-6 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  onClick={handlePurchase}
                  disabled={isLoading}
                >
                  <Rocket className="h-5 w-5" />
                  Începe Transformarea Acum
                  <ArrowRight className="h-5 w-5" />
                </Button>

                <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Garanție 30 zile
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Acces instant
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Suport prioritar
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
