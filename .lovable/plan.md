

# Plan: Flux de înregistrare EduForYou cu acces instant

## Problema
1. Utilizatorii nu primesc email de confirmare → nu se pot loga
2. Butonul "Sunt student EduForYou" duce la `#pricing` în loc de un formular dedicat
3. Studenții EduForYou trebuie să primească acces imediat, fără confirmare email

## Soluție

### 1. Activare auto-confirm email
Activăm auto-confirmarea email-urilor pentru toți utilizatorii — astfel nimeni nu mai rămâne blocat la verificare.

### 2. Pagină nouă: `/auth/register-eduforyou`
Formular dedicat pentru studenți EduForYou care colectează:
- **Nume complet** (obligatoriu)
- **Email** (obligatoriu)
- **Parolă** (obligatoriu, min 6 caractere)
- **Cursul** (dropdown cu cursurile EduForYou existente din OnboardingStep1)
- **Campusul** (dropdown: London, Birmingham, Manchester, Online, etc.)

La submit:
- Se creează contul cu `signUp()` (auto-confirmat)
- Se actualizează profilul: `is_eduforyou_member = true`, `study_field`, `campus`, `full_name`, `onboarding_completed = true`
- Redirect direct la `/dashboard`

### 3. Coloană nouă `campus` în `profiles`
Migrare DB: `ALTER TABLE profiles ADD COLUMN campus text;`

### 4. Actualizare butoane landing page
Pe toate paginile (`/`, `/ro`, `/en`, `/ua`):
- **"Vreau acces la SkillMarket"** → `#pricing` (rămâne)
- **"Sunt student EduForYou"** → `/auth/register-eduforyou`

Același lucru în secțiunea EduForYou de pe landing.

### 5. Rută nouă în App.tsx
`<Route path="/auth/register-eduforyou" element={<RegisterEduForYou />} />`

## Fișiere afectate
- `src/pages/auth/RegisterEduForYou.tsx` — **NOU** (formular dedicat, stilizat ca Register.tsx)
- `src/App.tsx` — adăugare rută
- `src/pages/SkillMarketLanding.tsx` — update link buton "Sunt student EduForYou"
- `src/components/landing/HeroSection.tsx` — update link buton cta2
- Migrare DB — coloană `campus`
- Configurare auth — auto-confirm email

## Securitate
- Adminul poate restricționa accesul din backend prin dezactivarea contului sau ștergerea rolului
- `is_eduforyou_member` este setat server-side prin profile update cu RLS
- Onboarding skip-uit (marcat `completed`) deoarece datele sunt colectate la înregistrare

