

## Plan: Admin Feedback & AI Outputs Viewer

### What We're Building

Two new admin sections:
1. **Feedback Manager** — view all user feedback (ratings, comments, step) with user names
2. **AI Outputs Viewer** — view what each user generated (CVs, outreach, offers, profiles, gigs) with details

No external connectors needed. All data already exists in `step_feedback` and `ai_outputs` tables. We just need admin RLS policies and new pages.

### Database Changes

**Add admin SELECT policies** (migration):
- `step_feedback`: admin can view all rows
- `ai_outputs`: admin can view all rows

Both tables currently only allow users to see their own data. Admins need read access.

```sql
CREATE POLICY "Admins can view all feedback"
ON public.step_feedback FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all ai outputs"
ON public.ai_outputs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

### New Pages

**`src/pages/admin/FeedbackManager.tsx`**
- Table with columns: User Name, Email, Step, Rating (stars), Comment, Date
- Join with profiles to get user info
- Filter by step, rating, search by user
- Summary stats at top: total feedback, average rating, count per rating

**`src/pages/admin/AIOutputsManager.tsx`**
- Table with columns: User Name, Email, Tool (cv-generator, offer-builder, etc.), Date, Actions (view detail)
- Filter by tool type, search by user
- Dialog to view full input/output JSON formatted nicely
- Join with profiles for user info

### Routing & Navigation

- Add routes `/admin/feedback` and `/admin/ai-outputs` in `App.tsx`
- Add quick action buttons in `AdminDashboard.tsx`

### File Changes

| File | Action |
|------|--------|
| Migration | Add admin SELECT policies on `step_feedback` and `ai_outputs` |
| `src/pages/admin/FeedbackManager.tsx` | Create |
| `src/pages/admin/AIOutputsManager.tsx` | Create |
| `src/App.tsx` | Add 2 routes |
| `src/pages/admin/AdminDashboard.tsx` | Add 2 quick action buttons |

No connectors needed. All additive, no breaking changes.

