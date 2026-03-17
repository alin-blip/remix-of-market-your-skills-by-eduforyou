

## Plan: Waitlist cu Formular de Screening + Admin Manager

### Intrebarile din formular (in ordine)

1. **Nume complet** (text, obligatoriu)
2. **Email** (email, obligatoriu)
3. **Telefon** (text, obligatoriu)
4. **In ce domeniu lucrezi/studiezi?** (select: IT, Marketing, Design, Business, Educatie, Sanatate, Altele)
5. **Ai experienta cu freelancing?** (Da / Nu / Putin)
6. **Ce obiectiv ai cu platforma?** (textarea)
7. **Tara de rezidenta** (text)
8. **De unde ai auzit de noi?** (select: Social Media, Prieten, Google, TikTok, YouTube, Altele)
9. **Esti inscris cu Eduforyou?** (Da / Nu) — ultimul camp

### Database

**New table: `waitlist_applications`**
- `id`, `email` (unique), `full_name`, `phone`, `domain` (domeniu), `freelance_experience`, `objective` (textarea), `country`, `how_heard`, `is_eduforyou_member` (boolean), `status` (pending/approved/rejected, default pending), `admin_notes`, `reviewed_at`, `reviewed_by`, `created_at`
- RLS: public INSERT, admin SELECT/UPDATE

### New Pages

1. **`/waitlist`** — Gold-themed form with all 9 fields, success message after submit
2. **`/admin/waitlist`** — Table with filters (pending/approved/rejected), approve/reject buttons, admin notes

### Modified Files

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/waitlist` and `/admin/waitlist` routes |
| `src/pages/SkillMarketLanding.tsx` | CTA buttons → `/waitlist` |
| `src/components/layout/AppSidebar.tsx` | Add "Waitlist" in admin section |
| `src/pages/auth/Register.tsx` | Check email is approved in waitlist before allowing signup |

### Flow
1. Visitor fills form → saved as `pending`
2. Admin reviews in `/admin/waitlist` → approve/reject
3. Approved users can register with that email

