

## Plan: Dashboard Visual Refresh — Midnight Wealth Style

Pure visual/styling changes only. No functionality, data logic, or content order changes.

### Changes

**1. `src/pages/Dashboard.tsx`** — Styling upgrades:
- Remove emoji from greeting, use `text-gradient` class for name
- Cards get gold-border styling: `border-[#D4A843]/20 bg-[#1A2A3E]` with `rounded-2xl` and hover glow
- Stats cards grid: add subtle gold gradient borders, larger rounded corners
- Next Steps card: gold accent border, refined spacing
- Week navigation buttons: gold active state instead of primary
- Task cards: gold-bordered active states, cleaner spacing
- Add `backdrop-blur` glass effect to all cards
- Progress bar: gold gradient fill

**2. `src/components/layout/AppSidebar.tsx`** — Sidebar polish:
- Active nav items: gold pill background (`bg-primary/15 text-primary`) with `rounded-xl`
- Logo text: add `font-display italic` for "Student Freedom"
- Section labels: slightly more opacity, gold tint
- Progress card in footer: gold border accent

**3. `src/components/layout/MainLayout.tsx`** — Header refinement:
- More transparent glass header: `bg-background/60 backdrop-blur-xl`
- Subtle bottom border with gold tint

**4. `src/index.css`** — New utility classes:
- `.card-gold`: navy bg + gold border + hover glow transition
- `.card-gold-hover`: hover state with brighter gold border and shadow

### What stays the same
- All data fetching, logic, hooks
- Content order and structure
- Navigation and routing
- All existing functionality

### Files Modified

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Card styling, greeting, gold borders, rounded corners |
| `src/components/layout/AppSidebar.tsx` | Gold active states, logo styling |
| `src/components/layout/MainLayout.tsx` | Transparent glass header |
| `src/index.css` | Add `.card-gold` utility classes |

