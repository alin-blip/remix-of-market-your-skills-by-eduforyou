import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://venture-stride-kit.lovable.app';

interface SEOHeadProps {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  ogType?: string;
  locale?: string;
  noindex?: boolean;
  hreflangAlternates?: { lang: string; path: string }[];
  children?: React.ReactNode;
}

export function SEOHead({
  title,
  description,
  path = '/',
  ogImage = `${BASE_URL}/og-default.jpg`,
  ogType = 'website',
  locale = 'en_GB',
  noindex = false,
  hreflangAlternates,
  children,
}: SEOHeadProps) {
  const canonical = `${BASE_URL}${path}`;
  const fullTitle = title.length > 55 ? title : `${title} | Market Your Skill`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content="Market Your Skill" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Hreflang */}
      {hreflangAlternates?.map(({ lang, path: altPath }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={`${BASE_URL}${altPath}`} />
      ))}

      {children}
    </Helmet>
  );
}

export const DEFAULT_HREFLANG = [
  { lang: 'en-GB', path: '/en' },
  { lang: 'ro', path: '/ro' },
  { lang: 'uk', path: '/ua' },
  { lang: 'x-default', path: '/en' },
];
