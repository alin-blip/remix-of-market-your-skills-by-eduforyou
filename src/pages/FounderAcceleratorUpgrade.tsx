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

const getModules = (t: any) => [
  {
    number: 1,
    title: t?.founderAccelerator?.modules?.m1?.title || "Deciding to Start a Startup",
    description: t?.founderAccelerator?.modules?.m1?.description || "Find out if entrepreneurship is for you and how to prepare for your journey.",
    lessons: 4,
    duration: "2h 30min",
    topics: ["Should You Start A Startup?", "Why to Not Not Start", "Before the Startup", "Founder Mindset"]
  },
  {
    number: 2,
    title: t?.founderAccelerator?.modules?.m2?.title || "Getting & Evaluating Startup Ideas",
    description: t?.founderAccelerator?.modules?.m2?.description || "Learn how to find and evaluate startup ideas that can become million-dollar businesses.",
    lessons: 5,
    duration: "3h 15min",
    topics: ["How to Get Startup Ideas", "Idea Validation Framework", "All About Pivoting", "Market Research", "Competitive Analysis"]
  },
  {
    number: 3,
    title: t?.founderAccelerator?.modules?.m3?.title || "Building Your Founding Team",
    description: t?.founderAccelerator?.modules?.m3?.description || "Find the right co-founders and build a winning team.",
    lessons: 4,
    duration: "2h 45min",
    topics: ["All About Co-Founders", "How to Split Equity", "Avoiding Founder Conflicts", "Team Dynamics"]
  },
  {
    number: 4,
    title: t?.founderAccelerator?.modules?.m4?.title || "Planning & Building Your MVP",
    description: t?.founderAccelerator?.modules?.m4?.description || "Build an MVP that solves real problems and attracts first users.",
    lessons: 5,
    duration: "4h",
    topics: ["How to Talk to Users", "How to Build an MVP", "Product Development Cycle", "Feature Prioritization", "Launch Checklist"]
  },
  {
    number: 5,
    title: t?.founderAccelerator?.modules?.m5?.title || "Launching & Getting First Customers",
    description: t?.founderAccelerator?.modules?.m5?.description || "Proven strategies to launch and attract first paying customers.",
    lessons: 4,
    duration: "3h",
    topics: ["How to Launch (Again and Again)", "Getting First Customers", "Do Things That Don't Scale", "Early Traction Tactics"]
  },
  {
    number: 6,
    title: t?.founderAccelerator?.modules?.m6?.title || "Growth & Monetization",
    description: t?.founderAccelerator?.modules?.m6?.description || "Scale your startup and monetize effectively.",
    lessons: 5,
    duration: "4h 30min",
    topics: ["Setting KPIs & Prioritization", "Business Models & Pricing", "Growth for Startups", "Retention Strategies", "Product-Market Fit"]
  },
  {
    number: 7,
    title: t?.founderAccelerator?.modules?.m7?.title || "Fundraising & Company Building",
    description: t?.founderAccelerator?.modules?.m7?.description || "Attract investments and build a lasting company.",
    lessons: 4,
    duration: "3h 30min",
    topics: ["How Startup Fundraising Works", "Pitch Deck Mastery", "Negotiating with Investors", "Building Company Culture"]
  },
  {
    number: 8,
    title: t?.founderAccelerator?.modules?.m8?.title || "Stories from Great Founders",
    description: t?.founderAccelerator?.modules?.m8?.description || "Learn from the founders of the most successful companies in the world.",
    lessons: 5,
    duration: "4h",
    topics: ["The Facebook Story", "The Airbnb Story", "The Stripe Story", "Lessons from Unicorns", "Founder Q&A Sessions"]
  }
];

const getBenefits = (t: any) => [
  { icon: Video, title: t?.founderAccelerator?.benefits?.videoContent?.title || "36+ hours of video content", description: t?.founderAccelerator?.benefits?.videoContent?.description || "HD lessons with experts and successful founders" },
  { icon: FileText, title: t?.founderAccelerator?.benefits?.materials?.title || "Downloadable materials", description: t?.founderAccelerator?.benefits?.materials?.description || "Templates, worksheets and checklists" },
  { icon: MessageSquare, title: t?.founderAccelerator?.benefits?.community?.title || "Private community", description: t?.founderAccelerator?.benefits?.community?.description || "Access to the founders group" },
  { icon: Award, title: t?.founderAccelerator?.benefits?.certificate?.title || "Completion certificate", description: t?.founderAccelerator?.benefits?.certificate?.description || "Personalized certificate upon completion" },
  { icon: Clock, title: t?.founderAccelerator?.benefits?.lifetime?.title || "Lifetime access", description: t?.founderAccelerator?.benefits?.lifetime?.description || "Learn at your own pace, anytime" },
  { icon: Shield, title: t?.founderAccelerator?.benefits?.guarantee?.title || "30-day guarantee", description: t?.founderAccelerator?.benefits?.guarantee?.description || "Money back no questions asked" },
];

