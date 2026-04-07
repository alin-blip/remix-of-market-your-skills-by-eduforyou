

# Plan: SEO & GEO Optimization pentru UK — Prima Pagină Google

## Situația actuală (probleme critice)

Platforma are **zero SEO tehnic** implementat:
- **Fără sitemap.xml** — Google nu știe ce pagini există
- **Fără canonical URLs** — risc de duplicate content
- **Fără hreflang tags** — Google nu știe că ai EN/RO/UA
- **Fără JSON-LD structured data** — nicio rich snippet în SERP
- **Meta description în română** pe index.html — Google UK vede text românesc
- **Fără meta tags per pagină** — toate paginile au același title/description
- **robots.txt fără sitemap reference**
- **SPA fără SSR/prerender** — crawlerii văd doar un `<div id="root">`

## Conectori disponibili

- **Firecrawl** (deja linked) — putem face audit SEO automat, crawl site-ul și identifica probleme
- **Perplexity** (deja linked) — putem genera keyword research UK-specific în edge functions

## Ce construim

### Faza 1: Fundația SEO Tehnică (zero risc, nu afectează UI)

**1. Sitemap.xml static** (`public/sitemap.xml`)
- Listează toate paginile publice: `/`, `/en`, `/ro`, `/ua`, `/case-studies`, `/adn-test/en`, `/adn-test/ro`, `/courses/*`, `/ebook/*`, `/pricing`
- Adaugă `<xhtml:link rel="alternate" hreflang="...">` per pagină

**2. robots.txt actualizat** (`public/robots.txt`)
- Adaugă `Sitemap: https://venture-stride-kit.lovable.app/sitemap.xml`
- Blochează paginile admin și protected routes

**3. React Helmet pentru meta tags per pagină**
- Instalez `react-helmet-async`
- Creez componenta `SEOHead.tsx` reutilizabilă
- Adaug meta tags unice pe fiecare pagină publică (title, description, canonical, hreflang, og:*)

**4. JSON-LD Structured Data** (în `SEOHead.tsx`)
- `Organization` schema pe homepage
- `WebApplication` schema (SaaS)
- `FAQPage` schema pe pricing
- `Course` schema pe paginile de cursuri
- `Article` schema pe case studies

### Faza 2: GEO Targeting UK

**5. Meta tags UK-specific pe `/en`**
- Title: "Market Your Skill — Turn Your Skills Into Income | UK"
- Description optimizat pentru keywords UK: "freelancing UK", "skill monetization", "career coaching AI"
- `og:locale` = `en_GB`

**6. Hreflang implementation**
```text
<link rel="alternate" hreflang="en-GB" href="/en" />
<link rel="alternate" hreflang="ro" href="/ro" />
<link rel="alternate" hreflang="uk" href="/ua" />
<link rel="alternate" hreflang="x-default" href="/en" />
```

**7. Pagină dedicată `/blog` sau `/resources`** (opțional, faza 2+)
- Content pages static pentru keyword targeting
- Folosim Perplexity API pentru research topics trending în UK

### Faza 3: SEO Audit Automat (Admin Tool)

**8. Pagină admin `/admin/seo-audit`**
- Folosește Firecrawl connector să crawl-uiască site-ul
- Afișează: pagini indexate, broken links, missing meta, page speed issues
- Rulează on-demand din admin dashboard

## Fișiere afectate

| Fișier | Acțiune |
|---|---|
| `public/sitemap.xml` | NOU — sitemap static |
| `public/robots.txt` | UPDATE — adaug sitemap + blocări |
| `src/components/seo/SEOHead.tsx` | NOU — componenta meta tags |
| `src/components/seo/JsonLd.tsx` | NOU — structured data |
| `src/pages/SkillMarketLanding.tsx` | UPDATE — adaug SEOHead |
| `src/pages/CaseStudies.tsx` | UPDATE — adaug SEOHead |
| `src/pages/Pricing.tsx` | UPDATE — adaug SEOHead |
| `src/pages/CourseSalesPage.tsx` | UPDATE — adaug SEOHead |
| `src/pages/DnaQuizPublic.tsx` | UPDATE — adaug SEOHead |
| `index.html` | UPDATE — meta tags EN default, lang="en-GB" |
| `src/pages/admin/SeoAudit.tsx` | NOU — admin SEO audit cu Firecrawl |
| `src/App.tsx` | UPDATE — ruta /admin/seo-audit |

## Siguranță

- **Nicio modificare la logica existentă** — doar adăugăm componente SEO
- **SEOHead e un wrapper React Helmet** — nu afectează rendering-ul
- **Sitemap e un fișier static** în /public — zero impact pe build
- **Admin SEO audit e pagină nouă** — izolată complet

## Pași implementare

1. Instalez `react-helmet-async`, creez `SEOHead.tsx` și `JsonLd.tsx`
2. Adaug SEOHead pe toate paginile publice cu meta tags UK-optimized
3. Creez `sitemap.xml` și actualizez `robots.txt`
4. Adaug JSON-LD structured data (Organization, Course, FAQ)
5. Implementez hreflang corect pe toate versiunile lingvistice
6. Creez pagina admin SEO Audit cu Firecrawl
7. Actualizez `index.html` cu `lang="en-GB"` și meta tags EN default

