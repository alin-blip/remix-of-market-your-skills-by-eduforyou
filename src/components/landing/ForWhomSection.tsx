import { useI18n } from '@/lib/i18n';
import { GraduationCap, Briefcase, RefreshCw } from 'lucide-react';

export function ForWhomSection() {
  const { t } = useI18n();

  const audiences = [
    {
      icon: GraduationCap,
      title: t.landing.forWhom.students.title,
      description: t.landing.forWhom.students.description,
      color: 'from-primary to-purple-500',
    },
    {
      icon: Briefcase,
      title: t.landing.forWhom.graduates.title,
      description: t.landing.forWhom.graduates.description,
      color: 'from-accent to-lime-400',
    },
    {
      icon: RefreshCw,
      title: t.landing.forWhom.careerChangers.title,
      description: t.landing.forWhom.careerChangers.description,
      color: 'from-blue-500 to-cyan-400',
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            {t.landing.forWhom.title}{' '}
            <span className="text-gradient">{t.landing.forWhom.titleHighlight}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.landing.forWhom.subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {audiences.map((audience, i) => {
            const Icon = audience.icon;
            return (
              <div 
                key={i}
                className="group p-8 rounded-2xl glass card-shine hover-lift text-center"
              >
                <div className={`h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br ${audience.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-2xl mb-3">{audience.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{audience.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
