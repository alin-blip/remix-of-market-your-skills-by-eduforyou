import { useI18n } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Handshake, GraduationCap, Briefcase } from 'lucide-react';

export function PartnersSection() {
  const { t } = useI18n();

  const partners = [
    { name: 'Edu4U', icon: GraduationCap, type: 'education' },
    { name: 'SwipeHire', icon: Briefcase, type: 'employment' },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container relative">
        <div className="max-w-4xl mx-auto">
          <div className="p-10 rounded-3xl glass glow-primary relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent/20 to-transparent rounded-full blur-3xl" />
            
            <div className="relative text-center">
              {/* Header */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <Handshake className="h-8 w-8 text-accent" />
                <h2 className="font-display text-3xl md:text-4xl font-bold">
                  {t.landing.partners.title}
                </h2>
              </div>
              
              <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
                {t.landing.partners.subtitle}
              </p>
              
              {/* Partner logos */}
              <div className="flex flex-wrap items-center justify-center gap-8 mb-10">
                {partners.map((partner, i) => {
                  const Icon = partner.icon;
                  return (
                    <div 
                      key={i}
                      className="flex items-center gap-3 px-6 py-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group"
                    >
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-display font-bold text-lg">{partner.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{partner.type}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Edu4U callout */}
              <Badge variant="outline" className="text-base px-6 py-2 border-accent text-accent bg-accent/10">
                <GraduationCap className="h-4 w-4 mr-2" />
                {t.landing.partners.edu4uCallout}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
