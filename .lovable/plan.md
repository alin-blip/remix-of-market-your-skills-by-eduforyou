

## Plan: Add Feedback Popup After Each Wizard Step + Trustpilot Integration

### Trustpilot Integration — What's Possible

Trustpilot does **not** allow posting reviews directly via API. Their API supports:
- **Invitation Links**: Generate a unique link that redirects the user to Trustpilot's review page
- **Email Invitations**: Send an email invitation to leave a review

So the flow will be: positive feedback → open Trustpilot review page via invitation link or direct URL.

For generating invitation links, you need a Trustpilot Business API key + Business Unit ID. A simpler approach (no API key needed) is to redirect users to your Trustpilot profile page directly: `https://www.trustpilot.com/evaluate/YOUR-DOMAIN`.

### Implementation

**1. Create `step_feedback` database table**
- Columns: `id`, `user_id`, `step_key` (which wizard step), `rating` (1-5 stars), `comment` (optional text), `created_at`
- RLS: users can insert/read their own feedback

**2. Create `FeedbackDialog` component**
- Modal popup with 5-star rating + optional comment textarea
- On submit: save to `step_feedback` table
- If rating >= 4: show a "Thank you!" message with a gold button "Leave a review on Trustpilot" that opens the Trustpilot evaluate page in a new tab
- If rating < 4: show a "Thank you for your feedback" message, no Trustpilot button
- Appears automatically when user completes a step (first time only per step)

**3. Update each wizard page (6 pages)**
- After successful save/generation, check if feedback already given for this step
- If not, show FeedbackDialog
- Pages: SkillScanner, IkigaiBuilder, OfferBuilder, ProfileBuilder, OutreachGenerator, FreedomPlanExport

**4. Trustpilot redirect approach**
- No API key needed — use direct URL: `https://www.trustpilot.com/evaluate/YOUR-DOMAIN`
- The user will need to provide their Trustpilot business domain (e.g., `skillmarket.ro`)
- Button opens in new tab, user leaves review on Trustpilot's own page

### File Changes Summary

| File | Action |
|------|--------|
| Migration | Create `step_feedback` table with RLS |
| `src/components/feedback/FeedbackDialog.tsx` | Create — star rating + comment + Trustpilot button |
| `src/pages/wizard/SkillScanner.tsx` | Edit — trigger feedback after step completion |
| `src/pages/wizard/IkigaiBuilder.tsx` | Edit — trigger feedback |
| `src/pages/wizard/OfferBuilder.tsx` | Edit — trigger feedback |
| `src/pages/wizard/ProfileBuilder.tsx` | Edit — trigger feedback |
| `src/pages/wizard/OutreachGenerator.tsx` | Edit — trigger feedback |
| `src/pages/wizard/FreedomPlanExport.tsx` | Edit — trigger feedback |

### Important Notes
- No Trustpilot API key required — uses direct redirect
- Feedback appears only once per step per user (checks DB before showing)
- Non-intrusive: dialog can be dismissed without leaving feedback
- All additive changes, no breaking modifications

