

## Plan: Fix OAuth Login Redirect (Google/Apple)

### Problema
După ce te loghezi cu Google sau Apple, OAuth-ul redirecționează la `window.location.origin` care este `/` — adică landing page-ul. Nu există nicio logică pe landing page care să detecteze un utilizator autentificat și să-l ducă la `/dashboard`. De aceea te "duce iar pe index".

### Soluția
Două modificări simple:

**1. Redirecționare post-OAuth pe landing page (`SkillMarketLanding.tsx`)**
- Adăugăm un `useEffect` care verifică dacă utilizatorul este autentificat (via `useAuth()`)
- Dacă `user` există și nu e loading → `navigate('/dashboard')`
- Asta prinde utilizatorii care vin din OAuth callback

**2. Schimbăm `redirect_uri` la `/dashboard` (opțional, backup)**
- În `Login.tsx`, `Register.tsx`, și `DnaQuizLeadCapture.tsx`, schimbăm `redirect_uri` de la `window.location.origin` la `window.location.origin + '/dashboard'`
- Asta face ca OAuth-ul să redirecționeze direct spre dashboard, nu spre landing

### Fișiere modificate
- `src/pages/SkillMarketLanding.tsx` — adăugare redirect pentru useri autentificați
- `src/pages/auth/Login.tsx` — update redirect_uri
- `src/pages/auth/Register.tsx` — update redirect_uri
- `src/components/dna-quiz/DnaQuizLeadCapture.tsx` — update redirect_uri

