import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { Sparkles, Mail, Twitter, Linkedin, Instagram } from 'lucide-react';

export function LandingFooter() {
  const { t } = useI18n();

  const footerLinks = {
    product: [
      { label: t.landing.footer.links.pricing, href: '/pricing' },
      { label: t.landing.footer.links.features, href: '/#features' },
    ],
    legal: [
      { label: t.landing.footer.links.terms, href: '/terms' },
      { label: t.landing.footer.links.privacy, href: '/privacy' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  return (
    <footer className="py-16 border-t border-border">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl gradient-accent flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-accent-foreground" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">
                Student<span className="text-accent">Freedom</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm mb-6">
              {t.landing.footer.description}
            </p>
            {/* Social links */}
            <div className="flex gap-4">
              {socialLinks.map((social, i) => {
                const Icon = social.icon;
                return (
                  <a 
                    key={i}
                    href={social.href}
                    className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
          
          {/* Product links */}
          <div>
            <h4 className="font-semibold mb-4">{t.landing.footer.sections.product}</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link, i) => (
                <li key={i}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Legal links */}
          <div>
            <h4 className="font-semibold mb-4">{t.landing.footer.sections.legal}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, i) => (
                <li key={i}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Eduforyou. {t.landing.footer.rights}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Mail className="h-4 w-4" />
            contact@eduforyou.co.uk
          </p>
        </div>
      </div>
    </footer>
  );
}
