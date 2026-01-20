import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useAuth } from '@/lib/auth';
import { 
  Loader2, 
  ShoppingCart, 
  CheckCircle, 
  BookOpen, 
  ArrowRight, 
  Gift,
  Shield,
  HelpCircle,
  Play
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const EBOOK_SLUG = 'fiverr-ebook';

const previewItems = [
  "Fiverr's Secret",
  "The Good News?",
  "The Biggest Hassle with Fiverr",
  "6 Better Ways to Make Money Off Fiverr",
  "Offer premium value-added services",
  "Bundle others' services and sell turnkey assets",
  "Bundle others' services and sell operational assets",
  "Buy Services That Help You Buy Resellable High-Value Assets",
  "Resell Cheap Fiverr Services at Other Higher Value Locations",
  "Use Fiverr Services to Build Your Own Assets",
];

const targetAudience = [
  "You want to dedicate yourself to charging a lot more for your time.",
  "You want to stop trying to turn your spare time into spare cash.",
  "You know that traditional freelancing is also not very scalable.",
  "You want to have the chance to make real money off Fiverr.",
  "You want to learn how to play the Fiverr freelancing game to win.",
];

const bonuses = [
  {
    title: "Cheat Sheet",
    description: "This cheat sheet is a handy checklist that makes it easy to get started. It breaks up the entire guide into easy-to-follow steps.",
    value: 27,
    file: "/funnels/fiverr/Cheat_Sheet.pdf"
  },
  {
    title: "Mind Map",
    description: "The mind map gives you an overview of everything covered inside the guide. You can also print it out for quick reference anytime you need it!",
    value: 17,
    file: "/funnels/fiverr/MindMap.pdf"
  },
  {
    title: "Resource Guide",
    description: "The Resource Guide gives you a quick point of reference to all of the resources mentioned throughout the guide.",
    value: 17,
    file: "/funnels/fiverr/Resources_Report.pdf"
  },
];

const faqs = [
  {
    question: "What's this all about?",
    answer: "This is a comprehensive guide that will show you exactly how to make money on Fiverr using proven strategies and methods."
  },
  {
    question: "Who is this for?",
    answer: "This is for anyone who wants to make real money on Fiverr - whether you're a complete beginner or already have some experience with freelancing."
  },
  {
    question: "How long until I see results?",
    answer: "You can begin seeing results extremely quickly… Within days and sometimes even within hours of getting started. The more you apply these strategies, the better results you'll get."
  },
  {
    question: "Do I need to buy anything else?",
    answer: "No! Everything you need to start making money on Fiverr is included in this step-by-step guide and bonuses."
  },
  {
    question: "How is this delivered?",
    answer: "You'll get instant access to a PDF version of this guide along with download links for all the bonuses. There's no waiting… You can get started RIGHT NOW."
  },
  {
    question: "Is there a guarantee?",
    answer: "Absolutely! You get a full 30 days to make sure this is for you. If you're not 100% satisfied, simply send us an email and we'll refund every penny. No questions asked!"
  }
];

export default function FiverrEbookSalesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkoutCourse, isLoading: isCheckoutLoading } = useStripeCheckout();

  // Fetch the ebook product
  const { data: product, isLoading } = useQuery({
    queryKey: ['ebook-product', EBOOK_SLUG],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', EBOOK_SLUG)
        .eq('product_type', 'ebook')
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Check if user has purchased this ebook
  const { data: hasPurchased } = useQuery({
    queryKey: ['ebook-purchase', product?.id, user?.id],
    queryFn: async () => {
      if (!user?.id || !product?.id) return false;
      const { data } = await supabase
        .from('course_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', product.id)
        .eq('status', 'completed')
        .single();
      return !!data;
    },
    enabled: !!user?.id && !!product?.id,
  });

  const handleBuy = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    if (product?.stripe_price_id) {
      await checkoutCourse(product.id, product.stripe_price_id);
    }
  };

  const handleDownload = () => {
    if (product?.download_url) {
      window.open(product.download_url, '_blank');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <Loader2 className="h-8 w-8 animate-spin text-green-400" />
      </div>
    );
  }

  const BuyButton = () => (
    <Button 
      size="lg" 
      onClick={hasPurchased ? handleDownload : handleBuy}
      disabled={isCheckoutLoading}
      className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg px-10 py-7 rounded-full shadow-xl hover:shadow-green-500/30 transition-all transform hover:scale-105"
    >
      {isCheckoutLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : hasPurchased ? (
        <>
          <BookOpen className="h-5 w-5" />
          Descarcă eBook-ul
        </>
      ) : (
        <>
          <ShoppingCart className="h-5 w-5" />
          CLICK HERE TO GET ACCESS
          <ArrowRight className="h-5 w-5" />
        </>
      )}
    </Button>
  );

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f4c3a 50%, #1a1a2e 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Badge className="bg-red-500 text-white px-6 py-2 text-base md:text-lg rounded-full mb-6">
              Are You Ready To Start Building Your Online Empire Five Bucks At A Time?
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
              It's About Time For You To Start
            </h1>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-yellow-400 uppercase">
              Making Money On Fiverr TODAY!
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start max-w-6xl mx-auto">
            {/* Video */}
            <div className="aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
              <video 
                controls 
                className="w-full h-full"
                poster="/funnels/fiverr/Bundle.jpg"
              >
                <source src="/funnels/fiverr/Doodle.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-white">
                  <CheckCircle className="h-6 w-6 text-green-400 shrink-0 mt-1" />
                  <span>Compared to traditional freelancing, Fiverr removes a lot of doubt and guesswork from the freelance process.</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <CheckCircle className="h-6 w-6 text-green-400 shrink-0 mt-1" />
                  <span>If you are looking to earn a full-time income, you have to learn how to use Fiverr the right way.</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <CheckCircle className="h-6 w-6 text-green-400 shrink-0 mt-1" />
                  <span>You don't have to play the Fiverr freelancing game to lose!</span>
                </li>
              </ul>
              <div className="pt-4">
                <BuyButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h3 className="text-xl font-bold mb-6 text-gray-800">Dear Friend,</h3>
          <div className="space-y-4 text-gray-700 text-lg">
            <p>Fiverr has taken the internet by storm.</p>
            <p>There is really no other way to say it. This little freelancing platform that could has totally transformed people's expectations of getting and providing freelance services through an online exchange format.</p>
            <p>It seems that Fiverr has solved the two most common problems freelance platforms have historically struggled with.</p>
            <p>Fiverr not only offers a ton of services from a wide range of eager providers from all over the world, but it also is able to pull in lots of buyers.</p>
          </div>
        </div>
      </section>

      {/* Key Message */}
      <section className="py-16" style={{ backgroundColor: '#5f9ea0' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-8">
              When you put these two factors together, it is no surprise that Fiverr has become the "go to" freelance service destination on the internet.
            </h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4 text-white">
                <p>Fiverr has many testimonials of people claiming that their income on this platform has replaced their regular job's income.</p>
                <p>But there's a big warning sign. You have to be careful about using Fiverr the right way.</p>
                <p>If you don't know what you're doing or if you don't have a strategy, you end up wasting time and, yes, money, in the form of opportunity costs.</p>
                <p className="font-bold">Here's where my advice for you comes in.</p>
              </div>
              <div className="flex justify-center">
                <img 
                  src="/funnels/fiverr/Bundle.jpg" 
                  alt="Fiverr Bundle" 
                  className="max-w-full h-auto rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* With My Advice */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">With My Advice…</h2>
          <hr className="border-gray-300 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-1" />
                <span className="text-gray-700">You are going to understand the truth about making money off Fiverr.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-1" />
                <span className="text-gray-700">You will learn to identify six different methods anybody can use to make real money off Fiverr.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-1" />
                <span className="text-gray-700">You will learn everything there is to know about playing the Fiverr game the right way.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-1" />
                <span className="text-gray-700">You can begin to understand how lucrative this micro-freelancing platform can be.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-1" />
                <span className="text-gray-700">You are going to learn exactly how to think outside of the traditional freelancing box.</span>
              </li>
            </ul>
            <div>
              <hr className="border-gray-300 mb-4" />
              <p className="text-gray-800 text-lg">
                To make it easy, I've put together a <span className="font-bold">step-by-step guide</span> that will show you exactly how it's done...
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Introducing */}
      <section className="py-20 relative" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f4c3a 100%)' }}>
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-white text-gray-900 px-8 py-3 text-lg rounded-full mb-6">
            I N T R O D U C I N G
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-green-400 mb-4">
            How To Make Money On Fiverr
          </h2>
          <h3 className="text-2xl md:text-3xl font-semibold text-yellow-400 mb-8">
            A Systematic Guide To Building Your Online Empire Five Bucks At A Time
          </h3>
          <div className="max-w-2xl mx-auto text-white space-y-4 mb-8">
            <p>No stones are left unturned when you get your hands on this now.</p>
            <p>You will become a complete expert on this, and you'll get everything you need inside to do the same…</p>
          </div>
          <BuyButton />
        </div>
      </section>

      {/* Quick Preview */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h3 className="text-2xl font-semibold mb-2">Here's Just A Quick Preview Of What You'll</h3>
          <h2 className="text-4xl md:text-5xl font-bold text-teal-500 uppercase mb-8">Discover Inside...</h2>
          <div className="grid md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
            {previewItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-teal-500 shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <p className="font-bold mt-8 text-gray-800">Plus, a whole lot more...</p>
          <p className="font-bold text-lg mt-2 text-gray-900">This is the easiest way to actually start making money off Fiverr!</p>
        </div>
      </section>

      {/* Who Needs This */}
      <section className="py-16 relative" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 100%)' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wider mb-2">Who Needs This</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-yellow-400 uppercase mb-4">Step-By-Step Guide?</h3>
          <p className="text-white italic underline mb-8">If you answer YES to any of the below, you need this…</p>
          <div className="max-w-2xl mx-auto space-y-4">
            {targetAudience.map((item, index) => (
              <div key={index} className="flex items-start gap-3 text-white text-left">
                <CheckCircle className="h-6 w-6 text-yellow-400 shrink-0 mt-1" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Much */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #0f4c3a 0%, #1a1a2e 100%)' }}>
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white tracking-wide">Does This Sound Like Exactly</h3>
          <h2 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-wider mb-4">What You Need?</h2>
          <h3 className="text-2xl md:text-3xl font-bold text-white tracking-wide mb-2">But maybe your question is:</h3>
          <h1 className="text-6xl md:text-8xl font-bold text-white uppercase tracking-widest mb-8">How Much?</h1>
          <div className="max-w-3xl mx-auto text-white space-y-4 mb-8">
            <p>If you were going to hire an expert on this, to show you how it's done, you could easily find yourself investing hundreds of dollars for this sort of coaching.</p>
            <p>In fact, many people invest hundreds and thousands of dollars to get into coaching programs or attend workshops...</p>
            <p>But, you won't have to invest anywhere near that today.</p>
            <p className="text-2xl pt-4">Today, you can get <span className="font-bold">INSTANT ACCESS</span> for just...</p>
            {product && (
              <p className="text-5xl font-bold text-green-400">£{product.price}</p>
            )}
          </div>
          <BuyButton />
          <p className="text-white font-bold mt-6">And it just keeps getting better…</p>
        </div>
      </section>

      {/* Bonuses */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">When You Make The Wise Decision To Grab This Today You'll Also Get These...</h3>
            <h2 className="text-5xl md:text-6xl font-bold text-red-500 uppercase">Fast Action Bonuses</h2>
          </div>
          <div className="max-w-4xl mx-auto space-y-8">
            {bonuses.map((bonus, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                      <Badge className="bg-red-500 text-white mb-3">Fast Action Bonus #{index + 1}</Badge>
                      <h4 className="text-xl font-bold underline mb-3">How To Make Money On Fiverr - {bonus.title}</h4>
                      <p className="text-gray-600 mb-4">{bonus.description}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        Valued at <span className="text-4xl text-red-500">${bonus.value}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      <Gift className="h-24 w-24 text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-16" style={{ backgroundColor: '#b0e0e6' }}>
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-4 border-yellow-600 rounded-2xl overflow-hidden" style={{ backgroundColor: '#2e8b57' }}>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                <div className="flex justify-center">
                  <Shield className="h-32 w-32 text-yellow-400" />
                </div>
                <div className="md:col-span-2 text-white">
                  <h3 className="text-xl font-bold mb-4">Try This Guide On MY DIME… There's No Risk!</h3>
                  <p className="text-sm mb-3">There are a lot of people that claim to offer a solution on how to start making money on Fiverr, so it's understandable if you're a little skeptical.</p>
                  <p className="text-sm mb-3">I can keep telling you just how great my guide is, but you really need to go through it and see for yourself what it's all about to know if it's for you…</p>
                  <p className="text-sm mb-3">That's why I'm going to give you a FULL 30 days to decide if this is for you…</p>
                  <p className="text-sm mb-3">If for any reason, or no reason at all, you're not 100% satisfied with what's inside, simply send me an email, <strong>and I'll refund every penny of your tiny investment…</strong></p>
                  <p className="text-sm font-bold">No questions asked!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16" style={{ backgroundColor: '#b0e0e6' }}>
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-semibold mb-6">
            Click The Button Below Now To Get <span className="font-bold text-red-500">INSTANT ACCESS…</span>
          </h3>
          <BuyButton />
          <div className="max-w-2xl mx-auto mt-8 text-gray-700">
            <p className="mb-4">Thank you so much for taking the time to take a look at this extremely limited offer that has the potential to help you tap the power of Fiverr to build your online empire!</p>
            <p className="font-bold">I'll see you on the inside!</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f4c3a 100%)' }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`} className="bg-white/10 rounded-lg border-none">
                  <AccordionTrigger className="px-6 text-white hover:no-underline">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-green-400" />
                      <span className="font-semibold text-left">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-300">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <div className="text-center mt-8">
            <BuyButton />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400 space-x-4">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <span>|</span>
          <a href="#" className="hover:text-white">Disclaimer</a>
          <span>|</span>
          <a href="#" className="hover:text-white">Terms and Conditions</a>
          <span>|</span>
          <a href="#" className="hover:text-white">Support</a>
        </div>
      </footer>
    </div>
  );
}
