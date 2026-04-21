import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ro } from './translations/ro';
import { en } from './translations/en';
import { supabase } from '@/integrations/supabase/client';

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
I18nContext.displayName = 'I18nContext';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ro');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Listen to auth changes directly from supabase to avoid circular dependency
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load locale from profile when user is authenticated
  useEffect(() => {
    if (userId) {
      supabase
        .from('profiles')
        .select('locale')
        .eq('id', userId)
        .single()
        .then(({ data }) => {
          if (data?.locale && (data.locale === 'ro' || data.locale === 'en')) {
            setLocaleState(data.locale as Locale);
          }
        });
    }
  }, [userId]);

  const setLocale = async (newLocale: Locale) => {
    setLocaleState(newLocale);
    
    // If user is logged in, save to profile
    if (userId) {
      setIsLoading(true);
      try {
        await supabase
          .from('profiles')
          .update({ locale: newLocale })
          .eq('id', userId);
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
