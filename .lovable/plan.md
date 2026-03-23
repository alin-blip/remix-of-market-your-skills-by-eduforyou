

## Plan: Early Bird Pricing cu 2 Tiere + Coupon Stripe Automat

### Structura corectă de prețuri

```text
┌─────────────────────┬─────────────────────┬──────────────┐
│      STARTER        │        PRO          │  EDUFORYOU   │
│  7 zile trial free  │  Direct acces       │  = Pro gratis│
│  apoi £49/lună      │  £97/lună           │  (admin)     │
│  (de la £98)        │  (de la £194)       │              │
│  50% Early Bird     │  50% Early Bird     │              │
└─────────────────────┴─────────────────────┴──────────────┘
```

### Cum funcționează Stripe (realist)

Creăm produsele la prețul **COMPLET** (£98 și £194), apoi aplicăm automat un **coupon Stripe de 50% forever** la checkout. Astfel:
- Userul deschide Stripe Checkout și vede: ~~£98~~ → £49/lună (cu "Beta Early Bird -50%")
- Stripe afișează nativ coupon-ul aplicat — arată profesional și credibil
- Prețul £49 / £97 rămâne blocat pentru totdeauna (coupon duration = forever)

### Pași de implementare

**1. Stripe — Produse noi + Coupon**
- Creăm produs "Starter Plan" cu preț £98/lună GBP
- Creăm produs "Pro Plan" cu preț £194/lună GBP (înlocuiește vechiul £97)
- Creăm coupon "EARLYBIRD50" — 50% off, duration: forever

**2. `supabase/functions/stripe-checkout/index.ts`**
- Acceptă parametru opțional `couponId`
- Aplicare automată: `discounts: [{ coupon: couponId }]` pe sesiunea de checkout

**3. `src/hooks/useStripeCheckout.ts`**
- Adăugăm `STRIPE_PRICES.starter` (noul price ID £98)
- Actualizăm `STRIPE_PRICES.pro` cu noul price ID (£194)
- Adăugăm `STRIPE_COUPON = 'EARLYBIRD50'`
- Funcție nouă `checkoutStarter()` — checkout cu trial 7 zile + coupon
- `checkoutPro()` — checkout fără trial + coupon

**4. `supabase/functions/check-subscription/index.ts`**
- Adăugăm `STARTER_PRODUCT_ID` pe lângă `PRO_PRODUCT_ID`
- Mapare: starter product → plan 'starter', pro product → plan 'pro'
- Trial pe starter rămâne cu funcționalități limitate

**5. `src/pages/Pricing.tsx` — Redesign complet**
- **Starter**: "£49/lună" mare, cu ~~£98~~ tăiat, badge "Early Bird — blocat pentru totdeauna", CTA "Începe 7 Zile Gratuit"
- **Pro**: "£97/lună" mare, cu ~~£194~~ tăiat, badge "Early Bird Rate", CTA "Upgrade la Pro"
- **EduForYou**: neschimbat
- Header: "🚀 Beta Early Bird — Prețuri blocate pentru primii adoptatori"
- Subsecțiune: "Ești printre primii. Prețul tău rămâne blocat cât timp ai contul activ."
- Fără cuvântul "discount" sau "reducere" — doar "Early Bird Rate", "Founding Member"

**6. `src/components/landing/PricingPreview.tsx`**
- 2 carduri: Starter (£49, de la £98) și Pro (£97, de la £194)
- Badge "Beta Testing — Early Bird Rate"
- Prețuri tăiate + preț actual

**7. `src/components/upgrade/UpgradeModal.tsx`**
- Pro afișat ca "£97/lună (Early Bird de la £194)"
- "Preț blocat pentru totdeauna"

**8. `src/hooks/useSubscription.ts`**
- Adăugăm mapare pentru noul Starter product ID
- Starter cu subscripție activă = acces la funcțiile starter (limitate)
- Pro = acces complet

### Copy — fără "discount"
- "Early Bird Rate" / "Founding Member Price"
- "Preț blocat pentru totdeauna"
- "Prețul crește după faza Beta"
- "Ești printre primii adoptatori"

