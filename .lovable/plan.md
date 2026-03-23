

# Plan: Fix Post-Payment Flow for Existing Users + Email Audit

## Probleme identificate

1. **Register page nu gestionează "user already exists"** — eroare generică, fără ghidaj
2. **PaymentSuccess page nu oferă opțiunea de login** — doar "Creează Contul"
3. **Emailul de recovery a fost trimis cu succes** (status: `sent`) dar probabil a ajuns în Spam — nu e bug de cod, dar putem îmbunătăți subject-ul în română

## Soluții

### 1. PaymentSuccess — adăugare opțiune Login pentru utilizatori existenți
Pe lângă butonul "Creează Contul", adăugăm "Am deja cont — Autentifică-te" care duce la `/auth/login`.

### 2. Register page — detectare eroare "user already exists"
Când `signUp` returnează eroare cu mesaj "User already registered":
- Afișăm mesaj clar: "Ai deja un cont cu acest email"
- Oferim buton "Autentifică-te" + link "Ai uitat parola?"
- Dacă `paid=true`, mesajul explică că trebuie doar să se logheze pentru a activa planul

### 3. Recovery email — subject în română
Schimbăm subject-ul din "Reset your password" în "Resetează-ți parola — MarketYourSkill" pentru a fi mai vizibil în inbox.

### 4. Login page — detectare `plan` + `paid` params
Dacă utilizatorul ajunge pe login cu `?plan=pro&paid=true`, afișăm banner "Plata confirmată" și redirect la dashboard după login.

## Fișiere afectate
- `src/pages/PaymentSuccess.tsx` — adăugare buton login
- `src/pages/auth/Register.tsx` — handling "user already exists" cu UI dedicat
- `src/pages/auth/Login.tsx` — detectare params plan/paid, banner + redirect
- `supabase/functions/auth-email-hook/index.ts` — subjects în română

