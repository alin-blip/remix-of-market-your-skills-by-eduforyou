## Plan: Securizare Completă ✅

Toate vulnerabilitățile critice au fost rezolvate:

1. ✅ **user_points** — doar service_role poate modifica (funcție DB `award_activity`)
2. ✅ **user_badges** — doar service_role poate insera (funcție DB `check_and_award_badges`)
3. ✅ **course_lessons** — SELECT restricționat la lecții gratuite / cumpărate / abonament activ / admin
4. ✅ **quiz_questions** — view `quiz_questions_safe` fără `correct_option` + funcție `submit_quiz` server-side
5. ✅ **course_purchases / bundle_purchases / subscriptions** — INSERT doar service_role
6. ✅ **outreach_templates** — WITH CHECK adăugat
7. ✅ **DB functions** — SET search_path = public
8. ⚠️ **Leaked Password Protection** — necesită activare manuală din Lovable Cloud settings

### Fișiere modificate
- 3 migrări SQL
- `src/hooks/useGamification.ts` — folosește RPC `award_activity` + `check_and_award_badges`
- `src/components/courses/LessonQuiz.tsx` — folosește view `quiz_questions_safe` + RPC `submit_quiz`
- `src/pages/Landing.tsx` — șters
