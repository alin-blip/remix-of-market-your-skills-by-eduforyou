

# Plan: CV Upload optional + Imagine profil in CV Builder

## 1. Imagine profil pentru CV-uri

Profilul (`profiles` table) nu are coloana `avatar_url`. Trebuie adaugata.

### Database migration:
- Adauga coloana `avatar_url TEXT` pe `profiles`
- Creaza storage bucket `profile-avatars` (public) cu RLS policy pentru upload/read

### CV Builder UI:
- Adauga sectiune "Foto profil" in zona de configurare -- upload cu preview circular
- Imaginea se uploadeaza in bucket `profile-avatars/{user_id}.jpg`
- URL-ul se salveaza in `profiles.avatar_url`
- Cand se genereaza CV (ATS sau Sales Page), imaginea este inclusa in output

### CV Generator edge function:
- Primeste `avatarUrl` in body
- Include in prompt-ul de generare instructiunea de a plasa imaginea (returneaza HTML/Markdown cu `<img>` tag)
- Alternativ: pentru ATS CV (plain text) nu include imagine, dar pentru Sales Page CV si Cover Letter genereaza cu imagine

### Afisare CV generat:
- Schimba rendering-ul din `<pre>` in div cu `dangerouslySetInnerHTML` sau Markdown renderer
- Sales Page CV va avea imaginea vizibila in preview si export

## 2. Upload CV clasic (optional) -- conform planului aprobat

### Edge function `parse-cv`:
- Primeste PDF via FormData
- Trimite PDF-ul la Gemini (document model) pentru extragere text
- Returneaza textul extras

### Componenta reutilizabila `CVUpload`:
- Dropzone PDF (max 5MB), drag & drop
- Stari: idle → uploading → parsed (preview text scurt)
- Callback `onTextExtracted(text: string)`

### Integrare in 3 locuri:
1. **Skill Scanner** (`/wizard/skills`) -- sub textarea experienta, textul extras se concateneaza cu experienta la scanare
2. **Onboarding Step 6** -- acelasi dropzone optional, textul se adauga la `projects_experience`
3. **CV Builder** -- sub textarea experienta, populeaza campul

### Edge function `skill-scanner` update:
- Parametru optional `cvText` concatenat cu `experiences` in prompt

## Componente noi de creat:
- `src/components/shared/CVUpload.tsx` -- dropzone reutilizabil
- `src/components/shared/AvatarUpload.tsx` -- upload foto profil cu crop/preview
- `supabase/functions/parse-cv/index.ts` -- parsare PDF via Gemini

## Fisiere de modificat:
- `src/pages/dream100/CVBuilder.tsx` -- adauga AvatarUpload + CVUpload + rendering HTML
- `src/pages/wizard/SkillScanner.tsx` -- adauga CVUpload
- `src/components/onboarding/OnboardingStep6Skills.tsx` -- adauga CVUpload
- `supabase/functions/cv-generator/index.ts` -- include avatarUrl, genereaza HTML pentru Sales Page
- `supabase/functions/skill-scanner/index.ts` -- accept cvText param
- Migration: `profiles.avatar_url` + bucket `profile-avatars`
- `supabase/config.toml` -- adauga `[functions.parse-cv]`
- i18n translations (en.ts, ro.ts)

