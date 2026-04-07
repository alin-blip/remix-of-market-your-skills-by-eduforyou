import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Dna, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DnaQuizContainer } from '@/components/dna-quiz/DnaQuizContainer';
import { quizTranslations, type QuizLang } from '@/components/dna-quiz/quizData';
import { SEOHead } from '@/components/seo/SEOHead';
import heroImage from '@/assets/quiz-hero.png';

export default function DnaQuizPublic() {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const quizLang: QuizLang = lang === 'en' || lang === 'ua' ? lang : 'ro';
  const t = quizTranslations[quizLang];
  const [phase, setPhase] = useState<'hero' | 'quiz'>('hero');

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <header className="border-b border-border/50 py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Dna className="h-6 w-6 text-primary" />
          <span className="font-bold text-foreground">Market Your Skill</span>
        </div>
      </header>

      {phase === 'hero' && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative"
        >
          {/* Hero with image */}
          <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
            {/* Background image */}
            <img
              src={heroImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Navy overlay */}
            <div className="absolute inset-0 bg-[#0D1B2A]/80" />

            {/* Content */}
            <div className="relative z-10 max-w-3xl mx-auto px-6 text-center py-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                  <Dna className="h-5 w-5 text-[#D4A843]" />
                  <span className="text-sm text-white/90 font-medium">
                    {t.title}
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 whitespace-pre-line" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {t.heroHeadline}
                </h1>

                <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
                  {t.heroSubheadline}
                </p>

                <Button
                  onClick={() => setPhase('quiz')}
                  size="lg"
                  className="bg-[#D4A843] hover:bg-[#C09A3A] text-[#0D1B2A] text-lg px-8 py-6 font-bold rounded-xl shadow-lg shadow-[#D4A843]/30 transition-all hover:scale-105"
                >
                  {t.heroCta}
                </Button>

                <p className="text-white/50 text-sm mt-6">
                  {t.subtitle}
                </p>
              </motion.div>

              {/* Scroll indicator */}
              <motion.div
                className="mt-12"
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <ChevronDown className="h-6 w-6 text-white/40 mx-auto" />
              </motion.div>
            </div>
          </div>
        </motion.section>
      )}

      {phase === 'quiz' && (
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto px-4 py-8 md:py-16"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {t.title}
            </h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>

          <DnaQuizContainer
            lang={quizLang}
            isPublic={true}
            onNavigate={(path) => navigate(path)}
          />
        </motion.main>
      )}
    </div>
  );
}
