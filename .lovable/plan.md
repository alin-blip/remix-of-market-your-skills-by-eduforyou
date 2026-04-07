

# Plan: Email Automat de Re-engagement la 7 Zile de Inactivitate

## Ce construim

O funcție Edge (`auto-reengagement`) care rulează automat zilnic prin cron job. Detectează utilizatorii inactivi de 7+ zile și le trimite un email personalizat cu sfaturi specifice bazate pe ce NU au făcut încă pe platformă.

## Logica de detectare inactivitate

Verificăm cea mai recentă activitate per utilizator din 3 surse:
- `ai_outputs.created_at` (folosire unelte AI)
- `user_course_progress.updated_at` (progres cursuri)
- `dream100_targets.updated_at` (activitate Dream 100)

Dacă MAX din toate cele 3 este mai veche de 7 zile (sau nu există deloc activitate) → utilizatorul primește email.

**Filtre de siguranță:**
- Excludem conturile interne (`@rowarrior`, `@eduforyou`, `@pluux`, `@icloud`)
- Excludem emailurile din `suppressed_emails` (dezabonați/bounces)
- Idempotency key: `reengagement-7d-{user_id}-{iso_week}` (1 email max per săptămână per user)
- Verificăm dacă utilizatorul a mai primit recent un email de re-engagement

## Emailul — personalizat pe baza activității

Subiect: `{Prenume}, nu lăsa oportunitățile să treacă pe lângă tine 🎯`

Conținutul variază în funcție de ce a făcut/nu a făcut utilizatorul:

| Situație | Sugestie în email |
|---|---|
| Nu a folosit Dream 100 Scanner | "Scanează piața și descoperă 100 de clienți ideali" |
| Nu a creat ofertă (Offer Builder) | "Creează o ofertă premium în 3 minute" |
| Nu a învățat nimic (0 progres cursuri) | "Învață strategii noi în secțiunea Learn" |
| Nu a folosit Outreach | "Trimite primele mesaje de outreach personalizate" |
| Nu a făcut Skill Scanner | "Descoperă-ți skillurile ascunse cu Skill Scanner" |

Emailul include 2-3 sugestii relevante + CTA principal + social proof scurt.

## Cron Job

- Rulează zilnic la 09:00 UTC (11:00 ora României)
- Folosește `enqueue_email` RPC (coada `transactional_emails`)
- Ritmul de trimitere controlat de setările existente din `email_send_state`

## Fișiere

| Fișier | Acțiune |
|---|---|
| `supabase/functions/auto-reengagement/index.ts` | NOU — detectare + email personalizat |

## Pași execuție
1. Creez Edge Function-ul cu logica de detectare și template email
2. Deploy funcția
3. Setez cron job zilnic la 09:00 UTC via `cron.schedule`

