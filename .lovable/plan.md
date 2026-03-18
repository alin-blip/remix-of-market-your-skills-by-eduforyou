

## Plan: Simplificare Onboarding — Doar Date Personale

### Ce se schimbă

Onboarding-ul trece de la **8 pași** la **1 singur pas** cu datele personale (nume, data nașterii, curs/studii, limbă). După completare, utilizatorul ajunge direct pe Dashboard.

### Ce se elimină din onboarding
- Step 2: Interese
- Step 3: Experiență/proiecte
- Step 4: Obiective
- Step 5: Valori
- Step 6: Skills AI
- Step 7: Ikigai AI
- Step 8: Offer AI

Aceste funcționalități rămân accesibile din platformă (Wizard tools, Dashboard).

### Fișiere modificate

| Fișier | Modificare |
|--------|-----------|
| `src/pages/Onboarding.tsx` | Rescris complet: un singur formular (Step1), fără stepper/progress bar, submit direct → `onboarding_completed: true` → redirect `/dashboard` |
| `src/lib/i18n/translations/ro.ts` | Simplificare `onboarding.steps` la un singur element |
| `src/lib/i18n/translations/en.ts` | Idem pentru engleză |

### Ce NU se schimbă
- `OnboardingStep1.tsx` — rămâne intact (nume, DOB, curs, limbă)
- `ProtectedRoute.tsx` — logica de redirect la `/onboard` rămâne la fel
- Tabelul `profiles` — aceleași coloane
- Componentele Step2-Step8 — rămân în codebase (sunt folosite și în wizard tools)

### Noul flow
1. User se înregistrează → redirect `/onboard`
2. Completează: nume, data nașterii, curs universitar, limbă
3. Click "Finalizează" → salvează profil + `onboarding_completed: true`
4. Redirect → `/dashboard`

Timp estimat de completare pentru user: ~30 secunde vs ~10 minute anterior.

