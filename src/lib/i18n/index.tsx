import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ro } from './translations/ro';
import { en } from './translations/en';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export type Locale = 'ro' | 'en';

type Translations = typeof ro;

const translations: Record<Locale, Translations> = {
  ro,
  en,
};

interface I18nContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => Promise<void>;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [locale, setLocaleState] = useState<Locale>('ro');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize locale from profile
  useEffect(() => {
    if (profile?.locale && (profile.locale === 'ro' || profile.locale === 'en')) {
      setLocaleState(profile.locale as Locale);
    }
  }, [profile?.locale]);

  const setLocale = async (newLocale: Locale) => {
    setLocaleState(newLocale);
    
    // If user is logged in, save to profile
    if (user) {
      setIsLoading(true);
      try {
        await supabase
          .from('profiles')
          .update({ locale: newLocale })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error saving locale:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const t = translations[locale];

  return (
    <I18nContext.Provider value={{ locale, t, setLocale, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export { translations };