const getTestimonials = (t: any) => [
  {
    name: t?.founderAccelerator?.testimonials?.t1?.name || "Alexander P.",
    role: t?.founderAccelerator?.testimonials?.t1?.role || "Founder, TechStartup",
    content: t?.founderAccelerator?.testimonials?.t1?.content || "This program completely changed my perspective. I launched my MVP in 6 weeks and got my first 50 paying customers!",
    image: null
  },
  {
    name: t?.founderAccelerator?.testimonials?.t2?.name || "Maria D.",
    role: t?.founderAccelerator?.testimonials?.t2?.role || "Co-founder, HealthApp",
    content: t?.founderAccelerator?.testimonials?.t2?.content || "The fundraising modules helped me raise £200k in the first 3 months. I recommend it to all aspiring entrepreneurs.",
    image: null
  },
  {
    name: t?.founderAccelerator?.testimonials?.t3?.name || "Andrew R.",
    role: t?.founderAccelerator?.testimonials?.t3?.role || "CEO, SaaS Platform",
    content: t?.founderAccelerator?.testimonials?.t3?.content || "From idea to £10k MRR in 4 months. The strategies in this course work, guaranteed.",
    image: null
  }
];

export default function FounderAcceleratorUpgrade() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  const modules = getModules(t);
  const benefits = getBenefits(t);
  const testimonials = getTestimonials(t);

  const handlePurchase = async () => {
    if (!user) {
      toast.error(t?.founderAccelerator?.messages?.needAuth || 'You need to be logged in to purchase');
      navigate('/auth/login');
      return;
    }

    setIsLoading(true);
    // TODO: Integrate with Stripe for real payments
    toast.success(t?.founderAccelerator?.messages?.stripeComingSoon || 'Stripe payment coming soon!');
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
                {t?.founderAccelerator?.badge || 'Premium Program • Unlimited Access'}
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-amber-500 bg-clip-text text-transparent">
                {t?.founderAccelerator?.title || 'Founder Accelerator'}
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                {t?.founderAccelerator?.subtitle || 'The complete 8-module program to transform your idea into a successful startup. Based on Y Combinator curriculum.'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Video className="h-5 w-5 text-primary" />
                  <span>{t?.founderAccelerator?.stats?.videoHours || '36+ video hours'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>{t?.founderAccelerator?.stats?.modules || '8 complete modules'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5 text-primary" />
                  <span>{t?.founderAccelerator?.stats?.community || 'Private community'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{t?.founderAccelerator?.stats?.lifetime || 'Lifetime access'}</span>
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
                  {t?.founderAccelerator?.cta?.startNow || 'Start Now - £997'}
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <p className="text-sm text-muted-foreground">
                  {t?.founderAccelerator?.cta?.or || 'or 3 x £349/month'}
                </p>
              </div>

              <p className="mt-6 text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                {t?.founderAccelerator?.cta?.guarantee || '30-day guarantee - money back no questions asked'}
              </p>
            </motion.div>
          </div>
        </section>

        {/* What You'll Learn */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">{t?.founderAccelerator?.curriculum?.badge || 'Complete Curriculum'}</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t?.founderAccelerator?.curriculum?.title || '8 Modules That Transform Your Startup'}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t?.founderAccelerator?.curriculum?.subtitle || 'Each module is created by experts with Y Combinator experience and successful startups'}
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
                                {module.lessons} {t?.founderAccelerator?.curriculum?.lessons || 'lessons'}
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
                            {t?.founderAccelerator?.curriculum?.freePreview || 'Free preview'}
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
              <Badge variant="outline" className="mb-4">{t?.founderAccelerator?.benefits?.badge || 'What You Get'}</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t?.founderAccelerator?.benefits?.title || 'Everything You Need For Success'}
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
              <Badge variant="outline" className="mb-4">{t?.founderAccelerator?.testimonials?.badge || 'Success Stories'}</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t?.founderAccelerator?.testimonials?.title || 'What Our Graduates Say'}
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
                  {t?.founderAccelerator?.finalCta?.badge || 'Limited Offer'}
                </Badge>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {t?.founderAccelerator?.finalCta?.title || 'Are You Ready To Launch Your Startup?'}
                </h2>
                
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  {t?.founderAccelerator?.finalCta?.subtitle || 'Join over 500 founders who have transformed their ideas into profitable businesses.'}
                </p>

                <div className="mb-8">
                  <div className="text-5xl font-bold text-amber-500 mb-2">{t?.founderAccelerator?.finalCta?.price || '£997'}</div>
                  <p className="text-muted-foreground">{t?.founderAccelerator?.finalCta?.priceNote || 'one-time payment • lifetime access'}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t?.founderAccelerator?.cta?.or || 'or 3 x £349/month'}</p>
                </div>

                <Button 
                  size="lg" 
                  className="gap-2 px-10 py-6 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  onClick={handlePurchase}
                  disabled={isLoading}
                >
                  <Rocket className="h-5 w-5" />
                  {t?.founderAccelerator?.cta?.startTransformation || 'Start Your Transformation Now'}
                  <ArrowRight className="h-5 w-5" />
                </Button>

                <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {t?.founderAccelerator?.finalCta?.securePayment || 'Secure payment'}
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {t?.founderAccelerator?.finalCta?.instantAccess || 'Instant access'}
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {t?.founderAccelerator?.finalCta?.moneyBack || '30-day money back'}
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
