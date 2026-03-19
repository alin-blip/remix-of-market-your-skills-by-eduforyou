import { useParams, useNavigate } from 'react-router-dom';
import { Dna } from 'lucide-react';
import { DnaQuizContainer } from '@/components/dna-quiz/DnaQuizContainer';
import { quizTranslations, type QuizLang } from '@/components/dna-quiz/quizData';

export default function DnaQuizPublic() {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const quizLang: QuizLang = lang === 'en' || lang === 'ua' ? lang : 'ro';
  const t = quizTranslations[quizLang];

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <header className="border-b border-border/50 py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Dna className="h-6 w-6 text-primary" />
          <span className="font-bold text-foreground">Market Your Skill</span>
        </div>
      </header>

      {/* Quiz content */}
      <main className="max-w-2xl mx-auto px-4 py-8 md:py-16">
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
      </main>
    </div>
  );
}
