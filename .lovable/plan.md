

## Plan: Logo, Hero Laptop Image, and Sidebar Design Refresh

### What's needed

1. **Copy logo image** (`market-your-skill-logo-premium.png`) to `src/assets/` and use it in:
   - `AppSidebar.tsx` header (replace Sparkles icon with actual logo)
   - `Landing.tsx` header (replace Sparkles icon with actual logo)
   - `SkillMarketLanding.tsx` Logo component (replace Zap icon with actual logo)

2. **Copy laptop mockup** (`laptop-v2-glow.png`) to `src/assets/` and embed in:
   - `HeroSection.tsx` — add the laptop image to the right side of the hero, making it a 2-column layout (text left, laptop right) matching the reference image style

3. **Sidebar design refresh** (`AppSidebar.tsx`) to match the reference laptop screenshot:
   - Darker navy background (`#0D1B2A`)
   - Gold pill active state with more visible gold background
   - Cleaner spacing between items
   - Subtle gold border on the right edge
   - Section labels with gold tint
   - Avatar/user icon at top of sidebar (gold circle with user silhouette)

### File Changes

| File | Action |
|------|--------|
| `src/assets/logo.png` | Copy from `user-uploads://market-your-skill-logo-premium.png` |
| `src/assets/laptop-mockup.png` | Copy from `user-uploads://laptop-v2-glow.png` |
| `src/components/landing/HeroSection.tsx` | 2-column layout: text left + laptop image right, gold color accents |
| `src/components/layout/AppSidebar.tsx` | Replace icon with logo image, refine active states to match reference (gold bg pill, cleaner nav) |
| `src/pages/Landing.tsx` | Replace Sparkles icon with logo image in header |
| `src/pages/SkillMarketLanding.tsx` | Replace Zap icon with logo image in Logo component |

### Design Details

**Hero layout** (matching reference image):
- Left side: badge, headline, gold subtitle, feature pills (Skill Scanner AI, Dream 100 System, Income Tracker), CTA button
- Right side: laptop mockup image with subtle gold glow shadow
- Keep existing text content, just restructure layout and add the image

**Sidebar** (matching reference):
- Active item: `bg-[#D4A843]/20` with `text-[#D4A843]` and left gold border or rounded gold pill
- Non-active items: `text-[#7A94B0]` muted color
- Group labels: gold tinted uppercase text
- Logo: actual image instead of icon, sized ~32x32px

No functionality changes. No database changes.

