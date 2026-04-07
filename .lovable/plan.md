

# Plan: Email Re-engagement pentru Utilizatori Inactivi

## Date
- **67 utilizatori reali** care s-au înregistrat dar nu au folosit nicio unealtă AI
- Trimitem câte 1 email la 5 minute (total ~5.5 ore pentru toți)

## Ce construim

### 1. Edge Function `reengagement-notify`
- Lista celor 67 de utilizatori hardcoded (email + prenume)
- Email Hormozi-style în română: focus pe ce au ratat, ce pot construi, cât de repede
- Referință la studiile de caz reale (7 profesioniști, sub 30 min)
- CTA: "Începe acum — durează sub 10 minute"
- Folosește `enqueue_email` RPC-ul existent (coada `transactional_emails`)
- Idempotency key per user: `reengagement-v1-{email}` (previne duplicatele)

### 2. Ajustare temporară ritm trimitere
- Modificăm `email_send_state`: `batch_size = 1`
- Modificăm cron-ul `process-email-queue` de la `*/5 seconds` la `*/5 * * * *` (la fiecare 5 minute)
- După trimitere, revert la setările originale

### 3. Fix runtime error pe `/case-studies`
- Eroare `e is not defined` — investigăm și reparăm

## Structura emailului (Hormozi-style)
- **Subject**: `{Prenume}, ai ratat ceva important pe SkillMarket 🚀`
- **Body**:
  - Headline: "Contul tău e gata. Dar nu ai folosit încă nicio unealtă."
  - Social proof: "7 profesioniști au construit oferte premium în sub 30 de minute"
  - Ce pot face: Skill Scanner → Ikigai → Ofertă → Profil optimizat
  - Exemplu concret: "Gabriela A. a creat o ofertă HoReCa de 3.500 RON în 12 minute"
  - CTA button → link spre platformă `/wizard/skill-scanner`
  - Opt-out: "Nu mai doriți emailuri? Răspundeți și vă scoatem."

## Fișiere

| Fișier | Acțiune |
|---|---|
| `supabase/functions/reengagement-notify/index.ts` | NOU — enqueue 67 emailuri |
| `src/pages/CaseStudies.tsx` | FIX — runtime error |

## Pași execuție
1. Fix runtime error CaseStudies
2. Creez edge function-ul cu emailul și lista de utilizatori
3. Deploy edge function
4. Ajustez batch_size=1 și cron la 5 min (via SQL)
5. Invoc funcția pentru a pune emailurile în coadă
6. Revert setările cron/batch după ce se trimit toate

