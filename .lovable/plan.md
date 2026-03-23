

## Plan: Restructurare Pricing + Eliminare Waitlist

### Ce se schimbă

**Structură nouă cu 3 planuri:**

```text
┌──────────────────┬──────────────────┬──────────────────┐
│     STARTER      │       PRO        │  EDUFORYOU FREE  │
│   7 zile trial   │   £97/lună       │   Privilege Card │
│   (cu card)      │                  │  (aprobare admin)│
├──────────────────┼──────────────────┼──────────────────┤
│ 3 platforme      │ Totul din Starter│ = Pro complet    │
│ 15 gig-uri       │ + Nelimitat      │ fără plată       │
│ 50 AI gen/lună   │ + Dream 100      │                  │
│ Profile Builder  │ + CV Generator   │ Admin setează    │
│ Income Tracker   │ + Outreach Seq.  │ is_eduforyou     │
│ Export PDF       │ + Dream Scanner  │ din dashboard    │
│ Skill Scanner    │ + Certificări    │                  │
│ Ikigai Builder   │ + Priority Supp. │                  │
│                  │ + ADN Test       │                  │
└──────────────────┴──────────────────┴──────────────────┘

Cursuri = achiziții separate (neschimbat)
Founder = eliminat
Free (fără card) = nu mai există
```

### Eliminare Waitlist
- Eliminăm verificarea waitlist din `Register.tsx` (rândurile 44-53)
- Păstrăm tabela `waitlist_applications` (date istorice) dar nu mai blocăm signup-ul
- Eliminăm `check_waitlist_status` RPC call din Register
- Eliminăm `populate_profile_from_waitlist` call (profilul se creează normal la signup)
- Pagina `/waitlist` redirecționează direct la `/auth/register`

### Stripe: Produs Pro nou
- Creăm produs Stripe "Pro Plan" cu preț £97/lună recurring (GBP)
- Starter-ul folosește trial de 7 zile pe același produs Pro (Stripe `trial_period_days: 7`)
- Când trial-ul expiră, userul rămâne pe Starter limitat dacă nu plătește

**Flux trial cu card:**
1. User se înregistrează → cont gratuit cu plan "starter"
2. Click "Start 7-Day Trial" → Stripe Checkout cu `trial_period_days: 7` + card obligatoriu
3. După 7 zile → Stripe taxează £97 automat → plan devine "pro"
4. Dacă anulează în trial → rămâne pe "starter" (limitat)

### Fișiere modificate

1. **Stripe** — Creăm produs + preț nou (£97/lună GBP) via tool
2. **`src/hooks/useSubscription.ts`** — Actualizăm PLAN_LIMITS:
   - Eliminăm `founder` 
   - `pro` primește Dream 100, CV Generator, Outreach, ADN Test, certificări
   - `eduforyou` = copie exactă Pro
3. **`src/hooks/useStripeCheckout.ts`** — Actualizăm STRIPE_PRICES (un singur preț Pro), eliminăm founder, trial checkout cu `trial_period_days: 7`
4. **`src/pages/Pricing.tsx`** — Redesign cu 3 carduri (Starter trial, Pro £97, EduForYou privilege)
5. **`src/components/upgrade/UpgradeModal.tsx`** — Actualizăm info planuri
6. **`src/pages/auth/Register.tsx`** — Eliminăm verificare waitlist, signup direct
7. **`supabase/functions/stripe-checkout/index.ts`** — Suport `trial_period_days`
8. **`supabase/functions/check-subscription/index.ts`** — Eliminăm product ID founder, actualizăm mapare
9. **`src/components/layout/AppSidebar.tsx`** — Actualizăm gating-ul pe Dream 100, CV, etc. pentru Pro

### EduForYou — Flux admin
- Admin marchează manual `is_eduforyou_member = true` pe profil din admin dashboard (existent deja)
- Hook-ul `useSubscription` detectează flag-ul și setează plan = 'eduforyou' (echivalent Pro)
- Nu necesită Stripe — acces gratuit complet

### Detalii tehnice suplimentare

**PLAN_LIMITS actualizat:**
```typescript
starter: {
  platforms: 3, gigs: 15, aiGenerations: 50,
  outreachTemplates: 5, hasProfileBuilder: true,
  hasIncomeTracker: true, hasExport: true,
  hasPrioritySupport: false, hasAllCourses: false,
  hasExternalCourses: false, hasDream100: false,
  hasCVGenerator: false, hasCertifications: false,
  hasAdnTest: false,
},
pro: {
  platforms: Infinity, gigs: Infinity, aiGenerations: Infinity,
  outreachTemplates: Infinity, hasProfileBuilder: true,
  hasIncomeTracker: true, hasExport: true,
  hasPrioritySupport: true, hasAllCourses: false,
  hasExternalCourses: true, hasDream100: true,
  hasCVGenerator: true, hasCertifications: true,
  hasAdnTest: true,
},
eduforyou: { /* identic cu pro */ }
```

