

## Plan: Quiz → Cont Direct (fără waitlist gate)

### Problema actuală
Când un vizitator face quiz-ul ADN public (`/adn-test/:lang`), fluxul este:
1. Răspunde la 10 întrebări
2. Introduce email-ul (DnaQuizLeadCapture)
3. Vede rezultatul
4. CTA: "Creează cont" → redirect la `/auth/register?dna=...`
5. La Register, se verifică waitlist → **blocat** dacă nu e aprobat

**Pierzi clientul** pentru că nu poate crea cont direct din quiz.

### Soluția
Transformăm pasul de email capture într-un formular de **înregistrare directă** (email + parolă), care creează contul, salvează rezultatul ADN și redirecționează direct în platformă.

### Ce se modifică

**1. `DnaQuizLeadCapture.tsx` → `DnaQuizSignupCapture`**
- Adăugăm câmp de parolă lângă email
- Titlu: "Rezultatul tău e gata! Creează cont pentru a-l vedea."
- La submit: creează cont via `supabase.auth.signUp`, salvează `execution_dna` în profil, apoi arată rezultatul
- **Fără verificare waitlist** — quiz-ul ADN devine un canal direct de achiziție
- Afișăm și opțiunile de Google/Apple sign-in

**2. `DnaQuizContainer.tsx`**
- Faza `email` devine `signup`
- `handleEmailSubmit` devine `handleSignupSubmit(email, password)`
- După signup reușit: salvează scorul + rezultatul, actualizează profilul cu `execution_dna`, apoi trece la faza `result`
- Dacă userul are deja cont → afișăm link "Ai cont? Loghează-te"

**3. `quizData.ts` — traduceri noi**
- Adăugăm chei: `passwordPlaceholder`, `signupButton`, `loginLink`, `signupTitle`, `signupSubtitle`
- Pentru RO, EN, UA

**4. `DnaQuizResult.tsx`**
- Dacă userul e acum autentificat (tocmai a creat cont): CTA-ul devine "Intră în platformă" → redirect la `/dashboard`
- Nu mai arătăm "Creează cont" dacă e deja logat

**5. Build issue (preview)**
- Se va verifica și remedia importul `useCallback` neutilizat din `useScrollReveal.ts` (cleanup)

### Flow nou
```text
Quiz (10 întrebări)
  ↓
Email + Parolă + Google/Apple
  ↓
Cont creat automat (fără waitlist)
  ↓
Rezultat ADN afișat
  ↓
CTA: "Intră în platformă" → /dashboard
```

### Fișiere modificate
- `src/components/dna-quiz/DnaQuizLeadCapture.tsx` — refactor în signup form
- `src/components/dna-quiz/DnaQuizContainer.tsx` — signup logic
- `src/components/dna-quiz/DnaQuizResult.tsx` — CTA adaptat
- `src/components/dna-quiz/quizData.ts` — traduceri noi
- `src/hooks/useScrollReveal.ts` — cleanup import neutilizat

