

# Audit de Lansare — Platforma Market Your Skill

## Verdict: ⚠️ Aproape gata, dar are câteva probleme critice de rezolvat

Am verificat edge functions, Stripe, baza de date și fluxurile de acces. Iată ce am găsit:

---

## ✅ Ce funcționează corect
- **Landing page & SEO** — implementat cu meta tags UK, sitemap, JSON-LD
- **Sistem de autentificare** — login, register, forgot password, register EduForYou
- **Checkout Stripe** — funcția `stripe-checkout` creează sesiuni corect
- **Verificare subscripție** — `check-subscription` funcționează (confirmat din loguri live)
- **Feature gating** — Starter/Pro/EduForYou cu limite corecte
- **Accesul la cursuri** — verificare prin `course_purchases` + preț 0 = gratuit
- **Customer portal** — funcțional pentru gestionare abonament
- **Admin dashboard** — complet cu notificări real-time

## ⚠️ Probleme critice de rezolvat înainte de lansare

### 1. Webhook Stripe — SDK vechi și desincronizat
`stripe-webhook/index.ts` folosește **Stripe SDK v14.21.0** și API `2023-10-16`, în timp ce `stripe-checkout` folosește **v18.5.0** și `2025-08-27.basil`. Asta poate cauza **incompatibilități** la procesarea evenimentelor noi de la Stripe.

**Fix:** Actualizez webhook-ul la aceeași versiune SDK (18.5.0).

### 2. Subscripțiile din Stripe nu se sincronizează cu baza de date
- **Stripe**: 4 subscripții active
- **Baza de date**: doar 2 rânduri, ambele cu status `inactive`
- Exemplu real: `alinflorinradu@icloud.com` are customer Stripe (`cus_ToH9ZiTMbaouy3`) dar check-subscription returnează "No active or trialing subscription found"

**Fix:** Funcția `check-subscription` deja face sync-ul, dar trebuie verificat de ce subscripțiile existente nu se mapează corect (posibil price ID-uri vechi).

### 3. Guest checkout nu setează email-ul corect
În `stripe-checkout`, dacă utilizatorul nu are un customer Stripe existent, sesiunea nu primește `customer_email`. Asta înseamnă că webhook-ul nu poate lega plata de utilizator.

**Fix:** Adaug `customer_email` în parametrii sesiunii Stripe când nu există `customerId`.

### 4. Pending subscriptions cu UUID placeholder
Webhook-ul salvează subscripții guest cu `user_id = "00000000-0000-0000-0000-000000000000"`. Dacă 2 guests plătesc, al doilea va eșua pe constraint unique.

**Fix:** Folosesc `customer_email` ca identificator temporar, nu un UUID fake.

---

## Plan de implementare (zero risc pentru cei 82 useri)

### Pas 1: Actualizez webhook-ul Stripe
- Upgrade SDK la v18.5.0
- Fix guest checkout email handling
- Fix pending subscription storage

### Pas 2: Fix checkout-ul pentru guest users
- Adaug `customer_email` în sesiunea Stripe

### Pas 3: Sync subscripții existente
- Verific cele 4 subscripții active din Stripe și le sincronizez în DB

### Pas 4: Verific config.toml
- `stripe-webhook` și `stripe-checkout` funcționează cu default `verify_jwt = false`, dar e bine să le adăugăm explicit

### Fișiere afectate
| Fișier | Schimbare |
|---|---|
| `supabase/functions/stripe-webhook/index.ts` | Upgrade SDK + fix guest flow |
| `supabase/functions/stripe-checkout/index.ts` | Adaug customer_email |
| `supabase/config.toml` | Adaug explicit stripe functions |

### Ce NU modificăm
- Nimic din frontend-ul existent
- Nimic din auth, courses, dashboard
- Nimic din flow-ul utilizatorilor activi

---

## După aceste fix-uri, ești gata să lansezi campanii de ads
Traficul poate veni pe:
- `/en` — landing page principal (EN, optimizat UK)
- `/adn-test/en` — quiz ADN ca lead magnet
- `/pricing` — direct la planuri
- `/squeeze/[slug]` — squeeze pages pentru lead-uri

