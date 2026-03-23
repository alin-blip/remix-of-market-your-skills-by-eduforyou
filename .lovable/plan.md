

## Plan: Securizare Platformă pentru Lansare

### Ce se face

**1. Migrare DB — Restricționare RLS policies (1 migrare SQL)**

Eliminăm politicile INSERT/UPDATE permisive care permit fraude:

- **`course_purchases`** — eliminăm INSERT policy de la useri (doar Stripe webhook/service_role poate crea)
- **`bundle_purchases`** — la fel, eliminăm INSERT policy
- **`subscriptions`** — eliminăm INSERT policy (doar service_role)
- **`user_points`** — restricționăm UPDATE doar la propria înregistrare, dar păstrăm INSERT cu `user_id = auth.uid()`
- **`user_badges`** — păstrăm INSERT cu `user_id = auth.uid()` (gamification-ul funcționează client-side)
- **`quiz_questions`** — restricționăm SELECT doar la useri autentificați (ascundem `correct_option` de public)
- **`course_lessons`** — restricționăm SELECT la useri autentificați (ascundem `video_url` de public)
- **`outreach_templates`** — adăugăm `WITH CHECK (auth.uid() = user_id)` la ALL policy
- **DB functions** — adăugăm `SET search_path = public` la cele 4 funcții email

**2. Activare Leaked Password Protection**
- Folosim configure_auth tool

**3. Eliminare Landing.tsx nefolosit**

### Fișiere modificate
- 1 migrare SQL (securitate RLS + funcții)
- `src/pages/Landing.tsx` — ștergere
- Auth config — activare leaked password protection

### Ce NU se modifică
- Nu se adaugă ruta `/onboard` (conform cerință)
- Nu se modifică funcționalități existente

