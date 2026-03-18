

## Plan: Adaugă limba preferată în waitlist + elimină onboarding complet

### Rezumat
Mutăm **toate** datele din onboarding (nume, DOB, curs universitar, limbă) în waitlist form. La signup, profilul se populează automat din datele waitlist → `onboarding_completed: true` → redirect direct pe Dashboard.

### Database migration
```sql
ALTER TABLE waitlist_applications 
  ADD COLUMN study_field text,
  ADD COLUMN date_of_birth date,
  ADD COLUMN preferred_locale text DEFAULT 'ro';
```

### Fișiere modificate

| Fișier | Ce se schimbă |
|--------|--------------|
| `src/pages/WaitlistForm.tsx` | Adaug 3 câmpuri noi: select curs universitar (lista eduforyou din OnboardingStep1), input data nașterii, select limbă (RO/EN) |
| `src/pages/auth/Register.tsx` | Elimin câmpul "Full Name" (vine din waitlist). După signup reușit, copiez datele din waitlist în profiles via RPC |
| `src/lib/auth.tsx` | În `signUp`, după creare cont, apelez funcție de populare profil din waitlist |
| `src/components/ProtectedRoute.tsx` | Elimin logica `requireOnboarding` — toți userii au deja profil complet |
| `src/App.tsx` | Elimin ruta `/onboard` |

### Logica de auto-populare profil

Creez o funcție RPC `populate_profile_from_waitlist(user_email text)` (SECURITY DEFINER) care:
1. Caută waitlist application by email
2. Updatează profiles cu `full_name`, `study_field`, `date_of_birth`, `locale`, `onboarding_completed = true`

Aceasta se apelează din `Register.tsx` după signup reușit.

### Migration SQL completă
```sql
-- Add fields to waitlist
ALTER TABLE waitlist_applications 
  ADD COLUMN study_field text,
  ADD COLUMN date_of_birth date,
  ADD COLUMN preferred_locale text DEFAULT 'ro';

-- RPC to auto-populate profile from waitlist data
CREATE OR REPLACE FUNCTION public.populate_profile_from_waitlist(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  w RECORD;
BEGIN
  SELECT full_name, study_field, date_of_birth, preferred_locale
  INTO w
  FROM waitlist_applications
  WHERE LOWER(email) = LOWER(user_email) AND status = 'approved'
  LIMIT 1;

  IF FOUND THEN
    UPDATE profiles
    SET full_name = w.full_name,
        study_field = w.study_field,
        date_of_birth = w.date_of_birth,
        locale = COALESCE(w.preferred_locale, 'ro'),
        onboarding_completed = true
    WHERE email = LOWER(user_email);
  END IF;
END;
$$;
```

### Flow nou
1. Student completează waitlist (nume, email, telefon, domeniu, curs universitar, DOB, limbă, etc.)
2. Admin aprobă → email cu link register
3. Student se înregistrează (doar email + parolă)
4. Profilul se populează automat din waitlist → `onboarding_completed: true`
5. Redirect direct pe Dashboard

