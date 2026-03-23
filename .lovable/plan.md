

## Plan: Persist Quiz State Through OAuth Redirect

### Problema
Când utilizatorul alege "Continuă cu Google" din quiz, OAuth face redirect la `/dashboard`. Toată starea quiz-ului (scoruri, răspunsuri, rezultat) se pierde din React state. Rezultatul nu se salvează, utilizatorul nu-l vede niciodată.

### Soluția
Salvăm starea quiz-ului în `localStorage` **înainte** de OAuth redirect. După autentificare, pe Dashboard detectăm datele pendinte, le salvăm în DB, actualizăm profilul cu `execution_dna`, și afișăm rezultatul.

### Ce se modifică

**1. `DnaQuizLeadCapture.tsx`**
- Înainte de `lovable.auth.signInWithOAuth('google')`, salvăm în `localStorage` key `pending_dna_quiz`:
  ```json
  { "scores": {...}, "answers": [...], "result": { "primary": "freelancer" }, "lang": "ro" }
  ```
- Adăugăm prop `quizState` (scores, answers, result, lang) pentru a avea acces la date

**2. `DnaQuizContainer.tsx`**
- Transmitem `quizState` ca prop la `DnaQuizLeadCapture`: `{ scores, answers, result, lang }`

**3. `Dashboard.tsx`**
- La mount, verificăm dacă există `pending_dna_quiz` în localStorage
- Dacă da: salvăm rezultatul în `dna_quiz_results`, actualizăm `profiles.execution_dna`, ștergem din localStorage
- Afișăm un banner/card cu rezultatul ADN (tipul + scor) cu opțiunea de a reface testul
- Adăugăm o secțiune permanentă pe dashboard care arată `execution_dna` din profil, cu buton "Refă testul" care duce la `/wizard/define-your-path`

**4. Redirect URI**
- Schimbăm redirect-ul Google din `/dashboard` în `/dashboard?from=dna-quiz` (doar din quiz) pentru a ști că vine din quiz flow

### Flow nou
```text
Quiz completat → Alege Google
  ↓
State salvat în localStorage
  ↓
OAuth redirect → /dashboard
  ↓
Dashboard detectează pending_dna_quiz
  ↓
Salvează în DB + actualizează profil
  ↓
Afișează card cu rezultatul ADN
  ↓
Opțiune: "Refă testul" sau "Continuă"
```

### Fișiere modificate
- `src/components/dna-quiz/DnaQuizLeadCapture.tsx` — save state to localStorage before OAuth
- `src/components/dna-quiz/DnaQuizContainer.tsx` — pass quiz state to lead capture
- `src/pages/Dashboard.tsx` — detect pending quiz, save result, show DNA card

