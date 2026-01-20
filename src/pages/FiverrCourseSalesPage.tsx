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
  Play, 
  ArrowRight, 
  Shield,
  HelpCircle,
  Headphones,
  Eye,
  Target,
  Award
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const COURSE_SLUG = 'fiverr-video-course';

const videoModules = [
  "Introduction",
  "Fiverr's Secret",
  "The Good News?",
  "The Biggest Hassle With Fiverr",
  "6 Better Ways to Make Money Off Fiverr",
  "Offer Premium Value-Added Services",
  "Bundle Others' Services and Sell Turnkey Assets",
  "Bundle Others' Services and Sell Operational Assets",
  "Buy Services That Help You Buy Resellable High-Value Assets",
  "Resell Cheap Fiverr Services at Other High Value Locations",
];

const benefits = [
  {
    icon: Eye,
    title: "Avoid Missing Details",
    description: "Avoid missing any important key details that you might miss by only reading the guide"
  },
  {
    icon: Target,
    title: "Stay Focused",
    description: "Stay focused and accountable, and follow through and make sure you get ongoing results"
  },
  {
    icon: Award,
    title: "Long-Term Benefits",
    description: "Ensure that the work you put in now keeps on giving you benefits long into the future"
  }
];

const faqs = [
  {
    question: "Who should get the video training?",
    answer: "If you're a visual learner, the video version makes it a wonderful training experience. Although the guide you just purchased leaves no stones unturned, if you want to be sure you see results as fast as possible, you need to get the video version. Not only will you see results faster, but you'll make sure you stick to your plan and in many cases, you'll get even BETTER results by following the video upgrade."
  },
  {
    question: "How many videos are there?",
    answer: "There are 10, high-quality, in-depth videos that cover everything you'll find inside the text-based version of the guide."
  },
  {
    question: "How is this different than the EBook version of the training?",
    answer: "Although the material covered is the same, it's done in a format that makes it much easier for you to learn and start making things happen as quickly as possible. It's proven that most people struggle and ultimately give up with text only guides. THIS upgrade gives you the best chance for success and will pay for itself extremely quickly."
  },
  {
    question: "In what format is the training delivered?",
    answer: "You'll get 10 high-quality videos in MP4 format that you can download and view anytime you want."
  },
  {
    question: "Is there a guarantee?",
    answer: "Of course. You get a FULL 30 days to make sure this is for you. If for any reason, or no reason at all you're not 100% satisfied with what's inside, simply send me an email, and I'll refund every penny of your tiny investment. No questions asked."
  }
];

