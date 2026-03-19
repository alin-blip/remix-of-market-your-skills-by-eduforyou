

## Plan: Hero page quiz + Email rezultat ADN + Email invitație 48h

### 1. Hero page pentru quiz (`DnaQuizPublic.tsx`)

Refac pagina de start a quiz-ului cu un hero section complet înainte de quiz:
- Copiez imaginea uploadată în `src/assets/quiz-hero.png`
- Hero cu background imagine, overlay navy
- Headline: "Mulți urcă o scară... dar pe zidul greșit."
- Sub-headline: "Ești destinat să fii Angajat, Freelancer sau Antreprenor? Nu irosi timp și bani construind ceva greșit."
- CTA buton: "Verifică-ți ADN-ul — Gratuit" care scrollează/afișează quiz-ul
- Traduceri EN/UA echivalente adăugate în `quizData.ts`

Pagina va avea 2 faze: `hero` (landing) → `quiz` (DnaQuizContainer apare după click CTA).

### 2. Edge function `dna-quiz-email` — email cu rezultatul

Creez o nouă Edge Function `supabase/functions/dna-quiz-email/index.ts` care:
- Primește: `{ email, result_type, lang }` 
- Folosește Resend (RESEND_API_KEY deja configurat) pentru a trimite emailul corespunzător
- 3 template-uri HTML inline (cele din documentul tău), câte unul per profil
- Subiectele exacte furnizate de tine

### 3. Trimitere automată la completare quiz

Modific `DnaQuizContainer.tsx` — în funcția `saveResult`, după salvarea în DB, apelez edge function-ul:
```ts
await supabase.functions.invoke('dna-quiz-email', {
  body: { email, result_type: res.primary, lang }
});
```
Se trimite doar pentru utilizatori publici (care au dat email).

### 4. Email invitație 48h — edge function `dna-quiz-followup`

Creez `supabase/functions/dna-quiz-followup/index.ts`:
- Primește: `{ email, result_type, lang }` (sau va fi apelat via cron)
- Template-ul de invitație din documentul tău
- Înlocuiește `[Prenume]` cu emailul (nu avem prenume) și `[ADN_PROFIL]` cu tipul tradus

Pentru automatizarea la 48h, creez un cron job DB care:
- Selectează din `dna_quiz_results` rândurile cu `created_at < now() - interval '48 hours'` și `followup_sent = false`
- Apelează edge function-ul pentru fiecare
- Setează `followup_sent = true`

**Migrare DB**: Adaug coloana `followup_sent boolean default false` pe `dna_quiz_results`.

### 5. Traduceri hero (`quizData.ts`)

Adaug câmpuri noi în `QuizTranslation`:
- `heroHeadline`, `heroSubheadline`, `heroCta`

### Fișiere create/modificate

| Fișier | Acțiune |
|--------|---------|
| `src/assets/quiz-hero.png` | Copy din upload |
| `src/pages/DnaQuizPublic.tsx` | Refac cu hero section + 2 faze |
| `src/components/dna-quiz/quizData.ts` | Adaug câmpuri hero traduceri |
| `supabase/functions/dna-quiz-email/index.ts` | Creare — 3 template-uri email rezultat |
| `supabase/functions/dna-quiz-followup/index.ts` | Creare — email invitație 48h |
| `src/components/dna-quiz/DnaQuizContainer.tsx` | Apel edge function după save |
| DB migration | `followup_sent` pe `dna_quiz_results` + cron job pt followup |

