

## Plan: Rezolvare Ultimelor Vulnerabilități de Securitate

### Erori rămase (5 critice)

1. **user_points** — userii pot modifica liber punctele (INSERT + UPDATE permisiv)
2. **user_badges** — userii pot să-și acorde orice badge
3. **course_lessons** — video_url accesibil tuturor utilizatorilor autentificați (nu doar cumpărătorilor)
4. **quiz_questions** — correct_option expus tuturor autentificaților
5. **Leaked Password Protection** — încă dezactivat

### Soluția — 1 migrare SQL + auth config

**Migrare SQL:**

- **user_points**: Eliminăm INSERT și UPDATE policies pentru useri. Doar service_role poate modifica puncte.
- **user_badges**: Eliminăm INSERT policy pentru useri. Doar service_role poate acorda badge-uri.
- **course_lessons**: SELECT restricționat la: lecții gratuite (`is_free = true`) SAU utilizatorul are achiziție/bundle/abonament activ pentru cursul respectiv.
- **quiz_questions**: Creăm o funcție `check_quiz_answer` (security definer) care verifică răspunsul server-side fără a expune `correct_option`. Eliminăm `correct_option` din SELECT policy prin crearea unui view sau prin excluderea coloanei.

**Auth config:**
- Activăm Leaked Password Protection

### Impactul asupra codului existent

Gamification-ul (puncte, badge-uri) se face client-side acum — trebuie mutat în edge functions sau DB triggers. Voi verifica dacă există cod client care face INSERT/UPDATE direct pe aceste tabele.

### Detalii tehnice

**course_lessons SELECT policy:**
```sql
CREATE POLICY "Users can view lessons they have access to" ON course_lessons
  FOR SELECT TO authenticated
  USING (
    is_free = true
    OR EXISTS (SELECT 1 FROM course_purchases WHERE user_id = auth.uid() AND course_id = course_lessons.course_id)
    OR EXISTS (SELECT 1 FROM bundle_purchases bp JOIN bundle_courses bc ON bc.bundle_id = bp.bundle_id WHERE bp.user_id = auth.uid() AND bc.course_id = course_lessons.course_id)
    OR EXISTS (SELECT 1 FROM subscriptions WHERE user_id = auth.uid() AND status = 'active')
  );
```

**quiz_questions** — creăm un view fără `correct_option` + funcție server-side pentru verificare:
```sql
CREATE VIEW public.quiz_questions_safe AS
  SELECT id, quiz_id, question, option_a, option_b, option_c, option_d, "order"
  FROM quiz_questions;
```

**user_points / user_badges** — restricționăm la service_role. Creăm o funcție DB `award_points()` apelabilă de useri dar cu logică controlată.

### Fișiere modificate
- 1 migrare SQL (RLS + view + funcții DB)
- `src/hooks/useGamification.ts` — update să folosească funcția DB în loc de INSERT/UPDATE direct
- `src/components/courses/LessonQuiz.tsx` — update să folosească funcția `check_quiz_answer` 
- Auth config — activare leaked password protection

