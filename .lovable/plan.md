

## Plan: Premium Login Page Redesign

### Current State
The login page is a centered single-column form with basic glass card, gradient mesh background, and minimal animation (one `animate-slide-up`). It looks functional but flat — no visual drama, no layered depth, no staggered entrance.

### Design Direction
Align with the **Midnight Wealth** theme: navy + gold, editorial luxury feel with subtle motion.

### Changes to `src/pages/auth/Login.tsx`

**1. Solid background fix** — Add `bg-background` to root div (same fix as Register).

**2. Animated gold accent elements** — Add 2-3 floating decorative shapes (gold gradient circles/rings) with CSS `animate-float` and `animate-pulse-soft` at different speeds, positioned absolutely behind the form. Creates depth and luxury feel.

**3. Staggered entrance animations** — Instead of one `animate-slide-up` on the card:
- Logo: `animate-fade-in`
- Card: `animate-slide-up`  
- Title: `animate-slide-up delay-100`
- Social buttons: `animate-slide-up delay-200`
- Form fields: `animate-slide-up delay-300`
- Submit button: `animate-scale-in delay-400`

**4. Gold border glow on card** — Replace plain `glass` with `glass card-shine` + a subtle gold border (`border-primary/20`) and hover glow effect.

**5. Logo upgrade** — Use Playfair Display italic for "Market" + bold for "YourSkill" to match the brand, with a gold gradient icon background.

**6. Input field polish** — Add gold focus ring (`focus:ring-primary/30`), slightly larger rounded corners, and subtle transition on focus.

**7. Submit button gold gradient** — Replace `gradient-primary` with the gold shimmer style (matching the landing page `btn-gold` aesthetic): `background: linear-gradient(135deg, #D4A843, #F0C96A, #D4A843)` with hover glow.

**8. Decorative gold line** — A thin horizontal gold gradient divider above/below the form card for editorial separation.

### Changes to `src/pages/auth/Register.tsx`
Apply the same visual upgrades for consistency (floating accents, staggered animations, gold styling).

### Files Modified

| File | Change |
|------|--------|
| `src/pages/auth/Login.tsx` | Full premium redesign with floating accents, staggered animations, gold styling |
| `src/pages/auth/Register.tsx` | Match same premium styling for consistency |

### No new dependencies needed — uses existing CSS utilities and Tailwind classes.

