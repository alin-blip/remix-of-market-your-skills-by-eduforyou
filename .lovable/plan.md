

## Plan: Add Login Button to Landing Page Navbar

### What
Add a "Login" button to the `SkillMarketLanding.tsx` navbar (both desktop and mobile) that links to `/auth/login`. No register button — registration remains only through the waitlist.

### Changes

**1. `src/lib/skillmarket-i18n.tsx`** — Add `login` label to nav translations for all 3 languages:
- `en.nav.login: "Login"`
- `ro.nav.login: "Autentificare"`
- `ua.nav.login: "Увійти"`

**2. `src/pages/SkillMarketLanding.tsx`** — Update `Navbar` component:
- Import `Link` from `react-router-dom`
- Desktop: Add a login link before the EduForYou button (styled as ghost/outline text link)
- Mobile: Add a login link in the mobile menu above the "Get Access" CTA

The login button will use the existing `btn-gold-outline` or a simple text link style to keep it secondary to the waitlist CTA.