export default function FiverrCourseSalesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkoutCourse, isLoading: isCheckoutLoading } = useStripeCheckout();

  // Fetch the course product
  const { data: product, isLoading } = useQuery({
    queryKey: ['fiverr-course-product', COURSE_SLUG],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', COURSE_SLUG)
        .eq('product_type', 'course')
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Check if user has purchased this course
  const { data: hasPurchased } = useQuery({
    queryKey: ['fiverr-course-purchase', product?.id, user?.id],
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

  const handleAccess = () => {
    if (product?.id) {
      navigate(`/course/${product.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <Loader2 className="h-8 w-8 animate-spin text-green-400" />
      </div>
    );
  }

  const BuyButton = ({ className = "" }: { className?: string }) => (
    <Button 
      size="lg" 
      onClick={hasPurchased ? handleAccess : handleBuy}
      disabled={isCheckoutLoading}
      className={`gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-lg px-12 py-8 rounded-full shadow-xl hover:shadow-yellow-500/30 transition-all transform hover:scale-105 ${className}`}
    >
      {isCheckoutLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : hasPurchased ? (
        <>
          <Play className="h-5 w-5" />
          Accesează Cursul Video
        </>
      ) : (
        <>
          <ShoppingCart className="h-5 w-5" />
          YES! UPGRADE ME NOW
          <ArrowRight className="h-5 w-5" />
        </>
      )}
    </Button>
  );

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #1a1a2e 100%)' }}>
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-red-600 text-white px-8 py-3 text-lg rounded-full mb-6 animate-pulse">
            Thank You For Your Purchase...
          </Badge>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
            Would You Like To Discover A Shortcut
          </h2>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-yellow-400 uppercase mb-2">
            Building Your Online Empire Five Bucks
          </h1>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white uppercase mb-6">
            At A Time A Lot Faster?
          </h1>
          
          <p className="text-white text-lg mb-8 max-w-3xl mx-auto">
            <u>If so, pay close attention to this very limited, special offer… You will only see this once...</u>
          </p>

          {/* Video */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/CejawrN8b8c" 
                frameBorder="0" 
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>

          <BuyButton />
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h3 className="text-xl font-bold mb-6 text-gray-800">Dear Valued Customer,</h3>
          <div className="space-y-4 text-gray-700 text-lg">
            <p>First off, thanks so much for purchasing the guide That Will Teach You All the Skills You Need to make real money off Fiverr.</p>
            <p>If you follow the step-by-step guide, <strong>you will be heading straight to that goal...</strong></p>
            <p>But, what if you could do it even faster…</p>
            <p>And what if you could insure that you get the absolute BEST results possible and stay focused…</p>
            <p>In short, making sure that this is a real success.</p>
            <p><strong>The good news is, you can…</strong></p>
            <p>For a limited time, you can get access to the video upgrade to the guide you just purchased at a very low price...</p>
            <p>This powerful upgrade will make it easier to get started and stay committed to your ultimate goal.</p>
            <p>Just to be clear, this is an <strong>EXCLUSIVE</strong> upgrade for customers only...</p>
          </div>
        </div>
      </section>

      {/* Why Upgrade */}
      <section className="py-16" style={{ backgroundColor: '#5f9ea0' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center text-white">
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">
              Why Do You Need To Upgrade To The Video Version Of The
            </h2>
            <h1 className="text-4xl md:text-6xl font-bold mb-8">
              <span className="text-yellow-300">"How To Make Money On Fiverr"</span> Guide?
            </h1>
            
            <div className="grid md:grid-cols-2 gap-8 items-center text-left">
              <div className="space-y-4">
                <p>Did you know that most people learn a lot faster when they see something being done on video than by just reading about it?</p>
                <p>That's because most people out there are visual learners.</p>
                <p>How do you normally learn the best?</p>
                <p>Although the guide you just purchased gives you a step-by-step approach to Fiverr freelancing, experience tells us that it requires learners to pay very close attention to the details to get the best results possible.</p>
                <p>If you miss any of the most important details or do things the wrong way, you may miss out on the fullest benefits offered inside the guide.</p>
                <p>For that very reason, I've put together a video version to make it much easier to get positive results quickly…</p>
              </div>
              <div className="flex justify-center">
                <img 
                  src="/funnels/fiverr/deluxe-package.png" 
                  alt="Deluxe Video Package" 
                  className="max-w-full h-auto rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-2">
            The Video Version Of The Guide
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            You Just Purchased Will Help You...
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center p-6 border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="mx-auto w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                    <benefit.icon className="h-10 w-10 text-teal-600" />
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-gray-900">{benefit.title}</h4>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Introducing */}
      <section className="py-20 relative" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f4c3a 100%)' }}>
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-white text-gray-900 px-8 py-3 text-lg rounded-full mb-6">
            I N T R O D U C I N G
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
            "How To Make Money On Fiverr"
          </h2>
          <h3 className="text-5xl md:text-7xl font-bold text-green-400 mb-8" style={{ fontFamily: 'cursive' }}>
            Video Course
          </h3>
          
          <img 
            src="/funnels/fiverr/deluxe-package.png" 
            alt="Video Course Bundle" 
            className="max-w-3xl w-full mx-auto mb-8"
          />
          
          <p className="text-white text-lg mb-4">
            Are you ready to Learn All the Skills You Need to Start making money off Fiverr, a lot faster?
          </p>
          <p className="text-white font-bold text-xl mb-8">
            If the answer is "YES," click the button below…
          </p>
          
          <BuyButton />
        </div>
      </section>

      {/* Video Modules Preview */}
      <section className="py-16" style={{ backgroundColor: '#d5ffd6' }}>
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-center text-gray-800 mb-2">
            Here is a Quick Peek at the Quality Of
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-center text-teal-600 mb-12">
            The Video Course Included:
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {videoModules.map((module, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <span className="font-semibold text-gray-800">{module}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fast Action Bonus */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
            When You Upgrade Today, You'll Also Get This Exclusive
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-red-600 mb-8">
            Fast Action Bonus…
          </h3>
          
          <Card className="max-w-4xl mx-auto overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
              <h4 className="text-xl font-semibold mb-2">Fast Action Bonus</h4>
              <h3 className="text-2xl font-bold">
                High-Quality MP3s Of The Entire Video Version Of The Training
              </h3>
            </div>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                    <Headphones className="h-16 w-16 text-white" />
                  </div>
                </div>
                <div className="text-left space-y-4">
                  <p className="text-gray-700">Don't have time to watch videos? I am also providing you with 10 MP3s that you can use while you're on the go…</p>
                  <p className="text-gray-700">Listen to them in the car, at home, or even at the office…</p>
                  <p className="text-gray-700 font-bold">All day… Every day.</p>
                  <p className="text-3xl font-bold">
                    <span className="text-gray-600">Valued at </span>
                    <span className="text-red-600 text-4xl">$27</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <p className="text-xl font-semibold text-gray-800 mt-8">And here's what's really great about this...</p>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto overflow-hidden border-4 border-yellow-600 rounded-2xl" style={{ backgroundColor: '#2e8b57' }}>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-4 gap-6 items-center text-white">
                <div className="flex justify-center">
                  <div className="w-28 h-28 rounded-full bg-yellow-500 flex items-center justify-center">
                    <Shield className="h-14 w-14 text-white" />
                  </div>
                </div>
                <div className="md:col-span-3 space-y-4">
                  <h3 className="text-2xl font-bold">You Don't Have To Decide Anything Today...</h3>
                  <p>You get a full 30 days to go through the video training and decide if this is really for you.</p>
                  <p>If for any reason, or no reason at all, you're not 100% satisfied with everything you get inside, simply let me know, and I'll refund every penny of your tiny investment.</p>
                  <p className="font-bold">No questions asked!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
            Here's How To Get Instant Access
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-teal-600 mb-6">
            To The Video Version Today...
          </h3>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto mb-8">
            Simply click the button below, enter your information, and you'll get <strong>INSTANT ACCESS</strong> to the entire video training version <strong>PLUS the Fast Action Bonus MP3s…</strong>
          </p>
          
          <BuyButton />
          
          <div className="mt-12 max-w-3xl mx-auto">
            <h4 className="text-2xl font-bold text-gray-800 mb-2">But, Please Don't Wait,</h4>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">You MUST grab this <u>RIGHT NOW!</u></h3>
            <p className="bg-red-600 text-white p-4 rounded-lg italic">
              In fact, if you close this page, you may never have the opportunity to upgrade to the video version of this ever again at an investment this low.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16" style={{ backgroundColor: '#b0e0e6' }}>
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Are you ready To Make Things
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Happen A Lot Faster?
          </h3>
          
          <div className="space-y-4 text-gray-800 mb-8">
            <p>If you prefer to learn by being shown how to do something, and you want to get results quickly… this is for you…</p>
            <p>If you're REALLY serious about Building Your Online Empire Five Bucks At A Time… this is for you...</p>
            <p>And, if you're one of those people that's a visual learner, you <strong>NEED THIS!</strong></p>
            <p>Here's to becoming the most productive <strong>YOU</strong> that you can be!</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 100%)' }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-8">
            <HelpCircle className="h-8 w-8 text-white" />
            <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white/10 backdrop-blur rounded-lg border-none px-6"
              >
                <AccordionTrigger className="text-white hover:no-underline text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="text-center mt-12">
            <BuyButton />
            <p className="text-red-400 italic text-sm mt-6 max-w-2xl mx-auto">
              (Remember, if you close this page, you may never see this again at such a low investment… There's no risk… Try this out for 30 days and then decide if it's for you. It doesn't get any easier than that)
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-center">
        <div className="space-x-4 text-sm text-gray-400">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <span>|</span>
          <a href="#" className="hover:underline">Disclaimer</a>
          <span>|</span>
          <a href="#" className="hover:underline">Terms and Conditions</a>
          <span>|</span>
          <a href="#" className="hover:underline">Support</a>
        </div>
      </footer>
    </div>
  );
}
