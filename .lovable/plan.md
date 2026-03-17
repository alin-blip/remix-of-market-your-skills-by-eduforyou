

## Status Audit Pre-Lansare

### Ce s-a rezolvat deja:
| # | Task | Status |
|---|------|--------|
| 7 | Setup email domain (notify.mk.eduforyou.co.uk) | DONE |
| - | Auth email templates (6 template-uri branded) | DONE |
| - | Google Sign-In | DONE |
| - | Apple Sign-In | DONE |

### Ce mai rămâne de implementat:
| # | Task | Prioritate |
|---|------|-----------|
| 1 | **Fix waitlist RLS policy** — politica SELECT cu `USING (true)` expune toate datele public | CRITIC |
| 2 | **Bulk approve + paginare** in Waitlist Manager — fără ele vezi max 1000 din 7800 aplicanți, și aprobarea e doar 1 câte 1 | CRITIC |
| 3 | **Normalizare email lowercase** pe waitlist submit — previne mismatch la register | CRITIC |
| 4 | **Forgot Password + Reset Password page** — nu există deloc, obligatoriu cu 7800 useri | CRITIC |
| 5 | **Auto-confirm email la signup** — necesită decizia ta (da/nu) | IMPORTANT |
| 6 | **Email notificare la aprobare waitlist** — studentul nu știe că a fost aprobat | IMPORTANT |
| 8 | **Fix console warning forwardRef** | MINOR |

### Plan de implementare (toate 6 task-uri rămase):

**1. Fix waitlist RLS** — Șterg politica `Anyone can check own email status` (USING true) și o înlocuiesc cu una care permite SELECT doar pe baza emailului propriu, folosind un RPC `check_waitlist_status(email)` security definer.

**2. Bulk approve + paginare** — Adaug în WaitlistManager:
- Paginare cu count total (50 per pagină)
- Checkbox-uri pe fiecare rând + "Selectează toate"
- Buton "Aprobă selectate" și "Aprobă toate pending"
- Filtru Eduforyou members

**3. Email lowercase** — În `WaitlistForm.tsx`, normalizez emailul cu `.trim().toLowerCase()` înainte de insert.

**4. Forgot Password** — Creez:
- `src/pages/auth/ForgotPassword.tsx` — formular cu email, apelează `resetPasswordForEmail`
- `src/pages/auth/ResetPassword.tsx` — formular cu parolă nouă, apelează `updateUser({ password })`
- Link "Am uitat parola" pe Login
- Rute noi în App.tsx

**5. Auto-confirm** — Dacă aprobi, activez auto-confirm email la signup (studenții vin din waitlist, emailul e deja validat).

**6. Email notificare aprobare** — Când adminul aprobă, trimite email automat prin email queue cu link de înregistrare.

### Fișiere afectate:
- `src/pages/admin/WaitlistManager.tsx` — bulk approve, paginare, checkbox-uri
- `src/pages/WaitlistForm.tsx` — email lowercase
- `src/pages/auth/ForgotPassword.tsx` — NEW
- `src/pages/auth/ResetPassword.tsx` — NEW
- `src/pages/auth/Login.tsx` — link forgot password
- `src/App.tsx` — rute noi
- Migration SQL — fix RLS, add RPC check_waitlist_status
- Edge function update — notificare email la aprobare

### Decizie necesară:
Activăm **auto-confirm email** la signup? (studenții vin din waitlist → emailul e deja validat de admin)

