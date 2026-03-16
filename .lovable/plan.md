

## Plan: Add Output Language Selector to AI Generation Pages

### Problem
Currently, AI-generated content (CVs, outreach messages, social profiles, offers) uses either the user's profile locale or defaults to Romanian. Users need to choose the **output language** independently — e.g., generate a CV in English while using the app in Romanian.

### Pages That Need a Language Selector

| Page | File | Currently passes locale? |
|------|------|------------------------|
| CV Builder | `src/pages/dream100/CVBuilder.tsx` | No |
| Outreach Sequences | `src/pages/dream100/OutreachSequences.tsx` | No |
| Offer Builder | `src/pages/wizard/OfferBuilder.tsx` | Yes (from profile) |
| Profile Builder | `src/pages/wizard/ProfileBuilder.tsx` | Yes (from profile) |
| Outreach Generator | `src/pages/wizard/OutreachGenerator.tsx` | Yes (from profile) |
| Gig Job Builder | `src/components/gigs/GigJobBuilder.tsx` | Needs check |

### Implementation

**1. Create a reusable `OutputLanguageSelect` component**
- Simple Select dropdown with options: Română, English, Українська
- Values: `ro`, `en`, `ua`
- Defaults to user's profile locale
- Small, non-intrusive — placed near the "Generate" button on each page

**2. Update each page (6 files)**
- Add `outputLang` state initialized from `locale`
- Render `OutputLanguageSelect` in the config/settings area
- Pass `outputLang` to the edge function call body as `locale`

**3. Update edge functions to respect `locale` param (4 files)**
- `cv-generator` — add locale param, instruct AI to write in that language
- `outreach-sequence` — add locale param, instruct AI to write in that language
- `offer-builder` — already uses locale, just ensure `ua` works
- `profile-builder` — already uses locale, just ensure `ua` works
- `outreach-generator` — already uses locale, just ensure `ua` works
- `gig-platform-generator` — add locale support

### File Changes Summary

| File | Action |
|------|--------|
| `src/components/shared/OutputLanguageSelect.tsx` | Create — reusable dropdown |
| `src/pages/dream100/CVBuilder.tsx` | Edit — add selector + pass locale |
| `src/pages/dream100/OutreachSequences.tsx` | Edit — add selector + pass locale |
| `src/pages/wizard/OfferBuilder.tsx` | Edit — add selector (replace hardcoded profile locale) |
| `src/pages/wizard/ProfileBuilder.tsx` | Edit — add selector |
| `src/pages/wizard/OutreachGenerator.tsx` | Edit — add selector |
| `src/components/gigs/GigJobBuilder.tsx` | Edit — add selector |
| `supabase/functions/cv-generator/index.ts` | Edit — use locale in prompts |
| `supabase/functions/outreach-sequence/index.ts` | Edit — use locale in prompts |
| `supabase/functions/offer-builder/index.ts` | Edit — add `ua` language support |
| `supabase/functions/profile-builder/index.ts` | Edit — add `ua` language support |
| `supabase/functions/outreach-generator/index.ts` | Edit — add `ua` language support |
| `supabase/functions/gig-platform-generator/index.ts` | Edit — add locale support |

No database changes needed. No breaking changes — all additions are additive.

