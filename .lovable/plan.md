

## Plan: Replicate SkillMarket Landing Page with 3 Languages

The uploaded document contains a complete landing page ("SkillMarket") with a "Midnight Wealth" design (dark navy + gold), 3 languages (RO, EN, UA), and multiple sections. The goal is to replicate this as the new landing page for this project, replacing the current one.

### Key Differences from Current Setup
- Current project uses `wouter`-incompatible routing (uses `react-router-dom`) -- good, no migration needed
- Current i18n has only `ro` and `en`; new page needs `ua` (Ukrainian) added
- Current landing is a single `/` route; new design needs `/ro`, `/en`, `/ua` routes with redirect from `/` to `/ro`
- Completely different visual design: navy (#0D1B2A) + gold (#D4A843) vs current indigo + lime
- The new landing is self-contained (no backend features needed)

### Implementation Plan

**1. Create new SkillMarket landing translations file**
- `src/lib/skillmarket-i18n.ts` -- contains all 3 language translations (EN, RO, UA) from the uploaded document, plus the `Lang`, `LANGS`, `LangProvider`, `useLang` context

**2. Create the SkillMarket landing page component**
- `src/pages/SkillMarketLanding.tsx` -- single file containing all sections (Nav, Hero, TaglineBanner, Stats, HowItWorks, Dream100, ValueStack, EduForYou, Pricing, FAQ, Footer) adapted from the uploaded code
- Replace `wouter` imports with `react-router-dom` (`useLocation` from wouter -> `useNavigate` from react-router-dom)
- Replace `useLocation` for language switching with `useNavigate`
- Keep all the visual design exactly as-is (hardcoded navy/gold colors, Playfair Display font)

**3. Create SkillMarket-specific CSS**
- `src/pages/skillmarket.css` -- contains the `.btn-gold`, `.btn-gold-outline`, `.card-gold`, `.section-badge`, `.fade-up`, and keyframe animations from the uploaded CSS
- Scoped to avoid conflicting with the existing app design system

**4. Update routing in App.tsx**
- Add routes: `/ro`, `/en`, `/ua` -> SkillMarketLanding with appropriate lang prop
- Change `/` to redirect to `/ro` (or keep current Landing and add SkillMarket routes separately)
- Keep all existing protected routes intact

**5. Add Google Fonts**
- Add Playfair Display font import to index.html or the skillmarket CSS file

### Important Notes
- The current app's Landing page (`/`) and all protected routes remain untouched
- The SkillMarket landing pages are public, no auth required
- CTA buttons on the SkillMarket page will link to `#pricing`, `#eduforyou` etc. (anchor links within the page), and "Get Access" buttons will link to `/auth/register`
- The Dream 100 image URL from CloudFront will be kept as-is (external image)
- The third language in the uploaded doc is "ua" (Ukrainian), not "hu" (Hungarian) as the user mentioned -- will clarify

### File Changes Summary
| File | Action |
|------|--------|
| `src/lib/skillmarket-i18n.ts` | Create -- translations + context |
| `src/pages/SkillMarketLanding.tsx` | Create -- full landing page |
| `src/pages/skillmarket.css` | Create -- gold/navy CSS classes |
| `src/App.tsx` | Edit -- add `/ro`, `/en`, `/ua` routes |
| `index.html` | Edit -- add Playfair Display font |

