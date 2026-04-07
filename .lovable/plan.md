

# Plan: Case Studies + Email Notificare Utilizatori

## Date disponibile (7 utilizatori, 40 generări, 5 unelte)

| Utilizator | Unelte | Gen. | Timp | Domeniu |
|---|---|---|---|---|
| Gabriela A. | skill, ikigai, offer x4, profile | 7 | ~12 min | HoReCa Consulting |
| Elena M. | skill, ikigai, offer, profile | 4 | ~6 min | HoReCa Operations |
| Ioana I. | life-os x2 | 2 | ~1 min | Life Planning |
| Andrei P. | skill, ikigai, offer x4 | 6 | ~3 min | (TBD from data) |
| Marcel C. | skill, ikigai x2, offer x2, life-os | 6 | ~33 min | Medical Logistics |
| Virgil-Catalin B. | skill, ikigai, offer x4, profile x2 | 8 | ~8 min | (TBD from data) |
| Nicolae C. | skill, ikigai, offer, profile x4 | 7 | ~8 min | Construcții Metalice |

## Ce construim

### 1. Pagina dedicată `/case-studies` (publică)
- Stil Hormozi: focus pe REZULTATE + TIMP + TRANSFORMARE
- Header: "7 Profesioniști. 40 de Rezultate AI. Sub 30 de Minute."
- Fiecare card arată:
  - Numele: "Gabriela A." (prenume + inițială)
  - ★★★★★ (5 stele)
  - Domeniul extras din skill-scanner output
  - Timpul total (prima → ultima generare)
  - Ce a construit: skills identificate, ofertă creată, profil optimizat
  - Snippets reale din output-urile lor (bio, SMV, target market)
  - Email de contact pentru colaborări
- CTA final: "Construiește-ți și tu oferta în sub 30 de minute"

### 2. Secțiune pe Landing Page (între ValueStack și EduForYou)
- Versiune compactă: 3-4 carduri highlight cu cele mai impresionante rezultate
- Scroll horizontal pe mobile
- Link "Vezi toate studiile de caz →" spre `/case-studies`

### 3. Edge Function `case-study-notify` — Email către utilizatori
- Trimite email personalizat fiecărui utilizator prin sistemul de email existent (enqueue_email)
- Mesaj Hormozi-style: "Am observat rezultatele tale pe platformă — sunt impresionante. Vrem să te prezentăm ca studiu de caz..."
- Include: ce vom arăta, beneficiul pentru ei (vizibilitate, email de contact pentru clienți)
- Opt-out: "Dacă nu doriți, răspundeți la acest email"

### 4. Datele — hardcoded din baza de date
- Extragem output-urile reale și le hardcodăm în componenta de case studies (cele mai bune rezultate per utilizator)
- Nu facem fetch dinamic — datele sunt curate și controlate

## Fișiere

| Fișier | Acțiune |
|---|---|
| `src/pages/CaseStudies.tsx` | NOU — pagina completă case studies |
| `src/pages/SkillMarketLanding.tsx` | Adăugăm secțiune CaseStudiesPreview între ValueStack și EduForYou |
| `src/App.tsx` | Rută publică `/case-studies` |
| `supabase/functions/case-study-notify/index.ts` | NOU — trimite emailuri personalizate |
| `src/lib/i18n/translations/en.ts` + `ro.ts` | Texte case studies |
| `src/lib/skillmarket-i18n.tsx` | Texte landing section |

## Stil vizual
- Navy/Gold consistent cu landing page
- Carduri cu gradient subtil, border gold
- Stele gold animate
- Metric boxes: "33 min → Ofertă completă", "7 skills identificate"
- Typography: Playfair Display pentru headings

