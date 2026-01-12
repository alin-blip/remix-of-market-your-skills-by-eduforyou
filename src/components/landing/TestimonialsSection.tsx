import { useI18n } from '@/lib/i18n';
import { Quote, Star } from 'lucide-react';

export function TestimonialsSection() {
  const { t } = useI18n();

  const testimonials = [
    {
      name: 'Alexandra M.',
      role: t.landing.testimonials.roles.student,
      university: 'University of Birmingham',
      quote: t.landing.testimonials.quotes.alexandra,
      income: '£1,200/month',
      avatar: 'A',
    },
    {
      name: 'Andrei P.',
      role: t.landing.testimonials.roles.graduate,
      university: 'University of Manchester',
      quote: t.landing.testimonials.quotes.andrei,
      income: '£2,500/month',
      avatar: 'A',
    },
    {
      name: 'Maria D.',
      role: t.landing.testimonials.roles.student,
      university: 'University of Leeds',
      quote: t.landing.testimonials.quotes.maria,
      income: '£800/month',
      avatar: 'M',
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            {t.landing.testimonials.title}{' '}
            <span className="text-accent">{t.landing.testimonials.titleHighlight}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.landing.testimonials.subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, i) => (
            <div 
              key={i}
              className="p-8 rounded-2xl glass card-shine hover-lift relative"
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/20" />
              
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              
              {/* Quote */}
              <p className="text-muted-foreground mb-6 leading-relaxed italic">
                "{testimonial.quote}"
              </p>
              
              {/* Income badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                {testimonial.income}
              </div>
              
              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} • {testimonial.university}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
