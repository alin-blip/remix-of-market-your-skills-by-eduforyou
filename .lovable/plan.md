

# Audit Complet Platformă Market Your Skill

## Probleme Critice (Blochează clienții)

### 1. PaymentSuccess este protejat — guest-urile nu-l pot accesa
`/payment-success` este învelit în `<ProtectedRoute>` (App.tsx linia 267-273). Fluxul Stripe-first trimite guest-uri (neautentificate) la această pagină după plată, dar ei sunt redirecționați la `/auth/login` și nu văd niciodată pagina de succes cu instrucțiunile de creare cont.

**Fix:** Scoatem `ProtectedRoute` de pe `/payment-success`.

### 2. Webhook Stripe — `determinePlanFromAmount` incorect
Funcția din `stripe-webhook` determină planul pe baza sumei în cenți:
- `<= 1000` → starter, `<= 2000` → pro
- Prețurile reale sunt £49 (4900 cenți) și £97 (9700 cenți) — ambele depășesc pragurile
- Cu cuponul 50%, devin ~£24.50 (2450) și ~£48.50 (4850) — tot depășesc
- **Rezultat:** Toți clienții primesc plan "founder" în loc de starter/pro

**Fix:** Actualizăm pragurile: `<= 6000` → starter, `<= 12000` → pro, rest → founder.

### 3. Webhook nu gestionează guest checkout-uri
Când un guest plătește prin Stripe, `session.metadata.userId` este `undefined` (nu e setat de landing page). Webhook-ul nu face nimic — subscripția nu se creează. Chiar dacă user-ul creează cont ulterior cu același email, nu se leagă automat.

**Fix:** Dacă nu există `userId` dar există `customer_email`, salvăm un record pending cu emailul. La register, verificăm dacă există un record pending pentru acel email și îl legăm.

### 4. Ruta `/onboard` nu există
Settings.tsx redirecționează la `/onboard` (linia 49) dar nu există o rută cu acest path în App.tsx. Orice utilizator care resetează onboarding-ul ajunge pe 404.

**Fix:** Adăugăm ruta `/onboard` → `<Onboarding />` în App.tsx (protejată).

## Probleme Medii

### 5. Register.tsx — `signUp` trimis cu `fullName` gol
La linia 46: `signUp(email, password, '')` — nu se colectează numele. Trigger-ul `handle_new_user` va seta `full_name = email` din fallback, dar profilul nu va avea un nume real.

**Fix:** Adăugăm un câmp "Nume complet" în formularul de Register.

### 6. Landing page — link-uri moarte
- Secțiunea ValueStack (linia 612): `<a href="/waitlist">` — ruta `/waitlist` face redirect la `/auth/register`, dar butonul ar trebui să ducă la `#pricing`
- Footer links (Terms, Privacy, Contact) — toate duc la `href="#"` fără funcționalitate
- EduForYou secțiunea "Apply Now" link → `href="#"` fără target

### 7. Secțiunea EduForYou — CTA2 nu funcționează
`<a href="#" className="text-gold ...">` la linia 651 nu duce nicăieri.

### 8. `subscription.updated` și `subscription.deleted` nu fac nimic
Webhook-ul loghează evenimentele dar nu actualizează baza de date. Dacă un client anulează subscripția din Stripe, platforma nu reflectă schimbarea — accesul rămâne activ.

**Fix:** Implementăm logica de update/delete pentru aceste evenimente.

## Probleme Minore

### 9. Pricing page (`/pricing`) necesită autentificare
E wrapped în `ProtectedRoute`. Dacă un user autentificat vrea să-și schimbe planul, e ok. Dar dacă vine din alt context fără auth, nu poate vedea prețurile. Landing page-ul acoperă acest caz, deci e minor.

### 10. `useSubscription` polling la 60 secunde
Verifică subscripția prin edge function la fiecare 60 secunde — poate fi costisitor la scară. Nu e critic acum.

### 11. Register page nu are full_name field
Pagina de register nu colectează numele complet al utilizatorului (trimite string gol la signUp). Profilul rămâne cu emailul ca nume.

## Ce funcționează bine
- Flux EduForYou: formular dedicat cu colectare date, auto-confirm, acces imediat
- Admin dashboard: verificări, cursuri, feedback, AI outputs
- Gamification: badges, points, streaks
- Life OS: goals, sprints, tasks
- AI tools: toate 13 funcțiile loghează în `ai_outputs`
- RLS: politici corecte pe toate tabelele critice
- Auth: Google + Apple OAuth, forgot/reset password
- Sidebar: navigare completă cu feature gating

## Plan de Fixare (Prioritate)

### Batch 1 — Critice
1. Scoatem `ProtectedRoute` de pe `/payment-success`
2. Fixăm `determinePlanFromAmount` cu praguri corecte
3. Gestionăm guest checkout în webhook (salvare cu email, linking la register)
4. Adăugăm ruta `/onboard` în App.tsx

### Batch 2 — Medii
5. Adăugăm câmp "Nume complet" în Register.tsx
6. Fixăm link-urile moarte din landing page
7. Implementăm `subscription.updated` și `subscription.deleted` în webhook

### Fișiere afectate
- `src/App.tsx` — rută payment-success fără ProtectedRoute + rută /onboard
- `supabase/functions/stripe-webhook/index.ts` — fix plan detection + subscription lifecycle + guest linking
- `src/pages/auth/Register.tsx` — câmp full_name + linking guest payment
- `src/pages/SkillMarketLanding.tsx` — fix link-uri moarte

