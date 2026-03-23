

# Plan: Landing Page Pricing = Full Early Bird + Stripe-First Flow

## Ce se schimbă

### 1. Secțiunea de prețuri pe landing page — design complet ca `/pricing`
Secțiunea `Pricing` din `SkillMarketLanding.tsx` arată acum o versiune simplificată (doar features incluse). O vom transforma să arate identic cu pagina `/pricing`:
- **Toate feature-urile** listate cu ✓ (inclus) și ✗ (neinclus)
- **Badge "Cel mai ales"** pe Pro
- **"7 zile gratuit • card necesar"** pe Starter
- **Lock icon + "Early Bird Rate — blocat pentru totdeauna"**
- **Prețul tăiat** (£98 / £194)

Vom adăuga feature-urile complete (incluse + neincluse) în datele i18n (`skillmarket-i18n.tsx`) pentru toate cele 3 limbi, și vom actualiza componenta `Pricing` din landing page să le randeze cu iconițe ✓/✗.

### 2. Flux nou: Stripe PRIMUL, cont DUPĂ
Fluxul actual: Click plan → Register → Auto-checkout → Stripe
Fluxul nou: Click plan → Stripe direct (guest checkout) → Payment success → Register → Dashboard

**Implementare:**
- **Stripe checkout fără autentificare**: Modificăm edge function `stripe-checkout` să accepte și cereri fără auth header (guest checkout). Emailul va fi colectat de Stripe la checkout.
- **Landing page buttons**: Starter/Pro → apelează direct Stripe checkout (fără redirect la `/auth/register`). Vom adăuga `useStripeCheckout` logic direct în landing page sau vom face redirect la `/pricing` care face checkout-ul.
- **Payment Success page**: După plata cu succes, redirecționăm la `/auth/register?plan=starter&paid=true` (sau pro). Pagina de register detectează `paid=true` și afișează mesaj "Plata confirmată! Creează-ți contul pentru a accesa platforma."
- **Stripe webhook**: La completarea plății, webhook-ul salvează `stripe_customer_id` + email. Când utilizatorul creează cont cu același email, se leagă automat.

### 3. Email recovery
Adăugăm pe pagina de success Stripe un mesaj clar cu emailul folosit și instrucțiuni de creare cont, astfel încât utilizatorul să nu se "piardă pe drum".

## Fișiere afectate
- `src/lib/skillmarket-i18n.tsx` — adăugare features complete (included/excluded) în toate cele 3 limbi
- `src/pages/SkillMarketLanding.tsx` — refactor secțiune Pricing cu design complet + flow Stripe-first
- `supabase/functions/stripe-checkout/index.ts` — permit guest checkout (fără auth obligatoriu)
- `src/pages/PaymentSuccess.tsx` — adăugare flow pentru redirect la register după plată
- `src/pages/auth/Register.tsx` — detectare `paid=true` și mesaj adaptat

## Flow vizual

```text
Landing Page (#pricing)
    ├── Click "Starter" / "Pro"
    │   └── Stripe Checkout (guest, email colectat de Stripe)
    │       └── Payment Success → /auth/register?plan=pro&paid=true
    │           └── Creează cont → Dashboard (acces imediat)
    │
    └── Click "EduForYou"
        └── /auth/register-eduforyou (rămâne ca acum)
```

