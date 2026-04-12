import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle, Rocket, BookOpen, Crown, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

const planDetails = {
  starter: {
    name: "Starter",
    icon: Rocket,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    message: "Ai acces la 3 gig-uri/lună și instrumente AI de bază!",
    features: ["3 gig-uri/lună", "Skill Scanner", "Profile Builder", "Outreach Generator"],
  },
  pro: {
    name: "Pro",
    icon: Crown,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    message: "Ai deblocat gig-uri nelimitate și toate instrumentele AI!",
    features: ["Gig-uri nelimitate", "Toate instrumentele AI", "Client CRM", "Analize avansate"],
  },
  founder: {
    name: "Founder Accelerator",
    icon: Sparkles,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    message: "Ai acces lifetime la tot ce oferă Freedom Launcher!",
    features: ["Acces lifetime", "Toate cursurile", "Coaching 1-on-1", "Comunitate exclusivă"],
  },
  course: {
    name: "Curs",
    icon: BookOpen,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    message: "Ai acces complet la cursul achiziționat!",
    features: ["Acces permanent", "Toate lecțiile", "Materiale bonus", "Certificat de completare"],
  },
};

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState<keyof typeof planDetails>("starter");

  useEffect(() => {
    const planParam = searchParams.get("plan");
    const courseId = searchParams.get("course_id");
    
    if (courseId) {
      setPlan("course");
    } else if (planParam && planParam in planDetails) {
      setPlan(planParam as keyof typeof planDetails);
    }

    // Fire Meta Pixel Purchase event for Starter/Pro only
    if (typeof fbq !== 'undefined' && (planParam === 'starter' || planParam === 'pro')) {
      const value = planParam === 'starter' ? 49 : 97;
      fbq('track', 'Purchase', {
        value,
        currency: 'GBP',
        content_name: `${planParam} subscription`,
        content_type: 'product',
      });
    }

    // Fire confetti
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ["#9b87f5", "#7E69AB", "#D6BCFA", "#F97316", "#22C55E"];

    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();

    setTimeout(() => {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors });
    }, 500);
  }, [searchParams]);

  const details = planDetails[plan];
  const Icon = details.icon;
  const isGuest = !user;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full"
      >
        <Card className="border-2 border-primary/20 shadow-2xl">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className={`w-24 h-24 rounded-full ${details.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-12 h-12 ${details.color}`} />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="absolute -bottom-1 -right-1"
                >
                  <CheckCircle className="w-8 h-8 text-green-500 bg-background rounded-full" />
                </motion.div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <h1 className="text-3xl font-bold text-foreground">
                {isGuest ? "Plata confirmată! 🎉" : "Felicitări! 🎉"}
              </h1>
              <p className="text-xl text-muted-foreground">
                Ai activat <span className={details.color}>{details.name}</span>
              </p>
            </motion.div>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-lg"
            >
              {details.message}
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <p className="text-sm font-medium text-foreground">Ce ai deblocat:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {details.features.map((feature, index) => (
                  <motion.span
                    key={feature}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className={`px-3 py-1 rounded-full text-sm ${details.bgColor} ${details.color}`}
                  >
                    {feature}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col gap-3 pt-4"
            >
              {isGuest ? (
                <>
                  <p className="text-sm text-muted-foreground mb-2">
                    Creează-ți contul cu <strong>același email</strong> folosit la plată pentru a activa accesul.
                  </p>
                  <Button
                    onClick={() => navigate(`/auth/register?plan=${plan}&paid=true`)}
                    className="w-full"
                    size="lg"
                  >
                    Creează Contul <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    onClick={() => navigate(`/auth/login?plan=${plan}&paid=true`)}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    Am deja cont — Autentifică-te
                  </Button>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  {plan === "course" ? (
                    <Button onClick={() => navigate("/learning-hub")} className="flex-1" size="lg">
                      <BookOpen className="mr-2 h-5 w-5" /> Începe Cursul
                    </Button>
                  ) : (
                    <Button onClick={() => navigate("/dashboard")} className="flex-1" size="lg">
                      <Rocket className="mr-2 h-5 w-5" /> Mergi la Dashboard
                    </Button>
                  )}
                  <Button onClick={() => navigate("/wizard/skill-scanner")} variant="outline" className="flex-1" size="lg">
                    Explorează Instrumentele
                  </Button>
                </div>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
