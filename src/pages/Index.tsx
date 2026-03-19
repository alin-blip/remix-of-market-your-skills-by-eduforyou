import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'ro', label: '🇷🇴 Română', path: '/ro' },
  { code: 'en', label: '🇬🇧 English', path: '/en' },
  { code: 'ua', label: '🇺🇦 Українська', path: '/ua' },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 animate-fade-in">
        <Globe className="h-10 w-10 text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground tracking-wide uppercase">
          Choose your language
        </p>
        <div className="flex flex-col gap-3 min-w-[220px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => navigate(lang.path)}
              className="px-6 py-3 rounded-lg border border-border bg-card text-card-foreground text-lg font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
