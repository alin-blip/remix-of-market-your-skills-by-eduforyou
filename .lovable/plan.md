

## Plan: Quiz "Descoperă-ți ADN-ul de Execuție" — Lead Magnet + In-Platform

### Rezumat
Creăm un quiz cu 10 întrebări care determină profilul utilizatorului (Angajat / Freelancer / Startup). Funcționează în 2 contexte:
1. **Public (lead magnet)**: `/adn-test/ro`, `/adn-test/en`, `/adn-test/ua` — fără cont, colectează email înainte de rezultat, apoi CTA spre înregistrare
2. **In-platform (authenticated)**: Disponibil din Define Your Path ca prim pas, salvează rezultatul în profil

---

### 1. Migrare DB

**Tabel `dna_quiz_results`**:
- `id` uuid PK
- `user_id` uuid nullable (null pt lead-uri neautentificate)
- `email` text nullable (pt lead magnet)
- `lang` text ('ro'/'en'/'ua')
- `answers` jsonb (toate răspunsurile)
- `scores` jsonb (`{employee: X, freelancer: Y, startup: Z}`)
- `result_type` text ('employee' | 'freelancer' | 'startup')
- `created_at` timestamptz

**Update `profiles`**: adaugă coloană `execution_dna` text nullable ('employee'/'freelancer'/'startup') — setată la completarea quiz-ului in-platform.

**RLS**: Insert public (pt lead magnet), select/update own rows pt authenticated.

### 2. Componente React noi

| Componentă | Scop |
|-----------|------|
| `src/components/dna-quiz/DnaQuizContainer.tsx` | Container principal: state management, progress bar, navigare întrebări |
| `src/components/dna-quiz/DnaQuizQuestion.tsx` | Afișare întrebare + opțiuni cu animație |
| `src/components/dna-quiz/DnaQuizResult.tsx` | Ecran rezultat cu profilul dominant, text, CTA |
| `src/components/dna-quiz/DnaQuizLeadCapture.tsx` | Formular email (doar pt public) |
| `src/components/dna-quiz/quizData.ts` | Întrebările, scorurile, textele rezultat — toate 3 limbi |

**Quiz flow**:
```text
[Întrebare 1-10] → [Email capture (public only)] → [Rezultat + CTA]
                                                      ├─ Public: "Creează cont" → /auth/register
                                                      └─ Platform: Salvează în profil + redirect path
```

### 3. Pagini publice (Lead Magnet)

**`src/pages/DnaQuizPublic.tsx`** — pagină publică cu:
- Detectare limbă din URL (`/adn-test/ro` etc.)
- Header minimal cu logo
- Quiz complet
- După email capture → salvare în `dna_quiz_results` + `leads`
- Rezultat cu CTA: "Creează-ți cont gratuit și primește planul complet"

**Rute noi în `App.tsx`**:
```
/adn-test/ro, /adn-test/en, /adn-test/ua
```

### 4. Integrare In-Platform

**Modificare `DefineYourPath.tsx`**:
- Adaugă "Pasul 0" — ADN Quiz, înainte de Skill Scanner
- Dacă `profiles.execution_dna` este setat → afișează badge cu tipul
- Dacă nu → CTA "Descoperă-ți ADN-ul" care deschide quiz-ul
- La completare → update `profiles.execution_dna` + salvare în `dna_quiz_results`

### 5. Traduceri (`quizData.ts`)

Fișierul va conține obiectul complet cu toate cele 10 întrebări + 3 variante + scoruri + textele rezultat, în 3 limbi (ro/en/ua). Structură:

```ts
const quizTranslations = {
  ro: {
    title: "Descoperă-ți ADN-ul de Execuție",
    questions: [{ question: "...", options: [{ text: "...", scores: { employee: 2, freelancer: 0, startup: 0 } }] }],
    results: { employee: { title: "...", description: "...", cta: "..." }, ... }
  },
  en: { ... },
  ua: { ... }
}
```

### 6. Scoring & Logica

- Fiecare răspuns adaugă puncte conform matricei din documentul furnizat
- La final: `Math.max(employee, freelancer, startup)` → profil dominant
- Egalitate: se afișează combinația (ex: "Freelancer cu tendințe de Startup")
- Scorurile exacte din documentul tău, fără modificări

### 7. Design

- Progress bar animat (1/10, 2/10...)
- Tranziții smooth între întrebări (framer-motion, deja în proiect)
- Culori brand: navy + gold
- Mobile-first, responsive
- Rezultat cu iconițe distincte per profil (Briefcase/Laptop/Rocket — deja importate)

### Fișiere modificate/create

| Fișier | Acțiune |
|--------|---------|
| `src/components/dna-quiz/quizData.ts` | Creare — date quiz 3 limbi |
| `src/components/dna-quiz/DnaQuizContainer.tsx` | Creare — logica principală |
| `src/components/dna-quiz/DnaQuizQuestion.tsx` | Creare — UI întrebare |
| `src/components/dna-quiz/DnaQuizResult.tsx` | Creare — UI rezultat |
| `src/components/dna-quiz/DnaQuizLeadCapture.tsx` | Creare — email capture |
| `src/pages/DnaQuizPublic.tsx` | Creare — pagina publică lead magnet |
| `src/App.tsx` | Adăugare rute `/adn-test/:lang` |
| `src/pages/wizard/DefineYourPath.tsx` | Adăugare Pas 0 — ADN Quiz |
| DB migration | Tabel `dna_quiz_results` + coloană `execution_dna` pe profiles |

