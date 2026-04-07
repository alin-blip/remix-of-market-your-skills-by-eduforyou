import { Helmet } from 'react-helmet-async';

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Market Your Skill',
  url: 'https://venture-stride-kit.lovable.app',
  logo: 'https://venture-stride-kit.lovable.app/logo.png',
  sameAs: [],
  description: 'AI-powered career coaching platform that helps students and professionals monetise their skills through freelancing, employment, and entrepreneurship.',
};

export const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Market Your Skill',
  url: 'https://venture-stride-kit.lovable.app',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'GBP',
    lowPrice: '0',
    highPrice: '49',
    offerCount: '3',
  },
  description: 'Turn your skills into income with AI coaching. Skill scanning, offer building, profile optimisation, and outreach — all in one platform.',
};

export function courseJsonLd(course: {
  title: string;
  description: string;
  price: number;
  currency?: string;
  slug?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'Market Your Skill',
    },
    offers: {
      '@type': 'Offer',
      price: course.price,
      priceCurrency: course.currency || 'EUR',
      availability: 'https://schema.org/InStock',
    },
    url: course.slug
      ? `https://venture-stride-kit.lovable.app/courses/${course.slug}`
      : undefined,
  };
}
